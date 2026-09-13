"use client";

import { useEffect, useRef, useState } from "react";

export default function EditalPdfViewer({ src }: { src: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("A carregar o edital…");

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let renderToken = 0;
    let lastWidth = 0;

    const draw = async () => {
      const width = host.clientWidth || 1100;
      if (Math.abs(width - lastWidth) < 8) return;
      lastWidth = width;
      const token = ++renderToken;
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const pdf = await pdfjs.getDocument(src).promise;
      if (cancelled || token !== renderToken) return;
      host.replaceChildren();

      for (let n = 1; n <= pdf.numPages; n += 1) {
        const page = await pdf.getPage(n);
        if (cancelled || token !== renderToken) return;
        const base = page.getViewport({ scale: 1 });
        const scale = width / base.width;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.className = "w-full bg-white block";
        canvas.setAttribute("aria-label", `Página ${n} de ${pdf.numPages}`);
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport }).promise;
        if (cancelled || token !== renderToken) return;
        if (n > 1) {
          const rule = document.createElement("div");
          rule.className = "h-px bg-navy-100";
          host.appendChild(rule);
        }
        host.appendChild(canvas);
      }
      setStatus("");
    };

    draw().catch(() => {
      if (!cancelled) setStatus("Não foi possível mostrar o PDF neste browser.");
    });

    const ro = new ResizeObserver(() => {
      draw().catch(() => undefined);
    });
    ro.observe(host);

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [src]);

  return (
    <div className="bg-white border border-navy-100">
      {status && (
        <p className="px-6 py-10 text-center text-sm text-navy-900/60">{status}</p>
      )}
      <div ref={hostRef} />
    </div>
  );
}
