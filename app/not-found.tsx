import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16 md:py-24">
        <div className="bg-white border border-navy-100 px-6 py-10 md:px-10 text-center max-w-3xl mx-auto overflow-x-hidden">
          <p className="font-serif font-black text-sky leading-none text-[100px] select-none tracking-tighter">
            404
          </p>
          <h1 className="font-serif font-bold text-2xl md:text-3xl text-navy-900 mt-2">
            Página não encontrada
          </h1>
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
