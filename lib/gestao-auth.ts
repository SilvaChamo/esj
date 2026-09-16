import type { User } from "@supabase/supabase-js";
import { createBrowserSupabase } from "@/lib/supabase/browser";

/** E-mails de super-admin (vírgula). Ex.: NEXT_PUBLIC_SUPER_ADMIN_EMAILS=admin@esj.ac.mz */
function emailsSuperAdmin(): string[] {
  const raw =
    process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS ||
    process.env.SUPER_ADMIN_EMAILS ||
    "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function localEmail(user: User): string {
  return (user.email || "").split("@")[0]?.trim().toLowerCase() || "";
}

export function eSuperAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  const role = String(user.user_metadata?.role || "").toLowerCase();
  if (
    role === "super_admin" ||
    role === "super-admin" ||
    role === "superadmin" ||
    role === "admin" ||
    role === "administrador"
  ) {
    return true;
  }
  const local = localEmail(user);
  if (local === "admin" || local === "administrador" || local.startsWith("admin")) {
    return true;
  }
  const email = (user.email || "").trim().toLowerCase();
  if (!email) return false;
  return emailsSuperAdmin().includes(email);
}

/** Nome e apelido (nunca o rótulo Administrador). */
export function nomeDeUser(user: User | null | undefined): string | null {
  if (!user) return null;
  const meta = user.user_metadata || {};
  const completo = String(meta.full_name || meta.name || meta.nome || "").trim();
  if (completo) return completo;
  const local = (user.email || "").split("@")[0] || "";
  const partes = local.split(/[._\s-]+/).filter(Boolean);
  if (!partes.length) return user.email || null;
  return partes
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Rótulo automático para «Por: …» no painel.
 * Conta admin → «Administrador»; outras → nome e apelido.
 */
export function rotuloAutorConta(user: User | null | undefined): string | null {
  if (!user) return null;
  if (eSuperAdmin(user)) return "Administrador";
  return nomeDeUser(user);
}

export type GestorSessao = {
  id: string;
  email: string | null;
  nome: string | null;
  /** Texto para «Por: …» (Administrador ou nome). */
  autor: string | null;
  superAdmin: boolean;
};

export async function gestorSessao(): Promise<GestorSessao | null> {
  const supabase = createBrowserSupabase();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? null,
    nome: nomeDeUser(user),
    autor: rotuloAutorConta(user),
    superAdmin: eSuperAdmin(user),
  };
}
