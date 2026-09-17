import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { eSuperAdmin } from "@/lib/gestao-auth";

export const dynamic = "force-dynamic";

/** Confirma que quem chamou a rota tem sessão iniciada como super-admin. */
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

export async function GET() {
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
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const docentes = data.users
    .filter((u) => String(u.user_metadata?.role || "").toLowerCase() === "docente")
    .map((u) => ({
      id: u.id,
      email: u.email,
      nome: u.user_metadata?.full_name || null,
      createdAt: u.created_at,
    }));
  return NextResponse.json({ docentes });
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
  const email = String(body?.email || "").trim();
  const password = String(body?.password || "");
  const nome = String(body?.nome || "").trim();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Indique um correio válido." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "A palavra-passe deve ter pelo menos 6 caracteres." },
      { status: 400 }
    );
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "docente", full_name: nome || undefined },
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data.user?.id });
}

export async function DELETE(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || "";
  if (!id) return NextResponse.json({ error: "Indique a conta a eliminar." }, { status: 400 });

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
