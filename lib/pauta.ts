import { getSupabase } from "@/lib/supabase";
import {
  ANO_LECTIVO,
  classificacao,
  mediaFinal,
  type Nivel,
  type Regime,
} from "@/lib/admissao";

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
  resultado: "Admitido" | "Não admitido";
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

const DEMO_JORNALISMO_DIURNO: Omit<PautaRow, "id" | "publicado">[] = [
  {
    ano_lectivo: ANO_LECTIVO,
    nivel: "Licenciatura",
    curso: "Jornalismo",
    regime: "Diurno",
    apelido: "Bila",
    nome: "Ana Maria",
    nota_portugues: 16,
    nota_historia: 14.5,
  },
  {
    ano_lectivo: ANO_LECTIVO,
    nivel: "Licenciatura",
    curso: "Jornalismo",
    regime: "Diurno",
    apelido: "Chissano",
    nome: "Carlos Eduardo",
    nota_portugues: 11,
    nota_historia: 9.5,
  },
  {
    ano_lectivo: ANO_LECTIVO,
    nivel: "Licenciatura",
    curso: "Jornalismo",
    regime: "Diurno",
    apelido: "Dava",
    nome: "Esperança",
    nota_portugues: 8,
    nota_historia: 9,
  },
  {
    ano_lectivo: ANO_LECTIVO,
    nivel: "Licenciatura",
    curso: "Jornalismo",
    regime: "Diurno",
    apelido: "Francisco",
    nome: "João Pedro",
    nota_portugues: 13.5,
    nota_historia: 15,
  },
  {
    ano_lectivo: ANO_LECTIVO,
    nivel: "Licenciatura",
    curso: "Jornalismo",
    regime: "Diurno",
    apelido: "Gove",
    nome: "Lurdes",
    nota_portugues: 17,
    nota_historia: 16,
  },
  {
    ano_lectivo: ANO_LECTIVO,
    nivel: "Licenciatura",
    curso: "Jornalismo",
    regime: "Diurno",
    apelido: "Mabunda",
    nome: "Pedro António",
    nota_portugues: 12,
    nota_historia: 12,
  },
  {
    ano_lectivo: ANO_LECTIVO,
    nivel: "Licenciatura",
    curso: "Jornalismo",
    regime: "Diurno",
    apelido: "Nhaca",
    nome: "Fátima",
    nota_portugues: 14,
    nota_historia: 13,
  },
  {
    ano_lectivo: ANO_LECTIVO,
    nivel: "Licenciatura",
    curso: "Jornalismo",
    regime: "Diurno",
    apelido: "Sitoe",
    nome: "Miguel",
    nota_portugues: 9.5,
    nota_historia: 10,
  },
];

const DEMO_JORNALISMO_POS: Omit<PautaRow, "id" | "publicado">[] = [
  {
    ano_lectivo: ANO_LECTIVO,
    nivel: "Licenciatura",
    curso: "Jornalismo",
    regime: "Pós-laboral",
    apelido: "Alberto",
    nome: "Helena",
    nota_portugues: 15,
    nota_historia: 14,
  },
  {
    ano_lectivo: ANO_LECTIVO,
    nivel: "Licenciatura",
    curso: "Jornalismo",
    regime: "Pós-laboral",
    apelido: "Cossa",
    nome: "Daniel",
    nota_portugues: 10,
    nota_historia: 11,
  },
  {
    ano_lectivo: ANO_LECTIVO,
    nivel: "Licenciatura",
    curso: "Jornalismo",
    regime: "Pós-laboral",
    apelido: "Machel",
    nome: "Inês",
    nota_portugues: 7.5,
    nota_historia: 8,
  },
  {
    ano_lectivo: ANO_LECTIVO,
    nivel: "Licenciatura",
    curso: "Jornalismo",
    regime: "Pós-laboral",
    apelido: "Tembe",
    nome: "Rui",
    nota_portugues: 13,
    nota_historia: 12.5,
  },
];

function demoPauta(curso: string, nivel: Nivel, regime: Regime): LinhaPauta[] {
  if (curso !== "Jornalismo" || nivel !== "Licenciatura") return [];
  const source = regime === "Pós-laboral" ? DEMO_JORNALISMO_POS : DEMO_JORNALISMO_DIURNO;
  return source.map((row, i) =>
    mapLinha({
      ...row,
      id: `demo-${regime}-${i}`,
      publicado: true,
    })
  );
}

export async function loadPautaPublica(input: {
  curso: string;
  nivel: Nivel;
  regime: Regime;
  anoLectivo?: string;
}): Promise<PautaPublica> {
  const anoLectivo = input.anoLectivo ?? ANO_LECTIVO;
  const supabase = getSupabase();
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
    if (data?.length) {
      return {
        anoLectivo,
        nivel: input.nivel,
        curso: input.curso,
        regime: input.regime,
        linhas: ordenarPauta(data.map(mapLinha)),
      };
    }
  }
  return {
    anoLectivo,
    nivel: input.nivel,
    curso: input.curso,
    regime: input.regime,
    linhas: ordenarPauta(demoPauta(input.curso, input.nivel, input.regime)),
  };
}
