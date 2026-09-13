import Link from "next/link";
import { notFound } from "next/navigation";
import { getNoticia, noticias } from "@/lib/noticias";

export function generateStaticParams() {
  return noticias.map((item) => ({ slug: item.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const item = getNoticia(params.slug);
  if (!item) return { title: "Notícia | ESJ" };
  return {
    title: `${item.title} | ESJ`,
    description: item.excerpt,
  };
}

export default function NoticiaPage({ params }: { params: { slug: string } }) {
  const item = getNoticia(params.slug);
  if (!item) notFound();

  return (
    <main className="bg-cream min-h-[70vh]">
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-3xl px-4 lg:px-8 py-10 md:py-12">
          <Link href="/noticias" className="text-sky text-xs font-semibold tracking-wide hover:text-sky-300">
            ← Todas as notícias
          </Link>
          <p className="mt-5 text-[11px] font-bold tracking-widest text-sky">{item.date}</p>
          <h1 className="mt-3 font-serif text-3xl md:text-4xl font-bold leading-tight">{item.title}</h1>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 lg:px-8 py-10 md:py-14">
        <div className="overflow-hidden bg-white border border-navy-100">
          <img src={item.image} alt={item.title} className="w-full h-auto object-contain max-h-[520px] mx-auto" />
        </div>
        <div className="mt-8 space-y-4 text-navy-900/80 leading-relaxed">
          {item.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </article>
    </main>
  );
}
