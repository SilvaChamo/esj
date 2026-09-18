import { Suspense } from "react";
import BannerInterior from "@/components/BannerInterior";
import ResultadosLista from "@/components/ResultadosLista";
import { CarregandoTexto } from "@/components/Carregando";

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
      <Suspense
        fallback={
          <section className="mx-auto max-w-7xl px-4 py-6 md:py-8">
            <div className="bg-white border border-navy-100">
              <CarregandoTexto texto="A carregar os resultados…" />
            </div>
          </section>
        }
      >
        <ResultadosLista />
      </Suspense>
    </main>
  );
}
