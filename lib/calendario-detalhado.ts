export type CategoriaEventoCalendario =
  | "exame"
  | "feriado"
  | "festival"
  | "ferias"
  | "inscricao"
  | "academico"
  // Além das categorias fixas acima, a gestão permite escrever uma categoria
  // livre; guarda-se tal e qual e é apresentada com uma cor neutra.
  | (string & {});

export type EventoCalendarioDetalhado = {
  id: string;
  titulo: string;
  categoria: CategoriaEventoCalendario;
  dataInicio: string; // YYYY-MM-DD ou texto legível
  dataFim?: string;
  dataRepresentativa: string; // ex: "25 de Junho", "10 - 20 de Fevereiro"
  descricao: string;
  destaque?: boolean;
  // Como a ESJ lida com esta data em concreto (aulas suspensas, quando retomam, etc.),
  // mostrado no calendário público a seguir à descrição.
  consideracaoEsj?: string;
  // Imagem de fundo do painel lateral (comemorações / atmosfera). Editável no painel.
  imagemFundo?: string;
};

export type CalendarioAcademicoAnual = {
  anoLectivo: string;
  subtitulo: string;
  eventos: EventoCalendarioDetalhado[];
};

export const CALENDARIO_DETALHADO_KEY = "esj-calendario-detalhado-2026-v2";

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
      descricao:
        "Celebra-se a passagem de ano e o Dia de Fraternidade Universal, assinalando o início do calendário civil.",
      destaque: false,
      consideracaoEsj:
        "A Escola Superior de Jornalismo encerra no dia 1 de Janeiro, assinalando a passagem de ano. A actividade lectiva mantém-se suspensa até ao início do período de pré-inscrições, a 5 de Janeiro.",
      imagemFundo: "/Cnderencias.jpg",
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
      consideracaoEsj:
        "Durante este período, a Secretaria Académica está disponível para receber candidaturas e boletins de inscrição. Não há aulas em curso, por corresponder ao período que antecede o início do ano lectivo.",
      imagemFundo: "/esj-2026.webp",
    },
    {
      id: "ev-3",
      titulo: "Dia dos Heróis Moçambicanos",
      categoria: "feriado",
      dataInicio: "2026-02-03",
      dataRepresentativa: "3 de Fevereiro de 2026",
      descricao:
        "Homenageia os heróis da luta de libertação nacional, em memória do assassinato de Eduardo Mondlane a 3 de Fevereiro de 1969.",
      consideracaoEsj:
        "A Escola Superior de Jornalismo concede aos estudantes um intervalo alusivo à comemoração do Dia dos Heróis Moçambicanos. As aulas retomam no dia 4 de Fevereiro.",
      imagemFundo: "/Cnderencias.jpg",
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
      consideracaoEsj:
        "Este período é dedicado às provas de admissão dos novos candidatos. Não há aulas para estudantes já matriculados, uma vez que o ano lectivo ainda não teve início.",
      imagemFundo: "/esj-2026.webp",
    },
    {
      id: "ev-5",
      titulo: "Início do 1º Semestre Lectivo 2026",
      categoria: "academico",
      dataInicio: "2026-03-02",
      dataRepresentativa: "2 de Março de 2026",
      descricao: "Início das aulas para os regimes Diurno e Pós-Laboral.",
      destaque: true,
      consideracaoEsj:
        "Arrancam as aulas do 1º Semestre para os regimes Diurno e Pós-Laboral, segundo o horário definido por curso e ano.",
      imagemFundo: "/esj-2026.webp",
    },
    {
      id: "ev-6",
      titulo: "Dia da Mulher Moçambicana",
      categoria: "feriado",
      dataInicio: "2026-04-07",
      dataRepresentativa: "7 de Abril de 2026",
      descricao:
        "Assinala o papel das mulheres na história de Moçambique, em memória de Josina Machel, falecida a 7 de Abril de 1971.",
      consideracaoEsj:
        "A Escola Superior de Jornalismo suspende as aulas neste dia. A actividade lectiva retoma no dia seguinte, 8 de Abril.",
      imagemFundo: "/Cnderencias.jpg",
    },
    {
      id: "ev-7",
      titulo: "Dia Internacional do Trabalhador",
      categoria: "feriado",
      dataInicio: "2026-05-01",
      dataRepresentativa: "1 de Maio de 2026",
      descricao:
        "Comemora-se a 1 de Maio o Dia Internacional do Trabalhador, em solidariedade com os direitos e as conquistas laborais.",
      consideracaoEsj:
        "A Escola Superior de Jornalismo concede aos estudantes um intervalo alusivo à comemoração do Dia Internacional do Trabalhador. As aulas retomam no dia 2 de Maio.",
      imagemFundo: "/Cnderencias.jpg",
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
      consideracaoEsj:
        "Durante esta semana, o horário normal de aulas dá lugar à programação do festival — palestras, workshops e exposições abertos a toda a comunidade académica. As aulas regulares retomam na semana seguinte.",
      imagemFundo: "/Graduacao-ESJ.jpg",
    },
    {
      id: "ev-9",
      titulo: "Dia da Independência Nacional",
      categoria: "feriado",
      dataInicio: "2026-06-25",
      dataRepresentativa: "25 de Junho de 2026",
      descricao:
        "Celebra a proclamação da Independência de Moçambique, a 25 de Junho de 1975.",
      consideracaoEsj:
        "A Escola Superior de Jornalismo concede aos estudantes um intervalo alusivo à comemoração do Dia da Independência Nacional. As aulas retomam no dia 26 de Junho.",
      imagemFundo: "/Cnderencias.jpg",
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
      consideracaoEsj:
        "Período de avaliação final das disciplinas do 1º Semestre. Não há aulas regulares — o horário é substituído pelo calendário de exames de cada curso.",
      imagemFundo: "/esj-2026.webp",
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
      consideracaoEsj:
        "Período de férias intercalares para estudantes e corpo docente. As aulas do 2º Semestre têm início a 10 de Agosto.",
      imagemFundo: "/Biblioteca.webp",
    },
    {
      id: "ev-12",
      titulo: "Início do 2º Semestre Lectivo",
      categoria: "academico",
      dataInicio: "2026-08-10",
      dataRepresentativa: "10 de Agosto de 2026",
      descricao: "Reinicio das atividades académicas do 2º semestre.",
      consideracaoEsj:
        "Reinício das actividades lectivas do 2º Semestre, segundo o horário definido por curso e ano.",
      imagemFundo: "/esj-2026.webp",
    },
    {
      id: "ev-13",
      titulo: "Dia da Vitória",
      categoria: "feriado",
      dataInicio: "2026-09-07",
      dataRepresentativa: "7 de Setembro de 2026",
      descricao:
        "Assinala a assinatura dos Acordos de Lusaka, a 7 de Setembro de 1974, marco da vitória da luta de libertação.",
      consideracaoEsj:
        "A Escola Superior de Jornalismo concede aos estudantes um intervalo alusivo à comemoração do Dia da Vitória. As aulas retomam no dia 8 de Setembro.",
      imagemFundo: "/Cnderencias.jpg",
    },
    {
      id: "ev-14",
      titulo: "Dia das Forças Armadas de Libertação Nacional",
      categoria: "feriado",
      dataInicio: "2026-09-25",
      dataRepresentativa: "25 de Setembro de 2026",
      descricao:
        "Homenageia as Forças Armadas de Libertação Nacional e a data histórica associada à FRELIMO, a 25 de Setembro.",
      consideracaoEsj:
        "A Escola Superior de Jornalismo concede aos estudantes um intervalo alusivo a esta comemoração. As aulas retomam no dia 26 de Setembro.",
      imagemFundo: "/Cnderencias.jpg",
    },
    {
      id: "ev-15",
      titulo: "Dia da Paz e Reconciliação",
      categoria: "feriado",
      dataInicio: "2026-10-04",
      dataRepresentativa: "4 de Outubro de 2026",
      descricao:
        "Celebra a assinatura do Acordo Geral de Paz em Roma, a 4 de Outubro de 1992.",
      consideracaoEsj:
        "A Escola Superior de Jornalismo concede aos estudantes um intervalo alusivo à comemoração do Dia da Paz e Reconciliação. As aulas retomam no dia 5 de Outubro.",
      imagemFundo: "/Cnderencias.jpg",
    },
    {
      id: "ev-16",
      titulo: "Cerimónia Solene de Graduação ESJ 2026",
      categoria: "festival",
      dataInicio: "2026-11-06",
      dataRepresentativa: "6 de Novembro de 2026",
      descricao: "Outorga de diplomas de Licenciatura aos finalistas da ESJ.",
      destaque: true,
      consideracaoEsj:
        "Dia dedicado à cerimónia de outorga de diplomas aos finalistas. As aulas dos restantes cursos e anos decorrem normalmente, salvo alterações pontuais de horário anunciadas pela Secretaria Académica.",
      imagemFundo: "/Graduacao-ESJ.jpg",
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
      consideracaoEsj:
        "Período de avaliação final das disciplinas do 2º Semestre. Não há aulas regulares — o horário é substituído pelo calendário de exames de cada curso.",
      imagemFundo: "/esj-2026.webp",
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
      consideracaoEsj:
        "Encerramento do ano lectivo 2026. A actividade académica é retomada com o período de pré-inscrições do ano lectivo seguinte.",
      imagemFundo: "/Biblioteca.webp",
    },
  ],
};

