import { getSupabase } from "@/lib/supabase";

export type Noticia = {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  body: string[];
};

export const noticias: Noticia[] = [
  {
    slug: "conhecimento-que-conecta",
    date: "Setembro 2026",
    title: "Em breve | Lançamento de Conhecimento que conecta",
    excerpt:
      "A ESJ anuncia o lançamento da obra Experiências Metodológicas em Comunicação — conhecimento que conecta pessoas, ideias e realidades.",
    image: "/livro-experiencias.jpg",
    body: [
      "A Escola Superior de Jornalismo anuncia o lançamento da obra Experiências Metodológicas em Comunicação, apresentada sob o mote Conhecimento que conecta pessoas, ideias e realidades.",
      "O livro reúne práticas, reflexões e caminhos metodológicos para uma comunicação mais crítica, estratégica e transformadora, ao serviço da formação e da investigação na ESJ.",
    ],
  },
  {
    slug: "lancamento-infovula",
    date: "24 de Junho de 2026",
    title: "Lançamento do livro Infovula",
    excerpt:
      "Sérgio Langa e Joana Machuza apresentam Infovula na Galeria Porto de Maputo, numa sessão aberta à comunidade académica e ao público.",
    image: "/livro-infovula.jpg",
    body: [
      "Sérgio Langa e Joana Machuza apresentam Infovula na Galeria Porto de Maputo, numa sessão aberta à comunidade académica e ao público.",
      "A obra discute a qualidade da informação na televisão em Moçambique e reforça o papel da ESJ na produção e divulgação de conhecimento.",
    ],
  },
  {
    slug: "esj-18-anos",
    date: "13 de Maio de 2026",
    title: "ESJ celebra 18 anos de ensino",
    excerpt:
      "A Escola Superior de Jornalismo assinala 18 anos a formar profissionais nas Ciências da Comunicação e da Informação, em Maputo e em Manica.",
    image: "/studentes.jpg",
    body: [
      "A Escola Superior de Jornalismo assinala 18 anos a formar profissionais nas Ciências da Comunicação e da Informação.",
      "Com sede em Maputo e delegação académica em Manica, a instituição continua a ligar a sala de aula à redacção, à pesquisa e à vida pública.",
    ],
  },
  {
    slug: "iii-conferencia-comunicacao",
    date: "Novembro 2025",
    title: "III Conferência Internacional das Ciências da Comunicação",
    excerpt:
      "Investigadores e profissionais reuniram-se no IPAJ, em Maputo, para debater o jornalismo, a era digital e o papel dos media na democracia.",
    image: "/Confefencias.jpg",
    body: [
      "A III Conferência Internacional das Ciências da Comunicação reuniu investigadores e profissionais no IPAJ, em Maputo.",
      "O encontro debateu o jornalismo, os desafios da era digital e o papel dos media na consolidação da democracia moçambicana.",
    ],
  },
  {
    slug: "barometro-comunicacao-social",
    date: "4 de Setembro de 2026",
    title: "ESJ apresenta o Barómetro da Comunicação Social",
    excerpt:
      "O GABINFO apresentou o Barómetro da Comunicação Social, projecto da ESJ para reforçar a transparência e o pluralismo informativo no país.",
    image: "/Estudio.jpg",
    body: [
      "O Gabinete de Informação apresentou o Barómetro da Comunicação Social, projecto concebido pela Escola Superior de Jornalismo.",
      "A iniciativa pretende reforçar a transparência pública, o pluralismo informativo e a produção de conhecimento sobre o sector dos media em Moçambique.",
    ],
  },
  {
    slug: "noivas-do-homem-maduro",
    date: "25 de Maio de 2026",
    title: "Lançamento de As Noivas do Homem Maduro",
    excerpt:
      "Isaías Carlos Fuel apresenta As Noivas do Homem Maduro na sala de conferências da ESJ, com apresentação de Alexandre Dinis Zavala.",
    image: "/livro-noivas.jpg",
    body: [
      "A ESJ acolhe o lançamento de As Noivas do Homem Maduro, de Isaías Carlos Fuel, com apresentação de Alexandre Dinis Zavala.",
      "A sessão realiza-se na sala de conferências da escola e está aberta à comunidade académica.",
    ],
  },
  {
    slug: "exames-admissao-2026",
    date: "5 de Fevereiro de 2026",
    title: "Exames de admissão ao ano lectivo 2026",
    excerpt:
      "As provas de Português e História realizaram-se em todo o país, para as licenciaturas em Maputo e na delegação académica de Manica.",
    image: "/Banner-website-ESJ-Final4-3-1.jpg",
    body: [
      "Os exames de admissão à ESJ realizaram-se a 5 de Fevereiro de 2026, com provas de Português e História.",
      "As candidaturas decorreram de Novembro de 2025 a Janeiro de 2026, para as licenciaturas em Maputo e na delegação de Manica.",
    ],
  },
  {
    slug: "jornalista-plataformas-digitais",
    date: "26 de Março de 2026",
    title: "Jornalista deve dominar plataformas digitais",
    excerpt:
      "Paulo da Conceição falou aos estudantes da ESJ sobre ética, verificação da informação e o domínio das plataformas digitais.",
    image: "/Estudio.jpg",
    body: [
      "O chefe da Redacção do Jornal Notícias, Paulo da Conceição, falou aos estudantes da ESJ sobre o perfil do jornalista na era digital.",
      "Sublinhou o domínio das plataformas digitais, o pensamento crítico, a ética e a capacidade de verificação perante a inteligência artificial.",
    ],
  },
];

export const noticiasDestaque = noticias.slice(0, 4);

type NoticiaRow = {
  slug: string;
  date_label: string;
  title: string;
  excerpt: string;
  image: string;
  body: string[] | null;
};

function fromRow(row: NoticiaRow): Noticia {
  return {
    slug: row.slug,
    date: row.date_label,
    title: row.title,
    excerpt: row.excerpt,
    image: row.image,
    body: row.body ?? [],
  };
}

export async function listNoticias(): Promise<Noticia[]> {
  const supabase = getSupabase();
  if (!supabase) return noticias;
  const { data, error } = await supabase
    .from("noticias")
    .select("slug, date_label, title, excerpt, image, body")
    .order("published_at", { ascending: false });
  if (error || !data?.length) return noticias;
  return data.map(fromRow);
}

export async function listNoticiasDestaque(): Promise<Noticia[]> {
  const all = await listNoticias();
  return all.slice(0, 4);
}

export function getNoticia(slug: string) {
  return noticias.find((item) => item.slug === slug);
}

export async function findNoticia(slug: string): Promise<Noticia | undefined> {
  const supabase = getSupabase();
  if (!supabase) return getNoticia(slug);
  const { data, error } = await supabase
    .from("noticias")
    .select("slug, date_label, title, excerpt, image, body")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return getNoticia(slug);
  return fromRow(data);
}
