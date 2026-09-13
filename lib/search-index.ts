export type SearchItem = {
  title: string;
  excerpt: string;
  href: string;
  category: string;
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
      "Sede na Av. 24 de Julho, antiga Escola Industrial, Maputo. Telefone +258 21 302 721.",
    href: "/#contacto",
    category: "Contacto",
  },
  {
    title: "Portal eDondzo",
    excerpt: "Aceda ao portal académico eDondzo da Escola Superior de Jornalismo.",
    href: "https://esj.edondzo.ac.mz",
    category: "Serviços",
  },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function searchSite(query: string): SearchItem[] {
  const q = normalize(query);
  if (!q) return [];

  const scored = searchIndex
    .map((item) => {
      const title = normalize(item.title);
      const excerpt = normalize(item.excerpt);
      const category = normalize(item.category);
      let score = 0;
      if (title === q) score += 8;
      if (title.startsWith(q)) score += 5;
      if (title.includes(q)) score += 4;
      if (category.includes(q)) score += 3;
      if (excerpt.includes(q)) score += 2;
      q.split(/\s+/).forEach((word) => {
        if (word.length < 2) return;
        if (title.includes(word)) score += 2;
        if (excerpt.includes(word)) score += 1;
      });
      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((entry) => entry.item);
}
