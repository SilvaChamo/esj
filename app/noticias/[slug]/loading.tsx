import BannerInterior from "@/components/BannerInterior";
import { CarregandoTexto } from "@/components/Carregando";

export default function Loading() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior busca={false} voltar={false} />
      <section className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <div className="bg-white border border-navy-100">
          <CarregandoTexto texto="A carregar a notícia…" />
        </div>
      </section>
    </main>
  );
}
