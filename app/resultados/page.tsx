import { Suspense } from "react";
import ResultadosLista from "@/components/ResultadosLista";
import VoltarBanner from "@/components/VoltarBanner";

export const metadata = {
  title: "Resultados de Admissão | ESJ",
  description:
    "Resultados dos exames de admissão da Escola Superior de Jornalismo, por curso e regime.",
};

export const dynamic = "force-dynamic";

export default function ResultadosPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10 md:py-12">
          <p className="text-sky font-semibold tracking-[0.2em] text-[11px] mb-3">
            ADMISSÕES
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold">
            Resultados de Admissão
          </h1>
          <p className="mt-3 text-white/70 max-w-2xl text-sm leading-relaxed">
            Filtre o nível e o regime na barra lateral e abra a pauta do curso.
            A média final é (Português × 50%) + (História × 50%).
          </p>
          <VoltarBanner href="/#ensino" label="Voltar ao calendário académico" />
        </div>
      </section>
      <Suspense fallback={<p className="px-8 py-10 text-sm text-navy-900/50">A carregar…</p>}>
        <ResultadosLista />
      </Suspense>
    </main>
  );
}
