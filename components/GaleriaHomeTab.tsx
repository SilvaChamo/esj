"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import EntradaHome from "@/components/EntradaHome";
import { FotoACarregar, ImgACarregar } from "@/components/Carregando";
import { listAlbunsGaleria, type AlbumGaleria } from "@/lib/galeria-albuns";

const FOTOS_FALLBACK: { url: string; caption: string }[] = [
  { url: "/Graduacao-ESJ.jpg", caption: "Cerimónia de Graduação" },
  { url: "/curso-jornalismo-ESJ.jpg", caption: "Prática em Jornalismo" },
  { url: "/Confefencias.jpg", caption: "Conferências" },
  { url: "/ESJ-background.jpg", caption: "Campus ESJ" },
  { url: "/Curso-Publicidade-e-Marketing-ESJ.jpg", caption: "Publicidade e Marketing" },
  { url: "/Estudio.jpg", caption: "Estúdio" },
  { url: "/Biblioteca.jpeg", caption: "Biblioteca" },
  { url: "/Sala de conferencias.jpg", caption: "Sala de conferências" },
];

export default function GaleriaHomeTab() {
  const [albuns, setAlbuns] = useState<AlbumGaleria[]>([]);
  const [estado, setEstado] = useState<"a-carregar" | "pronto">("a-carregar");
  const [ver, setVer] = useState<{ url: string; caption: string } | null>(null);

  useEffect(() => {
    let cancelado = false;
    listAlbunsGaleria()
      .then((lista) => {
        if (!cancelado) setAlbuns(lista);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelado) setEstado("pronto");
      });
    return () => {
      cancelado = true;
    };
  }, []);

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
                </div>
              </Link>
            </EntradaHome>
          ))}
        </div>
      ) : estado === "pronto" ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {FOTOS_FALLBACK.map((foto, i) => (
            <EntradaHome key={foto.url} atraso={i * 0.04}>
              <button
                type="button"
                onClick={() => setVer(foto)}
                className="relative h-40 sm:h-48 w-full overflow-hidden group border border-navy-100 bg-navy-100/40 text-left"
              >
                <FotoACarregar
                  src={foto.url}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </button>
            </EntradaHome>
          ))}
        </div>
      ) : null}

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
    </>
  );
}
