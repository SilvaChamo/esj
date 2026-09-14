import { getSupabase } from "@/lib/supabase";

export const CALENDARIO_KEY = "esj-calendario";
export const CALENDARIO_EVENT = "esj-calendario";

export type Calendario = {
  inscricoes: string;
  exames: string;
  resultados: string;
  inicioAno: string;
};

export const DEFAULT_CALENDARIO: Calendario = {
  inscricoes:
    "O prazo de pré-inscrição para o ano lectivo 2026 encontra-se encerrado. O próximo período, para o ano lectivo 2027, deverá abrir em Novembro.",
  exames:
    "Provas de Português e História, para todas as licenciaturas, nos regimes diurno e pós-laboral, em data e local a anunciar no edital do próximo ciclo de admissão.",
  resultados:
    "Divulgados pela Secretaria Académica através deste portal, após a correcção dos exames de admissão.",
  inicioAno:
    "Datas de matrículas, acolhimento aos novos estudantes e início das aulas publicadas no edital de admissão do próximo ciclo, disponível nesta página e em /edital.",
};

export function readCalendario(): Calendario {
  if (typeof window === "undefined") return DEFAULT_CALENDARIO;
  try {
    const raw = window.localStorage.getItem(CALENDARIO_KEY);
    if (!raw) return DEFAULT_CALENDARIO;
    return { ...DEFAULT_CALENDARIO, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CALENDARIO;
  }
}

export function writeCalendario(data: Calendario) {
  window.localStorage.setItem(CALENDARIO_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(CALENDARIO_EVENT));
}

export async function loadCalendario(): Promise<Calendario> {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase
      .from("calendario_academico")
      .select("inscricoes, exames, resultados, inicio_ano")
      .eq("id", 1)
      .maybeSingle();
    if (data) {
      return {
        inscricoes: data.inscricoes,
        exames: data.exames,
        resultados: data.resultados,
        inicioAno: data.inicio_ano,
      };
    }
  }
  return readCalendario();
}
