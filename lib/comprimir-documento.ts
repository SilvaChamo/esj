import { comprimirImagemUpload } from "@/lib/comprimir-imagem";

/** Limite para Word/Excel e similares. */
export const MAX_DOCUMENTO_BYTES = 1 * 1024 * 1024;

/** Limite para PDF (sem reprocessar páginas — mantém o original). */
export const MAX_PDF_BYTES = 15 * 1024 * 1024;

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

/** Limite aplicável ao ficheiro (PDF vs outros documentos). */
export function limiteDocumentoBytes(file: { name: string; type?: string }) {
  return ePdf(file.name, file.type) ? MAX_PDF_BYTES : MAX_DOCUMENTO_BYTES;
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
 * Documentos:
 * - Imagens: compressor de imagem
 * - Word/Excel: imagens internas + DEFLATE (máx. 1 MB)
 * - PDF: nunca reprocessado (mantém texto nítido); limite 15 MB
 */
export async function comprimirDocumentoUpload(
  file: File,
  maxBytes = MAX_DOCUMENTO_BYTES
): Promise<File> {
  if (typeof window === "undefined") return file;

  if (eImagem(file)) {
    return comprimirImagemUpload(file);
  }

  if (ePdf(file.name, file.type)) {
    const limite = MAX_PDF_BYTES;
    if (file.size > limite) {
      throw new Error(`O PDF tem ${mb(file.size)}. Limite: ${mb(limite)}.`);
    }
    return file;
  }

  if (file.size <= maxBytes) return file;

  if (eOfficeZip(file.name, file.type)) {
    try {
      let actual = file;
      for (let i = 0; i < 2; i += 1) {
        actual = await comprimirOffice(actual, maxBytes);
        if (actual.size <= maxBytes) return actual;
      }
      if (actual.size <= maxBytes) return actual;
      throw new Error(
        `O documento ainda tem ${mb(actual.size)} após compressão (limite ${mb(maxBytes)}).`
      );
    } catch (err) {
      if (err instanceof Error && /limite|após compressão/i.test(err.message)) throw err;
      throw new Error(
        `Não foi possível comprimir o documento (${mb(file.size)}). Limite: ${mb(maxBytes)}.`
      );
    }
  }

  throw new Error(
    `O ficheiro tem ${mb(file.size)} e o limite é ${mb(maxBytes)}.`
  );
}
