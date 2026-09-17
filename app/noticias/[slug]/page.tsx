import { Suspense } from "react";
import { notFound } from "next/navigation";
import BannerInterior from "@/components/BannerInterior";
import { CarregandoTexto, ImgACarregar } from "@/components/Carregando";
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

async function NoticiaCorpo({ slug }: { slug: string }) {
  const item = await findNoticia(slug);
  if (!item) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 lg:px-8 py-10">
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
  );
}

async function NoticiaBanner({ slug }: { slug: string }) {
  const item = await findNoticia(slug);
  if (!item) return null;
  return <BannerInterior kicker={item.date} title={item.title} compact />;
}

export default function NoticiaPage({ params }: { params: { slug: string } }) {
  // Procura no array estático pré-carregado para renderização instantânea
  const estatico = noticias.find((n) => n.slug === params.slug);

  return (
    <main className="bg-cream min-h-[70vh]">
      {estatico ? (
        <BannerInterior kicker={estatico.date} title={estatico.title} compact />
      ) : (
        <Suspense fallback={<BannerInterior kicker="NOTÍCIA" title="A carregar notícia..." compact />}>
          <NoticiaBanner slug={params.slug} />
        </Suspense>
      )}

      <Suspense
        fallback={
          <section className="mx-auto max-w-3xl px-4 lg:px-8 py-10">
            <div className="bg-white border border-navy-100 p-8">
              <CarregandoTexto texto="A carregar o conteúdo da notícia…" />
            </div>
          </section>
        }
      >
        <NoticiaCorpo slug={params.slug} />
      </Suspense>
    </main>
  );
}
