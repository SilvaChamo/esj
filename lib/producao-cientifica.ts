export type CursoBibliotecaCodigo = "JJ" | "PM" | "RP" | "BD";

export type TipoProjecto =
  | "monografia"
  | "projecto-experimental"
  | "relatorio-estagio"
  | "artigo";

export type CursoBiblioteca = {
  codigo: CursoBibliotecaCodigo;
  slug: string;
  titulo: string;
  descricao: string;
  expectativa: string;
};

export type ProjectoCientifico = {
  slug: string;
  titulo: string;
  curso: CursoBibliotecaCodigo;
  tipo: TipoProjecto;
  ramos: string;
  tutor: string;
  avaliador?: string;
  numeroEstudante?: string;
  ano: number;
  autores: string[];
  resumo: string;
  /** PDF externo ou local; opcional enquanto o acervo cresce. */
  ficheiro?: string;
};

export const TIPOS_PROJECTO: { id: TipoProjecto | "todos"; label: string }[] = [
  { id: "todos", label: "Todos os tipos" },
  { id: "monografia", label: "Monografia" },
  { id: "projecto-experimental", label: "Projecto experimental" },
  { id: "relatorio-estagio", label: "Relatório de estágio" },
  { id: "artigo", label: "Artigo científico" },
];

export const CURSOS_BIBLIOTECA: CursoBiblioteca[] = [
  {
    codigo: "JJ",
    slug: "jornalismo",
    titulo: "Jornalismo",
    descricao:
      "Acervo de monografias e projectos experimentais em jornalismo impresso, digital, rádio e televisão.",
    expectativa:
      "Encontrará trabalhos de apuração, reportagem, ética dos media e investigação jornalística defendidos na ESJ.",
  },
  {
    codigo: "PM",
    slug: "publicidade-e-marketing",
    titulo: "Publicidade e Marketing",
    descricao:
      "Produção científica sobre marcas, campanhas, públicos e comunicação comercial.",
    expectativa:
      "Consultará projectos de estratégia, criação publicitária e estudos de mercado aplicados ao contexto moçambicano.",
  },
  {
    codigo: "RP",
    slug: "relacoes-publicas",
    titulo: "Relações Públicas",
    descricao:
      "Trabalhos sobre comunicação institucional, reputação, eventos e diálogo com os públicos.",
    expectativa:
      "Acederá a monografias e projectos de assessoria, gestão de imagem e comunicação organizacional.",
  },
  {
    codigo: "BD",
    slug: "biblioteconomia-e-documentacao",
    titulo: "Biblioteconomia e Documentação",
    descricao:
      "Investigação sobre organização, preservação e mediação da informação e do conhecimento.",
    expectativa:
      "Encontrará estudos sobre bibliotecas, arquivos, documentação digital e políticas de informação.",
  },
];

/** Exemplares — PDF de demonstração institucional enquanto o acervo real cresce. */
const PDF_DEMO =
  "https://esj.ac.mz/wp-content/uploads/2026/05/Minuta-de-Pedido-de-Declaracao-de-Notas.pdf";

