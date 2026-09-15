import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16 md:py-24">
        <div className="bg-white border border-navy-100 px-6 py-12 md:px-10 text-center max-w-lg mx-auto">
          <p className="text-[11px] font-bold tracking-widest text-sky mb-3">404</p>
          <h1 className="font-serif font-bold text-2xl text-navy-900">Página não encontrada</h1>
          <p className="mt-3 text-sm text-navy-900/65 leading-relaxed">
            O endereço que procurou não existe ou foi movido.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center bg-navy-900 hover:bg-crimson text-white font-semibold text-xs tracking-wide px-6 py-3 transition-colors"
          >
            Ir ao início
          </Link>
        </div>
      </div>
    </main>
  );
}
