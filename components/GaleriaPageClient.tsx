"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BannerInterior from "@/components/BannerInterior";
import EntradaHome from "@/components/EntradaHome";
import { FotoACarregar } from "@/components/Carregando";
import { listAlbunsGaleria, type AlbumGaleria } from "@/lib/galeria-albuns";

export default function GaleriaPageClient() {
  const [albuns, setAlbuns] = useState<AlbumGaleria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAlbunsGaleria()
      .then(setAlbuns)
      .catch(() => setAlbuns([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="ESJ"
        title="Galeria"
        description="Álbuns e momentos da vida académica da Escola Superior de Jornalismo."
      />
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12 md:py-16">
        {loading ? (
          <p className="text-sm text-navy-900/50">A carregar os álbuns…</p>
        ) : albuns.length === 0 ? (
          <p className="text-sm text-navy-900/55">Ainda sem álbuns publicados.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {albuns.map((album, i) => (
              <EntradaHome key={album.slug} atraso={i * 0.04}>
                <Link
                  href={`/galeria/${album.slug}`}
                  className="group relative block aspect-[3/2] min-h-[220px] overflow-hidden border border-navy-100 bg-navy-100/40"
                >
                  {album.coverUrl ? (
                    <FotoACarregar
                      src={album.coverUrl}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-navy-900/45 group-hover:bg-navy-900/55 transition-colors flex flex-col justify-end p-5 md:p-6">
                    <h2 className="font-serif font-bold text-white text-xl md:text-2xl leading-snug">
                      {album.title}
                    </h2>
                    {album.subtitle ? (
                      <p className="mt-2 text-sm text-white/80 line-clamp-2">{album.subtitle}</p>
                    ) : null}
                    <span className="mt-4 text-xs font-bold tracking-wide text-white">
                      VER ÁLBUM
                    </span>
                  </div>
                </Link>
              </EntradaHome>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
