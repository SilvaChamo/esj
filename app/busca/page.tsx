import { Suspense } from "react";
import SearchResults from "@/components/SearchResults";

export default function BuscaPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16 min-h-[60vh]">
          <p className="text-navy-900/60">A carregar resultados…</p>
        </section>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
