import { filtroQuery } from "@/lib/admissao";

export type CursoInfo = {
  slug: string;
  titulo: string;
  nivel: "Licenciatura" | "Pós-Graduação";
  resumo: string;
  descricao: string[];
  inscricaoQuery: string;
};

export const CURSOS_PAGINAS: CursoInfo[] = [
  {
    slug: "jornalismo",
    titulo: "Jornalismo",
    nivel: "Licenciatura",
    resumo:
      "Formação em técnicas e ética do jornalismo, para os media impressos, digitais, rádio e televisão.",
    descricao: [
      "A licenciatura em Jornalismo prepara profissionais capazes de apurar, verificar e contar factos com rigor ético, ao serviço do interesse público e da democracia em Moçambique.",
      "O percurso combina teoria da comunicação com prática em redação, rádio, televisão e plataformas digitais, em laboratórios e estúdios da ESJ.",
      "Os graduados saem aptos a trabalhar em órgãos de comunicação social, assessoria de imprensa, produção de conteúdos e investigação jornalística.",
    ],
    inscricaoQuery: filtroQuery({
      nivel: "Licenciatura",
      regime: "Diurno",
      curso: "jornalismo",
    }),
  },
  {
    slug: "publicidade-e-marketing",
    titulo: "Publicidade e Marketing",
    nivel: "Licenciatura",
    resumo: "Estratégia, criação e comunicação de marcas para organizações e mercados.",
    descricao: [
      "A licenciatura em Publicidade e Marketing forma profissionais para planear, criar e gerir a comunicação de marcas e organizações no mercado moçambicano e regional.",
      "O curso articula criatividade, estratégia comercial e análise de públicos, com projectos práticos alinhados às realidades das empresas e instituições.",
      "Os graduados podem actuar em agências, departamentos de marketing, produção publicitária e gestão de campanhas digitais e tradicionais.",
    ],
    inscricaoQuery: filtroQuery({
      nivel: "Licenciatura",
      regime: "Diurno",
      curso: "publicidade-e-marketing",
    }),
  },
  {
    slug: "relacoes-publicas",
    titulo: "Relações Públicas",
    nivel: "Licenciatura",
    resumo: "Gestão da comunicação institucional e da relação com os públicos.",
    descricao: [
      "A licenciatura em Relações Públicas prepara profissionais para gerir a imagem, a reputação e o diálogo das organizações com os seus públicos internos e externos.",
      "O percurso cobre comunicação institucional, organização de eventos, media relations e gestão de crises, com forte componente prática.",
      "Os graduados encontram espaço em instituições públicas, empresas, ONG e gabinetes de comunicação.",
    ],
    inscricaoQuery: filtroQuery({
      nivel: "Licenciatura",
      regime: "Diurno",
      curso: "relacoes-publicas",
    }),
  },
  {
    slug: "biblioteconomia-e-documentacao",
    titulo: "Biblioteconomia e Documentação",
    nivel: "Licenciatura",
    resumo: "Organização, gestão e mediação da informação e do conhecimento.",
    descricao: [
      "A licenciatura em Biblioteconomia e Documentação forma profissionais para organizar, preservar e mediar o acesso à informação e ao conhecimento.",
      "O curso aborda bibliotecas, arquivos, documentação digital e políticas de informação, com atenção às necessidades das instituições moçambicanas.",
      "Os graduados podem trabalhar em bibliotecas, centros de documentação, arquivos e serviços de gestão da informação.",
    ],
    inscricaoQuery: filtroQuery({
      nivel: "Licenciatura",
      regime: "Diurno",
      curso: "biblioteconomia-e-documentacao",
    }),
  },
  {
    slug: "pos-graduacao",
    titulo: "Pós-Graduação",
    nivel: "Pós-Graduação",
    resumo:
      "Percursos de especialização e investigação avançada em Ciências da Comunicação.",
    descricao: [
      "A pós-graduação na ESJ oferece especialização avançada em Ciências da Comunicação, para profissionais e investigadores que querem aprofundar a prática e a investigação.",
      "Entre as áreas em desenvolvimento contam-se o jornalismo de investigação, a comunicação estratégica e marketing, e a gestão da informação e documentação.",
      "Os candidatos devem consultar o edital e a Secretaria Académica para regimes, requisitos e calendário do ciclo em vigor.",
    ],
    inscricaoQuery: filtroQuery({ nivel: "Pós-Graduação", regime: "Diurno" }),
  },
];

export function cursoPorSlug(slug: string) {
  return CURSOS_PAGINAS.find((c) => c.slug === slug) ?? null;
}

export function slugsCursos() {
  return CURSOS_PAGINAS.map((c) => c.slug);
}
