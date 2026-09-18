import Link from "next/link";
import { notFound } from "next/navigation";
import BannerInterior from "@/components/BannerInterior";
import { cursoPorSlug, slugsCursos } from "@/lib/cursos";

export function generateStaticParams() {
  return slugsCursos().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const curso = cursoPorSlug(params.slug);
  if (!curso) return { title: "Curso | ESJ" };
  return {
    title: `${curso.titulo} | ESJ`,
    description: curso.resumo,
  };
}

export default function CursoPage({ params }: { params: { slug: string } }) {
  const curso = cursoPorSlug(params.slug);
  if (!curso) notFound();

  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker={curso.nivel.toUpperCase()}
        title={curso.titulo}
        description={curso.resumo}
        actions={
          <Link
            href={`/inscricao?${curso.inscricaoQuery}`}
            className="bg-leaf text-white font-semibold text-xs tracking-wide px-6 py-3 transition-colors"
          >
            CANDIDATAR-SE
          </Link>
        }
      />
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <article className="bg-white border border-navy-100 p-8 md:p-10 max-w-3xl">
          <h2 className="font-serif text-2xl font-bold text-navy-900">Sobre o curso</h2>
          <div className="mt-5 space-y-4 text-sm text-navy-900/75 leading-relaxed">
            {curso.descricao.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/inscricao?${curso.inscricaoQuery}`}
              className="esj-btn-move inline-flex items-center bg-navy-800 text-white font-semibold text-xs tracking-wide px-6 py-3.5"
            >
              CANDIDATAR-SE
            </Link>
            <Link
              href="/edital"
              className="esj-btn-move inline-flex items-center bg-white border border-navy-100 hover:border-sky text-navy-800 font-semibold text-xs tracking-wide px-6 py-3.5"
            >
              VER EDITAL
            </Link>
            <Link
              href="/inscricoes"
              className="esj-btn-move inline-flex items-center bg-white border border-navy-100 hover:border-sky text-navy-800 font-semibold text-xs tracking-wide px-6 py-3.5"
            >
              ADMISSÕES
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
