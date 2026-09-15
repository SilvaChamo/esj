import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { enviarUmSms, smsProvider, telemoveisUnicos } from "@/lib/sms";

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
  return NextResponse.json({ configurado: Boolean(smsProvider()) });
}

export async function POST(request: Request) {
  const { supabase, user } = await utilizadorGestao();
  if (!supabase || !user) {
    return NextResponse.json({ error: "Inicie sessão na gestão." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const destinatarios = String(body.destinatarios || "Todos os estudantes").trim();
  const assunto = String(body.assunto || "").trim();
  const mensagem = String(body.mensagem || "").trim();
  const extra = String(body.extra || "");
  if (!mensagem) {
    return NextResponse.json({ error: "Escreva a mensagem." }, { status: 400 });
  }
  if (!smsProvider()) {
    return NextResponse.json(
      { error: "Configure TWILIO_FROM, TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN no servidor." },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from("inscricoes")
    .select("telefone, curso, delegacao");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const numeros = telemoveisUnicos(data ?? [], destinatarios, extra);
  if (numeros.length === 0) {
    return NextResponse.json(
      { error: "Não há telemóveis válidos para este grupo." },
      { status: 400 }
    );
  }

  let enviados = 0;
  let falhados = 0;
  const falhas: string[] = [];
  for (const para of numeros) {
    try {
      await enviarUmSms(para, mensagem);
      enviados += 1;
    } catch (err) {
      falhados += 1;
      falhas.push(`${para}: ${err instanceof Error ? err.message : "falhou"}`);
    }
  }

  const row = {
    destinatarios,
    assunto: assunto || "SMS ESJ",
    mensagem,
    canal: "sms",
    enviados,
    falhados,
  };
  const ins = await supabase.from("anuncios").insert(row);
  if (ins.error) {
    await supabase.from("anuncios").insert({
      destinatarios,
      assunto: assunto || "SMS ESJ",
      mensagem,
    });
  }

  return NextResponse.json({
    ok: true,
    enviados,
    falhados,
    total: numeros.length,
    falhas: falhas.slice(0, 8),
  });
}
