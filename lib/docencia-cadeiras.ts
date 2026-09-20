import { createBrowserSupabase } from "@/lib/supabase/browser";
import { isMissingTable } from "@/lib/cms";
import { CURRICULOS_ESJ, type CadeiraCurriculo } from "@/lib/curriculo";
import type { CursoDocenciaSlug } from "@/lib/docencia";

export type CadeiraAtribuida = {
  id: string;
  docenteId: string;
  curso: CursoDocenciaSlug;
  cadeiraCodigo: string;
  cadeiraNome: string;
  ano: number | null;
  semestre: number | null;
};

type CadeiraAtribuidaRow = {
  id: string;
  docente_id: string;
  curso: CursoDocenciaSlug;
  cadeira_codigo: string;
  cadeira_nome: string;
  ano: number | null;
  semestre: number | null;
};

function deLinha(row: CadeiraAtribuidaRow): CadeiraAtribuida {
  return {
    id: row.id,
    docenteId: row.docente_id,
    curso: row.curso,
    cadeiraCodigo: row.cadeira_codigo,
    cadeiraNome: row.cadeira_nome,
    ano: row.ano,
    semestre: row.semestre,
  };
}

/**
 * Cadeiras atribuídas ao docente autenticado. A RLS filtra sempre por
 * docente_id = auth.uid(), por isso não é possível ler as de outra pessoa
 * a partir do cliente. Devolve null se a tabela ainda não existir.
 */
export async function listarMinhasCadeiras(): Promise<CadeiraAtribuida[] | null> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("docencia_cadeiras")
    .select("*")
    .order("curso", { ascending: true })
    .order("ano", { ascending: true });
  if (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
  return (data ?? []).map(deLinha);
}

/** Todas as cadeiras de todos os cursos, agrupadas — usado pelo selector de atribuição na Gestão. */
export function todasAsCadeirasPorCurso(): {
  curso: CursoDocenciaSlug;
  cursoNome: string;
  cadeiras: CadeiraCurriculo[];
}[] {
  return Object.values(CURRICULOS_ESJ).map((c) => ({
    curso: c.cursoSlug,
    cursoNome: c.cursoNome,
    cadeiras: c.cadeiras,
  }));
}

export type CadeiraCatalogo = { id: string; codigo: string; nome: string; ano: number; semestre: number };
export type GrupoCadeiras = { curso: CursoDocenciaSlug; cursoNome: string; cadeiras: CadeiraCatalogo[] };

/** Cadeira acrescentada pela secretaria via interface (tabela cadeiras_adicionais) — complementa o catálogo estático. */
export type CadeiraExtra = { id: string; curso: CursoDocenciaSlug; codigo: string; nome: string; ano: number; semestre: number };

/**
 * Correcção da secretaria a uma cadeira do catálogo estático (lib/curriculo.ts).
 * Identificada por curso+codigo — o código nunca muda (é a chave usada em
 * docencia_cadeiras/docencia_materiais/notas), só nome/ano/semestre, e
 * `removida` esconde a cadeira do catálogo sem apagar o código-fonte.
 */
export type CadeiraOverride = {
  curso: CursoDocenciaSlug;
  codigo: string;
  nome: string | null;
  ano: number | null;
  semestre: number | null;
  removida: boolean;
};

const CATALOGO_BASE: GrupoCadeiras[] = todasAsCadeirasPorCurso().map((g) => ({
  curso: g.curso,
  cursoNome: g.cursoNome,
  cadeiras: g.cadeiras.map((c) => ({ id: c.id, codigo: c.codigo, nome: c.nome, ano: c.ano, semestre: c.semestre })),
}));

/**
 * Junta o catálogo estático (lib/curriculo.ts) com as correcções da secretaria
 * (overrides de nome/ano/semestre, e cadeiras base escondidas) e com as
 * cadeiras que a secretaria acrescentou de raiz (extras).
 */
