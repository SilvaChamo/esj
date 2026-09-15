import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const NEWSLETTER_CONTACTO = "Newsletter";

function colunaEmFalta(error: { message?: string; code?: string } | null) {
  const msg = error?.message || "";
  const code = error?.code || "";
  return code === "PGRST204" || code === "42703" || /telefone/i.test(msg);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const tipo = String(body.tipo || "");
  const supabase = getSupabase();

  if (tipo === "newsletter") {
    const email = String(body.email || "").trim();
    const telefone = String(body.telefone || "").trim();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Correio inválido." }, { status: 400 });
    }
    if (!telefone) {
      return NextResponse.json({ error: "Indique o contacto." }, { status: 400 });
    }
    if (!supabase) {
      return NextResponse.json({ error: "Não foi possível gravar a inscrição." }, { status: 503 });
    }
    try {
      const comTel = await supabase.from("newsletter").insert({ email, telefone });
      if (!comTel.error) {
        return NextResponse.json({ ok: true });
      }
      if (!colunaEmFalta(comTel.error)) {
        return NextResponse.json({ error: comTel.error.message }, { status: 400 });
      }
      const soEmail = await supabase.from("newsletter").insert({ email });
      if (soEmail.error) {
        return NextResponse.json({ error: soEmail.error.message }, { status: 400 });
      }
      await supabase.from("contactos").insert({
        nome: NEWSLETTER_CONTACTO,
        email,
        mensagem: telefone,
      });
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Não foi possível subcrever." },
        { status: 500 }
      );
    }
  }

  if (tipo === "mensagem") {
    const nome = String(body.nome || "").trim();
    const email = String(body.email || "").trim();
    const mensagem = String(body.mensagem || "").trim();
    if (!nome || !email || !mensagem) {
      return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
    }
    if (supabase) {
      await supabase.from("contactos").insert({ nome, email, mensagem });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
}
