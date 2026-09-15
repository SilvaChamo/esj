export type DocLink = { label: string; href?: string };

export type DocSecao = {
  id: string;
  label: string;
  description: string;
  items: DocLink[];
};

/** Minutas — PDFs do sítio antigo; substituir por ficheiros locais quando existirem. */
export const MINUTAS: DocLink[] = [
  {
    label: "Pedido de Mudança de curso",
    href: "https://esj.ac.mz/wp-content/uploads/2026/05/Minuta-de-Pedido-de-Mudanca-de-Curso.pdf",
  },
  {
    label: "Pedido de Mudança de regime",
    href: "https://esj.ac.mz/wp-content/uploads/2026/05/Minuta-de-Pedido-de-Mudanca-de-Regime.pdf",
  },
  {
    label: "Pedido de Reingresso",
    href: "https://esj.ac.mz/wp-content/uploads/2026/05/Minuta-de-Pedido-de-Reingresso.pdf",
  },
  {
    label: "Pedido de Declaração de Notas",
    href: "https://esj.ac.mz/wp-content/uploads/2026/05/Minuta-de-Pedido-de-Declaracao-de-Notas.pdf",
  },
  {
    label: "Pedido de Declaração de frequência",
    href: "https://esj.ac.mz/wp-content/uploads/2026/05/Minuta-de-Pedido-de-Declaracao-de-Frequencia.pdf",
  },
  {
    label: "Pedido de Certificado",
    href: "https://esj.ac.mz/wp-content/uploads/2026/05/Minuta-de-Pedido-de-Certificado.pdf",
  },
  {
    label: "Pedido de Diploma",
    href: "https://esj.ac.mz/wp-content/uploads/2026/05/Minuta-de-Pedido-de-Diploma.pdf",
  },
  {
    label: "Pedido de Anulação da Matrícula",
    href: "https://esj.ac.mz/wp-content/uploads/2026/05/Minuta-de-Pedido-de-Anulacao-da-Matricula.pdf",
  },
  {
    label: "Pedido de Vaga 2ª Licenciatura",
    href: "https://esj.ac.mz/wp-content/uploads/2026/05/Minuta-de-Pedido-de-Vaga-2a-Licenciatura.pdf",
  },
  {
    label: "Pedido de Vaga",
    href: "https://esj.ac.mz/wp-content/uploads/2026/05/Minuta-de-Pedido-de-Vaga.pdf",
  },
  {
    label: "Pedido de Transferência",
    href: "https://esj.ac.mz/wp-content/uploads/2026/05/Minuta-de-Pedido-de-Transferencia.pdf",
  },
  {
    label: "Pedido de Revisão de Exame Especial",
    href: "https://esj.ac.mz/wp-content/uploads/2026/05/Minuta-de-Pedido-de-Revisao-de-Exame-Especial.pdf",
  },
  {
    label: "Pedido de Revisão de Exame",
    href: "https://esj.ac.mz/wp-content/uploads/2026/05/Minuta-de-Pedido-de-Revisao-de-Exame.pdf",
  },
  {
    label: "Pedido de Plano Analítico",
    href: "https://esj.ac.mz/wp-content/uploads/2026/05/Minuta-de-Pedido-de-Plano-Analitico.pdf",
  },
];

export const REGULAMENTOS: DocLink[] = [
  { label: "Regulamento de Taxas de serviço académico" },
  { label: "Regulamento Pedagógico" },
  { label: "Regulamento de Estágio" },
  { label: "Regulamento de culminação de curso" },
  {
    label: "Regulamento – Tipo de Delegação Académica",
    href: "https://esj.ac.mz/wp-content/uploads/2026/05/Regulamento-Tipo-da-DAM-BR.pdf",
  },
  { label: "Currículo dos Cursos da ESJ" },
  { label: "Normas de citação" },
];

export const DOC_SECOES: DocSecao[] = [
  {
    id: "minutas",
    label: "Minutas",
    description: "Formulários para pedidos à Secretaria Académica.",
    items: MINUTAS,
  },
  {
    id: "regulamentos",
    label: "Regulamentos",
    description: "Normas e regulamentos da vida académica na ESJ.",
    items: REGULAMENTOS,
  },
];

export function secaoPorId(id: string | null | undefined): DocSecao {
  return DOC_SECOES.find((s) => s.id === id) ?? DOC_SECOES[0];
}
