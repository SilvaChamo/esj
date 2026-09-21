import { Suspense } from "react";
import BannerInterior from "@/components/BannerInterior";
import PautasFinais from "@/components/PautasFinais";
import { CarregandoTexto } from "@/components/Carregando";

export const metadata = {
  title: "Pautas Finais | ESJ",
  description:
    "Pautas finais das cadeiras da Escola Superior de Jornalismo, por curso e regime.",
};

export const dynamic = "force-dynamic";

export default function PautasPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="REGISTO ACADÉMICO"
        title="Pautas Finais"
        description="Escolha o curso, o regime e a cadeira para consultar a pauta final publicada pelo registo académico."
      />
      <Suspense
        fallback={
          <section className="mx-auto max-w-7xl px-4 py-6 md:py-8">
            <div className="bg-white border border-navy-100">
              <CarregandoTexto texto="A carregar as pautas…" />
            </div>
          </section>
        }
      >
        <PautasFinais />
      </Suspense>
    </main>
  );
}
