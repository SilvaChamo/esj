import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { eSuperAdmin } from "@/lib/gestao-auth";

export const dynamic = "force-dynamic";

/**
 * Publica ou despublica a pauta final de uma cadeira (todas as linhas dessa
 * turma em estudantes_notas) — acto do registo académico, só super-admin.
 * A escrita usa a chave de serviço porque afecta linhas de vários
 * estudantes, não apenas do próprio utilizador.
 */
async function pedirSuperAdmin() {
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

export async function POST(request: Request) {
  if (!(await pedirSuperAdmin())) {
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
  const cadeiraCodigo = String(body?.cadeiraCodigo || "");
  const publicado = Boolean(body?.publicado);

  if (!curso || !regime || !cadeiraCodigo) {
    return NextResponse.json({ error: "Indique curso, regime e cadeira." }, { status: 400 });
  }

  const { error, count } = await admin
    .from("estudantes_notas")
    .update({ publicado }, { count: "exact" })
    .eq("curso", curso)
    .eq("regime", regime)
    .eq("cadeira_codigo", cadeiraCodigo);

  if (error) {
    if (/Could not find the table|PGRST205|schema cache/i.test(error.message)) {
      return NextResponse.json(
        { error: "A tabela de notas ainda não existe.", needsSchema: true },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, actualizadas: count ?? 0 });
}
