import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { emailProvider, emailsValidos, enviarUmEmail, htmlFolha, siteUrl } from "@/lib/email";

async function utilizadorGestao() {
  const supabase = createServerSupabase();
  if (!supabase) return { supabase: null, user: null };
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}

export async function GET() {
  const { user } = await utilizadorGestao();
  if (!user) {
    return NextResponse.json({ error: "Inicie sessão na gestão." }, { status: 401 });
  }
  return NextResponse.json({ configurado: Boolean(emailProvider()) });
}

export async function POST(request: Request) {
  const { supabase, user } = await utilizadorGestao();
  if (!supabase || !user) {
    return NextResponse.json({ error: "Inicie sessão na gestão." }, { status: 401 });
  }
  if (!emailProvider()) {
    return NextResponse.json(
      { error: "Configure BREVO_API_KEY e EMAIL_FROM no servidor." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const titulo = String(body.titulo || "").trim();
  const ficheiro = String(body.ficheiro || "").trim();
  if (!titulo || !ficheiro) {
    return NextResponse.json({ error: "Indique o título e o PDF da edição." }, { status: 400 });
  }

  const { data, error } = await supabase.from("newsletter").select("email");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  const destinos = emailsValidos((data ?? []).map((row) => row.email));
  if (destinos.length === 0) {
    return NextResponse.json({ error: "Não há subscritores com correio válido." }, { status: 400 });
  }

  const assunto = `Folha académica — ${titulo}`;
  const html = htmlFolha({ origem: siteUrl(request), titulo, ficheiro });

  let enviados = 0;
  let falhados = 0;
  for (const para of destinos) {
    try {
      await enviarUmEmail(para, assunto, html);
      enviados += 1;
    } catch {
      falhados += 1;
    }
  }

  const row = {
    destinatarios: `${enviados} subscritor(es)`,
    assunto,
    mensagem: ficheiro,
    canal: "folha",
    enviados,
    falhados,
  };
  const ins = await supabase.from("anuncios").insert(row);
  if (ins.error) {
    await supabase.from("anuncios").insert({
      destinatarios: row.destinatarios,
      assunto,
      mensagem: ficheiro,
    });
  }

  return NextResponse.json({ ok: true, enviados, falhados, total: destinos.length });
}
