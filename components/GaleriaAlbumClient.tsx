"use client";

import { useEffect, useState } from "react";
import BannerInterior from "@/components/BannerInterior";
import EntradaHome from "@/components/EntradaHome";
import { FotoACarregar } from "@/components/Carregando";
import FotoLightbox from "@/components/FotoLightbox";
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

  const tituloBanner = loading
    ? "Álbum"
    : album?.title || "Álbum não encontrado";
  const descricaoBanner = loading
    ? undefined
    : album
      ? album.subtitle || undefined
      : "Este álbum não existe ou foi removido.";

  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior title={tituloBanner} description={descricaoBanner} />

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

      {ver && <FotoLightbox fotos={fotos} fotoInicial={ver} onClose={() => setVer(null)} />}
    </main>
  );
}
