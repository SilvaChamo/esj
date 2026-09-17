"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ImgACarregar } from "@/components/Carregando";
import type { FotoAlbum } from "@/lib/galeria-albuns";

/** Popup de visualização de foto com navegação para as outras fotos do álbum. */
export default function FotoLightbox({
  fotos,
  fotoInicial,
  onClose,
}: {
  fotos: FotoAlbum[];
  fotoInicial: FotoAlbum;
  onClose: () => void;
}) {
  const [indice, setIndice] = useState(() =>
    Math.max(0, fotos.findIndex((f) => f.name === fotoInicial.name))
  );

  const foto = fotos[indice] ?? fotoInicial;

  const irPara = (novoIndice: number) => {
    if (fotos.length === 0) return;
    setIndice(((novoIndice % fotos.length) + fotos.length) % fotos.length);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") irPara(indice - 1);
      if (e.key === "ArrowRight") irPara(indice + 1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice, fotos.length]);

  return (
    <div
      className="fixed inset-0 z-[80] bg-navy-900/85 flex items-center justify-center p-4 md:p-10"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="absolute top-4 right-4 text-white/80 hover:text-white"
      >
        <X size={28} />
      </button>

      {fotos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              irPara(indice - 1);
            }}
            aria-label="Foto anterior"
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              irPara(indice + 1);
            }}
            aria-label="Foto seguinte"
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      <div className="relative max-h-[90vh] max-w-[92vw]" onClick={(e) => e.stopPropagation()}>
        <ImgACarregar
          src={foto.url}
          alt=""
          className="max-h-[90vh] max-w-[92vw] w-auto h-auto object-contain shadow-2xl"
        />
        {fotos.length > 1 && (
          <p className="mt-3 text-center text-xs text-white/60">
            {indice + 1} / {fotos.length}
          </p>
        )}
      </div>
    </div>
  );
}
