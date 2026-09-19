import { createBrowserSupabase } from "@/lib/supabase/browser";
import { isMissingTable } from "@/lib/cms";
import type { CursoDocenciaSlug } from "@/lib/docencia";

export type ResultadoNota = "Aprovado" | "Em Frequência" | "Reprovado" | "Excluído";

export type NotaEstudante = {
  id: string;
  estudanteId: string;
  numeroEstudante: string;
  nomeEstudante: string;
  curso: CursoDocenciaSlug;
  cadeiraCodigo: string;
  cadeiraNome: string;
  ano: number;
  semestre: number;
  teste1: number | null;
  teste2: number | null;
  trabalho: number | null;
  exameNormal: number | null;
  mediaFinal: number | null;
  resultado: ResultadoNota;
  docenteNome: string | null;
  updatedAt: string;
};

type NotaRow = {
  id: string;
  estudante_id: string;
  numero_estudante: string;
  nome_estudante: string;
  curso: CursoDocenciaSlug;
  cadeira_codigo: string;
  cadeira_nome: string;
  ano: number;
  semestre: number;
  teste1: number | null;
  teste2: number | null;
  trabalho: number | null;
  exame_normal: number | null;
  media_final: number | null;
  resultado: ResultadoNota;
  docente_nome: string | null;
  updated_at: string;
};

function deLinha(row: NotaRow): NotaEstudante {
  return {
    id: row.id,
    estudanteId: row.estudante_id,
    numeroEstudante: row.numero_estudante,
    nomeEstudante: row.nome_estudante,
    curso: row.curso,
    cadeiraCodigo: row.cadeira_codigo,
    cadeiraNome: row.cadeira_nome,
    ano: row.ano,
    semestre: row.semestre,
    teste1: row.teste1,
    teste2: row.teste2,
    trabalho: row.trabalho,
    exameNormal: row.exame_normal,
    mediaFinal: row.media_final,
    resultado: row.resultado,
    docenteNome: row.docente_nome,
    updatedAt: row.updated_at,
  };
}

/** Todas as notas já lançadas para o estudante autenticado. Devolve null se a tabela ainda não existir. */
export async function listarMinhasNotas(): Promise<NotaEstudante[] | null> {
  const supabase = createBrowserSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return [];

  const { data, error } = await supabase
    .from("estudantes_notas")
    .select("*")
    .eq("estudante_id", uid);
  if (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
  return (data ?? []).map(deLinha);
}

/** Pauta pública de uma cadeira (todos os estudantes já avaliados). Devolve null se a tabela ainda não existir. */
export async function listarPautaCadeira(
  curso: CursoDocenciaSlug,
  cadeiraCodigo: string
): Promise<NotaEstudante[] | null> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("estudantes_notas")
    .select("*")
    .eq("curso", curso)
    .eq("cadeira_codigo", cadeiraCodigo)
    .order("nome_estudante", { ascending: true });
  if (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
  return (data ?? []).map(deLinha);
}
