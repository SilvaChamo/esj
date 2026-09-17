import { createBrowserSupabase } from "@/lib/supabase/browser";
import { cmsError, isMissingTable, slugify, uploadMedia } from "@/lib/cms";

export type TipoMaterialDocencia = "pauta" | "livro" | "outro";

export type CursoDocenciaSlug =
  | "jornalismo"
  | "publicidade-e-marketing"
  | "relacoes-publicas"
  | "biblioteconomia-e-documentacao";

export type MaterialDocencia = {
  id: string;
  curso: CursoDocenciaSlug;
  cadeira: string;
  cadeiraSlug: string;
  tipo: TipoMaterialDocencia;
  titulo: string;
  ficheiro: string;
  autor: string | null;
  autorId: string | null;
  createdAt: string;
};

export type CadeiraDocencia = {
  slug: string;
  nome: string;
  materiais: MaterialDocencia[];
};

export const CURSOS_DOCENCIA: { slug: CursoDocenciaSlug; titulo: string }[] = [
  { slug: "jornalismo", titulo: "Jornalismo" },
  { slug: "publicidade-e-marketing", titulo: "Publicidade e Marketing" },
  { slug: "relacoes-publicas", titulo: "Relações Públicas" },
  { slug: "biblioteconomia-e-documentacao", titulo: "Biblioteconomia e Documentação" },
];

export const TIPOS_MATERIAL_DOCENCIA: { id: TipoMaterialDocencia; label: string }[] = [
  { id: "pauta", label: "Pauta" },
  { id: "livro", label: "Livro" },
  { id: "outro", label: "Outro material" },
];

export function cursoDocenciaPorSlug(slug: string) {
  return CURSOS_DOCENCIA.find((c) => c.slug === slug) ?? null;
}

export function labelTipoMaterial(tipo: TipoMaterialDocencia) {
  return TIPOS_MATERIAL_DOCENCIA.find((t) => t.id === tipo)?.label ?? tipo;
}

type MaterialRow = {
  id: string;
  curso: CursoDocenciaSlug;
  cadeira: string;
  cadeira_slug: string;
  tipo: TipoMaterialDocencia;
  titulo: string;
  ficheiro: string;
  autor: string | null;
  autor_id: string | null;
  created_at: string;
};

function deLinha(row: MaterialRow): MaterialDocencia {
  return {
    id: row.id,
    curso: row.curso,
    cadeira: row.cadeira,
    cadeiraSlug: row.cadeira_slug,
    tipo: row.tipo,
    titulo: row.titulo,
    ficheiro: row.ficheiro,
    autor: row.autor,
    autorId: row.autor_id,
    createdAt: row.created_at,
  };
}

/** Lista os materiais; devolve null se a tabela ainda não existir (a instalar no painel). */
export async function listMateriaisDocencia(
  curso?: CursoDocenciaSlug
): Promise<MaterialDocencia[] | null> {
  const supabase = createBrowserSupabase();
  let q = supabase
    .from("docencia_materiais")
    .select("*")
    .order("cadeira", { ascending: true })
    .order("created_at", { ascending: false });
  if (curso) q = q.eq("curso", curso);
  const { data, error } = await q;
  if (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
  return (data ?? []).map(deLinha);
}

/** Agrupa os materiais de um curso por cadeira. */
export function agruparPorCadeira(materiais: MaterialDocencia[]): CadeiraDocencia[] {
  const porSlug = new Map<string, CadeiraDocencia>();
  for (const m of materiais) {
    const existente = porSlug.get(m.cadeiraSlug);
    if (existente) {
      existente.materiais.push(m);
    } else {
      porSlug.set(m.cadeiraSlug, { slug: m.cadeiraSlug, nome: m.cadeira, materiais: [m] });
    }
  }
  return Array.from(porSlug.values()).sort((a, b) => a.nome.localeCompare(b.nome, "pt"));
}

export async function adicionarMaterialDocencia(input: {
  curso: CursoDocenciaSlug;
  cadeira: string;
  tipo: TipoMaterialDocencia;
  titulo: string;
  ficheiro: File;
  autor: string | null;
  autorId: string | null;
}): Promise<string> {
  const supabase = createBrowserSupabase();
  const cadeira = input.cadeira.trim();
  if (!cadeira) throw new Error("Indique a cadeira.");
  const titulo = input.titulo.trim();
  if (!titulo) throw new Error("Indique o título do material.");

  const url = await uploadMedia(input.ficheiro, "docencia");

  const { data, error } = await supabase
    .from("docencia_materiais")
    .insert({
      curso: input.curso,
      cadeira,
      cadeira_slug: slugify(cadeira),
      tipo: input.tipo,
      titulo,
      ficheiro: url,
      autor: input.autor,
      autor_id: input.autorId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function eliminarMaterialDocencia(id: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("docencia_materiais").delete().eq("id", id);
  if (error) throw error;
}

export { cmsError, isMissingTable };
