export type CategoriaEventoCalendario =
  | "exame"
  | "feriado"
  | "festival"
  | "ferias"
  | "inscricao"
  | "academico";

export type EventoCalendarioDetalhado = {
  id: string;
  titulo: string;
  categoria: CategoriaEventoCalendario;
  dataInicio: string; // YYYY-MM-DD ou texto legível
  dataFim?: string;
  dataRepresentativa: string; // ex: "25 de Junho", "10 - 20 de Fevereiro"
  descricao: string;
  destaque?: boolean;
};

export type CalendarioAcademicoAnual = {
  anoLectivo: string;
  subtitulo: string;
  eventos: EventoCalendarioDetalhado[];
};

export const CALENDARIO_DETALHADO_KEY = "esj-calendario-detalhado-2026";

export const CALENDARIO_2026_DEFAULT: CalendarioAcademicoAnual = {
  anoLectivo: "2026",
  subtitulo: "Calendário Académico Oficial da Escola Superior de Jornalismo",
  eventos: [
    {
      id: "ev-1",
      titulo: "Ano Novo (Dia de Fraternidade Universal)",
      categoria: "feriado",
      dataInicio: "2026-01-01",
      dataRepresentativa: "1 de Janeiro de 2026",
      descricao: "Feriado Nacional.",
      destaque: false,
    },
    {
      id: "ev-2",
      titulo: "Período de Pré-Inscrições e Matrículas 2026",
      categoria: "inscricao",
      dataInicio: "2026-01-05",
      dataFim: "2026-01-25",
      dataRepresentativa: "5 a 25 de Janeiro de 2026",
      descricao: "Receção de candidaturas e boletins de inscrição para os novos estudantes.",
      destaque: true,
    },
    {
      id: "ev-3",
      titulo: "Dia dos Heróis Moçambicanos",
      categoria: "feriado",
      dataInicio: "2026-02-03",
      dataRepresentativa: "3 de Fevereiro de 2026",
      descricao: "Feriado Nacional.",
    },
    {
      id: "ev-4",
      titulo: "Exames de Admissão 2026",
      categoria: "exame",
      dataInicio: "2026-02-09",
      dataFim: "2026-02-13",
      dataRepresentativa: "9 a 13 de Fevereiro de 2026",
      descricao: "Exames presenciais de Português e História no campus da ESJ.",
      destaque: true,
    },
    {
      id: "ev-5",
      titulo: "Início do 1º Semestre Lectivo 2026",
      categoria: "academico",
      dataInicio: "2026-03-02",
      dataRepresentativa: "2 de Março de 2026",
      descricao: "Início das aulas para os regimes Diurno e Pós-Laboral.",
      destaque: true,
    },
    {
      id: "ev-6",
      titulo: "Dia da Mulher Moçambicana",
      categoria: "feriado",
      dataInicio: "2026-04-07",
      dataRepresentativa: "7 de Abril de 2026",
      descricao: "Feriado Nacional.",
    },
    {
      id: "ev-7",
      titulo: "Dia Internacional do Trabalhador",
      categoria: "feriado",
      dataInicio: "2026-05-01",
      dataRepresentativa: "1 de Maio de 2026",
      descricao: "Feriado Nacional.",
    },
    {
      id: "ev-8",
      titulo: "Semana da Comunicação e Informação (Festival ESJ)",
      categoria: "festival",
      dataInicio: "2026-05-18",
      dataFim: "2026-05-22",
      dataRepresentativa: "18 a 22 de Maio de 2026",
      descricao: "Palestras, workshops, amostra de curtas e exposição de trabalhos dos estudantes.",
      destaque: true,
    },
    {
      id: "ev-9",
      titulo: "Dia da Independência Nacional",
      categoria: "feriado",
      dataInicio: "2026-06-25",
      dataRepresentativa: "25 de Junho de 2026",
      descricao: "Feriado Nacional.",
    },
    {
      id: "ev-10",
      titulo: "Exames do 1º Semestre (Época Normal)",
      categoria: "exame",
      dataInicio: "2026-07-06",
      dataFim: "2026-07-17",
      dataRepresentativa: "6 a 17 de Julho de 2026",
      descricao: "Avaliação final das disciplinas do 1º Semestre.",
      destaque: true,
    },
    {
      id: "ev-11",
      titulo: "Interregno Lectivo (Férias do fim do 1º semestre)",
      categoria: "ferias",
      dataInicio: "2026-07-20",
      dataFim: "2026-08-07",
      dataRepresentativa: "20 de Julho a 7 de Agosto de 2026",
      descricao: "Férias intercalares para estudantes e corpo docente.",
      destaque: true,
    },
    {
      id: "ev-12",
      titulo: "Início do 2º Semestre Lectivo",
      categoria: "academico",
      dataInicio: "2026-08-10",
      dataRepresentativa: "10 de Agosto de 2026",
      descricao: "Reinicio das atividades académicas do 2º semestre.",
    },
    {
      id: "ev-13",
      titulo: "Dia da Vitória",
      categoria: "feriado",
      dataInicio: "2026-09-07",
      dataRepresentativa: "7 de Setembro de 2026",
      descricao: "Feriado Nacional.",
    },
    {
      id: "ev-14",
      titulo: "Dia das Forças Armadas de Libertação Nacional",
      categoria: "feriado",
      dataInicio: "2026-09-25",
      dataRepresentativa: "25 de Setembro de 2026",
      descricao: "Feriado Nacional.",
    },
    {
      id: "ev-15",
      titulo: "Dia da Paz e Reconciliação",
      categoria: "feriado",
      dataInicio: "2026-10-04",
      dataRepresentativa: "4 de Outubro de 2026",
      descricao: "Feriado Nacional.",
    },
    {
      id: "ev-16",
      titulo: "Cerimónia Solene de Graduação ESJ 2026",
      categoria: "festival",
      dataInicio: "2026-11-06",
      dataRepresentativa: "6 de Novembro de 2026",
      descricao: "Outorga de diplomas de Licenciatura aos finalistas da ESJ.",
      destaque: true,
    },
    {
      id: "ev-17",
      titulo: "Exames Finais do 2º Semestre (Época Normal)",
      categoria: "exame",
      dataInicio: "2026-11-23",
      dataFim: "2026-12-04",
      dataRepresentativa: "23 de Novembro a 4 de Dezembro de 2026",
      descricao: "Avaliação final das cadeiras do 2º semestre.",
      destaque: true,
    },
    {
      id: "ev-18",
      titulo: "Férias de Fim de Ano Lectivo",
      categoria: "ferias",
      dataInicio: "2026-12-18",
      dataFim: "2027-01-15",
      dataRepresentativa: "18 de Dezembro de 2026 a 15 de Janeiro de 2027",
      descricao: "Fim do ano académico 2026.",
      destaque: true,
    },
  ],
};

