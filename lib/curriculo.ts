import type { CursoDocenciaSlug } from "@/lib/docencia";

export type RegimeCurso = "diurno" | "pos-laboral";

export type CadeiraCurriculo = {
  id: string;
  codigo: string;
  nome: string;
  ano: number; // 1, 2, 3, 4
  semestre: number; // 1, 2
  regime: RegimeCurso;
  docente: string;
  docenteEmail?: string;
  planoAnaliticoUrl?: string;
  descricao?: string;
};

export type CurriculoCurso = {
  cursoSlug: CursoDocenciaSlug;
  cursoNome: string;
  cadeiras: CadeiraCurriculo[];
};

export const CURRICULOS_ESJ: Record<CursoDocenciaSlug, CurriculoCurso> = {
  jornalismo: {
    cursoSlug: "jornalismo",
    cursoNome: "Jornalismo",
    cadeiras: [
      {
        id: "jor-101",
        codigo: "JOR101",
        nome: "Teoria da Comunicação I",
        ano: 1,
        semestre: 1,
        regime: "diurno",
        docente: "Dr. Alberto Mavila",
        docenteEmail: "alberto.mavila@esj.ac.mz",
        planoAnaliticoUrl: "/documentos/plano-teoria-comunicacao-1.pdf",
        descricao: "Introdução aos conceitos e teorias fundamentais da comunicação de massas.",
      },
      {
        id: "jor-102",
        codigo: "JOR102",
        nome: "Técnicas de Expressão em Língua Portuguesa",
        ano: 1,
        semestre: 1,
        regime: "diurno",
        docente: "Dra. Maria Celeste",
        docenteEmail: "maria.celeste@esj.ac.mz",
        planoAnaliticoUrl: "/documentos/plano-lingua-portuguesa.pdf",
        descricao: "Desenvolvimento de competências linguísticas e de redação jornalística.",
      },
      {
        id: "jor-103",
        codigo: "JOR103",
        nome: "Gêneros Jornalísticos I (Notícia e Reportagem)",
        ano: 1,
        semestre: 2,
        regime: "diurno",
        docente: "Prof. Tomás Macuácua",
        docenteEmail: "tomas.macuacua@esj.ac.mz",
        planoAnaliticoUrl: "/documentos/plano-generos-jornalisticos.pdf",
        descricao: "Estrutura da notícia, pirâmide invertida, técnicas de entrevista e reportagem de campo.",
      },
      {
        id: "jor-201",
        codigo: "JOR201",
        nome: "Jornalismo de Investigação",
        ano: 2,
        semestre: 1,
        regime: "diurno",
        docente: "Dra. Isabel Cossa",
        docenteEmail: "isabel.cossa@esj.ac.mz",
        planoAnaliticoUrl: "/documentos/plano-jornalismo-investigacao.pdf",
        descricao: "Metodologias de cruzamento de fontes, verificação de dados e ética investigativa.",
      },
      {
        id: "jor-202",
        codigo: "JOR202",
        nome: "Ética e Deontologia Jornalística",
        ano: 2,
        semestre: 2,
        regime: "diurno",
        docente: "Dr. Salomão Moyana",
        docenteEmail: "salomao.moyana@esj.ac.mz",
        planoAnaliticoUrl: "/documentos/plano-etica-deontologia.pdf",
        descricao: "Código de conduta profissional, direito à informação e liberdade de imprensa.",
      },
      // Regime Pós-Laboral
      {
        id: "jor-pl-101",
        codigo: "JOR101-PL",
        nome: "Teoria da Comunicação I (Pós-Laboral)",
        ano: 1,
        semestre: 1,
        regime: "pos-laboral",
        docente: "Dr. Alberto Mavila",
        docenteEmail: "alberto.mavila@esj.ac.mz",
        planoAnaliticoUrl: "/documentos/plano-teoria-comunicacao-1.pdf",
      },
      {
        id: "jor-pl-102",
        codigo: "JOR102-PL",
        nome: "Técnicas de Expressão em Língua Portuguesa",
        ano: 1,
        semestre: 1,
        regime: "pos-laboral",
        docente: "Dra. Maria Celeste",
        docenteEmail: "maria.celeste@esj.ac.mz",
      },
    ],
  },
  "publicidade-e-marketing": {
    cursoSlug: "publicidade-e-marketing",
    cursoNome: "Publicidade e Marketing",
    cadeiras: [
      {
        id: "pm-101",
        codigo: "PM101",
        nome: "Introdução ao Marketing",
        ano: 1,
        semestre: 1,
        regime: "diurno",
        docente: "Dr. Carlos Nhantumbo",
        docenteEmail: "carlos.nhantumbo@esj.ac.mz",
        planoAnaliticoUrl: "/documentos/plano-introducao-marketing.pdf",
        descricao: "Conceitos fundamentais de mercado, comportamento do consumidor e marketing mix.",
      },
      {
        id: "pm-102",
        codigo: "PM102",
        nome: "Criação e Redação Publicitária",
        ano: 1,
        semestre: 2,
        regime: "diurno",
        docente: "Dra. Vanessa Sitoe",
        docenteEmail: "vanessa.sitoe@esj.ac.mz",
        planoAnaliticoUrl: "/documentos/plano-redacao-publicitaria.pdf",
        descricao: "Desenvolvimento de conceitos criativos, copy para anúncios e campanhas de media.",
      },
    ],
  },
  "relacoes-publicas": {
    cursoSlug: "relacoes-publicas",
    cursoNome: "Relações Públicas",
    cadeiras: [
      {
        id: "rp-101",
        codigo: "RP101",
        nome: "Comunicação Organizacional",
        ano: 1,
        semestre: 1,
        regime: "diurno",
        docente: "Dra. Helena Tembe",
        docenteEmail: "helena.tembe@esj.ac.mz",
        planoAnaliticoUrl: "/documentos/plano-comunicacao-organizacional.pdf",
        descricao: "Estratégias de comunicação interna, gestão de imagem institucional e assessoria de imprensa.",
      },
      {
        id: "rp-102",
        codigo: "RP102",
        nome: "Gestão de Crise e Imagem",
        ano: 2,
        semestre: 1,
        regime: "diurno",
        docente: "Dr. Fernando Mucavele",
        docenteEmail: "fernando.mucavele@esj.ac.mz",
        planoAnaliticoUrl: "/documentos/plano-gestao-crise.pdf",
        descricao: "Protocolos de prevenção, gestão de reputação e comunicação em momentos críticos.",
      },
    ],
  },
  "biblioteconomia-e-documentacao": {
    cursoSlug: "biblioteconomia-e-documentacao",
    cursoNome: "Biblioteconomia e Documentação",
    cadeiras: [
      {
        id: "bd-101",
        codigo: "BD101",
        nome: "Gestão de Sistemas de Informação",
        ano: 1,
        semestre: 1,
        regime: "diurno",
        docente: "Dr. Jorge Mabote",
        docenteEmail: "jorge.mabote@esj.ac.mz",
        planoAnaliticoUrl: "/documentos/plano-gestao-sistemas-informacao.pdf",
        descricao: "Classificação bibliográfica, catalogação digital e preservação de acervos documentais.",
      },
    ],
  },
};

export function getCurriculoPorCurso(
  cursoSlug: CursoDocenciaSlug,
  regime?: RegimeCurso
): CadeiraCurriculo[] {
  const c = CURRICULOS_ESJ[cursoSlug];
  if (!c) return [];
  if (!regime) return c.cadeiras;
  const filtradas = c.cadeiras.filter((cad) => cad.regime === regime);
  return filtradas.length > 0 ? filtradas : c.cadeiras;
}
