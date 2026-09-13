import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const tipo = String(body.tipo || "");
  const supabase = getSupabase();

  if (tipo === "newsletter") {
    const email = String(body.email || "").trim();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Correio inválido." }, { status: 400 });
    }
    if (supabase) {
      await supabase.from("newsletter").insert({ email });
    }
    return NextResponse.json({ ok: true });
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
