import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdmissaoSidebar from "@/components/AdmissaoSidebar";
import PautaAdmissao from "@/components/PautaAdmissao";
import {
  MEDIA_MINIMA,
  PESO_HISTORIA,
  PESO_PORTUGUES,
  cursoPorSlug,
  filtroQuery,
  formatNota,
  parseFiltroFromRecord,
} from "@/lib/admissao";
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
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10 md:py-12">
          <p className="text-sky font-semibold tracking-[0.2em] text-[11px] mb-2">
            PAUTA DE ADMISSÃO
          </p>
          <h1 className="font-serif text-2xl md:text-3xl font-bold max-w-lg">{curso.titulo}</h1>
          <p className="mt-3 text-white/70 text-sm leading-relaxed max-w-lg">
            Média final = (Português × {PESO_PORTUGUES * 100}%) + (História ×{" "}
            {PESO_HISTORIA * 100}%). Admitido se a média for igual ou superior a{" "}
            {formatNota(MEDIA_MINIMA)} valores.
          </p>
          <Link
            href={`/resultados?${query}`}
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-sky hover:underline"
          >
            <ArrowLeft size={14} />
            Voltar aos cursos
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-10 md:py-12 print:py-0 print:px-0 print:max-w-full">
        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start print:block">
          <Suspense fallback={null}>
            <div className="lg:sticky lg:top-24 print:hidden">
              <AdmissaoSidebar inscricoesHref />
            </div>
          </Suspense>
          <div className="min-w-0 space-y-5">
            <PautaAdmissao
              curso={curso}
              regime={filtro.regime}
              anoLectivo={pauta.anoLectivo}
              linhas={pauta.linhas}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
