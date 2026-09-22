import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { eSuperAdmin } from "@/lib/gestao-auth";

export const dynamic = "force-dynamic";

/**
 * Aprova (ou retira) a pauta final de uma cadeira — só super-admin / DP.
 * Enquanto publicado=false, o estudante vê só a frequência em tempo real.
 */
export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });
  const { data: sessao } = await supabase.auth.getUser();
  if (!eSuperAdmin(sessao.user)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const curso = String(body?.curso || "");
  const cadeiraCodigo = String(body?.cadeiraCodigo || "");
  const regime = body?.regime === "pos-laboral" ? "pos-laboral" : "diurno";
  const publicado = body?.publicado !== false;

  if (!curso || !cadeiraCodigo) {
    return NextResponse.json({ error: "Indique o curso e a cadeira." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Chave de serviço do Supabase não configurada no servidor." },
      { status: 503 }
    );
  }

  const { error, count } = await admin
    .from("estudantes_notas")
    .update({ publicado, updated_at: new Date().toISOString() }, { count: "exact" })
    .eq("curso", curso)
    .eq("cadeira_codigo", cadeiraCodigo)
    .eq("regime", regime);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, actualizados: count ?? 0, publicado });
}
