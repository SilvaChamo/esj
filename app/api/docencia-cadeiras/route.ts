import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { eSuperAdmin } from "@/lib/gestao-auth";

export const dynamic = "force-dynamic";

const TABELA_EM_FALTA = /Could not find the table|PGRST205|schema cache/i;

/**
 * Só a Gestão (super-admin) atribui cadeiras a docentes — o mesmo critério
 * usado para criar/eliminar contas de docente em /api/docencia-contas.
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

export async function GET(request: Request) {
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
  const docenteId = searchParams.get("docenteId") || "";
  if (!docenteId) {
    return NextResponse.json({ error: "Indique o docente." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("docencia_cadeiras")
    .select("*")
    .eq("docente_id", docenteId);
  if (error) {
    if (TABELA_EM_FALTA.test(error.message)) {
      return NextResponse.json({ cadeiras: [], needsSchema: true });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ cadeiras: data ?? [] });
}

/** Substitui por completo o conjunto de cadeiras atribuídas a um docente. */
export async function PUT(request: Request) {
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
  const docenteId = String(body?.docenteId || "");
  const docenteEmail = body?.docenteEmail ? String(body.docenteEmail) : null;
  const cadeiras: any[] = Array.isArray(body?.cadeiras) ? body.cadeiras : [];
  if (!docenteId) {
    return NextResponse.json({ error: "Indique o docente." }, { status: 400 });
  }

  const del = await admin.from("docencia_cadeiras").delete().eq("docente_id", docenteId);
  if (del.error) {
    if (TABELA_EM_FALTA.test(del.error.message)) {
      return NextResponse.json(
        { error: "A tabela de cadeiras de docência ainda não existe.", needsSchema: true },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: del.error.message }, { status: 400 });
  }

  const linhas: {
    docente_id: string;
    docente_email: string | null;
    curso: string;
    cadeira_codigo: string;
    cadeira_nome: string;
    ano: number | null;
    semestre: number | null;
  }[] = cadeiras
    .map((c: any) => ({
      docente_id: docenteId,
      docente_email: docenteEmail,
      curso: String(c.curso || ""),
      cadeira_codigo: String(c.codigo || ""),
      cadeira_nome: String(c.nome || ""),
      ano: Number(c.ano) || null,
      semestre: Number(c.semestre) || null,
    }))
    .filter((l) => l.curso && l.cadeira_codigo && l.cadeira_nome);

  if (linhas.length > 0) {
    const ins = await admin.from("docencia_cadeiras").insert(linhas);
    if (ins.error) {
      return NextResponse.json({ error: ins.error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true, total: linhas.length });
}