export const PROJECTOS_CIENTIFICOS: ProjectoCientifico[] = [
  {
    slug: "barometro-da-comunicacao-social",
    titulo: "Barómetro da Comunicação Social em Moçambique",
    curso: "JJ",
    tipo: "projecto-experimental",
    ramos: "Jornalismo de dados · Transparência pública",
    tutor: "Alexandre Dinis Zavala",
    ano: 2026,
    autores: ["Equipa ESJ / GABINFO"],
    resumo:
      "Projecto da Escola Superior de Jornalismo para reforçar a transparência e o pluralismo informativo no país, apresentado pelo Gabinete de Informação. Serve de exemplar de projecto experimental no repositório científico.",
    ficheiro: PDF_DEMO,
  },
  {
    slug: "qualidade-da-informacao-na-televisao",
    titulo: "A qualidade da informação na televisão em Moçambique",
    curso: "JJ",
    tipo: "monografia",
    ramos: "Telejornalismo · Ética da comunicação",
    tutor: "Sérgio Langa",
    ano: 2025,
    autores: ["Joana Machuza"],
    resumo:
      "Monografia sobre padrões de qualidade informativa na televisão moçambicana e o papel da formação jornalística na ESJ.",
    ficheiro: PDF_DEMO,
  },
  {
    slug: "campanhas-digitais-de-marcas-locais",
    titulo: "Campanhas digitais de marcas locais em Maputo",
    curso: "PM",
    tipo: "projecto-experimental",
    ramos: "Marketing digital · Publicidade",
    tutor: "Isaías Carlos Fuel",
    ano: 2025,
    autores: ["Maria Tembe"],
    resumo:
      "Projecto experimental sobre planeamento e execução de campanhas digitais para marcas moçambicanas, com análise de públicos e métricas.",
    ficheiro: PDF_DEMO,
  },
  {
    slug: "posicionamento-de-marca-no-retalho",
    titulo: "Posicionamento de marca no retalho urbano",
    curso: "PM",
    tipo: "monografia",
    ramos: "Branding · Comunicação comercial",
    tutor: "Ana Paula Chissano",
    ano: 2024,
    autores: ["Carlos Nhantumbo"],
    resumo:
      "Estudo monográfico sobre estratégias de posicionamento de marca em estabelecimentos de retalho em Maputo.",
    ficheiro: PDF_DEMO,
  },
  {
    slug: "gestao-de-crise-em-instituicoes-publicas",
    titulo: "Gestão de crise em instituições públicas",
    curso: "RP",
    tipo: "monografia",
    ramos: "Comunicação de crise · RP institucional",
    tutor: "Filomena Mussagy",
    ano: 2025,
    autores: ["Pedro Macuácua"],
    resumo:
      "Análise de práticas de relações públicas na gestão de crises de comunicação em organismos da Administração Pública.",
    ficheiro: PDF_DEMO,
  },
  {
    slug: "organizacao-de-eventos-institucionais",
    titulo: "Organização de eventos institucionais na ESJ",
    curso: "RP",
    tipo: "relatorio-estagio",
    ramos: "Eventos · Media relations",
    tutor: "Helena Cossa",
    ano: 2024,
    autores: ["Lúcia Matavel"],
    resumo:
      "Relatório de estágio sobre planeamento e execução de eventos académicos e institucionais na Escola Superior de Jornalismo.",
    ficheiro: PDF_DEMO,
  },
  {
    slug: "bibliotecas-escolares-em-maputo",
    titulo: "Bibliotecas escolares em Maputo: acesso e mediação",
    curso: "BD",
    tipo: "monografia",
    ramos: "Bibliotecas · Mediação da informação",
    tutor: "João Mucavele",
    ano: 2025,
    autores: ["Sofia Mabunda"],
    resumo:
      "Monografia sobre o papel das bibliotecas escolares no acesso à informação e na promoção da leitura em escolas de Maputo.",
    ficheiro: PDF_DEMO,
  },
  {
    slug: "arquivo-digital-de-documentacao-academica",
    titulo: "Arquivo digital de documentação académica",
    curso: "BD",
    tipo: "projecto-experimental",
    ramos: "Arquivística · Documentação digital",
    tutor: "Rui Magaia",
    ano: 2024,
    autores: ["Daniel Chirindza"],
    resumo:
      "Projecto experimental de organização e preservação digital de documentação académica, com proposta de fluxo e metadados.",
    ficheiro: PDF_DEMO,
  },
  {
    slug: "infovula-como-recurso-de-investigacao",
    titulo: "Infovula como recurso de investigação e divulgação",
    curso: "JJ",
    tipo: "artigo",
    ramos: "Livro · Divulgação científica",
    tutor: "Sérgio Langa",
    ano: 2026,
    autores: ["Sérgio Langa", "Joana Machuza"],
    resumo:
      "Artigo sobre a obra Infovula e o seu contributo para a produção e divulgação de conhecimento em comunicação na ESJ.",
    ficheiro: PDF_DEMO,
  },
];

export function cursoBibliotecaPorSlug(slug: string) {
  return CURSOS_BIBLIOTECA.find((c) => c.slug === slug) ?? null;
}

export function cursoBibliotecaPorCodigo(codigo: string) {
  return CURSOS_BIBLIOTECA.find((c) => c.codigo === codigo) ?? null;
}

export function projectoPorSlug(slug: string) {
  return PROJECTOS_CIENTIFICOS.find((p) => p.slug === slug) ?? null;
}

export function projectosDoCurso(
  codigo: CursoBibliotecaCodigo,
  tipo: TipoProjecto | "todos" = "todos"
) {
  return PROJECTOS_CIENTIFICOS.filter(
    (p) => p.curso === codigo && (tipo === "todos" || p.tipo === tipo)
  ).sort((a, b) => b.ano - a.ano || a.titulo.localeCompare(b.titulo, "pt"));
}

export function labelTipo(tipo: TipoProjecto) {
  return TIPOS_PROJECTO.find((t) => t.id === tipo)?.label ?? tipo;
}

export function slugsCursosBiblioteca() {
  return CURSOS_BIBLIOTECA.map((c) => c.slug);
}

export function slugsProjectosDoCurso(cursoSlug: string) {
  const curso = cursoBibliotecaPorSlug(cursoSlug);
  if (!curso) return [];
  return PROJECTOS_CIENTIFICOS.filter((p) => p.curso === curso.codigo).map((p) => p.slug);
}
