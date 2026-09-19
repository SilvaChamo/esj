import { createBrowserSupabase } from "@/lib/supabase/browser";
import { isMissingTable } from "@/lib/cms";
import type { CursoDocenciaSlug } from "@/lib/docencia";
import type { RegimeCurso } from "@/lib/curriculo";
import { calcularFrequencia, type EstadoFrequencia, type ResultadoNota } from "@/lib/notas-formula";

export type { ResultadoNota } from "@/lib/notas-formula";

export type NotaEstudante = {
  id: string;
  estudanteId: string;
  numeroEstudante: string;
  nomeEstudante: string;
  curso: CursoDocenciaSlug;
  cadeiraCodigo: string;
  cadeiraNome: string;
  regime: RegimeCurso;
  ano: number;
  semestre: number;
  teste1: number | null;
  teste2: number | null;
  trabalho: number | null;
  trabalho2: number | null;
  participacao: number | null;
  exameNormal: number | null;
  exameRecorrencia: number | null;
  notaFrequencia: number | null;
  estadoFrequencia: EstadoFrequencia;
  mediaFinal: number | null;
  resultado: ResultadoNota;
  docenteNome: string | null;
  publicado: boolean;
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
  regime: RegimeCurso;
  ano: number;
  semestre: number;
  teste1: number | null;
  teste2: number | null;
  trabalho: number | null;
  trabalho2: number | null;
  participacao: number | null;
  exame_normal: number | null;
  exame_recorrencia: number | null;
  media_final: number | null;
  resultado: ResultadoNota;
  docente_nome: string | null;
  publicado: boolean;
  updated_at: string;
};

function deLinha(row: NotaRow): NotaEstudante {
  const { notaFrequencia, estado } = calcularFrequencia({
    teste1: row.teste1,
    teste2: row.teste2,
    trabalho1: row.trabalho,
    trabalho2: row.trabalho2,
    participacao: row.participacao,
  });
  return {
    id: row.id,
    estudanteId: row.estudante_id,
    numeroEstudante: row.numero_estudante,
    nomeEstudante: row.nome_estudante,
    curso: row.curso,
    cadeiraCodigo: row.cadeira_codigo,
    cadeiraNome: row.cadeira_nome,
    regime: row.regime,
    ano: row.ano,
    semestre: row.semestre,
    teste1: row.teste1,
    teste2: row.teste2,
    trabalho: row.trabalho,
    trabalho2: row.trabalho2,
    participacao: row.participacao,
    exameNormal: row.exame_normal,
    exameRecorrencia: row.exame_recorrencia,
    notaFrequencia,
    estadoFrequencia: estado,
    mediaFinal: row.media_final,
    resultado: row.resultado,
    docenteNome: row.docente_nome,
    publicado: row.publicado,
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

/** Pauta de uma cadeira para quem tem sessão (docente/secretaria/o próprio estudante). Devolve null se a tabela ainda não existir. */
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

/**
 * Pauta final pública de uma cadeira (/pautas) — só cadeiras já publicadas
 * pelo registo académico. Funciona sem sessão iniciada (RLS pública filtra
 * por publicado = true).
 */
export async function listarPautaFinalPublica(
  curso: CursoDocenciaSlug,
  regime: RegimeCurso,
  cadeiraCodigo: string
): Promise<NotaEstudante[] | null> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("estudantes_notas")
    .select("*")
    .eq("curso", curso)
    .eq("regime", regime)
    .eq("cadeira_codigo", cadeiraCodigo)
    .eq("publicado", true)
    .order("nome_estudante", { ascending: true });
  if (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
  return (data ?? []).map(deLinha);
}

export type CadeiraComNotas = {
  cadeiraCodigo: string;
  cadeiraNome: string;
  ano: number;
  semestre: number;
  total: number;
  publicadas: number;
};

/**
 * Resumo por cadeira (quantas notas lançadas / quantas já publicadas) para
 * o registo académico escolher o que publicar. Exige sessão (RLS). Devolve
 * null se a tabela ainda não existir.
 */
export async function listarCadeirasComNotas(
  curso: CursoDocenciaSlug,
  regime: RegimeCurso
): Promise<CadeiraComNotas[] | null> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("estudantes_notas")
    .select("cadeira_codigo, cadeira_nome, ano, semestre, publicado")
    .eq("curso", curso)
    .eq("regime", regime);
  if (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
  const porCadeira = new Map<string, CadeiraComNotas>();
  for (const row of data ?? []) {
    const atual = porCadeira.get(row.cadeira_codigo) ?? {
      cadeiraCodigo: row.cadeira_codigo,
      cadeiraNome: row.cadeira_nome,
      ano: row.ano,
      semestre: row.semestre,
      total: 0,
      publicadas: 0,
    };
    atual.total += 1;
    if (row.publicado) atual.publicadas += 1;
    porCadeira.set(row.cadeira_codigo, atual);
  }
  return Array.from(porCadeira.values()).sort((a, b) => a.cadeiraNome.localeCompare(b.cadeiraNome, "pt"));
}
