"use client";

import { useState, type ClipboardEvent, type MouseEvent, type ReactNode } from "react";
import { Download, PanelsTopLeft, ZoomIn, ZoomOut, X } from "lucide-react";
import DocumentoLeitor, { eWordUrl, srcDocumentoProxy } from "@/components/DocumentoLeitor";

const ZOOM_MIN = 0.7;
const ZOOM_MAX = 1.6;
const ZOOM_STEP = 0.1;

function nomeDescarga(titulo: string, url: string) {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() || "pdf";
  const base = titulo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `${base || "documento"}.${ext}`;
}

/**
 * Leitor único de documentos do site (Word + PDF).
 * Barra: Voltar · Páginas · zoom/baixar.
 */
export default function LeitorDocumento({
  url,
  title,
  stickyTop = false,
  modo = "pagina",
  onClose,
  accoesExtra,
  className = "",
}: {
  url: string;
  title?: string;
  stickyTop?: boolean;
  /** pagina = altura viewport; modal = preenche o contentor pai */
  modo?: "pagina" | "modal";
  onClose?: () => void;
  accoesExtra?: ReactNode;
  className?: string;
}) {
  const word = eWordUrl(url);
  const [paginasAbertas, setPaginasAbertas] = useState(false);
  const [zoom, setZoom] = useState(1);

  const baixar = async () => {
    const src = srcDocumentoProxy(url);
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = nomeDescarga(title || "documento", url);
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, "_blank");
    }
  };

  const bloquearCopia = (e: ClipboardEvent | MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className={`bg-white select-none flex flex-col min-h-0 ${
        modo === "modal" ? "h-full border-0" : "h-[calc(100dvh-84px)] border border-navy-100"
      } ${className}`}
      onCopy={bloquearCopia}
      onCut={bloquearCopia}
      onContextMenu={bloquearCopia}
    >
      <div
        className={`border-b border-navy-100 bg-cream/95 backdrop-blur-sm shrink-0 ${
          stickyTop ? "sticky top-[84px] z-40" : ""
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-pressed={paginasAbertas}
              onClick={() => setPaginasAbertas((v) => !v)}
              className={`inline-flex items-center gap-1.5 font-semibold text-xs tracking-wide transition-colors ${
                paginasAbertas ? "text-crimson" : "text-sky hover:text-crimson"
              }`}
            >
              <PanelsTopLeft size={14} />
              Páginas
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {word ? (
              <>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(ZOOM_MIN, Number((z - ZOOM_STEP).toFixed(1))))}
                  disabled={zoom <= ZOOM_MIN}
                  className="inline-flex items-center gap-1.5 font-semibold text-xs tracking-wide text-sky hover:text-crimson transition-colors disabled:opacity-40"
                  title="Reduzir zoom"
                  aria-label="Reduzir zoom"
                >
                  <ZoomOut size={14} />
                  −
                </button>
                <span className="text-xs font-semibold text-navy-900/55 tabular-nums w-10 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(ZOOM_MAX, Number((z + ZOOM_STEP).toFixed(1))))}
                  disabled={zoom >= ZOOM_MAX}
                  className="inline-flex items-center gap-1.5 font-semibold text-xs tracking-wide text-sky hover:text-crimson transition-colors disabled:opacity-40"
                  title="Aumentar zoom"
                  aria-label="Aumentar zoom"
                >
                  <ZoomIn size={14} />
                  +
                </button>
              </>
            ) : null}
            {accoesExtra}
            <button
              type="button"
              onClick={() => void baixar()}
              className="inline-flex items-center gap-2 text-sky font-semibold text-xs tracking-wide hover:text-crimson transition-colors"
            >
              <Download size={14} />
              Baixar
            </button>
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 font-semibold text-xs tracking-wide text-sky hover:text-crimson transition-colors"
              >
                <X size={14} />
                Fechar
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 bg-[#d9d9d9] overflow-hidden">
        <DocumentoLeitor
          url={url}
          title={title}
          paginasAbertas={paginasAbertas}
          zoom={zoom}
          className="absolute inset-0 w-full h-full border-0 bg-white"
        />
      </div>
    </div>
  );
}
