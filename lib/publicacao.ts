import { getSupabase } from "@/lib/supabase";

export const PUBLICACAO_KEY = "esj-publicacao";
export const EVENTO_KEY = "esj-publicacao-evento";

export type PublicacaoTipo = "livro" | "cartaz";
export type Categoria = "livro" | "evento";

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

export const DEFAULT_EVENTO: Publicacao = {
  image: "/Sala de conferencias.jpg",
  title: "Agenda de eventos da ESJ",
  subtitle: "Conferências, colóquios e a Semana da Comunicação e Informação",
  authors: "",
  date: "Brevemente",
  venue: "Campus da ESJ, Maputo",
  tipo: "cartaz",
};

function keyFor(categoria: Categoria) {
  return categoria === "evento" ? EVENTO_KEY : PUBLICACAO_KEY;
}

function defaultFor(categoria: Categoria) {
  return categoria === "evento" ? DEFAULT_EVENTO : DEFAULT_PUBLICACAO;
}

export function readPublicacao(categoria: Categoria = "livro"): Publicacao {
  const fallback = defaultFor(categoria);
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(keyFor(categoria));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Publicacao>;
    return {
      ...fallback,
      ...parsed,
      image: parsed.image || fallback.image,
      tipo: categoria === "evento" ? "cartaz" : "livro",
    };
  } catch {
    return fallback;
  }
}

export function writePublicacao(data: Publicacao, categoria: Categoria = "livro") {
  window.localStorage.setItem(keyFor(categoria), JSON.stringify(data));
  window.dispatchEvent(new Event("esj-publicacao"));
}

export async function loadPublicacao(categoria: Categoria = "livro"): Promise<Publicacao> {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase
      .from("publicacoes")
      .select("title, subtitle, authors, date_label, venue, image, tipo")
      .eq("categoria", categoria)
      .order("created_at", { ascending: false })
      .limit(1);
    const row = data?.[0];
    if (row?.image) {
      return {
        image: row.image,
        title: row.title,
        subtitle: row.subtitle,
        authors: row.authors,
        date: row.date_label,
        venue: row.venue,
        tipo: categoria === "evento" ? "cartaz" : "livro",
      };
    }
  }
  return readPublicacao(categoria);
}

export async function loadLivros(): Promise<LivroThumb[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase
      .from("livros")
      .select("title, image")
      .order("sort_order", { ascending: true });
    if (data?.length) return data;
  }
  return LIVROS_ANTERIORES;
}
