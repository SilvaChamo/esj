const ALVO_BYTES = 50 * 1024;
const LADO_INICIAL = 1600;
const LADO_MINIMO = 480;
const QUALIDADE_MAX = 0.88;
const QUALIDADE_MIN = 0.62;

function eImagem(file: Blob) {
  const tipo = file.type || "";
  return tipo.startsWith("image/") && tipo !== "image/svg+xml" && tipo !== "image/gif";
}

function lerImagem(file: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem."));
    };
    img.src = url;
  });
}

function desenhar(img: HTMLImageElement, largura: number, altura: number) {
  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível comprimir a imagem.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, largura, altura);
  return canvas;
}

function canvasParaBlob(canvas: HTMLCanvasElement, tipo: string, qualidade: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Falha ao comprimir a imagem."))), tipo, qualidade);
  });
}

async function escolherFormato(canvas: HTMLCanvasElement) {
  const webp = await canvasParaBlob(canvas, "image/webp", QUALIDADE_MAX);
  if (webp.type !== "image/webp") {
    throw new Error("O navegador não suporta conversão para WebP.");
  }
  return { tipo: "image/webp" as const, ext: "webp" };
}

function medidas(img: HTMLImageElement, lado: number) {
  const maior = Math.max(img.naturalWidth, img.naturalHeight);
  if (maior <= lado) {
    return { largura: img.naturalWidth, altura: img.naturalHeight };
  }
  const escala = lado / maior;
  return {
    largura: Math.max(1, Math.round(img.naturalWidth * escala)),
    altura: Math.max(1, Math.round(img.naturalHeight * escala)),
  };
}

async function melhorBlob(canvas: HTMLCanvasElement, tipo: string, tecto: number) {
  let baixo = QUALIDADE_MIN;
  let alto = QUALIDADE_MAX;
  let escolhido = await canvasParaBlob(canvas, tipo, alto);
  if (escolhido.size <= tecto) return escolhido;

  for (let i = 0; i < 7; i += 1) {
    const meio = (baixo + alto) / 2;
    const blob = await canvasParaBlob(canvas, tipo, meio);
    if (blob.size <= tecto) {
      escolhido = blob;
      baixo = meio;
    } else {
      alto = meio;
      if (blob.size < escolhido.size) escolhido = blob;
    }
  }
  return escolhido;
}

function nomeFicheiro(original: string, ext: string) {
  const base = original.replace(/\.[^/.]+$/, "") || "imagem";
  return `${base}.${ext}`;
}

export async function comprimirImagemUpload(file: File, maxBytes = ALVO_BYTES): Promise<File> {
  if (typeof window === "undefined" || !eImagem(file)) return file;

  try {
    const img = await lerImagem(file);
    let lado = Math.min(LADO_INICIAL, Math.max(img.naturalWidth, img.naturalHeight));
    let melhor: Blob | null = null;
    let ext = "webp";
    let tipo: "image/webp" = "image/webp";

    while (lado >= LADO_MINIMO) {
      const { largura, altura } = medidas(img, lado);
      const canvas = desenhar(img, largura, altura);
      const formato = await escolherFormato(canvas);
      tipo = formato.tipo;
      ext = formato.ext;
      const blob = await melhorBlob(canvas, tipo, maxBytes);
      melhor = blob;
      if (blob.size <= maxBytes) break;
      lado = Math.round(lado * 0.82);
    }

    if (!melhor || melhor.size > maxBytes) {
      throw new Error("Não foi possível manter a imagem abaixo de 50 KB.");
    }
    return new File([melhor], nomeFicheiro(file.name, ext), { type: tipo, lastModified: Date.now() });
  } catch {
    return file;
  }
}

export async function comprimirBlobImagem(blob: Blob, filename: string, maxBytes = ALVO_BYTES) {
  const file = new File([blob], filename, { type: blob.type || "image/jpeg", lastModified: Date.now() });
  return comprimirImagemUpload(file, maxBytes);
}
