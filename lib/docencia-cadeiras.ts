import { createBrowserSupabase } from "@/lib/supabase/browser";
import { isMissingTable } from "@/lib/cms";
import { CURRICULOS_ESJ, type CadeiraCurriculo } from "@/lib/curriculo";
import type { CursoDocenciaSlug } from "@/lib/docencia";

export type CadeiraAtribuida = {
  id: string;
  docenteId: string;
  curso: CursoDocenciaSlug;
  cadeiraCodigo: string;
  cadeiraNome: string;
  ano: number | null;
  semestre: number | null;
};

type CadeiraAtribuidaRow = {
  id: string;
  docente_id: string;
  curso: CursoDocenciaSlug;
  cadeira_codigo: string;
  cadeira_nome: string;
  ano: number | null;
  semestre: number | null;
};

function deLinha(row: CadeiraAtribuidaRow): CadeiraAtribuida {
  return {
    id: row.id,
    docenteId: row.docente_id,
    curso: row.curso,
    cadeiraCodigo: row.cadeira_codigo,
    cadeiraNome: row.cadeira_nome,
    ano: row.ano,
    semestre: row.semestre,
  };
}

/**
 * Cadeiras atribuídas ao docente autenticado. A RLS filtra sempre por
 * docente_id = auth.uid(), por isso não é possível ler as de outra pessoa
 * a partir do cliente. Devolve null se a tabela ainda não existir.
 */
export async function listarMinhasCadeiras(): Promise<CadeiraAtribuida[] | null> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("docencia_cadeiras")
    .select("*")
    .order("curso", { ascending: true })
    .order("ano", { ascending: true });
  if (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
  return (data ?? []).map(deLinha);
}

/** Todas as cadeiras de todos os cursos, agrupadas — usado pelo selector de atribuição na Gestão. */
export function todasAsCadeirasPorCurso(): {
  curso: CursoDocenciaSlug;
  cursoNome: string;
  cadeiras: CadeiraCurriculo[];
}[] {
  return Object.values(CURRICULOS_ESJ).map((c) => ({
    curso: c.cursoSlug,
    cursoNome: c.cursoNome,
    cadeiras: c.cadeiras,
  }));
}
