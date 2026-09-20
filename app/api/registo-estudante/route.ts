import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const CURSOS_VALIDOS = [
  "jornalismo",
  "publicidade-e-marketing",
  "relacoes-publicas",
  "biblioteconomia-e-documentacao",
];
const REGIMES_VALIDOS = ["diurno", "pos-laboral"];

/**
 * Junta o estudante à turma real (curso/regime/ano) no momento do
 * auto-registo. A escrita usa sempre a chave de serviço: nunca através de
 * RLS que confie em user_metadata (esse campo é editável pelo próprio
 * cliente via supabase.auth.updateUser, logo não serve para autorização —
 * qualquer conta autenticada poderia reclamar o número de outro estudante).
 * O número de estudante autoritativo é gravado em app_metadata, que só a
 * chave de serviço pode escrever, e uma vez definido não pode ser trocado
 * por este caminho — impede um estudante já registado "roubar" a linha de
 * outro mudando o número depois.
 */
export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        /* rota só de leitura de sessão — não define cookies novos */
      },
    },
  });
  const { data: sessao } = await supabase.auth.getUser();
  const user = sessao.user;
  if (!user) {
    return NextResponse.json({ error: "Sessão não encontrada." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const numeroEstudante = String(body?.numeroEstudante || "").trim();
  const nome = String(body?.nome || "").trim();
  const curso = String(body?.curso || "");
  const regime = String(body?.regime || "");
  const ano = Number(body?.ano);

  if (!numeroEstudante || !nome) {
    return NextResponse.json({ error: "Indique o número de estudante e o nome." }, { status: 400 });
  }
  if (!CURSOS_VALIDOS.includes(curso) || !REGIMES_VALIDOS.includes(regime) || !Number.isInteger(ano)) {
    return NextResponse.json({ error: "Curso, regime ou ano inválido." }, { status: 400 });
  }

  const numeroActual = String(user.app_metadata?.numero_estudante || "").trim();
  if (numeroActual && numeroActual !== numeroEstudante) {
    return NextResponse.json(
      { error: "Esta conta já está associada a outro número de estudante." },
      { status: 409 }
    );
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Chave de serviço do Supabase não configurada no servidor." },
      { status: 503 }
    );
  }

  if (!numeroActual) {
    // Primeira reclamação desta conta: se já existir uma linha com este
    // número (pré-semeada pela secretaria a partir da pauta real, ou já
    // reclamada por outra conta), recusar — nunca sobrescrever nome/curso/
    // regime/ano de um número que não é comprovadamente novo. A associação
    // a um número já existente só a secretaria faz, via /api/estudantes-contas.
    const { data: existente, error: buscaError } = await admin
      .from("turma_estudantes")
      .select("id")
      .eq("numero_estudante", numeroEstudante)
      .maybeSingle();
    if (buscaError) {
      if (/Could not find the table|PGRST205|schema cache/i.test(buscaError.message)) {
        return NextResponse.json({ error: "A tabela da turma ainda não existe.", needsSchema: true }, { status: 400 });
      }
      return NextResponse.json({ error: buscaError.message }, { status: 400 });
    }
    if (existente) {
      return NextResponse.json(
        {
          error:
            "Este número de estudante já consta da lista da turma. Contacte a secretaria para associar a sua conta.",
        },
        { status: 409 }
      );
    }

    const { error: metaError } = await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { ...user.app_metadata, numero_estudante: numeroEstudante },
    });
    if (metaError) {
      return NextResponse.json({ error: metaError.message }, { status: 400 });
    }

    const { error } = await admin
      .from("turma_estudantes")
      .insert({ numero_estudante: numeroEstudante, nome, curso, regime, ano });
    if (error) {
      if (/duplicate key|unique/i.test(error.message)) {
        return NextResponse.json(
          {
            error:
              "Este número de estudante já consta da lista da turma. Contacte a secretaria para associar a sua conta.",
          },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  // Conta já confirmada com este número (chamada repetida/idempotente) —
  // pode actualizar a sua própria linha.
  const { error } = await admin.from("turma_estudantes").upsert(
    { numero_estudante: numeroEstudante, nome, curso, regime, ano },
    { onConflict: "numero_estudante,curso" }
  );
  if (error) {
    if (/Could not find the table|PGRST205|schema cache/i.test(error.message)) {
      return NextResponse.json({ error: "A tabela da turma ainda não existe.", needsSchema: true }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
