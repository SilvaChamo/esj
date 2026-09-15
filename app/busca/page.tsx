import { Suspense } from "react";
import BannerInterior from "@/components/BannerInterior";
import SearchResults from "@/components/SearchResults";

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
            <p className="text-navy-900/60">A carregar resultados…</p>
          </section>
        }
      >
        <SearchResults />
      </Suspense>
    </main>
  );
}
