import { getSupabase } from "@/lib/supabase";
import { ANO_LECTIVO, classificacao, mediaFinal, type Nivel, type Regime } from "@/lib/admissao";

export type LinhaPauta = {
  id: string;
  anoLectivo: string;
  nivel: Nivel;
  curso: string;
  regime: Regime;
  apelido: string;
  nome: string;
  notaPortugues: number;
  notaHistoria: number;
  media: number;
  resultado: "Admitido" | "Suplente" | "Não admitido";
  publicado: boolean;
};

export type PautaPublica = {
  anoLectivo: string;
  nivel: Nivel;
  curso: string;
  regime: Regime;
  linhas: LinhaPauta[];
};

type PautaRow = {
  id: string;
  ano_lectivo: string;
  nivel: string;
  curso: string;
  regime: string;
  apelido: string;
  nome: string;
  nota_portugues: number | string;
  nota_historia: number | string;
  publicado: boolean;
};

function num(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

export function mapLinha(row: PautaRow): LinhaPauta {
  const notaPortugues = num(row.nota_portugues);
  const notaHistoria = num(row.nota_historia);
  const media = mediaFinal(notaPortugues, notaHistoria);
  return {
    id: row.id,
    anoLectivo: row.ano_lectivo,
    nivel: row.nivel as Nivel,
    curso: row.curso,
    regime: row.regime as Regime,
    apelido: row.apelido,
    nome: row.nome,
    notaPortugues,
    notaHistoria,
    media,
    resultado: classificacao(media),
    publicado: row.publicado,
  };
}

export function ordenarPauta(linhas: LinhaPauta[]) {
  return [...linhas].sort((a, b) => {
    const apelido = a.apelido.localeCompare(b.apelido, "pt", { sensitivity: "base" });
    if (apelido !== 0) return apelido;
    return a.nome.localeCompare(b.nome, "pt", { sensitivity: "base" });
  });
}

export function letraGrupo(apelido: string) {
  const letter = apelido
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .charAt(0)
    .toUpperCase();
  return /[A-Z]/.test(letter) ? letter : "#";
}

export function rankingMerito(linhas: LinhaPauta[]) {
  const byMedia = [...linhas].sort((a, b) => {
    if (b.media !== a.media) return b.media - a.media;
    const apelido = a.apelido.localeCompare(b.apelido, "pt", { sensitivity: "base" });
    if (apelido !== 0) return apelido;
    return a.nome.localeCompare(b.nome, "pt", { sensitivity: "base" });
  });
  const rank = new Map<string, number>();
  byMedia.forEach((linha, i) => rank.set(linha.id, i + 1));
  return rank;
}

/**
 * Pauta pública — sempre a mesma tabela que Candidaturas e a "Pauta" do
 * painel preenchem (pauta_admissao). Já teve um "demo" de nomes inventados
 * como reserva quando não havia dados reais; foi removido porque mostrava
 * candidatos falsos numa página de resultados reais sempre que um
 * curso/regime ainda não tinha nenhuma nota lançada — em vez disso, mostra
 * o estado vazio real ("Ainda não há resultados publicados...").
 */
export async function loadPautaPublica(input: {
  curso: string;
  nivel: Nivel;
  regime: Regime;
  anoLectivo?: string;
}): Promise<PautaPublica> {
  const anoLectivo = input.anoLectivo ?? ANO_LECTIVO;
  const supabase = getSupabase();
  let linhas: LinhaPauta[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("pauta_admissao")
      .select(
        "id, ano_lectivo, nivel, curso, regime, apelido, nome, nota_portugues, nota_historia, publicado"
      )
      .eq("ano_lectivo", anoLectivo)
      .eq("nivel", input.nivel)
      .eq("curso", input.curso)
      .eq("regime", input.regime)
      .eq("publicado", true);
    if (data?.length) linhas = ordenarPauta(data.map(mapLinha));
  }
  return {
    anoLectivo,
    nivel: input.nivel,
    curso: input.curso,
    regime: input.regime,
    linhas,
  };
}