export function readCalendarioDetalhado(): CalendarioAcademicoAnual {
  if (typeof window === "undefined") return CALENDARIO_2026_DEFAULT;
  try {
    const raw = window.localStorage.getItem(CALENDARIO_DETALHADO_KEY);
    if (!raw) return CALENDARIO_2026_DEFAULT;
    return JSON.parse(raw);
  } catch {
    return CALENDARIO_2026_DEFAULT;
  }
}

export function writeCalendarioDetalhado(data: CalendarioAcademicoAnual) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CALENDARIO_DETALHADO_KEY, JSON.stringify(data));
}

export function labelCategoriaCalendario(cat: CategoriaEventoCalendario): {
  label: string;
  color: string;
  bg: string;
} {
  switch (cat) {
    case "exame":
      return { label: "Exames & Avaliações", color: "text-crimson", bg: "bg-crimson/10 border-crimson/30" };
    case "feriado":
      return { label: "Feriado Nacional", color: "text-amber-700", bg: "bg-amber-100 border-amber-300" };
    case "festival":
      return { label: "Festival / Cerimónia", color: "text-purple-700", bg: "bg-purple-100 border-purple-300" };
    case "ferias":
      return { label: "Férias Académicas", color: "text-emerald-700", bg: "bg-emerald-100 border-emerald-300" };
    case "inscricao":
      return { label: "Inscrições & Matrículas", color: "text-sky", bg: "bg-sky/10 border-sky/30" };
    case "academico":
      return { label: "Actividade Académica", color: "text-navy-900", bg: "bg-navy-100 border-navy-300" };
  }
}

// --- Grelha do calendário anual (partilhado entre a página pública e a gestão) ---

export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

export function parseISO(iso: string) {
  return new Date(`${iso}T12:00:00`);
}

export function chaveDia(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function construirDias(ano: number, mes: number) {
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  return Array.from({ length: 42 }, (_, i) => new Date(ano, mes, 1 - primeiroDiaSemana + i));
}

export function diaEstaNoIntervalo(ev: EventoCalendarioDetalhado, diaKey: string) {
  const dia = parseISO(diaKey);
  const inicio = parseISO(ev.dataInicio);
  const fim = ev.dataFim ? parseISO(ev.dataFim) : inicio;
  return dia >= inicio && dia <= fim;
}

export function diasPartilhamEvento(
  eventosPorDia: Map<string, EventoCalendarioDetalhado[]>,
  keyA: string,
  keyB: string,
) {
  const eventosA = eventosPorDia.get(keyA);
  const eventosB = eventosPorDia.get(keyB);
  if (!eventosA || !eventosB) return false;
  return eventosA.some((ev) => eventosB.some((outro) => outro.id === ev.id));
}
