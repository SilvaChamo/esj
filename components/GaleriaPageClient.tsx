"use client";

import { useEffect, useState } from "react";
import AlbumCard from "@/components/AlbumCard";
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
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
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
  );
}
