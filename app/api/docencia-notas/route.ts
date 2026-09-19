import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { eSuperAdmin, rotuloAutorConta } from "@/lib/gestao-auth";
import { calcularResultadoFinal } from "@/lib/notas-formula";

export const dynamic = "force-dynamic";

function sessaoSupabase() {
  const cookieStore = cookies();
  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        /* rota só de leitura de sessão — não define cookies novos */
      },
    },
  });
}

function numOuNull(v: unknown): number | null {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(20, Math.round(n * 10) / 10));
}

/**
 * Lança ou actualiza a nota de um estudante numa cadeira. Só é permitido a
 * super-admin ou a um docente com essa cadeira atribuída em
 * docencia_cadeiras — a escrita real usa a chave de serviço porque o
 * docente não é o dono da linha (o dono é o estudante avaliado).
 */
export async function POST(request: Request) {
  const supabase = sessaoSupabase();
  const { data: sessao } = await supabase.auth.getUser();
  const user = sessao.user;
  if (!user) {
    return NextResponse.json({ error: "Sessão expirada. Inicie sessão novamente." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const estudanteId = String(body?.estudanteId || "");
  const numeroEstudante = String(body?.numeroEstudante || "").trim();
  const nomeEstudante = String(body?.nomeEstudante || "").trim();
  const curso = String(body?.curso || "");
  const cadeiraCodigo = String(body?.cadeiraCodigo || "");
  const cadeiraNome = String(body?.cadeiraNome || "").trim();
  const regime = body?.regime === "pos-laboral" ? "pos-laboral" : "diurno";
  const ano = Number(body?.ano) || null;
  const semestre = Number(body?.semestre) || null;

  if (!estudanteId || !numeroEstudante || !nomeEstudante || !curso || !cadeiraCodigo || !cadeiraNome) {
    return NextResponse.json({ error: "Preencha o estudante e a cadeira." }, { status: 400 });
  }

  if (!eSuperAdmin(user)) {
    const { data: atribuicao, error: atribuicaoErro } = await supabase
      .from("docencia_cadeiras")
      .select("id")
      .eq("docente_id", user.id)
      .eq("curso", curso)
      .eq("cadeira_codigo", cadeiraCodigo)
      .maybeSingle();
    if (atribuicaoErro || !atribuicao) {
      return NextResponse.json(
        { error: "Esta cadeira não lhe está atribuída — peça à Gestão para a atribuir primeiro." },
        { status: 403 }
      );
    }
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Chave de serviço do Supabase não configurada no servidor." },
      { status: 503 }
    );
  }

  const teste1 = numOuNull(body?.teste1);
  const teste2 = numOuNull(body?.teste2);
  const trabalho = numOuNull(body?.trabalho);
  const trabalho2 = numOuNull(body?.trabalho2);
  const participacao = numOuNull(body?.participacao);
  const exameNormal = numOuNull(body?.exameNormal);
  const exameRecorrencia = numOuNull(body?.exameRecorrencia);

  // A nota final e o resultado são sempre calculados aqui, nunca confiados
  // ao ecrã do docente — ver lib/notas-formula.ts para a regra completa
  // (Frequência = Testes 70% + Trabalhos 20% + Participação 10%; dispensa,
  // exame normal e recorrência conforme as pautas reais da ESJ).
  const { mediaFinal, resultado } = calcularResultadoFinal({
    teste1,
    teste2,
    trabalho1: trabalho,
    trabalho2,
    participacao,
    exameNormal,
    exameRecorrencia,
  });

  const { error } = await admin.from("estudantes_notas").upsert(
    {
      estudante_id: estudanteId,
      numero_estudante: numeroEstudante,
      nome_estudante: nomeEstudante,
      curso,
      cadeira_codigo: cadeiraCodigo,
      cadeira_nome: cadeiraNome,
      regime,
      ano,
      semestre,
      teste1,
      teste2,
      trabalho,
      trabalho2,
      participacao,
      exame_normal: exameNormal,
      exame_recorrencia: exameRecorrencia,
      media_final: mediaFinal,
      resultado,
      docente_id: user.id,
      docente_nome: rotuloAutorConta(user),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "estudante_id,curso,cadeira_codigo" }
  );

  if (error) {
    if (/Could not find the table|PGRST205|schema cache/i.test(error.message)) {
      return NextResponse.json(
        { error: "A tabela de notas ainda não existe.", needsSchema: true },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
