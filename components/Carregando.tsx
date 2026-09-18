"use client";

import Image, { type ImageProps } from "next/image";
import { IframeHTMLAttributes, ImgHTMLAttributes, useEffect, useState } from "react";

export function CarregandoTexto({ texto }: { texto: string }) {
  return <p className="px-6 py-6 md:py-8 text-center text-sm text-navy-900/60">{texto}</p>;
}

export default function Carregando({ texto }: { texto: string }) {
  return (
    <main className="bg-cream min-h-[70vh]">
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="bg-white border border-navy-100">
          <CarregandoTexto texto={texto} />
        </div>
      </section>
    </main>
  );
}

export function FotoACarregar({
  texto = "A carregar a imagem…",
  onLoad,
  onError,
  className,
  alt,
  src,
  ...props
}: ImageProps & { texto?: string }) {
  const [pronta, setPronta] = useState(false);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    setPronta(false);
    setFalhou(false);
  }, [src]);

  if (falhou) {
    return <span className="absolute inset-0 bg-navy-100/40" aria-hidden />;
  }

  return (
    <>
      {!pronta && (
        <span className="absolute inset-0 z-[1] bg-navy-100/25" aria-hidden />
      )}
      <Image
        {...props}
        src={src}
        alt={alt ?? ""}
        className={className}
        onLoadingComplete={() => setPronta(true)}
        onLoad={(e) => {
          setPronta(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setFalhou(true);
          setPronta(true);
          onError?.(e);
        }}
      />
    </>
  );
}

export function ImgACarregar({
  texto = "A carregar a imagem…",
  className,
  onLoad,
  onError,
  alt,
  src,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { texto?: string }) {
  const [pronta, setPronta] = useState(false);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    setPronta(false);
    setFalhou(false);
  }, [src]);

  return (
    <>
      {!pronta && !falhou && (
        <span className="absolute inset-0 z-[1] bg-navy-100/25" aria-hidden />
      )}
      {falhou && (
        <span className="absolute inset-0 z-[1] bg-navy-100/40" aria-hidden />
      )}
      <img
        {...props}
        src={src}
        alt={falhou ? "" : alt ?? ""}
        className={`${className ?? ""}${falhou ? " opacity-0" : ""}`.trim()}
        onLoad={(e) => {
          setPronta(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setFalhou(true);
          setPronta(true);
          e.currentTarget.alt = "";
          onError?.(e);
        }}
      />
    </>
  );
}

export function IframeACarregar({
  texto = "A carregar o vídeo…",
  className,
  onLoad,
  ...props
}: IframeHTMLAttributes<HTMLIFrameElement> & { texto?: string }) {
  const [pronto, setPronto] = useState(false);
  return (
    <>
      {!pronto && (
        <span className="absolute inset-0 z-[1] flex items-center justify-center px-3 text-center text-sm text-white/70 bg-black">
          {texto}
        </span>
      )}
      <iframe
        {...props}
        className={className}
        onLoad={(e) => {
          setPronto(true);
          onLoad?.(e);
        }}
      />
    </>
  );
}
