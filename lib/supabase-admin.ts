import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/supabase-env";

/**
 * Cliente com a service role key — só corre no servidor (API routes).
 * Nunca importar em código de cliente: a chave dá acesso total, sem RLS.
 */
export function getSupabaseAdmin() {
  const url = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
