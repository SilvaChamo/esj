import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { eSuperAdmin } from "@/lib/gestao-auth";

export const dynamic = "force-dynamic";

async function pedirAdmin() {
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
  const { data } = await supabase.auth.getUser();
  return eSuperAdmin(data.user);
}

/**
 * Incrementa a ÚLTIMA sequência de dígitos de um número de estudante,
 * mantendo o resto do formato (prefixo/sufixo). Ex.: "20260001MP" -> "20260002MP".
 * Preserva o número de dígitos (zero-padding), tal como o número inicial.
 */
function incrementarNumero(numero: string): string {
  const m = numero.match(/^(.*?)(\d+)(\D*)$/);
  if (!m) {
    throw new Error(
      `"${numero}" não tem dígitos para incrementar — o número inicial precisa de pelo menos um dígito.`
    );
  }
  const [, prefixo, digitos, sufixo] = m;
  const seguinte = String(BigInt(digitos) + BigInt(1)).padStart(digitos.length, "0");
  return `${prefixo}${seguinte}${sufixo}`;
}

const CURSOS_VALIDOS = ["jornalismo", "publicidade-e-marketing", "relacoes-publicas", "biblioteconomia-e-documentacao"];
const REGIMES_VALIDOS = ["diurno", "pos-laboral"];

/** GET ?curso=&regime= — devolve o próximo número já guardado, ou null se ainda não houver semente. */
export async function GET(request: Request) {
  if (!(await pedirAdmin())) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Chave de serviço do Supabase não configurada no servidor." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const curso = String(searchParams.get("curso") || "");
  const regime = String(searchParams.get("regime") || "");
  if (!CURSOS_VALIDOS.includes(curso) || !REGIMES_VALIDOS.includes(regime)) {
    return NextResponse.json({ error: "Curso ou regime inválido." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("numeracao_estudantes")
    .select("proximo_numero")
    .eq("curso", curso)
    .eq("regime", regime)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ proximoNumero: data?.proximo_numero ?? null });
}

/** PUT { curso, regime, numeroInicial } — define/repõe a semente (a secretaria digita-a uma única vez). */
export async function PUT(request: Request) {
  if (!(await pedirAdmin())) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Chave de serviço do Supabase não configurada no servidor." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const curso = String(body?.curso || "");
  const regime = String(body?.regime || "");
  const numeroInicial = String(body?.numeroInicial || "").trim();
  if (!CURSOS_VALIDOS.includes(curso) || !REGIMES_VALIDOS.includes(regime)) {
    return NextResponse.json({ error: "Curso ou regime inválido." }, { status: 400 });
  }
  if (!numeroInicial || !/\d/.test(numeroInicial)) {
    return NextResponse.json(
      { error: "Indique um número inicial válido (com pelo menos um dígito)." },
      { status: 400 }
    );
  }

  const { error } = await admin
    .from("numeracao_estudantes")
    .upsert(
      { curso, regime, proximo_numero: numeroInicial, updated_at: new Date().toISOString() },
      { onConflict: "curso,regime" }
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, proximoNumero: numeroInicial });
}

/**
 * POST { curso, regime } — "consome" o próximo número: devolve-o e já
 * avança o contador para o seguinte, para a próxima conta criada não
 * repetir. Não é atómico ao nível da base de dados (leitura-depois-escrita),
 * mas a criação de contas é feita uma pessoa de cada vez pela secretaria,
 * nunca em paralelo, por isso é seguro nesta escala.
 */
export async function POST(request: Request) {
  if (!(await pedirAdmin())) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Chave de serviço do Supabase não configurada no servidor." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const curso = String(body?.curso || "");
  const regime = String(body?.regime || "");
  if (!CURSOS_VALIDOS.includes(curso) || !REGIMES_VALIDOS.includes(regime)) {
    return NextResponse.json({ error: "Curso ou regime inválido." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("numeracao_estudantes")
    .select("proximo_numero")
    .eq("curso", curso)
    .eq("regime", regime)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data?.proximo_numero) {
    return NextResponse.json(
      {
        error:
          "Ainda não há número inicial definido para este curso/regime — indique-o uma vez em Estudantes → Numeração.",
      },
      { status: 400 }
    );
  }

  const numeroAtribuido = data.proximo_numero;
  let seguinte: string;
  try {
    seguinte = incrementarNumero(numeroAtribuido);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Não foi possível gerar o número seguinte." }, { status: 400 });
  }

  const { error: updErr } = await admin
    .from("numeracao_estudantes")
    .update({ proximo_numero: seguinte, updated_at: new Date().toISOString() })
    .eq("curso", curso)
    .eq("regime", regime);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });

  return NextResponse.json({ numeroAtribuido, proximoNumero: seguinte });
}
