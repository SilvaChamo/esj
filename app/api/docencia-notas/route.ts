import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { eSuperAdmin, rotuloAutorConta } from "@/lib/gestao-auth";

export const dynamic = "force-dynamic";

const RESULTADOS_VALIDOS = [
  "Dispensado",
  "Admitido",
  "Recorrência",
  "Aprovado",
  "Em Frequência",
  "Reprovado",
  "Excluído",
];

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
  let estudanteId = String(body?.estudanteId || "");
  const numeroEstudante = String(body?.numeroEstudante || "").trim();
  const nomeEstudante = String(body?.nomeEstudante || "").trim();
  const curso = String(body?.curso || "");
  const cadeiraCodigo = String(body?.cadeiraCodigo || "");
  const cadeiraNome = String(body?.cadeiraNome || "").trim();
  const regime = body?.regime === "pos-laboral" ? "pos-laboral" : "diurno";
  const ano = Number(body?.ano) || null;
  const semestre = Number(body?.semestre) || null;
  const resultado = String(body?.resultado || "Em Frequência");

  if (!numeroEstudante || !nomeEstudante || !curso || !cadeiraCodigo || !cadeiraNome) {
    return NextResponse.json({ error: "Preencha o estudante e a cadeira." }, { status: 400 });
  }
  if (!RESULTADOS_VALIDOS.includes(resultado)) {
    return NextResponse.json({ error: "Resultado inválido." }, { status: 400 });
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

  // Resolver a conta pelo número de estudante — NUNCA criar uma conta nova
  // aqui: um login com email/password adivinháveis a partir do número de
  // estudante (visível em qualquer pauta) seria uma conta que qualquer
  // colega ou docente conseguiria calcular e usar. Se o estudante ainda não
  // se registou, o docente é avisado a pedir-lhe para se registar em /entrar
  // (esse registo já o liga à turma automaticamente).
  if (!estudanteId) {
    const { data: lista } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const existente = (lista?.users || []).find(
      (u) =>
        u.user_metadata?.numero_estudante === numeroEstudante ||
        u.user_metadata?.numeroEstudante === numeroEstudante
    );
    if (existente) estudanteId = existente.id;
  }

  if (!estudanteId) {
    return NextResponse.json(
      {
        error:
          "Este estudante ainda não tem conta registada no site — peça-lhe para se registar em /entrar antes de lançar a nota.",
      },
      { status: 404 }
    );
  }

  const teste1 = numOuNull(body?.teste1);
  const teste2 = numOuNull(body?.teste2);
  const trabalho = numOuNull(body?.trabalho);
  const exameNormal = numOuNull(body?.exameNormal);
  const mediaInformada = numOuNull(body?.mediaFinal);

  const mf =
    teste1 !== null && teste2 !== null && trabalho !== null
      ? Math.round((teste1 * 0.3 + teste2 * 0.3 + trabalho * 0.4) * 10) / 10
      : null;

  const mediaCalculada =
    exameNormal !== null && mf !== null
      ? Math.round((mf * 0.5 + exameNormal * 0.5) * 10) / 10
      : mf;

  const mediaFinal = mediaInformada ?? mediaCalculada;

  const tentarUpsert = async (resVal: string) => {
    return await admin.from("estudantes_notas").upsert(
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
        exame_normal: exameNormal,
        media_final: mediaFinal,
        resultado: resVal,
        docente_id: user.id,
        docente_nome: rotuloAutorConta(user),
        // Frequência actualiza em tempo real no painel do estudante; a pauta
        // final (e /pautas público) só depois da aprovação do DP (publicado).
        // Cada novo lançamento/alteração do docente volta a exigir aprovação.
        publicado: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "estudante_id,curso,cadeira_codigo" }
    );
  };

  let { error } = await tentarUpsert(resultado);

  // Fallback se a tabela no Postgres ainda tiver a check constraint antiga
  if (error && /check constraint|estudantes_notas_resultado_check/i.test(error.message)) {
    let fallback = "Em Frequência";
    if (resultado === "Dispensado" || resultado === "Aprovado") fallback = "Aprovado";
    else if (resultado === "Reprovado" || resultado === "Excluído") fallback = "Reprovado";
    else fallback = "Em Frequência";

    const retry = await tentarUpsert(fallback);
    error = retry.error;
  }

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
