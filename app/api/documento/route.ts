import { NextRequest, NextResponse } from "next/server";

const PERMITIDOS = [/^https:\/\/([a-z0-9-]+\.)*esj\.ac\.mz\//i];

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url || !PERMITIDOS.some((r) => r.test(url))) {
    return NextResponse.json({ error: "URL inválido" }, { status: 400 });
  }

  try {
    const remoto = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://esj.ac.mz/",
        Accept: "application/pdf,*/*",
      },
      redirect: "follow",
    });

    if (!remoto.ok) {
      return new NextResponse("Documento indisponível", { status: remoto.status });
    }

    const tipo = remoto.headers.get("Content-Type") || "application/pdf";
    const dados = await remoto.arrayBuffer();

    return new NextResponse(dados, {
      headers: {
        "Content-Type": tipo.includes("pdf") ? "application/pdf" : tipo,
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Erro ao obter o documento", { status: 502 });
  }
}
