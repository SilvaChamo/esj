import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";

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

  const path = request.nextUrl.pathname;
  const role = String(user?.user_metadata?.role || "").toLowerCase();
  const soDocente = !!user && (role === "docente" || role === "professor");

  if ((path.startsWith("/gestao") || path.startsWith("/docencia")) && !user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/entrar";
    return NextResponse.redirect(redirect);
  }
  // Conta de docente: só tem acesso à secção Docência, não ao painel de gestão.
  if (path.startsWith("/gestao") && soDocente) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/docencia/partilhar";
    return NextResponse.redirect(redirect);
  }
  if (path === "/entrar" && user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = soDocente ? "/docencia/partilhar" : "/gestao";
    return NextResponse.redirect(redirect);
  }

  return response;
}
