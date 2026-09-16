import { NextRequest, NextResponse } from "next/server";

function urlPermitida(url: string) {
  if (/^https:\/\/([a-z0-9-]+\.)*esj\.ac\.mz\//i.test(url)) return true;
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  if (supabase && url.startsWith(`${supabase}/storage/`)) return true;
  if (/^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\//i.test(url)) return true;
  return false;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url || !urlPermitida(url)) {
    return NextResponse.json({ error: "URL inválido" }, { status: 400 });
  }

  try {
    const remoto = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://esj.ac.mz/",
        Accept:
          "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,*/*",
      },
      redirect: "follow",
    });

    if (!remoto.ok) {
      return new NextResponse("Documento indisponível", { status: remoto.status });
    }

    const tipo = remoto.headers.get("Content-Type") || "application/octet-stream";
    const caminho = url.split("?")[0].toLowerCase();
    const ehPdf = tipo.includes("pdf") || caminho.endsWith(".pdf");
    const ehDocx =
      tipo.includes("openxmlformats-officedocument.wordprocessingml") ||
      caminho.endsWith(".docx");
    const ehDoc =
      tipo.includes("msword") ||
      caminho.endsWith(".doc") ||
      caminho.endsWith(".odt");

    const contentType = ehPdf
      ? "application/pdf"
      : ehDocx
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : ehDoc
          ? "application/msword"
          : tipo;

    return new NextResponse(remoto.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Erro ao obter o documento", { status: 502 });
  }
}
