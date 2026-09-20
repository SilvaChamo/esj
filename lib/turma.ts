import { createBrowserSupabase } from "@/lib/supabase/browser";
import { isMissingTable } from "@/lib/cms";
import type { CursoDocenciaSlug } from "@/lib/docencia";
import type { RegimeCurso } from "@/lib/curriculo";

export type EstudanteTurma = {
  id: string;
  numeroEstudante: string;
  nome: string;
};

/**
 * Lista real dos estudantes de uma turma (curso + regime + ano) — vem da
 * pauta física da secretaria. Serve para o docente escolher directamente da
 * turma em vez de pesquisar às cegas. Devolve null se a tabela ainda não existir.
 */
export async function listarTurma(
  curso: CursoDocenciaSlug,
  regime: RegimeCurso,
  ano: number
): Promise<EstudanteTurma[] | null> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("turma_estudantes")
    .select("id, numero_estudante, nome")
    .eq("curso", curso)
    .eq("regime", regime)
    .eq("ano", ano)
    .order("nome", { ascending: true });
  if (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
  return (data ?? []).map((r) => ({
    id: r.id,
    numeroEstudante: r.numero_estudante,
    nome: r.nome,
  }));
}

/**
 * Acrescenta o estudante à turma real (curso + regime + ano) no momento do
 * auto-registo público — para aparecer logo na pauta do docente sem a
 * secretaria ter de o adicionar à mão. Passa sempre por /api/registo-estudante
 * (chave de serviço): nunca escrita directa do cliente, porque a tabela não
 * tem RLS de escrita própria — ver comentário em supabase/turma-estudantes.sql.
 * Falha em silêncio (não bloqueia o registo): sem sessão ainda confirmada, ou
 * sem a tabela criada, o estudante fica sem aparecer na turma até alguém o
 * adicionar manualmente.
 */
export async function adicionarEstudanteTurma(input: {
  numeroEstudante: string;
  nome: string;
  curso: CursoDocenciaSlug;
  regime: RegimeCurso;
  ano: number;
}): Promise<boolean> {
  if (!input.numeroEstudante.trim()) return false;
  try {
    const res = await fetch("/api/registo-estudante", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        numeroEstudante: input.numeroEstudante.trim(),
        nome: input.nome.trim(),
        curso: input.curso,
        regime: input.regime,
        ano: input.ano,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
