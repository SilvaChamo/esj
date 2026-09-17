import BannerInterior from "@/components/BannerInterior";
import { CarregandoTexto } from "@/components/Carregando";

export default function Loading() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="ESJ"
        title="Escola Superior de Jornalismo"
        description="A carregar a página solicitada..."
      />

      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
        <div className="bg-white border border-navy-100 p-8 md:p-12">
          <CarregandoTexto texto="A carregar a página…" />
        </div>
      </section>
    </main>
  );
}
