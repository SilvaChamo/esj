import Image from "next/image";
import Link from "next/link";
import { listNoticiasDestaque } from "@/lib/noticias";

export default async function News() {
  const items = await listNoticiasDestaque();

  return (
    <section id="noticias" className="bg-cream py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-navy-800 leading-tight">
            Notícias da ESJ
          </h2>
          <Link
            href="/noticias"
            className="text-sm font-semibold text-sky hover:text-crimson transition-colors"
          >
            Ver mais notícias →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/noticias/${item.slug}`}
              className="group bg-white border border-navy-100 hover:border-crimson transition-colors flex flex-col"
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="eager"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-[11px] font-bold tracking-widest text-sky">{item.date}</p>
                <h3 className="mt-2 font-serif font-bold text-navy-900 leading-snug group-hover:text-crimson transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-[11px] text-navy-900/65 leading-relaxed min-h-[4.5rem]">
                  {item.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
