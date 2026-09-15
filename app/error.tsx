"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="bg-cream min-h-[70vh]">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16 md:py-24">
        <div className="bg-white border border-navy-100 px-6 py-12 md:px-10 text-center max-w-lg mx-auto">
          <p className="text-[11px] font-bold tracking-widest text-sky mb-3">ERRO</p>
          <h1 className="font-serif font-bold text-2xl text-navy-900">Algo correu mal</h1>
          <p className="mt-3 text-sm text-navy-900/65 leading-relaxed">
            Não foi possível carregar esta página. Pode tentar de novo ou voltar ao início.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center bg-navy-900 hover:bg-crimson text-white font-semibold text-xs tracking-wide px-6 py-3 transition-colors"
            >
              Tentar de novo
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center border border-navy-200 text-navy-900 font-semibold text-xs tracking-wide px-6 py-3 hover:bg-cream transition-colors"
            >
              Ir ao início
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
