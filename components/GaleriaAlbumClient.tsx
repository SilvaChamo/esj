"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import EntradaHome from "@/components/EntradaHome";
import { FotoACarregar, ImgACarregar } from "@/components/Carregando";
import {
  getAlbumGaleria,
  listFotosAlbum,
  type AlbumGaleria,
  type FotoAlbum,
} from "@/lib/galeria-albuns";

export default function GaleriaAlbumClient({ slug }: { slug: string }) {
  const [album, setAlbum] = useState<AlbumGaleria | null>(null);
  const [fotos, setFotos] = useState<FotoAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [ver, setVer] = useState<FotoAlbum | null>(null);

  useEffect(() => {
    let cancelado = false;
    Promise.all([getAlbumGaleria(slug), listFotosAlbum(slug)])
      .then(([a, f]) => {
        if (cancelado) return;
        setAlbum(a);
        setFotos(f);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => {
      cancelado = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!ver) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVer(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [ver]);

  return (
    <main className="bg-cream min-h-[70vh]">
      {!loading && album && fotos.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10 md:py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {fotos.map((foto, i) => (
              <EntradaHome key={foto.name} atraso={i * 0.03}>
                <button
                  type="button"
                  onClick={() => setVer(foto)}
                  className="relative block w-full aspect-[4/3] overflow-hidden border border-navy-100 bg-navy-100/40"
                  aria-label="Ver foto"
                >
                  <FotoACarregar
                    src={foto.url}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </button>
              </EntradaHome>
            ))}
          </div>
        </div>
      )}

      {ver && (
        <div
          className="fixed inset-0 z-[80] bg-navy-900/85 flex items-center justify-center p-4 md:p-10"
          onClick={() => setVer(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setVer(null)}
            aria-label="Fechar"
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X size={28} />
          </button>
          <div className="relative max-h-[90vh] max-w-[92vw]" onClick={(e) => e.stopPropagation()}>
            <ImgACarregar
              src={ver.url}
              alt=""
              className="max-h-[90vh] max-w-[92vw] w-auto h-auto object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </main>
  );
}
