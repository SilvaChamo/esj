"use client";

import Image, { type ImageProps } from "next/image";
import { IframeHTMLAttributes, ImgHTMLAttributes, useState } from "react";

export function CarregandoTexto({ texto }: { texto: string }) {
  return <p className="px-6 py-10 text-center text-sm text-navy-900/60">{texto}</p>;
}

export default function Carregando({ texto }: { texto: string }) {
  return (
    <main className="bg-cream min-h-[70vh]">
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
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
  ...props
}: ImageProps & { texto?: string }) {
  const [pronta, setPronta] = useState(false);
  return (
    <>
      {!pronta && (
        <span className="absolute inset-0 z-[1] flex items-center justify-center px-3 text-center text-sm text-navy-900/60 bg-white">
          {texto}
        </span>
      )}
      <Image
        {...props}
        onLoad={(e) => {
          setPronta(true);
          onLoad?.(e);
        }}
        onError={(e) => {
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
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { texto?: string }) {
  const [pronta, setPronta] = useState(false);
  return (
    <>
      {!pronta && (
        <span className="absolute inset-0 z-[1] flex items-center justify-center px-3 text-center text-sm text-navy-900/60 bg-white">
          {texto}
        </span>
      )}
      <img
        {...props}
        className={className}
        onLoad={(e) => {
          setPronta(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setPronta(true);
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
