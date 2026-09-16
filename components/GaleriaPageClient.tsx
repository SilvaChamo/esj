"use client";

import { useEffect, useState } from "react";
import AlbumCard from "@/components/AlbumCard";
import BannerInterior from "@/components/BannerInterior";
import EntradaHome from "@/components/EntradaHome";
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
        title={
          <>
            Galeria da <span className="text-sky">ESJ</span>
          </>
        }
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
                <AlbumCard href={`/galeria/${album.slug}`} album={album} />
              </EntradaHome>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
