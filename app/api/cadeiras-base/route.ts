import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { pedirSuperAdmin } from "@/lib/gestao-api-auth";
import { todasAsCadeirasPorCurso } from "@/lib/docencia-cadeiras";

export const dynamic = "force-dynamic";

const CURSOS_VALIDOS = [
  "jornalismo",
  "publicidade-e-marketing",
  "relacoes-publicas",
  "biblioteconomia-e-documentacao",
];

/** Confirma que curso+codigo correspondem a uma cadeira real do catálogo estático (lib/curriculo.ts). */
function cadeiraBaseExiste(curso: string, codigo: string): boolean {
  const grupo = todasAsCadeirasPorCurso().find((g) => g.curso === curso);
  return !!grupo?.cadeiras.some((c) => c.codigo === codigo);
}

/**
 * Corrige o nome/ano/semestre de uma cadeira do catálogo estático. O código
 * nunca muda aqui — é a chave usada em docencia_cadeiras/docencia_materiais/
 * notas — por isso só se escreve em cadeiras_overrides, nunca em curriculo.ts.
 */
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
  const curso = String(body?.curso || "");
  const codigo = String(body?.codigo || "").trim();
  const nome = String(body?.nome || "").trim();
  const ano = Number(body?.ano);
  const semestre = Number(body?.semestre);

  if (!CURSOS_VALIDOS.includes(curso)) {
    return NextResponse.json({ error: "Curso inválido." }, { status: 400 });
  }
  if (!codigo || !cadeiraBaseExiste(curso, codigo)) {
    return NextResponse.json({ error: "Esta cadeira não existe no catálogo base." }, { status: 400 });
  }
  if (!nome) {
    return NextResponse.json({ error: "Indique o nome da cadeira." }, { status: 400 });
  }
  if (!Number.isInteger(ano) || ano < 1 || ano > 4) {
    return NextResponse.json({ error: "Ano inválido." }, { status: 400 });
  }
  if (semestre !== 1 && semestre !== 2) {
    return NextResponse.json({ error: "Semestre inválido." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("cadeiras_overrides")
    .upsert({ curso, codigo, nome, ano, semestre, removida: false }, { onConflict: "curso,codigo" })
    .select()
    .single();

  if (error) {
    if (/Could not find the table|PGRST205|schema cache/i.test(error.message)) {
      return NextResponse.json(
        { error: "A tabela cadeiras_overrides ainda não existe.", needsSchema: true },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, override: data });
}

/** Esconde uma cadeira do catálogo estático (não apaga o código-fonte, só marca removida=true). */
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

  const url = new URL(request.url);
  const curso = url.searchParams.get("curso") || "";
  const codigo = (url.searchParams.get("codigo") || "").trim();

  if (!CURSOS_VALIDOS.includes(curso)) {
    return NextResponse.json({ error: "Curso inválido." }, { status: 400 });
  }
  if (!codigo || !cadeiraBaseExiste(curso, codigo)) {
    return NextResponse.json({ error: "Esta cadeira não existe no catálogo base." }, { status: 400 });
  }

  const { error } = await admin
    .from("cadeiras_overrides")
    .upsert({ curso, codigo, removida: true }, { onConflict: "curso,codigo" });

  if (error) {
    if (/Could not find the table|PGRST205|schema cache/i.test(error.message)) {
      return NextResponse.json(
        { error: "A tabela cadeiras_overrides ainda não existe.", needsSchema: true },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

/** Repõe uma cadeira escondida (removida=false), sem mexer num eventual nome/ano/semestre corrigido. */
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

  if (!CURSOS_VALIDOS.includes(curso)) {
    return NextResponse.json({ error: "Curso inválido." }, { status: 400 });
  }
  if (!codigo || !cadeiraBaseExiste(curso, codigo)) {
    return NextResponse.json({ error: "Esta cadeira não existe no catálogo base." }, { status: 400 });
  }

  const { error } = await admin
    .from("cadeiras_overrides")
    .upsert({ curso, codigo, removida: false }, { onConflict: "curso,codigo" });

  if (error) {
    if (/Could not find the table|PGRST205|schema cache/i.test(error.message)) {
      return NextResponse.json(
        { error: "A tabela cadeiras_overrides ainda não existe.", needsSchema: true },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
