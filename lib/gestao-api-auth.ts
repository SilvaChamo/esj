import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";
import { eSuperAdmin } from "@/lib/gestao-auth";

/**
 * Confirma que quem chamou a rota é super-admin, a partir da sessão em
 * cookies — usado pelas rotas de API da Gestão que escrevem com a chave de
 * serviço (cadeiras-adicionais, cadeiras-base, …). Nunca importar isto num
 * componente "use client": next/headers só corre no servidor.
 */
export async function pedirSuperAdmin() {
  const cookieStore = cookies();
  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        /* rota só de leitura de sessão — não define cookies novos */
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  return eSuperAdmin(data.user);
}
