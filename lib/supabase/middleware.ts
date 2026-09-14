import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";

function isMissingTableError(error: unknown) {
  const msg =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: string }).message)
      : String(error);
  return /Could not find the table|PGRST205|schema cache/i.test(msg);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }

  // Todas as contas têm uma linha em "perfis" (criada por trigger no
  // auth.users; as contas antigas foram migradas com aprovado = true).
  // Falha fechado: qualquer erro ou linha não aprovada deixa pendente —
  // exceto se a tabela "perfis" ainda nem existir (SQL do painel por
  // correr), para não trancar toda a gente fora do painel nesse estado
  // transitório de instalação.
  let pendente = false;
  if (user) {
    pendente = true;
    try {
      const { data: perfil, error } = await supabase
        .from("perfis")
        .select("aprovado")
        .eq("id", user.id)
        .maybeSingle();
      if (!error) {
        pendente = !perfil?.aprovado;
      } else if (isMissingTableError(error)) {
        pendente = false;
      }
    } catch (error) {
      pendente = !isMissingTableError(error);
    }
  }

  const path = request.nextUrl.pathname;
  if (path.startsWith("/gestao") && (!user || pendente)) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/entrar";
    redirect.search = pendente ? "?pendente=1" : "";
    return NextResponse.redirect(redirect);
  }
  if (path === "/entrar" && user && !pendente) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/gestao";
    return NextResponse.redirect(redirect);
  }

  return response;
}
