import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { eSuperAdmin } from "@/lib/gestao-auth";
import {
  CALENDARIO_2026_DEFAULT,
  mergeCalendarioComDefaults,
  type CalendarioAcademicoAnual,
} from "@/lib/calendario-detalhado";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(CALENDARIO_2026_DEFAULT);
  }
  const { data, error } = await admin
    .from("calendario_detalhado")
    .select("ano_lectivo, subtitulo, eventos")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) {
    return NextResponse.json(CALENDARIO_2026_DEFAULT);
  }
  const raw: CalendarioAcademicoAnual = {
    anoLectivo: data.ano_lectivo || CALENDARIO_2026_DEFAULT.anoLectivo,
    subtitulo: data.subtitulo || CALENDARIO_2026_DEFAULT.subtitulo,
    eventos: Array.isArray(data.eventos) ? data.eventos : [],
  };
  return NextResponse.json(mergeCalendarioComDefaults(raw));
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });
  const { data: sessao } = await supabase.auth.getUser();
  if (!eSuperAdmin(sessao.user)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as CalendarioAcademicoAnual | null;
  if (!body?.eventos) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin não configurado." }, { status: 503 });
  }

  const merged = mergeCalendarioComDefaults(body);
  const { error } = await admin.from("calendario_detalhado").upsert({
    id: 1,
    ano_lectivo: merged.anoLectivo,
    subtitulo: merged.subtitulo,
    eventos: merged.eventos,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json(
      { error: error.message, needsSchema: /Could not find the table|PGRST205/i.test(error.message) },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
