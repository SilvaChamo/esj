"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-MZ">
      <body className="font-sans bg-cream text-navy-900 min-h-screen flex items-center justify-center p-6">
        <div className="bg-white border border-navy-100 px-6 py-10 text-center max-w-md w-full">
          <p className="text-[11px] font-bold tracking-widest text-sky mb-3">ERRO</p>
          <h1 className="font-serif font-bold text-xl">Algo correu mal</h1>
          <p className="mt-3 text-sm text-navy-900/65">
            Recarregue a página ou volte mais tarde.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 inline-flex items-center justify-center bg-navy-900 hover:bg-crimson text-white font-semibold text-xs tracking-wide px-6 py-3 transition-colors"
          >
            Tentar de novo
          </button>
        </div>
      </body>
    </html>
  );
}
