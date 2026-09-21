import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  emailProvider,
  emailsValidos,
  enviarUmEmail,
  htmlNewsletter,
  siteUrl,
} from "@/lib/email";

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

  const pecasRaw = Array.isArray(body.pecas) ? body.pecas : [];
  const pecas = pecasRaw
    .map((p: { title?: string; resumo?: string; slug?: string }) => ({
      title: String(p?.title || "").trim(),
      resumo: String(p?.resumo || "").trim(),
      slug: String(p?.slug || "").trim(),
    }))
    .filter((p: { title: string; slug: string }) => p.title && p.slug)
    .slice(0, 2);
  if (pecas.length === 0) {
    return NextResponse.json({ error: "Escolha uma ou duas notícias." }, { status: 400 });
  }

  const ids = Array.isArray(body.ids) ? body.ids.map((id: unknown) => String(id)) : [];
  const { data, error } = await supabase.from("newsletter").select("id, email");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  const escolhidos = new Set(ids);
  const destinos = emailsValidos(
    (data ?? [])
      .filter((row) => escolhidos.size === 0 || escolhidos.has(row.id))
      .map((row) => row.email)
  );
  if (destinos.length === 0) {
    return NextResponse.json({ error: "Não há correios válidos para este envio." }, { status: 400 });
  }

  const assunto =
    String(body.assunto || "").trim() ||
    (pecas.length === 1 ? pecas[0].title : "Newsletter da ESJ");
  const html = htmlNewsletter({ origem: siteUrl(request), pecas });

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
    mensagem: pecas.map((p: { title: string }) => p.title).join(" · "),
    canal: "email",
    enviados,
    falhados,
  };
  const ins = await supabase.from("anuncios").insert(row);
  if (ins.error) {
    await supabase.from("anuncios").insert({
      destinatarios: row.destinatarios,
      assunto,
      mensagem: row.mensagem,
    });
  }

  return NextResponse.json({ ok: true, enviados, falhados, total: destinos.length });
}
