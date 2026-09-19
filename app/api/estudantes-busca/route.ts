import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { eDocente, eSuperAdmin } from "@/lib/gestao-auth";

export const dynamic = "force-dynamic";

/**
 * Só docentes (para localizar o estudante a avaliar) e a Gestão podem
 * pesquisar contas de estudante — esta rota usa a chave de serviço para ver
 * todas as contas, por isso não pode ficar aberta a qualquer sessão.
 */
async function pedirDocenteOuAdmin() {
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
  return eDocente(data.user) || eSuperAdmin(data.user);
}

export async function GET(request: Request) {
  if (!(await pedirDocenteOuAdmin())) {
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
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  if (q.length < 2) {
    return NextResponse.json({ estudantes: [] });
  }

  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const estudantes = data.users
    .filter((u) => String(u.user_metadata?.role || "").toLowerCase() === "estudante")
    .map((u) => ({
      id: u.id,
      email: u.email,
      nome: u.user_metadata?.full_name || u.user_metadata?.nome || null,
      numeroEstudante: u.user_metadata?.numero_estudante || u.user_metadata?.numeroEstudante || null,
      curso: u.user_metadata?.curso || null,
    }))
    .filter(
      (e) =>
        (e.nome || "").toLowerCase().includes(q) ||
        (e.email || "").toLowerCase().includes(q) ||
        (e.numeroEstudante || "").toLowerCase().includes(q)
    )
    .slice(0, 20);

  return NextResponse.json({ estudantes });
}
