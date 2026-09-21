import { ANO_LECTIVO, cursoPorTitulo } from "@/lib/admissao";

export type ContaEstudanteCriada = {
  numeroEstudante: string;
  emailEnviado: boolean;
  avisoEmail: string | null;
  /** Só vem preenchida quando o e-mail falhou — é o único caso em que a secretaria precisa de a comunicar à mão. */
  passwordTemporaria: string | null;
};

/**
 * Núcleo da criação de conta de estudante: gera o número seguinte (só
 * consumido por Admitidos — ver /api/numeracao-estudantes) e cria a conta.
 * Partilhado por todos os sítios do painel que podem originar uma conta —
 * Candidaturas ("Criar conta"/"Repescar", e automático ao lançar um
 * resultado Admitido) e a Pauta interna (quando falta o número a um
 * admitido) — para nunca haver duas implementações a poder divergir.
 */
export async function criarContaEstudante(input: {
  protocolo: string;
  nome: string;
  email: string | null | undefined;
  curso: string;
  turno: string | null | undefined;
  anoLectivo?: string | null;
}): Promise<ContaEstudanteCriada> {
  const cursoInfo = cursoPorTitulo(input.curso);
  if (!cursoInfo) throw new Error(`Curso "${input.curso}" não reconhecido — não foi possível criar a conta.`);
  if (!input.email) throw new Error(`A candidatura de ${input.nome} não tem e-mail — não é possível criar a conta.`);
  const regime = input.turno === "Pós-laboral" ? "pos-laboral" : "diurno";

  const numRes = await fetch("/api/numeracao-estudantes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ curso: cursoInfo.slug, regime, ano: input.anoLectivo || ANO_LECTIVO }),
  });
  const numJson = await numRes.json();
  if (!numRes.ok) throw new Error(numJson.error || "Não foi possível gerar o número de estudante.");
  const numeroEstudante = numJson.numeroAtribuido as string;

  const contaRes = await fetch("/api/estudantes-contas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "criar_unico",
      numeroEstudante,
      nome: input.nome,
      curso: cursoInfo.slug,
      regime,
      ano: 1,
      email: input.email,
      candidaturaProtocolo: input.protocolo,
    }),
  });
  const contaJson = await contaRes.json();
  if (!contaRes.ok) throw new Error(contaJson.error || "Não foi possível criar a conta.");

  return {
    numeroEstudante,
    emailEnviado: Boolean(contaJson.emailEnviado),
    avisoEmail: (contaJson.avisoEmail as string | null) || null,
    passwordTemporaria: contaJson.passwordTemporaria as string | null,
  };
}
