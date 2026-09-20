import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { eSuperAdmin } from "@/lib/gestao-auth";

export const dynamic = "force-dynamic";

/**
 * A tabela "inscricoes" só tem políticas RLS de insert (público) e select
 * (autenticado) — de propósito, para que eliminar uma candidatura exija
 * sempre esta rota com a chave de serviço, nunca escrita directa do browser.
 */
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

export async function DELETE(request: Request) {
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
  const protocolos = Array.isArray(body?.protocolos)
    ? body.protocolos.map((p: unknown) => String(p)).filter(Boolean)
    : [];
  if (protocolos.length === 0) {
    return NextResponse.json({ error: "Indique pelo menos uma candidatura a eliminar." }, { status: 400 });
  }

  const { error, count } = await admin
    .from("inscricoes")
    .delete({ count: "exact" })
    .in("protocolo", protocolos);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, eliminados: count ?? protocolos.length });
}
