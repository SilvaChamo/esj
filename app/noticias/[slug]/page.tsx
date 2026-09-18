import { notFound } from "next/navigation";
import BannerInterior from "@/components/BannerInterior";
import { ImgACarregar } from "@/components/Carregando";
import { findNoticia, noticias } from "@/lib/noticias";
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

  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior kicker={item.date} title={item.title} compact />

      <article className="mx-auto max-w-3xl px-4 py-6 md:py-8">
        <div className="relative overflow-hidden bg-white border border-navy-100 min-h-[240px]">
          <ImgACarregar
            src={item.image}
            alt={item.title}
            className="w-full h-auto object-contain max-h-[520px] mx-auto"
            texto="A carregar a imagem da notícia…"
          />
        </div>
        <div className="mt-8 space-y-4 text-navy-900/80 leading-relaxed noticia-corpo">
          {item.body.map((p, i) =>
            /<[a-z][\s\S]*>/i.test(p) ? (
              <div key={`${i}-${p.slice(0, 24)}`} dangerouslySetInnerHTML={{ __html: sanitizarHtmlNoticia(p) }} />
            ) : (
              <p key={`${i}-${p.slice(0, 24)}`}>{p}</p>
            )
          )}
        </div>
      </article>
    </main>
  );
}
