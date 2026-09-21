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

/**
 * Como getSupabase(), mas em vez de "no-store" (0% cache — cada visita
 * paga sempre o pedido completo à Supabase, daí a pauta pública demorar a
 * abrir), deixa o Next.js reaproveitar a resposta durante
 * `revalidateSeconds`. As publicações novas continuam a aparecer sozinhas,
 * só passam a demorar até `revalidateSeconds` a chegar em vez de zero —
 * troca invisível para quem visita, muito mais rápida para todos.
 */
export function getSupabaseCached(revalidateSeconds: number): SupabaseClient | null {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) return null;
  return createClient(url, key, {
    global: {
      fetch: (input, init) => fetch(input, { ...init, next: { revalidate: revalidateSeconds } }),
    },
  });
}
