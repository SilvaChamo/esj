import { notFound } from "next/navigation";
import Link from "next/link";
import BannerInterior from "@/components/BannerInterior";
import { FotoACarregar } from "@/components/Carregando";
import { findNoticia, listNoticias, noticias } from "@/lib/noticias";
import { sanitizarHtmlNoticia } from "@/lib/html-noticia";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return noticias.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const item = await findNoticia(params.slug);
  if (!item) return { title: "Notícia | ESJ" };
  return {
    title: `${item.title} | ESJ`,
    description: item.excerpt,
  };
}

export default async function NoticiaPage({ params }: { params: { slug: string } }) {
  const item = await findNoticia(params.slug);
  if (!item) notFound();

  const todas = await listNoticias();
  const maisLidas = todas.filter((n) => n.slug !== item.slug).slice(0, 5);

  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior imagem={item.image} compact busca={false} />

      <article className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-10 items-start">
          <div className="min-w-0 bg-white border border-navy-100 p-6 md:p-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy-900 leading-tight">
              {item.title}
            </h1>
            <div className="mt-3 flex items-center gap-2 text-sm text-navy-900/55">
              <span>{item.date}</span>
              <span aria-hidden>·</span>
              <span>Redacção ESJ</span>
            </div>
            <div className="mt-8 space-y-4 text-navy-900/80 leading-relaxed noticia-corpo">
              {item.body.map((p, i) =>
                /<[a-z][\s\S]*>/i.test(p) ? (
                  <div
                    key={`${i}-${p.slice(0, 24)}`}
                    dangerouslySetInnerHTML={{ __html: sanitizarHtmlNoticia(p) }}
                  />
                ) : (
                  <p key={`${i}-${p.slice(0, 24)}`}>{p}</p>
                )
              )}
            </div>
          </div>

          {maisLidas.length > 0 && (
            <aside className="lg:sticky lg:top-24 bg-white border border-navy-100 p-6">
              <h2 className="font-serif text-lg font-bold text-navy-900 mb-4">
                Notícias mais lidas
              </h2>
              <div className="space-y-4">
                {maisLidas.map((n) => (
                  <Link
                    key={n.slug}
                    href={`/noticias/${n.slug}`}
                    className="group flex gap-3"
                  >
                    <div className="relative w-20 h-16 shrink-0 overflow-hidden">
                      <FotoACarregar
                        src={n.image}
                        alt={n.title}
                        fill
                        sizes="80px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        texto=""
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold tracking-widest text-sky">{n.date}</p>
                      <p className="mt-0.5 text-sm font-semibold text-navy-900 leading-snug line-clamp-2 group-hover:text-crimson transition-colors">
                        {n.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </div>
      </article>
    </main>
  );
}
