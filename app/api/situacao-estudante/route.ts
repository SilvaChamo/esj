import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { eSuperAdmin } from "@/lib/gestao-auth";

export const dynamic = "force-dynamic";

const TABELA_EM_FALTA = /Could not find the table|PGRST205|schema cache/i;
const ESTADOS_MATRICULA = ["activo", "trancado", "desistiu"];

/**
 * Confirmar/editar a situação (regularizado ou não) de um estudante é acto
 * da secretaria — só super-admin, tal como em /api/docencia-cadeiras. A
 * escrita real usa a chave de serviço porque o estudante avaliado não é
 * quem está a gravar a linha.
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
  const numeroEstudante = String(body?.numeroEstudante || "").trim();
  const nome = String(body?.nome || "").trim();
  if (!numeroEstudante || !nome) {
    return NextResponse.json({ error: "Indique o número de estudante e o nome." }, { status: 400 });
  }
  const matriculaEstado = String(body?.matriculaEstado || "activo");
  if (!ESTADOS_MATRICULA.includes(matriculaEstado)) {
    return NextResponse.json({ error: "Estado de matrícula inválido." }, { status: 400 });
  }

  const { error } = await admin.from("situacao_estudante").upsert(
    {
      numero_estudante: numeroEstudante,
      nome,
      curso: body?.curso ? String(body.curso) : null,
      regime: body?.regime ? String(body.regime) : null,
      regularizado: Boolean(body?.regularizado),
      observacao: body?.observacao ? String(body.observacao).trim() : null,
      matricula_estado: matriculaEstado,
      updated_at: new Date().toISOString(),
      updated_by: body?.updatedBy ? String(body.updatedBy) : null,
    },
    { onConflict: "numero_estudante" }
  );

  if (error) {
    if (TABELA_EM_FALTA.test(error.message)) {
      return NextResponse.json(
        { error: "A tabela de situação do estudante ainda não existe.", needsSchema: true },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
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
  if (!id) {
    return NextResponse.json({ error: "Indique o registo a remover." }, { status: 400 });
  }

  const { error } = await admin.from("situacao_estudante").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
