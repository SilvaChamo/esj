import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { pedirSuperAdmin } from "@/lib/gestao-api-auth";
import { CURRICULOS_ESJ } from "@/lib/curriculo";
import type { CursoDocenciaSlug } from "@/lib/docencia";

export const dynamic = "force-dynamic";

const CURSOS_VALIDOS = [
  "jornalismo",
  "publicidade-e-marketing",
  "relacoes-publicas",
  "biblioteconomia-e-documentacao",
];

/**
 * Impede criar/editar uma cadeira "extra" com um código já usado por uma
 * cadeira do plano curricular estático (lib/curriculo.ts) nesse curso — caso
 * contrário o catálogo (montarCatalogo) mostraria a mesma cadeira duas
 * vezes no selector, com um único checkbox a marcar as duas em simultâneo.
 */
function existeNoCurriculoBase(curso: CursoDocenciaSlug, codigo: string): boolean {
  return CURRICULOS_ESJ[curso].cadeiras.some((c) => c.codigo.toLowerCase() === codigo.toLowerCase());
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
  const codigo = String(body?.codigo || "").trim();
  const nome = String(body?.nome || "").trim();
  const ano = Number(body?.ano);
  const semestre = Number(body?.semestre);

  if (!CURSOS_VALIDOS.includes(curso)) {
    return NextResponse.json({ error: "Curso inválido." }, { status: 400 });
  }
  if (!codigo || !nome) {
    return NextResponse.json({ error: "Indique o código e o nome da cadeira." }, { status: 400 });
  }
  if (!Number.isInteger(ano) || ano < 1 || ano > 4) {
    return NextResponse.json({ error: "Ano inválido." }, { status: 400 });
  }
  if (semestre !== 1 && semestre !== 2) {
    return NextResponse.json({ error: "Semestre inválido." }, { status: 400 });
  }
  if (existeNoCurriculoBase(curso as CursoDocenciaSlug, codigo)) {
    return NextResponse.json(
      { error: "Já existe uma cadeira com este código no plano curricular deste curso." },
      { status: 400 }
    );
  }

  const { data, error } = await admin
    .from("cadeiras_adicionais")
    .insert({ curso, codigo, nome, ano, semestre })
    .select()
    .single();

  if (error) {
    if (/Could not find the table|PGRST205|schema cache/i.test(error.message)) {
      return NextResponse.json(
        { error: "A tabela cadeiras_adicionais ainda não existe.", needsSchema: true },
        { status: 400 }
      );
    }
    if (/duplicate key|unique/i.test(error.message)) {
      return NextResponse.json({ error: "Já existe uma cadeira com este código neste curso." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, cadeira: data });
}

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
  const id = String(body?.id || "");
  const curso = String(body?.curso || "");
  const codigo = String(body?.codigo || "").trim();
  const nome = String(body?.nome || "").trim();
  const ano = Number(body?.ano);
  const semestre = Number(body?.semestre);

  if (!id) {
    return NextResponse.json({ error: "Cadeira não indicada." }, { status: 400 });
  }
  if (!CURSOS_VALIDOS.includes(curso)) {
    return NextResponse.json({ error: "Curso inválido." }, { status: 400 });
  }
  if (!codigo || !nome) {
    return NextResponse.json({ error: "Indique o código e o nome da cadeira." }, { status: 400 });
  }
  if (!Number.isInteger(ano) || ano < 1 || ano > 4) {
    return NextResponse.json({ error: "Ano inválido." }, { status: 400 });
  }
  if (semestre !== 1 && semestre !== 2) {
    return NextResponse.json({ error: "Semestre inválido." }, { status: 400 });
  }
  if (existeNoCurriculoBase(curso as CursoDocenciaSlug, codigo)) {
    return NextResponse.json(
      { error: "Já existe uma cadeira com este código no plano curricular deste curso." },
      { status: 400 }
    );
  }

  const { data, error } = await admin
    .from("cadeiras_adicionais")
    .update({ curso, codigo, nome, ano, semestre })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (/duplicate key|unique/i.test(error.message)) {
      return NextResponse.json({ error: "Já existe uma cadeira com este código neste curso." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, cadeira: data });
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

  const id = new URL(request.url).searchParams.get("id") || "";
  if (!id) {
    return NextResponse.json({ error: "Cadeira não indicada." }, { status: 400 });
  }

  const { error } = await admin.from("cadeiras_adicionais").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
