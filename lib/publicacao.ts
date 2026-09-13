export const PUBLICACAO_KEY = "esj-publicacao";

export type PublicacaoTipo = "livro" | "cartaz";

export type Publicacao = {
  image: string;
  title: string;
  subtitle: string;
  authors: string;
  date: string;
  venue: string;
  tipo: PublicacaoTipo;
};

export type LivroThumb = {
  image: string;
  title: string;
};

export const LIVROS_ANTERIORES: LivroThumb[] = [
  { image: "/livro-infovula.jpg", title: "Infovula" },
  { image: "/livro-noivas.jpg", title: "As Noivas do Homem Maduro" },
  {
    image: "/livro-experiencias.jpg",
    title: "Conhecimento que conecta",
  },
];

export const DEFAULT_PUBLICACAO: Publicacao = {
  image: "/livro-infovula.jpg",
  title: "Infovula",
  subtitle: "Do pauperismo semântico à qualidade da informação da televisão em Moçambique",
  authors: "Sérgio Langa\nJoana Machuza",
  date: "24/06/2026",
  venue: "Porto de Maputo",
  tipo: "livro",
};

export function readPublicacao(): Publicacao {
  if (typeof window === "undefined") return DEFAULT_PUBLICACAO;
  try {
    const raw = window.localStorage.getItem(PUBLICACAO_KEY);
    if (!raw) return DEFAULT_PUBLICACAO;
    const parsed = JSON.parse(raw) as Partial<Publicacao> & { meta?: string };
    return {
      ...DEFAULT_PUBLICACAO,
      ...parsed,
      authors: parsed.authors?.includes("-PHD") || parsed.authors?.includes("Jeremias")
        ? DEFAULT_PUBLICACAO.authors
        : parsed.authors ?? DEFAULT_PUBLICACAO.authors,
      date: parsed.date ?? DEFAULT_PUBLICACAO.date,
      venue: parsed.venue ?? DEFAULT_PUBLICACAO.venue,
      tipo: parsed.tipo === "cartaz" ? "cartaz" : "livro",
    };
  } catch {
    return DEFAULT_PUBLICACAO;
  }
}

export function writePublicacao(data: Publicacao) {
  window.localStorage.setItem(PUBLICACAO_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("esj-publicacao"));
}
