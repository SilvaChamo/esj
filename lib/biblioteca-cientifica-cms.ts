import { createBrowserSupabase } from "@/lib/supabase/browser";
import { getSupabase } from "@/lib/supabase";
import { cmsError, isMissingTable, slugify } from "@/lib/cms";
import type {
  CursoBibliotecaCodigo,
  ProjectoCientifico,
  TipoProjecto,
} from "@/lib/producao-cientifica";

export type BibliotecaCientificaRow = {
  id: string;
  slug: string;
  titulo: string;
  curso: CursoBibliotecaCodigo;
  tipo: TipoProjecto;
  ramos: string;
  tutor: string;
  avaliador: string;
  numero_estudante: string;
  ano: number;
  autores: string[];
  resumo: string;
  ficheiro: string | null;
  created_at?: string;
  updated_at?: string;
};

export type BibliotecaCientificaInput = {
  titulo: string;
  curso: CursoBibliotecaCodigo;
  tipo: TipoProjecto;
  ramos: string;
  tutor: string;
  avaliador: string;
  numeroEstudante: string;
  ano: number;
  autores: string[];
  resumo: string;
  ficheiro?: string | null;
  slug?: string;
};

function deLinha(row: BibliotecaCientificaRow): ProjectoCientifico {
  return {
    slug: row.slug,
    titulo: row.titulo,
    curso: row.curso,
    tipo: row.tipo,
    ramos: row.ramos,
    tutor: row.tutor,
    avaliador: row.avaliador || undefined,
    numeroEstudante: row.numero_estudante || undefined,
    ano: row.ano,
    autores: row.autores ?? [],
    resumo: row.resumo,
    ficheiro: row.ficheiro || undefined,
  };
}

export async function listBibliotecaCientifica(
  curso?: CursoBibliotecaCodigo
): Promise<BibliotecaCientificaRow[]> {
  const supabase = typeof window === "undefined" ? getSupabase() : createBrowserSupabase();
  if (!supabase) return [];
  let q = supabase
    .from("biblioteca_cientifica")
    .select("*")
    .order("ano", { ascending: false })
    .order("titulo", { ascending: true });
  if (curso) q = q.eq("curso", curso);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as BibliotecaCientificaRow[];
}

export async function listProjectosPublicos(): Promise<ProjectoCientifico[] | null> {
  try {
    const rows = await listBibliotecaCientifica();
    return rows.map(deLinha);
  } catch (error) {
    if (isMissingTable(error)) return null;
    console.error(cmsError(error));
    return null;
  }
}

export async function guardarBibliotecaCientifica(
  input: BibliotecaCientificaInput,
  id?: string
): Promise<string> {
  const supabase = createBrowserSupabase();
  const slugBase = input.slug?.trim() || slugify(input.titulo);
  const payload = {
    slug: slugBase,
    titulo: input.titulo.trim(),
    curso: input.curso,
    tipo: input.tipo,
    ramos: input.ramos.trim(),
    tutor: input.tutor.trim(),
    avaliador: input.avaliador.trim(),
    numero_estudante: input.numeroEstudante.trim(),
    ano: input.ano,
    autores: input.autores.map((a) => a.trim()).filter(Boolean),
    resumo: input.resumo.trim(),
    ficheiro: input.ficheiro?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await supabase.from("biblioteca_cientifica").update(payload).eq("id", id);
    if (error) throw error;
    return id;
  }

  const { data, error } = await supabase
    .from("biblioteca_cientifica")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function eliminarBibliotecaCientifica(id: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("biblioteca_cientifica").delete().eq("id", id);
  if (error) throw error;
}
