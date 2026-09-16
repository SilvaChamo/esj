import { comprimirImagemUpload } from "@/lib/comprimir-imagem";

/** Limite máximo para documentos (PDF, Word, Excel, etc.). */
export const MAX_DOCUMENTO_BYTES = 1 * 1024 * 1024;

function eImagem(file: Blob) {
  const tipo = file.type || "";
  return tipo.startsWith("image/") && tipo !== "image/svg+xml" && tipo !== "image/gif";
}

function eOfficeZip(nome: string, mime?: string) {
  const n = nome.toLowerCase();
  if (/\.(docx|xlsx|pptx|odt|ods)$/i.test(n)) return true;
  return /officedocument|openxmlformats/i.test(mime || "");
}

function ePdf(nome: string, mime?: string) {
  return /\.pdf$/i.test(nome) || (mime || "").includes("pdf");
}

function mb(n: number) {
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Comprime imagens embutidas em DOCX/XLSX e volta a empacotar com DEFLATE máximo.
 */
async function comprimirOffice(file: File, maxBytes: number): Promise<File> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const caminhos = Object.keys(zip.files).filter(
    (p) => !zip.files[p].dir && /\.(png|jpe?g|gif|webp|bmp)$/i.test(p)
  );

  for (const path of caminhos) {
    const dados = await zip.files[path].async("blob");
    const nome = path.split("/").pop() || "imagem.jpg";
    const original = new File([dados], nome, {
      type: dados.type || "image/jpeg",
      lastModified: Date.now(),
    });
    // Imagens internas: alvo mais baixo para caber o documento em 1 MB
    const alvo = Math.min(80 * 1024, Math.max(30 * 1024, Math.floor(maxBytes / 8)));
    const comprimida = await comprimirImagemUpload(original, alvo);
    zip.file(path, comprimida, { binary: true });
  }

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  return new File([blob], file.name, {
    type: file.type || "application/octet-stream",
    lastModified: Date.now(),
  });
}

/**
 * Compressor automático de documentos: máximo 1 MB.
 * - Imagens: usa o compressor de imagem existente
 * - Word/Excel (ZIP): comprime imagens internas + DEFLATE
 * - PDF e outros: se já ≤ 1 MB aceita; senão rejeita com mensagem clara
 */
export async function comprimirDocumentoUpload(
  file: File,
  maxBytes = MAX_DOCUMENTO_BYTES
): Promise<File> {
  if (typeof window === "undefined") return file;

  if (eImagem(file)) {
    return comprimirImagemUpload(file);
  }

  if (file.size <= maxBytes) return file;

  if (eOfficeZip(file.name, file.type)) {
    try {
      let actual = file;
      // Até 2 passagens se ainda estiver grande
      for (let i = 0; i < 2; i += 1) {
        actual = await comprimirOffice(actual, maxBytes);
        if (actual.size <= maxBytes) return actual;
      }
      if (actual.size <= maxBytes) return actual;
      throw new Error(
        `O documento ainda tem ${mb(actual.size)} após compressão (limite ${mb(maxBytes)}). Reduza imagens ou o número de páginas.`
      );
    } catch (err) {
      if (err instanceof Error && /limite|após compressão/i.test(err.message)) throw err;
      throw new Error(
        `Não foi possível comprimir o documento (${mb(file.size)}). Limite: ${mb(maxBytes)}.`
      );
    }
  }

  if (ePdf(file.name, file.type)) {
    throw new Error(
      `O PDF tem ${mb(file.size)} e o limite é ${mb(maxBytes)}. Guarde uma versão mais leve ou converta para Word antes de carregar.`
    );
  }

  throw new Error(
    `O ficheiro tem ${mb(file.size)} e o limite é ${mb(maxBytes)}. Comprima-o antes de carregar.`
  );
}
