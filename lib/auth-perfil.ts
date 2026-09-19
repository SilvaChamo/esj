import type { CursoDocenciaSlug } from "@/lib/docencia";
import type { RegimeCurso } from "@/lib/curriculo";

export type TipoPerfilUtilizador = "estudante" | "docente" | "gestor";

export type PerfilUtilizador = {
  id: string;
  email: string;
  nome: string;
  tipo: TipoPerfilUtilizador;
  // Campos específicos de estudante:
  numeroEstudante?: string;
  curso?: CursoDocenciaSlug;
  regime?: RegimeCurso;
  anoLectivo?: string;
  regularizado?: boolean;
  avatar_url?: string;
  // Campos específicos de docente:
  departamento?: string;
  cadeiras?: string[];
};

export const PERFIL_KEY = "esj-perfil-utilizador";

export function getPerfilActual(): PerfilUtilizador | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PERFIL_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function savePerfilActual(perfil: PerfilUtilizador) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PERFIL_KEY, JSON.stringify(perfil));
}

export function clearPerfilActual() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PERFIL_KEY);
}
