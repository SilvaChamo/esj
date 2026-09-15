import { Suspense } from "react";
import BannerInterior from "@/components/BannerInterior";
import ResultadosLista from "@/components/ResultadosLista";

export const metadata = {
  title: "Resultados de Admissão | ESJ",
  description:
    "Resultados dos exames de admissão da Escola Superior de Jornalismo, por curso e regime.",
};

export const dynamic = "force-dynamic";

export default function ResultadosPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="ADMISSÕES"
        title="Resultados de Admissão"
        description="Filtre o nível e o regime na barra lateral e abra a pauta do curso. A média final é (Português × 50%) + (História × 50%)."
      />
      <Suspense fallback={<p className="px-8 py-10 text-sm text-navy-900/50">A carregar…</p>}>
        <ResultadosLista />
      </Suspense>
    </main>
  );
}
