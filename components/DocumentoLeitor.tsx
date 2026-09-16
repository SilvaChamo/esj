"use client";

import { useEffect, useRef, useState } from "react";

export function eWordUrl(url: string) {
  return /\.(docx?|odt)(\?|#|$)/i.test(url);
}

export function ePdfUrl(url: string) {
  return /\.pdf(\?|#|$)/i.test(url);
}

export function srcDocumentoProxy(href: string) {
  if (/^https?:\/\//i.test(href)) {
    return `/api/documento?url=${encodeURIComponent(href)}`;
  }
  return href;
}

function srcPdf(href: string, paginasAbertas: boolean) {
  const base = srcDocumentoProxy(href).split("#")[0];
  return paginasAbertas
    ? `${base}#navpanes=1&pagemode=thumbs`
    : `${base}#navpanes=0&pagemode=none`;
}

/** Altura do conteúdo/borda da página no leitor (px). */
const ALTURA_PAGINA = 800;

type PaginaInfo = {
  indice: number;
  /** secção real do docx-preview, ou virtual por scroll */
  tipo: "section" | "virtual";
  thumb?: string;
};

function aplicarEstilosLeitura(doc: Document, zoom: number) {
  let estilo = doc.getElementById("esj-docx-estilo") as HTMLStyleElement | null;
  if (!estilo) {
    estilo = doc.createElement("style");
    estilo.id = "esj-docx-estilo";
    doc.head.appendChild(estilo);
  }
  estilo.textContent = `
    html, body {
      margin: 0;
      background: #d9d9d9;
      user-select: none;
      -webkit-user-select: none;
    }
    .docx-wrapper {
      background: #d9d9d9 !important;
      padding: 25px !important;
      padding-bottom: 25px !important;
      display: flex !important;
      flex-flow: column !important;
      align-items: center !important;
      box-sizing: border-box !important;
    }
    .docx-wrapper > section.docx {
      background: white !important;
      box-shadow: 0 2px 10px rgba(0,0,0,0.18) !important;
      margin-bottom: 25px !important;
      overflow: visible !important;
      box-sizing: border-box !important;
      min-height: 800px !important;
    }
    .docx table td,
    .docx table th {
      color: #111 !important;
      border-color: #bbb !important;
    }
    .docx table td {
      background-color: #fff !important;
    }
    .docx table th,
    .docx table tr:first-child td {
      background-color: #e8e8e8 !important;
    }
    #documento-pagina {
      user-select: none;
      -webkit-user-select: none;
      zoom: ${zoom};
    }
  `;
}

function listarSeccoes(doc: Document) {
  return Array.from(doc.querySelectorAll(".docx-wrapper > section.docx, section.docx")) as HTMLElement[];
}

function montarPaginas(doc: Document): PaginaInfo[] {
  const secs = listarSeccoes(doc).filter((s) => {
    // Ignorar wrappers vazios
    return (s.textContent || "").trim().length > 0 || s.querySelector("img,table,svg");
  });
  if (secs.length > 1) {
    return secs.map((_, i) => ({ indice: i, tipo: "section" as const }));
  }
  const alvo = secs[0] || (doc.getElementById("documento-pagina") as HTMLElement | null);
  if (!alvo) return [{ indice: 0, tipo: "virtual" }];
  const altura = Math.max(alvo.scrollHeight, alvo.offsetHeight, 1);
  const n = Math.max(1, Math.ceil(altura / ALTURA_PAGINA));
  return Array.from({ length: n }, (_, i) => ({ indice: i, tipo: "virtual" as const }));
}

/** Coloca 1, 2, 3… no rodapé de cada página (o Word no browser não calcula o campo PAGE). */
function aplicarNumeracaoPaginas(doc: Document) {
  const secs = listarSeccoes(doc);
  if (secs.length <= 1) return;

  secs.forEach((sec, i) => {
    const n = i + 1;
    sec.setAttribute("data-esj-pagina", String(n));

    let footer = sec.querySelector(":scope > footer") as HTMLElement | null;
    if (!footer) {
      footer = doc.createElement("footer");
      footer.style.cssText = "margin-top:auto;width:100%;padding-top:6px;box-sizing:border-box;";
      sec.appendChild(footer);
    }

    // Esconder números estáticos errados (muitas vezes o mesmo «1» em todas as páginas)
    footer.querySelectorAll("p, span").forEach((el) => {
      if ((el as HTMLElement).closest(".esj-num-pagina")) return;
      const t = (el.textContent || "").trim();
      if (/^\d{1,4}$/.test(t)) {
        (el as HTMLElement).style.visibility = "hidden";
      }
    });

    let box = footer.querySelector(".esj-num-pagina") as HTMLElement | null;
    if (!box) {
      box = doc.createElement("div");
      box.className = "esj-num-pagina";
      box.style.cssText =
        "width:100%;text-align:center;font-size:11pt;line-height:1.2;color:#222;font-family:Times New Roman,Times,serif;";
      footer.appendChild(box);
    }
    box.textContent = String(n);
  });
}

async function capturarElemento(el: HTMLElement): Promise<HTMLCanvasElement | null> {
  try {
    const html2canvas = (await import("html2canvas")).default;
    // Clonar para o documento principal — html2canvas falha com frequência dentro do iframe
    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText =
      "position:fixed;left:-10000px;top:0;width:794px;background:#fff;pointer-events:none;z-index:-1;overflow:hidden;";
    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.margin = "0";
    clone.style.boxShadow = "none";
    clone.style.transform = "none";
    clone.style.zoom = "1";
    host.appendChild(clone);
    document.body.appendChild(host);
    try {
      return await html2canvas(clone, {
        backgroundColor: "#ffffff",
        scale: 0.35,
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
        width: Math.min(clone.scrollWidth || 794, 900),
        windowWidth: Math.min(clone.scrollWidth || 794, 900),
      });
    } finally {
      host.remove();
    }
  } catch {
    return null;
  }
}

async function gerarThumbnails(doc: Document, paginas: PaginaInfo[]): Promise<PaginaInfo[]> {
  const secs = listarSeccoes(doc);
  const limite = Math.min(paginas.length, 40);

  if (paginas[0]?.tipo === "section") {
    const out: PaginaInfo[] = [];
    for (let i = 0; i < limite; i++) {
      const p = paginas[i];
      const el = secs[p.indice];
      if (!el) {
        out.push(p);
        continue;
      }
      const canvas = await capturarElemento(el);
      out.push(canvas ? { ...p, thumb: canvas.toDataURL("image/jpeg", 0.75) } : p);
    }
    for (let i = limite; i < paginas.length; i++) out.push(paginas[i]);
    return out;
  }

  // Fluxo contínuo: uma captura, depois fatias por página
  const el = secs[0] || (doc.getElementById("documento-pagina") as HTMLElement | null);
  if (!el) return paginas;
  const full = await capturarElemento(el);
  if (!full) return paginas;

  const sliceH = Math.max(1, Math.round(full.height / Math.max(paginas.length, 1)));
  return paginas.map((p) => {
    if (p.indice >= limite) return p;
    const y = p.indice * sliceH;
    const h = Math.min(sliceH, full.height - y);
    if (h <= 0) return p;
    const corte = document.createElement("canvas");
    corte.width = full.width;
    corte.height = h;
    const ctx = corte.getContext("2d");
    if (!ctx) return p;
    ctx.drawImage(full, 0, y, full.width, h, 0, 0, full.width, h);
    return { ...p, thumb: corte.toDataURL("image/jpeg", 0.75) };
  });
}

/** Único leitor Word do site (docx-preview + fallback mammoth). */
export function WordLeitura({
  url,
  zoom = 1,
  paginasAbertas = false,
}: {
  url: string;
  zoom?: number;
  paginasAbertas?: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState("Carregando ficheiro…");
  const [paginas, setPaginas] = useState<PaginaInfo[]>([]);
  const [paginaActiva, setPaginaActiva] = useState(0);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const actualizarPaginas = async (doc: Document) => {
    // Esperar layout (fontes / imagens) antes de contar e capturar
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise((r) => setTimeout(r, 400));
    aplicarNumeracaoPaginas(doc);
    const base = montarPaginas(doc);
    setPaginas(base);
    setPaginaActiva(0);
    const comThumbs = await gerarThumbnails(doc, base);
    setPaginas(comThumbs);
  };

  // Se abrir «Páginas» sem miniaturas ainda, tentar gerar de novo
  useEffect(() => {
    if (!paginasAbertas) return;
    const doc = iframeRef.current?.contentDocument;
    if (!doc || status) return;
    if (paginas.length > 0 && paginas.every((p) => p.thumb)) return;
    void actualizarPaginas(doc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginasAbertas, status]);

  const irParaPagina = (indice: number) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    const secs = listarSeccoes(doc);
    const info = paginas[indice];
    if (!info) return;

    if (info.tipo === "section" && secs[indice]) {
      secs[indice].scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      const el = secs[0] || doc.getElementById("documento-pagina");
      const win = iframeRef.current?.contentWindow;
      if (el && win) {
        const top = el.offsetTop + indice * ALTURA_PAGINA;
        win.scrollTo({ top, behavior: "smooth" });
      }
    }
    setPaginaActiva(indice);
  };

  useEffect(() => {
    let cancelado = false;
    const iframe = iframeRef.current;
    if (!iframe) return;
    setStatus("Carregando ficheiro…");
    setPaginas([]);

    void (async () => {
      try {
        const res = await fetch(srcDocumentoProxy(url));
        if (!res.ok) throw new Error();
        const arrayBuffer = await res.arrayBuffer();
        if (cancelado) return;
        const doc = iframe.contentDocument;
        if (!doc) throw new Error();

        const { renderAsync } = await import("docx-preview");
        doc.open();
        doc.write(
          `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="documento-pagina"></div></body></html>`
        );
        doc.close();
        const alvo = doc.getElementById("documento-pagina");
        if (!alvo) throw new Error();

        try {
          await renderAsync(arrayBuffer, alvo, doc.head, {
            className: "docx",
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: true,
            ignoreLastRenderedPageBreak: false,
            experimental: true,
            renderHeaders: true,
            renderFooters: true,
            renderFootnotes: true,
            renderEndnotes: true,
            renderAltChunks: true,
            useBase64URL: true,
          });
          if (cancelado) return;
          aplicarEstilosLeitura(doc, zoomRef.current);
          // Se ainda houver só 1 secção com conteúdo muito alto, o contador virtual cobre
          await actualizarPaginas(doc);
        } catch {
          const mammoth = await import("mammoth");
          const result = await mammoth.convertToHtml({ arrayBuffer });
          if (cancelado) return;
          doc.open();
          doc.write(
            `<!doctype html><html><head><meta charset="utf-8"></head><body>
              <div class="docx-wrapper"><section class="docx" id="documento-pagina">${
                result.value || "<p>Documento vazio.</p>"
              }</section></div>
            </body></html>`
          );
          doc.close();
          aplicarEstilosLeitura(doc, zoomRef.current);
          const pagina = doc.getElementById("documento-pagina");
          if (pagina) {
            pagina.style.width = "21cm";
            pagina.style.padding = "2.54cm";
            pagina.style.fontFamily = '"Times New Roman", Times, serif';
            pagina.style.fontSize = "12pt";
            pagina.style.lineHeight = "1.15";
          }
          if (!cancelado) await actualizarPaginas(doc);
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

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc?.getElementById("documento-pagina")) return;
    aplicarEstilosLeitura(doc, zoom);
  }, [zoom]);

  // Actualizar página activa ao fazer scroll no documento
  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    const doc = iframeRef.current?.contentDocument;
    if (!win || !doc || paginas.length === 0) return;

    const onScroll = () => {
      const secs = listarSeccoes(doc);
      if (paginas[0]?.tipo === "section" && secs.length > 1) {
        let activa = 0;
        const y = win.scrollY + 40;
        secs.forEach((sec, i) => {
          if (sec.offsetTop <= y) activa = i;
        });
        setPaginaActiva(activa);
        return;
      }
      const el = secs[0] || doc.getElementById("documento-pagina");
      if (!el) return;
      const relativa = Math.max(0, win.scrollY - el.offsetTop);
      const i = Math.min(paginas.length - 1, Math.floor(relativa / ALTURA_PAGINA));
      setPaginaActiva(i);
    };

    win.addEventListener("scroll", onScroll, { passive: true });
    return () => win.removeEventListener("scroll", onScroll);
  }, [paginas, status]);

  return (
    <div className="absolute inset-0 bg-[#d9d9d9] flex">
      {paginasAbertas ? (
        <aside className="w-40 shrink-0 bg-white border-r border-navy-100 overflow-y-auto">
          <p className="px-3 py-2 text-[10px] font-bold tracking-widest text-navy-900/45">
            PÁGINAS
          </p>
          <ul className="px-2 pb-3 space-y-2">
            {(paginas.length > 0 ? paginas : [{ indice: 0, tipo: "virtual" as const }]).map((p) => (
              <li key={p.indice}>
                <button
                  type="button"
                  onClick={() => irParaPagina(p.indice)}
                  className={`w-full text-left rounded-sm border transition-colors overflow-hidden ${
                    paginaActiva === p.indice
                      ? "border-sky ring-1 ring-sky"
                      : "border-navy-100 hover:border-sky/50"
                  }`}
                >
                  <div className="aspect-[210/297] bg-[#f3f3f3] relative overflow-hidden">
                    {p.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.thumb}
                        alt={`Página ${p.indice + 1}`}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[11px] text-navy-900/35">{p.indice + 1}</span>
                      </div>
                    )}
                  </div>
                  <span
                    className={`block px-2 py-1 text-[11px] ${
                      paginaActiva === p.indice
                        ? "bg-navy-900 text-white font-semibold"
                        : "bg-white text-navy-900"
                    }`}
                  >
                    {p.indice + 1}
                    {paginas.length > 1 ? ` / ${paginas.length}` : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
      <div className="relative flex-1 min-w-0">
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
          onCopy={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
}

/** Motor de leitura (Word → WordLeitura; PDF → iframe). Use LeitorDocumento para a barra completa. */
export default function DocumentoLeitor({
  url,
  title,
  paginasAbertas = false,
  zoom = 1,
  className = "absolute inset-0 w-full h-full border-0 bg-white",
}: {
  url: string;
  title?: string;
  paginasAbertas?: boolean;
  zoom?: number;
  className?: string;
}) {
  if (eWordUrl(url)) {
    return <WordLeitura url={url} zoom={zoom} paginasAbertas={paginasAbertas} />;
  }

  return (
    <iframe
      key={paginasAbertas ? "com-paginas" : "sem-paginas"}
      src={srcPdf(url, paginasAbertas)}
      title={title || "Documento"}
      className={className}
    />
  );
}
