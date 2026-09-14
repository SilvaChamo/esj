import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import AdmissaoSidebar from "@/components/AdmissaoSidebar";
import PautaAdmissao from "@/components/PautaAdmissao";
import { cursoPorSlug, filtroQuery, parseFiltroFromRecord } from "@/lib/admissao";
import { loadPautaPublica } from "@/lib/pauta";

export const dynamic = "force-dynamic";

type Props = {
  params: { curso: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ params, searchParams }: Props) {
  const { filtro } = parseFiltroFromRecord(searchParams);
  const curso = cursoPorSlug(params.curso, filtro.nivel);
  return {
    title: curso
      ? `Pauta de ${curso.nome} | Resultados ESJ`
      : "Resultados de Admissão | ESJ",
  };
}

export default async function PautaCursoPage({ params, searchParams }: Props) {
  const { filtro } = parseFiltroFromRecord(searchParams);
  const curso = cursoPorSlug(params.curso, filtro.nivel);
  if (!curso) notFound();

  const pauta = await loadPautaPublica({
    curso: curso.nome,
    nivel: filtro.nivel,
    regime: filtro.regime,
  });
  const query = filtroQuery(filtro);

  return (
    <main className="bg-cream min-h-[70vh]">
      <section className="bg-navy-900 text-white print:hidden">
        <div className="w-full px-4 lg:px-8 py-8">
          <p className="text-sky font-semibold tracking-[0.2em] text-[11px] mb-2">
            PAUTA DE ADMISSÃO
          </p>
          <h1 className="font-serif text-2xl md:text-3xl font-bold">{curso.titulo}</h1>
        </div>
      </section>

      <section className="w-full px-4 lg:px-8 py-10 md:py-12">
        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start">
          <Suspense fallback={null}>
            <AdmissaoSidebar inscricoesHref />
          </Suspense>
          <div className="min-w-0 space-y-5">
            <PautaAdmissao
              curso={curso}
              regime={filtro.regime}
              anoLectivo={pauta.anoLectivo}
              linhas={pauta.linhas}
            />
            <div className="flex flex-wrap gap-4 print:hidden">
              <Link href={`/resultados?${query}`} className="text-sm text-sky hover:underline">
                ← Voltar aos cursos
              </Link>
              <Link href="/#ensino" className="text-sm text-sky hover:underline">
                Calendário académico
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
