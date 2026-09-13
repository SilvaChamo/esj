import Image from "next/image";
import Link from "next/link";
import { noticias } from "@/lib/noticias";

export const metadata = {
  title: "Notícias | ESJ",
  description:
    "Notícias da Escola Superior de Jornalismo: lançamentos, conferências, vida académica e comunicação institucional.",
};

export default function NoticiasPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10 md:py-12">
          <p className="text-sky font-semibold tracking-[0.2em] text-[11px] mb-3">BLOG</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold">Notícias</h1>
          <p className="mt-3 text-white/70 max-w-2xl text-sm leading-relaxed">
            Acompanhe os lançamentos, as conferências e a vida da Escola Superior de Jornalismo.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-12 md:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {noticias.map((item) => (
            <Link
              key={item.slug}
              href={`/noticias/${item.slug}`}
              className="group bg-white border border-navy-100 hover:border-crimson transition-colors flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="eager"
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
      </section>
    </main>
  );
}
