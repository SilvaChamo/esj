import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";

export function createBrowserSupabase() {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) {
    throw new Error("Supabase não está configurado.");
  }
  return createBrowserClient(url, key);
}
