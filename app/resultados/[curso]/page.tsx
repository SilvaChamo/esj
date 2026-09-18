import { notFound } from "next/navigation";
import { Suspense } from "react";
import AdmissaoSidebar from "@/components/AdmissaoSidebar";
import BannerInterior from "@/components/BannerInterior";
import PautaAdmissao from "@/components/PautaAdmissao";
import { CarregandoTexto } from "@/components/Carregando";
import {
  MEDIA_MINIMA,
  PESO_HISTORIA,
  PESO_PORTUGUES,
  cursoPorSlug,
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

  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="PAUTA DE ADMISSÃO"
        title={curso.titulo}
        description={
          <>
            Média final = (Português × {PESO_PORTUGUES * 100}%) + (História ×{" "}
            {PESO_HISTORIA * 100}%). Admitido se a média for igual ou superior a{" "}
            {formatNota(MEDIA_MINIMA)} valores.
          </>
        }
        compact
        printHidden
      />

      <section className="mx-auto max-w-7xl px-4 py-6 md:py-8 print:py-0 print:px-0 print:max-w-full">
        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start print:block">
          <Suspense fallback={<CarregandoTexto texto="A carregar o menu de admissão…" />}>
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
