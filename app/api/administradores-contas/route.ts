import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { eSuperAdmin } from "@/lib/gestao-auth";

export const dynamic = "force-dynamic";

const PAPEIS_ADMIN = ["admin", "administrador", "super_admin", "superadmin"];

/**
 * Devolve o utilizador autenticado se for super-admin, ou null. Esta rota
 * usa a service role key (acesso total à autenticação — cria, altera e
 * apaga QUALQUER conta, incluindo outras de administração), por isso não
 * pode ficar ao mesmo nível de "sessão iniciada" do resto do painel.
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
  return eSuperAdmin(data.user) ? data.user : null;
}

export async function GET() {
  const user = await pedirSuperAdmin();
  if (!user) {
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

  const administradores = data.users
    .filter((u) => PAPEIS_ADMIN.includes(String(u.user_metadata?.role || "").toLowerCase()))
    .map((u) => ({
      id: u.id,
      email: u.email,
      nome: u.user_metadata?.full_name || null,
      createdAt: u.created_at,
      souEu: u.id === user.id,
    }));
  return NextResponse.json({ administradores });
}

export async function POST(request: Request) {
  const user = await pedirSuperAdmin();
  if (!user) {
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
    user_metadata: { role: "administrador", full_name: nome || undefined },
  });
  if (!error) return NextResponse.json({ ok: true, id: data.user?.id });

  // Correio já pertence a outra conta: em vez de falhar, concede-lhe o
  // papel de administrador — mas nunca lhe repõe a palavra-passe (é a
  // conta de outra pessoa).
  if (/already.*registered|already.*exists/i.test(error.message)) {
    const { data: lista, error: listErr } = await admin.auth.admin.listUsers({ perPage: 200 });
    if (listErr) return NextResponse.json({ error: listErr.message }, { status: 400 });
    const existente = lista.users.find(
      (u) => (u.email || "").toLowerCase() === email.toLowerCase()
    );
    if (!existente) return NextResponse.json({ error: error.message }, { status: 400 });

    const { data: actualizado, error: updErr } = await admin.auth.admin.updateUserById(
      existente.id,
      {
        user_metadata: {
          ...existente.user_metadata,
          role: "administrador",
          full_name: nome || existente.user_metadata?.full_name,
        },
      }
    );
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });
    return NextResponse.json({ ok: true, id: actualizado.user?.id, actualizado: true });
  }

  return NextResponse.json({ error: error.message }, { status: 400 });
}

export async function PUT(request: Request) {
  const user = await pedirSuperAdmin();
  if (!user) {
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
  const id = String(body?.id || "").trim();
  const nome = String(body?.nome || "").trim();
  const email = String(body?.email || "").trim();
  const password = String(body?.password || "").trim();

  if (!id) return NextResponse.json({ error: "Indique a conta a atualizar." }, { status: 400 });
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Indique um correio válido." }, { status: 400 });
  }
  if (password && password.length < 6) {
    return NextResponse.json(
      { error: "A palavra-passe deve ter pelo menos 6 caracteres." },
      { status: 400 }
    );
  }

  const { data: existente, error: getErr } = await admin.auth.admin.getUserById(id);
  if (getErr || !existente.user) {
    return NextResponse.json({ error: getErr?.message || "Conta não encontrada." }, { status: 400 });
  }

  const updatePayload: {
    user_metadata: Record<string, unknown>;
    email: string;
    email_confirm: boolean;
    password?: string;
  } = {
    user_metadata: { ...existente.user.user_metadata, role: "administrador", full_name: nome || undefined },
    email,
    // Sem isto, o Supabase deixa o e-mail antigo activo à espera de
    // confirmação por link — uma correcção feita pela secretaria deve
    // aplicar-se de imediato.
    email_confirm: true,
  };
  if (password) updatePayload.password = password;

  const { error } = await admin.auth.admin.updateUserById(id, updatePayload);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await pedirSuperAdmin();
  if (!user) {
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

  // Nunca a partir daqui — evita que um administrador se tranque fora do
  // painel sem querer (não há forma de repor o próprio acesso sem outra
  // conta de administração já existente).
  if (id === user.id) {
    return NextResponse.json(
      { error: "Não pode eliminar a sua própria conta a partir daqui." },
      { status: 400 }
    );
  }

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
