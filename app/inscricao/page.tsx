import { Suspense } from "react";
import Link from "next/link";
import InscricaoForm from "@/components/InscricaoForm";
import InscricaoSidebar from "@/components/InscricaoSidebar";
import AdmissaoSidebar from "@/components/AdmissaoSidebar";
import BannerInterior from "@/components/BannerInterior";
import { CarregandoTexto } from "@/components/Carregando";

export const metadata = {
  title: "Pré-inscrição 2026 | ESJ",
  description:
    "Boletim de pré-inscrição da Escola Superior de Jornalismo para o ano lectivo 2026.",
};

export default function InscricaoPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="ANO LECTIVO 2026"
        title="Pré-inscrição"
        description={
          <>
            Boletim de demonstração da proposta. As inscrições reais para 2026 estão encerradas.
            Consulte o{" "}
            <Link href="/edital" className="text-sky hover:underline">
              edital
            </Link>
            .
          </>
        }
      />

      <section className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start">
          <Suspense fallback={null}>
            <div className="space-y-5">
              <InscricaoSidebar />
              <AdmissaoSidebar mostrarMedia={false} />
            </div>
          </Suspense>
          <div className="min-w-0 max-w-full">
            <Suspense
              fallback={
                <div className="bg-white border border-navy-100">
                  <CarregandoTexto texto="A carregar o boletim de inscrição…" />
                </div>
              }
            >
              <InscricaoForm />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
