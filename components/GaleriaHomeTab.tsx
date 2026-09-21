"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AlbumCard from "@/components/AlbumCard";
import EntradaHome from "@/components/EntradaHome";
import { listAlbunsGaleria, type AlbumGaleria } from "@/lib/galeria-albuns";

export default function GaleriaHomeTab() {
  const [albuns, setAlbuns] = useState<AlbumGaleria[]>([]);
  const [estado, setEstado] = useState<"a-carregar" | "pronto">("a-carregar");

  useEffect(() => {
    let cancelado = false;
    listAlbunsGaleria()
      .then((lista) => {
        if (!cancelado) setAlbuns(lista);
      })
      .catch(() => {
        if (!cancelado) setAlbuns([]);
      })
      .finally(() => {
        if (!cancelado) setEstado("pronto");
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const destaque = albuns.slice(0, 6);

  return (
    <>
      <EntradaHome>
        <div className="flex items-end justify-between gap-5 flex-wrap mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-900 leading-tight">
            Galeria
          </h2>
          <Link
            href="/galeria"
            className="esj-btn-move esj-btn-outline-navy inline-flex items-center border bg-transparent text-sm font-semibold px-5 py-2.5"
          >
            Ver mais álbuns →
          </Link>
        </div>
      </EntradaHome>

      {estado === "a-carregar" && (
        <p className="text-sm text-navy-900/50 mb-6">A carregar a galeria…</p>
      )}

      {destaque.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {destaque.map((album, i) => (
            <EntradaHome key={album.slug} atraso={i * 0.05}>
              <AlbumCard
                href={`/galeria/${album.slug}`}
                album={album}
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="min-h-0"
              />
            </EntradaHome>
          ))}
        </div>
      ) : estado === "pronto" ? (
        <p className="text-sm text-navy-900/55">
          Ainda sem álbuns publicados.{" "}
          <Link href="/galeria" className="text-sky hover:underline font-semibold">
            Ver galeria
          </Link>
        </p>
      ) : null}
    </>
  );
}
