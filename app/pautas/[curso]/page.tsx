import { notFound } from "next/navigation";
import BannerInterior from "@/components/BannerInterior";
import PautasFinais from "@/components/PautasFinais";
import { cursoDocenciaPorSlug } from "@/lib/docencia";
import type { RegimeCurso } from "@/lib/curriculo";

type Props = {
  params: { curso: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ params }: Props) {
  const curso = cursoDocenciaPorSlug(params.curso);
  return {
    title: curso ? `Pautas de ${curso.titulo} | ESJ` : "Pautas Finais | ESJ",
  };
}

export default function PautaCursoFinalPage({ params, searchParams }: Props) {
  const curso = cursoDocenciaPorSlug(params.curso);
  if (!curso) notFound();

  const regimeRaw = searchParams.regime;
  const regime: RegimeCurso =
    (Array.isArray(regimeRaw) ? regimeRaw[0] : regimeRaw) === "pos-laboral" ? "pos-laboral" : "diurno";

  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="REGISTO ACADÉMICO"
        title={curso.titulo}
        description="Seleccione o regime e a cadeira na barra lateral. Sem cadeira seleccionada, mostra a pauta geral com todas as cadeiras já publicadas."
        compact
      />
      <PautasFinais curso={curso.slug} regimeInicial={regime} />
    </main>
  );
}
