import { Suspense } from "react";
import Link from "next/link";
import BannerInterior from "@/components/BannerInterior";
import { CarregandoTexto, FotoACarregar } from "@/components/Carregando";
import { listNoticias } from "@/lib/noticias";

export const metadata = {
  title: "Notícias | ESJ",
  description:
    "Notícias da Escola Superior de Jornalismo: lançamentos, conferências, vida académica e comunicação institucional.",
};

export const dynamic = "force-dynamic";

async function NoticiasLista() {
  const items = await listNoticias();
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
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
  );
}

export default function NoticiasPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="BLOG"
        title="Notícias"
        description="Acompanhe os lançamentos, as conferências e a vida da Escola Superior de Jornalismo."
      />

      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
        <Suspense
          fallback={
            <div className="bg-white border border-navy-100 p-8">
              <CarregandoTexto texto="A carregar as notícias…" />
            </div>
          }
        >
          <NoticiasLista />
        </Suspense>
      </section>
    </main>
  );
}
