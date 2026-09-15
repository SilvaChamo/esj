import { Suspense } from "react";
import BannerInterior from "@/components/BannerInterior";
import SearchResults from "@/components/SearchResults";
import { CarregandoTexto } from "@/components/Carregando";

export const metadata = {
  title: "Pesquisa | ESJ",
};

export default function BuscaPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior kicker="PESQUISA" title="Resultados da busca" />
      <Suspense
        fallback={
          <section className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
            <div className="bg-white border border-navy-100">
              <CarregandoTexto texto="A carregar a pesquisa…" />
            </div>
          </section>
        }
      >
        <SearchResults />
      </Suspense>
    </main>
  );
}
