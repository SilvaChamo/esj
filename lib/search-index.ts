import {
  CURSOS_BIBLIOTECA,
  PROJECTOS_CIENTIFICOS,
  cursoBibliotecaPorCodigo,
  labelTipo,
  type ProjectoCientifico,
} from "@/lib/producao-cientifica";

export type SearchItem = {
  title: string;
  excerpt: string;
  href: string;
  category: string;
  /** Texto extra para pesquisa (autor, tutor, avaliador, área, tipo, etc.). */
  keywords?: string;
};

export const searchIndex: SearchItem[] = [
  {
    title: "Escola Superior de Jornalismo",
    excerpt:
      "Instituição pública de ensino superior vocacionada para a formação de quadros nas Ciências da Comunicação e da Informação, ao serviço de Moçambique.",
    href: "/#inicio",
    category: "Instituição",
  },
  {
    title: "Licenciaturas",
    excerpt:
      "Cursos de Jornalismo, Publicidade e Marketing, Relações Públicas e Biblioteconomia e Documentação.",
    href: "/#ensino",
    category: "Ensino",
  },
  {
    title: "Jornalismo",
    excerpt:
      "Formação prática em redação, estúdios de televisão, laboratórios de rádio e imprensa, alinhada ao jornalismo contemporâneo.",
    href: "/#ensino",
    category: "Cursos",
  },
  {
    title: "Publicidade e Marketing",
    excerpt:
      "Licenciatura em Publicidade e Marketing, com prática em laboratório de marketing digital e redes sociais.",
    href: "/#ensino",
    category: "Cursos",
  },
  {
    title: "Relações Públicas",
    excerpt:
      "Licenciatura em Relações Públicas para profissionais de comunicação institucional e imagem.",
    href: "/#ensino",
    category: "Cursos",
  },
  {
    title: "Biblioteconomia e Documentação",
    excerpt:
      "Licenciatura em Biblioteconomia e Documentação, com acervo de referência em Ciências da Comunicação.",
    href: "/#ensino",
    category: "Cursos",
  },
  {
    title: "Pós-Graduação",
    excerpt:
      "Oferta de pós-graduação da ESJ para aprofundamento académico e profissional em comunicação.",
    href: "/#ensino",
    category: "Ensino",
  },
  {
    title: "Admissões 2026",
    excerpt:
      "O prazo de pré-inscrição para 2026 está encerrado. O próximo ciclo, ano lectivo 2027, deverá abrir em novembro.",
    href: "/inscricoes",
    category: "Admissões",
  },
  {
    title: "Edital 2026",
    excerpt:
      "Edital de admissão para os cursos de Jornalismo, Publicidade e Marketing, Relações Públicas e Biblioteconomia e Documentação.",
    href: "/edital",
    category: "Admissões",
  },
  {
    title: "Pré-inscrição 2026",
    excerpt:
      "O prazo de pré-inscrição para 2026 está encerrado. Consulte as datas do ano lectivo 2027, previstas para novembro.",
    href: "/inscricoes",
    category: "Admissões",
  },
  {
    title: "Lançamento de livro",
    excerpt:
      "Infovula, de Sérgio Jeremias Langa e Joana Machuza Matenga. Lançamento a 24 de Junho de 2026, Galeria Porto de Maputo.",
    href: "/#ensino",
    category: "Publicações",
  },
  {
    title: "Infovula",
    excerpt:
      "Livro de Sérgio Jeremias Langa e Joana Machuza Matenga. Lançamento a 24 de Junho de 2026, Galeria Porto de Maputo.",
    href: "/#ensino",
    category: "Publicações",
  },
  {
    title: "Notícias da ESJ",
    excerpt:
      "Lançamentos, conferências e vida da Escola Superior de Jornalismo, a partir da página oficial no Facebook.",
    href: "/noticias",
    category: "Notícias",
  },
  {
    title: "Contacto",
    excerpt:
      "Sede na Av. 24 de Julho, antiga Escola Industrial, Maputo. Telefone +258 21 302 721. Boletim e mensagem na página de contacto.",
    href: "/contacto",
    category: "Contacto",
  },
  {
    title: "Portal eDondzo",
    excerpt: "Aceda ao portal académico eDondzo da Escola Superior de Jornalismo.",
    href: "https://esj.edondzo.ac.mz",
    category: "Serviços",
  },
  {
    title: "Biblioteca virtual",
    excerpt:
      "Repositório científico da ESJ — monografias, projectos experimentais, relatórios de estágio e artigos por curso.",
    href: "/biblioteca-virtual",
    category: "Biblioteca",
    keywords:
      "acervo produção científica monografia projecto experimental relatório estágio artigo científico",
  },
  ...CURSOS_BIBLIOTECA.map(
    (c): SearchItem => ({
      title: `Acervo · ${c.titulo}`,
      excerpt: c.descricao,
      href: `/biblioteca-virtual/${c.slug}`,
      category: "Biblioteca",
      keywords: `${c.titulo} ${c.codigo} ${c.expectativa} produção científica monografias projectos`,
    })
  ),
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** Campos pesquisáveis de um projecto científico. */
export function chavesProjecto(p: ProjectoCientifico): string {
  const curso = cursoBibliotecaPorCodigo(p.curso);
  return [
    p.titulo,
    p.slug.replace(/-/g, " "),
    labelTipo(p.tipo),
    p.tipo.replace(/-/g, " "),
    p.ramos,
    p.tutor,
    p.avaliador || "",
    p.numeroEstudante || "",
    String(p.ano),
    p.autores.join(" "),
    p.resumo,
    curso?.titulo || "",
    curso?.slug.replace(/-/g, " ") || "",
    p.curso,
    "biblioteca virtual",
    "produção científica",
    "acervo",
  ]
    .filter(Boolean)
    .join(" ");
}

export function searchItemDeProjecto(p: ProjectoCientifico): SearchItem {
  const curso = cursoBibliotecaPorCodigo(p.curso);
  const autores = p.autores.join(", ");
  const partes = [
    labelTipo(p.tipo),
    String(p.ano),
    autores ? `Autor(es): ${autores}` : "",
    p.tutor ? `Tutor: ${p.tutor}` : "",
    p.avaliador ? `Avaliador: ${p.avaliador}` : "",
    p.ramos ? `Área: ${p.ramos}` : "",
    p.numeroEstudante ? `N.º ${p.numeroEstudante}` : "",
  ].filter(Boolean);

  return {
    title: p.titulo,
    excerpt: partes.join(" · "),
    href: `/biblioteca-virtual/${curso?.slug || "jornalismo"}?p=${encodeURIComponent(p.slug)}`,
    category: "Biblioteca",
    keywords: chavesProjecto(p),
  };
}

/** Junta exemplares locais com o acervo remoto (remoto ganha no mesmo slug). */
export function fundirProjectos(remotos: ProjectoCientifico[] | null | undefined): ProjectoCientifico[] {
  const porSlug = new Map<string, ProjectoCientifico>();
  for (const p of PROJECTOS_CIENTIFICOS) porSlug.set(p.slug, p);
  if (remotos) {
    for (const p of remotos) porSlug.set(p.slug, p);
  }
  return Array.from(porSlug.values());
}

export function searchSite(query: string, projectosExtra: ProjectoCientifico[] = []): SearchItem[] {
  const q = normalize(query);
  if (!q) return [];

  const projectos = fundirProjectos(projectosExtra);
  const indice: SearchItem[] = [
    ...searchIndex,
    ...projectos.map(searchItemDeProjecto),
  ];

  const palavras = q.split(/\s+/).filter((w) => w.length >= 2);

  const scored = indice
    .map((item) => {
      const title = normalize(item.title);
      const excerpt = normalize(item.excerpt);
      const category = normalize(item.category);
      const keys = normalize(item.keywords || "");
      const blob = `${title} ${excerpt} ${category} ${keys}`;
      let score = 0;

      if (title === q) score += 10;
      if (title.startsWith(q)) score += 6;
      if (title.includes(q)) score += 5;
      if (keys.includes(q)) score += 5;
      if (category.includes(q)) score += 3;
      if (excerpt.includes(q)) score += 2;
      if (blob.includes(q)) score += 1;

      palavras.forEach((word) => {
        if (title.includes(word)) score += 3;
        if (keys.includes(word)) score += 3;
        if (excerpt.includes(word)) score += 1;
        if (category.includes(word)) score += 1;
      });

      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, "pt"));

  // Evitar duplicar o mesmo href+title
  const vistos = new Set<string>();
  const unicos: SearchItem[] = [];
  for (const { item } of scored) {
    const id = `${item.href}|${item.title}`;
    if (vistos.has(id)) continue;
    vistos.add(id);
    unicos.push(item);
  }
  return unicos;
}
