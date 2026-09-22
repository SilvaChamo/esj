import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";
import { eSuperAdmin, eDocente } from "@/lib/gestao-auth";

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
  const admin = eSuperAdmin(user);
  const soDocente = eDocente(user) && !admin;

  if (
    (path.startsWith("/gestao") || path.startsWith("/docencia") || path.startsWith("/estudantes")) &&
    !user
  ) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/entrar";
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }
  // Só super-admin tem acesso ao painel de gestão — docente vai para a
  // secção Docência, qualquer outra conta (estudante) vai para o dela.
  if (path.startsWith("/gestao") && !admin) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = soDocente ? "/docencia/partilhar" : "/estudantes";
    return NextResponse.redirect(redirect);
  }
  if (path === "/entrar" && user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = admin ? "/gestao" : soDocente ? "/docencia/partilhar" : "/estudantes";
    return NextResponse.redirect(redirect);
  }

  return response;
}
