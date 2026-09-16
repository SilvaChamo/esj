"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { FotoACarregar } from "@/components/Carregando";
import type { AlbumGaleria } from "@/lib/galeria-albuns";

type Props = {
  album: AlbumGaleria;
  href?: string;
  sizes?: string;
  className?: string;
  /** Botões só no painel (editar / eliminar) — ficam fora do link. */
  actions?: ReactNode;
  /** Imagem via <img> no painel (sem next/image). */
  imagemNativa?: boolean;
  /** Título maior no painel; nas páginas públicas fica mais pequeno. */
  tituloPainel?: boolean;
};

function CantosHover() {
  const canto = "absolute w-7 h-7 border-white/90";
  return (
    <>
      <span className={`${canto} album-canto-tl top-0 left-0 border-t border-l`} aria-hidden />
      <span className={`${canto} album-canto-tr top-0 right-0 border-t border-r`} aria-hidden />
      <span className={`${canto} album-canto-bl bottom-0 left-0 border-b border-l`} aria-hidden />
      <span className={`${canto} album-canto-br bottom-0 right-0 border-b border-r`} aria-hidden />
    </>
  );
}

export default function AlbumCard({
  album,
  href,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  className = "",
  actions,
  imagemNativa = false,
  tituloPainel = false,
}: Props) {
  const superficie = (
    <>
      {album.coverUrl ? (
        imagemNativa ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={album.coverUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <FotoACarregar
            src={album.coverUrl}
            alt=""
            fill
            sizes={sizes}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/55 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-500" />

      {/* Hover: mesmo tipo de gradiente da base — em cima e laterais */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none album-hover-vinheta"
        aria-hidden
      />

      <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6 transition-opacity duration-500 ease-out group-hover:opacity-0 group-hover:pointer-events-none">
        <h2
          className={`font-serif font-bold text-white leading-snug line-clamp-2 ${
            tituloPainel ? "text-xl md:text-2xl" : "text-base md:text-lg"
          }`}
        >
          {album.title}
        </h2>
        {album.subtitle ? (
          <p className="mt-2 text-xs text-white/80 line-clamp-2">{album.subtitle}</p>
        ) : null}
        <div className="mt-3 pt-3 border-t border-white/25 flex items-end justify-between gap-3">
          <p className="text-[10px] font-bold tracking-wide text-white/70 uppercase">
            {album.photoCount} foto{album.photoCount === 1 ? "" : "s"}
          </p>
          <p className="text-[10px] font-semibold text-white/80 text-right leading-snug shrink min-w-0">
            Por: {album.createdBy || "Administrador"}
            {album.createdAt
              ? ` - ${new Date(album.createdAt).toLocaleDateString("pt-PT")}`
              : ""}
          </p>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-3 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none">
        <div className="relative w-[88%] h-[78%] max-w-[380px] max-h-[240px] flex items-center justify-center">
          <CantosHover />
          <span className="album-explorar-texto text-center px-5">Explorar álbum</span>
        </div>
      </div>
    </>
  );

  const baseClass = `group relative block aspect-[3/2] min-h-[200px] overflow-hidden border border-navy-100 bg-navy-100/40 ${className}`;

  const card = href ? (
    <Link href={href} className={baseClass}>
      {superficie}
    </Link>
  ) : (
    <div className={baseClass}>{superficie}</div>
  );

  if (!actions) return card;

  return (
    <div className="relative">
      {card}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1">{actions}</div>
    </div>
  );
}