export function montarCatalogo(extras: CadeiraExtra[], overrides: CadeiraOverride[] = []): GrupoCadeiras[] {
  return CATALOGO_BASE.map((grupo) => ({
    ...grupo,
    cadeiras: [
      ...grupo.cadeiras
        .filter((c) => !overrides.some((o) => o.curso === grupo.curso && o.codigo === c.codigo && o.removida))
        .map((c) => {
          const override = overrides.find((o) => o.curso === grupo.curso && o.codigo === c.codigo);
          if (!override) return c;
          return {
            id: c.id,
            codigo: c.codigo,
            nome: override.nome ?? c.nome,
            ano: override.ano ?? c.ano,
            semestre: override.semestre ?? c.semestre,
          };
        }),
      ...extras
        .filter((e) => e.curso === grupo.curso)
        .map((e) => ({ id: `extra-${e.id}`, codigo: e.codigo, nome: e.nome, ano: e.ano, semestre: e.semestre })),
    ],
  }));
}

export type CadeiraRemovida = {
  curso: CursoDocenciaSlug;
  cursoNome: string;
  codigo: string;
  nome: string;
  ano: number;
  semestre: number;
};

/** Cadeiras do catálogo base escondidas pela secretaria (overrides com removida=true) — para a lixeira. */
export function cadeirasBaseRemovidas(overrides: CadeiraOverride[]): CadeiraRemovida[] {
  const resultado: CadeiraRemovida[] = [];
  for (const o of overrides) {
    if (!o.removida) continue;
    const grupo = CATALOGO_BASE.find((g) => g.curso === o.curso);
    const base = grupo?.cadeiras.find((c) => c.codigo === o.codigo);
    if (!grupo || !base) continue;
    resultado.push({
      curso: o.curso,
      cursoNome: grupo.cursoNome,
      codigo: o.codigo,
      nome: o.nome ?? base.nome,
      ano: o.ano ?? base.ano,
      semestre: o.semestre ?? base.semestre,
    });
  }
  return resultado;
}

export function nomeCadeira(catalogo: GrupoCadeiras[], curso: string, codigo: string): string {
  const grupo = catalogo.find((g) => g.curso === curso);
  return grupo?.cadeiras.find((c) => c.codigo === codigo)?.nome || codigo;
}

/** Ano curricular da cadeira — precisamos disto para saber a que turma pertencem os estudantes. */
export function anoCadeira(catalogo: GrupoCadeiras[], curso: string, codigo: string): number | null {
  const grupo = catalogo.find((g) => g.curso === curso);
  return grupo?.cadeiras.find((c) => c.codigo === codigo)?.ano ?? null;
}

/** Cadeiras acrescentadas pela secretaria (tabela cadeiras_adicionais). Devolve [] se a tabela ainda não existir. */
export async function listarCadeirasExtras(): Promise<{ extras: CadeiraExtra[]; tabelaFalta: boolean }> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.from("cadeiras_adicionais").select("*");
  if (error) {
    return { extras: [], tabelaFalta: isMissingTable(error) };
  }
  return {
    extras: (data || []).map((r) => ({
      id: r.id,
      curso: r.curso,
      codigo: r.codigo,
      nome: r.nome,
      ano: r.ano,
      semestre: r.semestre,
    })),
    tabelaFalta: false,
  };
}

/** Correcções da secretaria às cadeiras do catálogo estático (tabela cadeiras_overrides). Devolve [] se a tabela ainda não existir. */
export async function listarCadeirasOverrides(): Promise<{ overrides: CadeiraOverride[]; tabelaFalta: boolean }> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.from("cadeiras_overrides").select("*");
  if (error) {
    return { overrides: [], tabelaFalta: isMissingTable(error) };
  }
  return {
    overrides: (data || []).map((r) => ({
      curso: r.curso,
      codigo: r.codigo,
      nome: r.nome,
      ano: r.ano,
      semestre: r.semestre,
      removida: r.removida,
    })),
    tabelaFalta: false,
  };
}
