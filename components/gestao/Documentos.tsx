"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Download, FileText, Printer, Trash2, X } from "lucide-react";
import {
  cmsError,
  deleteMediaDocumentos,
  listMediaDocumentos,
  uploadMediaDocumento,
  type MediaFile,
} from "@/lib/cms";

function formatSize(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function rotuloTipo(file: MediaFile) {
  const nome = file.name.toLowerCase().split("?")[0];
  const mime = file.mimeType || "";
  if (mime === "application/pdf" || nome.endsWith(".pdf")) return "PDF";
  if (mime.includes("word") || /\.(doc|docx)$/.test(nome)) return "Word";
  if (mime.includes("spreadsheet") || mime.includes("excel") || /\.(xls|xlsx)$/.test(nome)) return "Excel";
  if (mime.includes("presentation") || mime.includes("powerpoint") || /\.(ppt|pptx)$/.test(nome)) return "PowerPoint";
  if (nome.endsWith(".odt")) return "Word";
  if (nome.endsWith(".ods")) return "Excel";
  if (nome.endsWith(".odp")) return "PowerPoint";
  if (mime.startsWith("image/") || /\.(jpe?g|png|webp|gif|avif|bmp)$/.test(nome)) return "Imagem";
  return "Documento";
}

function tipoDocumento(file: MediaFile) {
  const nome = file.name.toLowerCase().split("?")[0];
  const mime = file.mimeType || "";
  if (mime.startsWith("image/") || /\.(jpe?g|png|webp|gif|avif|bmp)$/.test(nome)) return "imagem";
  if (mime === "application/pdf" || nome.endsWith(".pdf")) return "pdf";
  if (mime.includes("word") || /\.(doc|docx|odt)$/.test(nome)) return "word";
  if (mime.includes("spreadsheet") || mime.includes("excel") || /\.(xls|xlsx|ods)$/.test(nome)) return "excel";
  if (mime.includes("presentation") || mime.includes("powerpoint") || /\.(ppt|pptx|odp)$/.test(nome)) return "office";
  return "outro";
}

const ESTILO_LEITURA = `<style>
  html, body { margin: 0; background: #d9d9d9; }
  .docx-wrapper { background: #d9d9d9 !important; padding: 16px 8px !important; align-items: stretch !important; }
  .docx-wrapper > section.docx { width: 100% !important; max-width: none !important; box-shadow: 0 2px 10px rgba(0,0,0,0.18); }
</style>`;

function WordLeitura({ url }: { url: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState("Carregando ficheiro…");

  useEffect(() => {
    let cancelado = false;
    const iframe = iframeRef.current;
    if (!iframe) return;
    setStatus("Carregando ficheiro…");

    void (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const arrayBuffer = await res.arrayBuffer();
        if (cancelado) return;
        const doc = iframe.contentDocument;
        if (!doc) throw new Error();

        try {
          const { renderAsync } = await import("docx-preview");
          doc.open();
          doc.write(
            `<!doctype html><html><head><meta charset="utf-8">${ESTILO_LEITURA}</head><body><div id="documento-pagina"></div></body></html>`
          );
          doc.close();
          const alvo = doc.getElementById("documento-pagina");
          if (!alvo) throw new Error();
          await renderAsync(arrayBuffer, alvo, doc.head, {
            ignoreWidth: true,
            ignoreHeight: true,
            breakPages: true,
            ignoreLastRenderedPageBreak: true,
            experimental: true,
            renderHeaders: true,
            renderFooters: true,
            useBase64URL: true,
          });
        } catch {
          const mammoth = await import("mammoth");
          const result = await mammoth.convertToHtml({ arrayBuffer });
          if (cancelado) return;
          doc.open();
          doc.write(
            `<!doctype html><html><head><meta charset="utf-8">${ESTILO_LEITURA}
            <style>
              #documento-pagina { background: #fff; min-height: 100vh; padding: 2.54cm 2cm; box-sizing: border-box; box-shadow: 0 2px 10px rgba(0,0,0,0.18); }
              img { max-width: 100%; }
            </style></head><body><div id="documento-pagina">${result.value || "<p>Documento vazio.</p>"}</div></body></html>`
          );
          doc.close();
        }
        if (!cancelado) setStatus("");
      } catch {
        if (!cancelado) setStatus("Não foi possível mostrar este documento neste ecrã.");
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [url]);

  return (
    <div className="absolute inset-0 bg-[#d9d9d9]">
      {status ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <p className="text-sm text-[#50575e]">{status}</p>
        </div>
      ) : null}
      <iframe
        id="documento-leitura-frame"
        ref={iframeRef}
        title="Documento"
        className="absolute inset-0 w-full h-full border-0 bg-[#d9d9d9]"
      />
    </div>
  );
}

function imprimirNumIframe(src?: string, srcdoc?: string) {
  return new Promise<void>((resolve) => {
    document.getElementById("esj-print-frame")?.remove();
    const iframe = document.createElement("iframe");
    iframe.id = "esj-print-frame";
    iframe.setAttribute(
      "style",
      "position:fixed;width:0;height:0;border:0;left:0;top:0;opacity:0;pointer-events:none"
    );
    let feito = false;
    const acabar = () => {
      if (feito) return;
      feito = true;
      window.setTimeout(() => {
        iframe.remove();
        if (src?.startsWith("blob:")) URL.revokeObjectURL(src);
        resolve();
      }, 400);
    };
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        /* o diálogo de impressão fica a cargo do browser */
      }
      acabar();
    };
    if (srcdoc) iframe.srcdoc = srcdoc;
    else if (src) iframe.src = src;
    document.body.appendChild(iframe);
  });
}

export default function Documentos() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [ler, setLer] = useState<MediaFile | null>(null);
  const [aImprimir, setAImprimir] = useState(false);

  const notify = (tipo: "ok" | "erro", texto: string) => {
    setToast({ tipo, texto });
    window.setTimeout(() => setToast(null), 3600);
  };

  const load = () => {
    setLoading(true);
    listMediaDocumentos()
      .then(setFiles)
      .catch((err) => notify("erro", cmsError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleUpload = async (filesToUpload: FileList | null) => {
    if (!filesToUpload || filesToUpload.length === 0) return;
    setUploading(true);
    const rotulo = document.getElementById("documentos-upload-label");
    if (rotulo) rotulo.textContent = "Carregando ficheiro…";
    let ok = 0;
    for (const file of Array.from(filesToUpload)) {
      try {
        await uploadMediaDocumento(file);
        ok += 1;
      } catch {
        /* segue para o próximo ficheiro */
      }
    }
    if (ok > 0) {
      notify("ok", `${ok} documento(s) carregado(s).`);
      load();
    }
    setUploading(false);
    if (rotulo) rotulo.textContent = "Adicionar ficheiro";
  };

  const remove = async (name: string) => {
    if (!window.confirm(`Eliminar "${name.split("/").pop()}"?`)) return;
    try {
      await deleteMediaDocumentos([name]);
      setFiles((prev) => prev.filter((f) => f.name !== name));
      if (ler?.name === name) setLer(null);
      notify("ok", "Documento eliminado.");
    } catch (err) {
      notify("erro", cmsError(err));
    }
  };

  const nomeFicheiro = (file: MediaFile) => file.name.split("/").pop() || "documento";

  const baixar = async (file: MediaFile) => {
    try {
      const res = await fetch(file.url);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = nomeFicheiro(file);
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(file.url, "_blank");
    }
  };

  const imprimir = async (file: MediaFile) => {
    if (aImprimir) return;
    setAImprimir(true);
    try {
      const tipo = tipoDocumento(file);
      if (tipo === "word") {
        const frame = document.getElementById("documento-leitura-frame") as HTMLIFrameElement | null;
        const win = frame?.contentWindow;
        if (win) {
          await new Promise<void>((resolve) => {
            let feito = false;
            const acabar = () => {
              if (feito) return;
              feito = true;
              resolve();
            };
            win.addEventListener("afterprint", acabar, { once: true });
            win.focus();
            win.print();
            window.setTimeout(acabar, 1200);
          });
          return;
        }
      }
      const res = await fetch(file.url);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      await imprimirNumIframe(URL.createObjectURL(blob));
    } catch {
      notify("erro", "Não foi possível imprimir o documento.");
    } finally {
      setAImprimir(false);
    }
  };

  const copiarLigacao = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      notify("ok", "Ligação copiada.");
    } catch {
      notify("erro", "Não foi possível copiar a ligação.");
    }
  };

  return (
    <div className="text-[#2c3338]">
      <input
        id="documentos-upload"
        type="file"
        multiple
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          handleUpload(e.target.files);
          e.target.value = "";
        }}
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#8c8f94] text-center bg-white border border-[#ccd0d4]">
          <FileText className="w-10 h-10 mb-2" />
          Ainda sem documentos. Carregue o primeiro.
        </div>
      ) : (
        <div className="bg-white border border-[#ccd0d4] overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white text-left text-[13px] font-bold border-b border-[#ccd0d4]">
                <th className="p-3">Ficheiro</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Tamanho</th>
                <th className="p-3">Data</th>
                <th className="p-3 text-right">Acções</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.name} className="border-b border-[#f0f0f1] hover:bg-[#f6f7f7] text-[13px]">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#787c82] shrink-0" />
                      <span className="font-semibold text-[#1d2327]">{file.name.split("/").pop()}</span>
                    </div>
                  </td>
                  <td className="p-3 text-[#50575e]">{rotuloTipo(file)}</td>
                  <td className="p-3 text-[#50575e]">{formatSize(file.size || 0)}</td>
                  <td className="p-3 text-[#50575e]">
                    {file.createdAt ? new Date(file.createdAt).toLocaleDateString("pt-PT") : "-"}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => setLer(file)} className="text-[#2271b1] hover:underline">
                        Ver
                      </button>
                      <span className="text-[#ccd0d4]">|</span>
                      <button
                        type="button"
                        onClick={() => void remove(file.name)}
                        title="Eliminar"
                        aria-label="Eliminar"
                        className="text-[#d63638] hover:text-[#b32d2e] p-0.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ler && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[85vh] bg-white border border-[#ccd0d4] flex flex-col">
            <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-[#ccd0d4] shrink-0">
              <h2 className="text-[15px] font-semibold text-[#1d2327] truncate min-w-0">
                {nomeFicheiro(ler)}
              </h2>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={aImprimir}
                  onClick={() => void imprimir(ler)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-[#2271b1] hover:bg-[#f6f7f7] disabled:opacity-60"
                >
                  <Printer className="w-4 h-4" />
                  {aImprimir ? "Carregando ficheiro…" : "Imprimir"}
                </button>
                <button
                  type="button"
                  onClick={() => void baixar(ler)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-[#2271b1] hover:bg-[#f6f7f7]"
                >
                  <Download className="w-4 h-4" />
                  Baixar
                </button>
                <button
                  type="button"
                  onClick={() => void copiarLigacao(ler.url)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-[#2271b1] hover:bg-[#f6f7f7]"
                >
                  <Copy className="w-4 h-4" />
                  Copiar ligação
                </button>
                <button type="button" onClick={() => setLer(null)} className="p-1.5 text-[#50575e] hover:text-[#1d2327]">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="relative flex-1 min-h-0 bg-[#d9d9d9]">
              {tipoDocumento(ler) === "imagem" ? (
                <div className="absolute inset-0 overflow-auto py-4 px-2">
                  <div
                    className="mx-auto bg-white shadow-[0_2px_10px_rgba(0,0,0,0.18)] w-full min-h-full flex justify-center"
                    style={{ backgroundColor: "#ffffff", padding: "2.54cm 2cm" }}
                  >
                    <img src={ler.url} alt="" className="max-w-full h-auto" />
                  </div>
                </div>
              ) : tipoDocumento(ler) === "pdf" ? (
                <iframe src={ler.url} title={ler.name} className="absolute inset-0 w-full h-full bg-white" />
              ) : tipoDocumento(ler) === "word" ? (
                <WordLeitura url={ler.url} />
              ) : tipoDocumento(ler) === "excel" || tipoDocumento(ler) === "office" ? (
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(ler.url)}`}
                  title={ler.name}
                  className="absolute inset-0 w-full h-full bg-white"
                />
              ) : (
                <div className="absolute inset-0 overflow-auto py-4 px-2">
                  <div
                    className="mx-auto bg-white shadow-[0_2px_10px_rgba(0,0,0,0.18)] w-full min-h-full"
                    style={{ backgroundColor: "#ffffff", padding: "2.54cm 2cm" }}
                  >
                    <p className="text-sm text-[#50575e]">Este ficheiro não tem pré-visualização neste ecrã.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[220] px-4 py-3 text-sm font-semibold text-white shadow-lg rounded-[3px] ${
            toast.tipo === "ok" ? "bg-navy-800" : "bg-crimson"
          }`}
        >
          {toast.texto}
        </div>
      )}
    </div>
  );
}