function descricaoRedundante(descricao: string) {
  return /^feriado nacional\.?$/i.test(descricao.trim());
}

/** Junta dados gravados com os defaults (descrições históricas + consideração ESJ). */
export function mergeCalendarioComDefaults(saved: CalendarioAcademicoAnual): CalendarioAcademicoAnual {
  const defaultsPorId = new Map(CALENDARIO_2026_DEFAULT.eventos.map((e) => [e.id, e]));
  const eventos = saved.eventos.map((ev) => {
    const def = defaultsPorId.get(ev.id);
    if (!def) return ev;
    return {
      ...def,
      ...ev,
      descricao:
        !ev.descricao?.trim() || descricaoRedundante(ev.descricao) ? def.descricao : ev.descricao,
      consideracaoEsj: ev.consideracaoEsj?.trim() ? ev.consideracaoEsj : def.consideracaoEsj,
      imagemFundo: ev.imagemFundo?.trim() ? ev.imagemFundo : def.imagemFundo,
    };
  });
  const idsGuardados = new Set(eventos.map((e) => e.id));
  for (const def of CALENDARIO_2026_DEFAULT.eventos) {
    if (!idsGuardados.has(def.id)) eventos.push(def);
  }
  return {
    anoLectivo: saved.anoLectivo || CALENDARIO_2026_DEFAULT.anoLectivo,
    subtitulo: saved.subtitulo || CALENDARIO_2026_DEFAULT.subtitulo,
    eventos,
  };
}

export function readCalendarioDetalhado(): CalendarioAcademicoAnual {
  if (typeof window === "undefined") return CALENDARIO_2026_DEFAULT;
  try {
    const raw = window.localStorage.getItem(CALENDARIO_DETALHADO_KEY);
    if (!raw) {
      // Migra chave antiga, se existir.
      const antigo = window.localStorage.getItem("esj-calendario-detalhado-2026");
      if (antigo) {
        const merged = mergeCalendarioComDefaults(JSON.parse(antigo) as CalendarioAcademicoAnual);
        writeCalendarioDetalhado(merged);
        return merged;
      }
      return CALENDARIO_2026_DEFAULT;
    }
    return mergeCalendarioComDefaults(JSON.parse(raw) as CalendarioAcademicoAnual);
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
    default:
      return { label: cat, color: "text-navy-900/70", bg: "bg-navy-100/60 border-navy-200" };
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

export function formatarDataPt(iso: string) {
  const d = parseISO(iso);
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

const DIAS_SEMANA_EXTENSO = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export function diaDaSemanaPt(iso: string) {
  return DIAS_SEMANA_EXTENSO[parseISO(iso).getDay()];
}
