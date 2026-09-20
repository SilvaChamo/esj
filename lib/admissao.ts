export const ANO_LECTIVO = "2026";

export const NIVEIS = ["Licenciatura", "Pós-Graduação"] as const;
export const REGIMES = ["Diurno", "Pós-laboral"] as const;

export type Nivel = (typeof NIVEIS)[number];
export type Regime = (typeof REGIMES)[number];

export const REGIME_LABEL: Record<Regime, string> = {
  Diurno: "Diurno (laboral)",
  "Pós-laboral": "Pós-laboral",
};

export type CursoAdmissao = {
  slug: string;
  nome: string;
  titulo: string;
};

const LICENCIATURAS: CursoAdmissao[] = [
  { slug: "jornalismo", nome: "Jornalismo", titulo: "Licenciatura em Jornalismo" },
  {
    slug: "publicidade-e-marketing",
    nome: "Publicidade e Marketing",
    titulo: "Licenciatura em Publicidade e Marketing",
  },
  {
    slug: "relacoes-publicas",
    nome: "Relações Públicas",
    titulo: "Licenciatura em Relações Públicas",
  },
  {
    slug: "biblioteconomia-e-documentacao",
    nome: "Biblioteconomia e Documentação",
    titulo: "Licenciatura em Biblioteconomia e Documentação",
  },
];

const POS_GRADUACOES: CursoAdmissao[] = LICENCIATURAS.map((c) => ({
  slug: c.slug,
  nome: c.nome,
  titulo: `Pós-Graduação em ${c.nome}`,
}));

export const CURSOS_POR_NIVEL: Record<Nivel, CursoAdmissao[]> = {
  Licenciatura: LICENCIATURAS,
  "Pós-Graduação": POS_GRADUACOES,
};

export const PESO_PORTUGUES = 0.5;
export const PESO_HISTORIA = 0.5;
export const MEDIA_MINIMA = 10;

export type FiltroAdmissao = {
  nivel: Nivel;
  regime: Regime;
  curso?: string;
};

export type FiltroLock = {
  nivel: boolean;
  regime: boolean;
  curso: boolean;
};

const NIVEL_SET = new Set<string>(NIVEIS);
const REGIME_SET = new Set<string>(REGIMES);

export function isNivel(value: string | null | undefined): value is Nivel {
  return Boolean(value && NIVEL_SET.has(value));
}

export function isRegime(value: string | null | undefined): value is Regime {
  return Boolean(value && REGIME_SET.has(value));
}

export function parseFiltroFromRecord(record: Record<string, string | string[] | undefined>) {
  const get = (key: string) => {
    const value = record[key];
    return Array.isArray(value) ? value[0] ?? null : value ?? null;
  };
  return parseFiltro({ get });
}

export function parseFiltro(input: {
  get: (key: string) => string | null;
}): { filtro: FiltroAdmissao; lock: FiltroLock } {
  const nivelRaw = input.get("nivel");
  const regimeRaw = input.get("regime");
  const cursoRaw = input.get("curso");
  return {
    filtro: {
      nivel: isNivel(nivelRaw) ? nivelRaw : "Licenciatura",
      regime: isRegime(regimeRaw) ? regimeRaw : "Diurno",
      curso: cursoRaw?.trim() || undefined,
    },
    lock: {
      nivel: isNivel(nivelRaw),
      regime: isRegime(regimeRaw),
      curso: Boolean(cursoRaw?.trim()),
    },
  };
}

export function filtroQuery(filtro: FiltroAdmissao) {
  const params = new URLSearchParams();
  params.set("nivel", filtro.nivel);
  params.set("regime", filtro.regime);
  if (filtro.curso) params.set("curso", filtro.curso);
  return params.toString();
}

export function cursosDoNivel(nivel: Nivel) {
  return CURSOS_POR_NIVEL[nivel];
}

export function cursoPorSlug(slug: string, nivel: Nivel) {
  return cursosDoNivel(nivel).find((c) => c.slug === slug) ?? null;
}

export function cursoPorTitulo(titulo: string) {
  return (
    LICENCIATURAS.find((c) => c.titulo === titulo) ??
    POS_GRADUACOES.find((c) => c.titulo === titulo) ??
    LICENCIATURAS.find((c) => c.nome === titulo) ??
    null
  );
}

/** Sigla curta do curso, para listas apertadas (ex.: coluna "Curso" das candidaturas). */
const CODIGO_POR_SLUG: Record<string, string> = {
  jornalismo: "JJ",
  "publicidade-e-marketing": "PM",
  "relacoes-publicas": "RP",
  "biblioteconomia-e-documentacao": "BD",
};

export function codigoCurso(tituloOuNome: string) {
  const curso = cursoPorTitulo(tituloOuNome);
  return (curso && CODIGO_POR_SLUG[curso.slug]) || tituloOuNome;
}

export function mediaFinal(notaPortugues: number, notaHistoria: number) {
  return (
    Math.round((notaPortugues * PESO_PORTUGUES + notaHistoria * PESO_HISTORIA) * 100) / 100
  );
}

export function classificacao(media: number) {
  return media >= MEDIA_MINIMA ? "Admitido" : "Não admitido";
}

export function formatNota(n: number) {
  return n.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function tituloPauta() {
  return "Pauta de resultados de admissão";
}
