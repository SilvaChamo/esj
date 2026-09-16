import { Suspense } from "react";
import { notFound } from "next/navigation";
import BannerInterior from "@/components/BannerInterior";
import BibliotecaCursoClient from "@/components/BibliotecaCursoClient";
import {
  cursoBibliotecaPorSlug,
  slugsCursosBiblioteca,
} from "@/lib/producao-cientifica";

export function generateStaticParams() {
  return slugsCursosBiblioteca().map((curso) => ({ curso }));
}

export function generateMetadata({ params }: { params: { curso: string } }) {
  const curso = cursoBibliotecaPorSlug(params.curso);
  if (!curso) return { title: "Biblioteca virtual | ESJ" };
  return {
    title: `${curso.titulo} · Produção científica | ESJ`,
    description: curso.descricao,
  };
}

export default function BibliotecaCursoPage({ params }: { params: { curso: string } }) {
  const curso = cursoBibliotecaPorSlug(params.curso);
  if (!curso) notFound();

  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="Biblioteca virtual"
        title={curso.titulo}
        description={
          <>
            {curso.descricao} {curso.expectativa}
          </>
        }
      />
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12 md:py-16">
        <Suspense fallback={<p className="text-sm text-navy-900/55">A carregar o acervo…</p>}>
          <BibliotecaCursoClient curso={curso} />
        </Suspense>
      </div>
    </main>
  );
}
