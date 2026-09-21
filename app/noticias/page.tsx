import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BannerInterior from "@/components/BannerInterior";
import { FotoACarregar } from "@/components/Carregando";
import { listNoticias } from "@/lib/noticias";

export const metadata = {
  title: "Notícias | ESJ",
  description:
    "Notícias da Escola Superior de Jornalismo: lançamentos, conferências, vida académica e comunicação institucional.",
};

export const dynamic = "force-dynamic";

const POR_PAGINA = 9;

export default async function NoticiasPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const items = await listNoticias();

  const totalPaginas = Math.max(1, Math.ceil(items.length / POR_PAGINA));
  const paginaPedida = Number(searchParams.pagina) || 1;
  const paginaAtual = Math.min(Math.max(1, paginaPedida), totalPaginas);
  const inicio = (paginaAtual - 1) * POR_PAGINA;
  const itensPagina = items.slice(inicio, inicio + POR_PAGINA);

  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="BLOG"
        title="Notícias"
        description="Acompanhe os lançamentos, as conferências e a vida da Escola Superior de Jornalismo."
      />

      <section className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {itensPagina.map((item) => (
            <Link
              key={item.slug}
              href={`/noticias/${item.slug}`}
              className="esj-card-move group bg-white border border-navy-100 hover:border-crimson flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <FotoACarregar
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="eager"
                  texto="A carregar a imagem da notícia…"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-[10px] font-bold tracking-widest text-sky">{item.date}</p>
                <h2 className="mt-2 font-serif font-bold text-lg text-navy-900 leading-snug group-hover:text-crimson transition-colors">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm text-navy-900/65 leading-relaxed">{item.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>

        {totalPaginas > 1 && (
          <nav aria-label="Paginação de notícias" className="mt-10 flex items-center justify-center gap-2">
            <Link
              href={`/noticias?pagina=${paginaAtual - 1}`}
              aria-disabled={paginaAtual === 1}
              className={`flex items-center justify-center w-9 h-9 border border-navy-100 text-navy-900 hover:border-sky hover:text-sky transition-colors ${
                paginaAtual === 1 ? "pointer-events-none opacity-40" : ""
              }`}
            >
              <ChevronLeft size={16} />
            </Link>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={`/noticias?pagina=${n}`}
                className={`flex items-center justify-center w-9 h-9 text-sm font-bold transition-colors ${
                  n === paginaAtual
                    ? "bg-sky text-white"
                    : "border border-navy-100 text-navy-900 hover:border-sky hover:text-sky"
                }`}
              >
                {n}
              </Link>
            ))}
            <Link
              href={`/noticias?pagina=${paginaAtual + 1}`}
              aria-disabled={paginaAtual === totalPaginas}
              className={`flex items-center justify-center w-9 h-9 border border-navy-100 text-navy-900 hover:border-sky hover:text-sky transition-colors ${
                paginaAtual === totalPaginas ? "pointer-events-none opacity-40" : ""
              }`}
            >
              <ChevronRight size={16} />
            </Link>
          </nav>
        )}
      </section>
    </main>
  );
}
