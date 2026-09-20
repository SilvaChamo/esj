import { cursosDoNivel, REGIMES } from "@/lib/admissao";

export const COURSES = cursosDoNivel("Licenciatura").map((c) => c.titulo);

export const SHIFTS = REGIMES;

// Só Maputo por enquanto — a delegação de Manica fica de fora da admissão
// enquanto não for reactivada para candidaturas.
export const DELEGACOES = ["Maputo (Sede)"] as const;

export const SEXOS = ["Feminino", "Masculino"] as const;

export const ESTADOS_CIVIS = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)"] as const;

export const PROVINCIAS = [
  "Cidade de Maputo",
  "Maputo",
  "Gaza",
  "Inhambane",
  "Sofala",
  "Manica",
  "Tete",
  "Zambézia",
  "Nampula",
  "Cabo Delgado",
  "Niassa",
] as const;

export const DOCUMENT_FIELDS = [
  {
    id: "bi",
    label: "Bilhete de Identidade ou Passaporte",
    hint: "Cópia frente e verso, PDF, JPG ou PNG.",
    required: true,
  },
  {
    id: "certificado",
    label: "Certificado de habilitações da 12.ª classe",
    hint: "Documento original digitalizado ou certidão equivalente.",
    required: true,
  },
  {
    id: "nascimento",
    label: "Certidão de nascimento",
    hint: "Cópia legível do assento de nascimento.",
    required: true,
  },
  {
    id: "foto",
    label: "Fotografia tipo passe",
    hint: "Fundo claro, recente, formato JPG ou PNG.",
    required: true,
  },
  {
    id: "pagamento",
    label: "Comprovativo de pagamento da taxa",
    hint: "Recibo da taxa de pré-inscrição.",
    required: true,
  },
  {
    id: "equivalencia",
    label: "Declaração de equivalência",
    hint: "Só se o ensino secundário foi concluído fora de Moçambique.",
    required: false,
  },
] as const;

export const EDITAL_PDF = "/Edital%202020.pdf";
