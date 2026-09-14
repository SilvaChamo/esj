import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";

export function getSupabase(): SupabaseClient | null {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) return null;
  return createClient(url, key, {
    // O Next.js guarda em cache qualquer fetch feito num Server Component,
    // mesmo em rotas "force-dynamic" — sem isto, as páginas de resultados
    // continuavam a mostrar a pauta antiga depois de a base de dados mudar.
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
