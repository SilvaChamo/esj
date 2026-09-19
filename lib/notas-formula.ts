/**
 * Regra real de avaliação da ESJ, confirmada a partir de documentos oficiais:
 * - Plano Analítico (peso da Frequência): Testes 70% + Trabalhos 20% + Participação 10%.
 * - Pautas de Exame e de Frequência reais: Frequência < 10 exclui sem exame;
 *   Frequência ≥ 14 dispensa de exame (Média Final = Frequência); entre 10 e
 *   13,9 o estudante é Admitido ao Exame Normal — Média Final = média(Frequência, Exame).
 *   Se o Exame Normal < 10, vai a Exame de Recorrência com a mesma regra.
 */

export const PESO_TESTES = 0.7;
export const PESO_TRABALHOS = 0.2;
export const PESO_PARTICIPACAO = 0.1;
export const MEDIA_MINIMA = 10;
export const DISPENSA_MINIMA = 14;

export type EstadoFrequencia = "Incompleto" | "Excluído" | "Admitido" | "Dispensado";
export type ResultadoNota = "Aprovado" | "Em Frequência" | "Reprovado" | "Excluído";

export type NotasEntrada = {
  teste1?: number | null;
  teste2?: number | null;
  trabalho1?: number | null;
  trabalho2?: number | null;
  participacao?: number | null;
  exameNormal?: number | null;
  exameRecorrencia?: number | null;
};

export type ResultadoCalculado = {
  notaFrequencia: number | null;
  estadoFrequencia: EstadoFrequencia;
  mediaFinal: number | null;
  resultado: ResultadoNota;
};

function arredondar(n: number): number {
  return Math.round(n * 10) / 10;
}

function mediaDe(...valores: (number | null | undefined)[]): number | null {
  const validos = valores.filter((v): v is number => v !== null && v !== undefined && Number.isFinite(v));
  if (!validos.length) return null;
  return validos.reduce((a, b) => a + b, 0) / validos.length;
}

export function calcularFrequencia(
  input: NotasEntrada
): { notaFrequencia: number | null; estado: EstadoFrequencia } {
  const mediaTestes = mediaDe(input.teste1, input.teste2);
  const mediaTrabalhos = mediaDe(input.trabalho1, input.trabalho2);
  // A Frequência só fica completa quando há pelo menos um teste e um trabalho;
  // a participação é opcional (conta 0 se não preenchida).
  if (mediaTestes === null || mediaTrabalhos === null) {
    return { notaFrequencia: null, estado: "Incompleto" };
  }
  const participacao = input.participacao ?? 0;
  const notaFrequencia = arredondar(
    mediaTestes * PESO_TESTES + mediaTrabalhos * PESO_TRABALHOS + participacao * PESO_PARTICIPACAO
  );
  const estado: EstadoFrequencia =
    notaFrequencia < MEDIA_MINIMA
      ? "Excluído"
      : notaFrequencia >= DISPENSA_MINIMA
      ? "Dispensado"
      : "Admitido";
  return { notaFrequencia, estado };
}

/** Regra completa: Frequência → (Dispensa | Exame Normal → Exame de Recorrência). */
export function calcularResultadoFinal(input: NotasEntrada): ResultadoCalculado {
  const { notaFrequencia, estado } = calcularFrequencia(input);

  if (estado === "Incompleto") {
    return { notaFrequencia, estadoFrequencia: estado, mediaFinal: null, resultado: "Em Frequência" };
  }
  if (estado === "Excluído") {
    return { notaFrequencia, estadoFrequencia: estado, mediaFinal: notaFrequencia, resultado: "Excluído" };
  }
  if (estado === "Dispensado") {
    return { notaFrequencia, estadoFrequencia: estado, mediaFinal: notaFrequencia, resultado: "Aprovado" };
  }

  // Admitido — precisa do Exame Normal.
  const exameNormal = input.exameNormal ?? null;
  if (exameNormal === null) {
    return { notaFrequencia, estadoFrequencia: estado, mediaFinal: null, resultado: "Em Frequência" };
  }
  if (exameNormal >= MEDIA_MINIMA) {
    return {
      notaFrequencia,
      estadoFrequencia: estado,
      mediaFinal: arredondar((notaFrequencia! + exameNormal) / 2),
      resultado: "Aprovado",
    };
  }

  // Exame Normal reprovado — vai a Exame de Recorrência.
  const exameRecorrencia = input.exameRecorrencia ?? null;
  if (exameRecorrencia === null) {
    return { notaFrequencia, estadoFrequencia: estado, mediaFinal: null, resultado: "Em Frequência" };
  }
  if (exameRecorrencia >= MEDIA_MINIMA) {
    return {
      notaFrequencia,
      estadoFrequencia: estado,
      mediaFinal: arredondar((notaFrequencia! + exameRecorrencia) / 2),
      resultado: "Aprovado",
    };
  }
  return {
    notaFrequencia,
    estadoFrequencia: estado,
    mediaFinal: exameRecorrencia,
    resultado: "Reprovado",
  };
}
