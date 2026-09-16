"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EntradaHome from "@/components/EntradaHome";
import { FotoACarregar } from "@/components/Carregando";
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

  const destaque = albuns.slice(0, 8);

  return (
    <>
      <EntradaHome>
        <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {destaque.map((album, i) => (
            <EntradaHome key={album.slug} atraso={i * 0.05}>
              <Link
                href={`/galeria/${album.slug}`}
                className="group relative block aspect-[16/10] overflow-hidden border border-navy-100 bg-navy-100/40"
              >
                {album.coverUrl ? (
                  <FotoACarregar
                    src={album.coverUrl}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : null}
                <div className="absolute inset-0 bg-navy-900/45 group-hover:bg-navy-900/55 transition-colors flex flex-col justify-end p-4">
                  <h3 className="font-serif font-bold text-white text-lg leading-snug">
                    {album.title}
                  </h3>
                  {album.subtitle ? (
                    <p className="mt-1 text-xs text-white/80 line-clamp-2">{album.subtitle}</p>
                  ) : null}
                  <p className="mt-2 text-[10px] font-bold tracking-wide text-white/70 uppercase">
                    {album.photoCount} foto{album.photoCount === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
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
