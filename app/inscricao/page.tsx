import { Suspense } from "react";
import Link from "next/link";
import InscricaoForm from "@/components/InscricaoForm";
import InscricaoSidebar from "@/components/InscricaoSidebar";
import AdmissaoSidebar from "@/components/AdmissaoSidebar";

export const metadata = {
  title: "Pré-inscrição 2026 | ESJ",
  description:
    "Boletim de pré-inscrição da Escola Superior de Jornalismo para o ano lectivo 2026.",
};

export default function InscricaoPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10 md:py-12">
          <p className="text-sky font-semibold tracking-[0.2em] text-[11px] mb-3">
            ANO LECTIVO 2026
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold">Pré-inscrição</h1>
          <p className="mt-3 text-white/70 max-w-xl text-sm leading-relaxed">
            Boletim de demonstração da proposta. As inscrições reais para 2026 estão encerradas.
            Consulte o{" "}
            <Link href="/edital" className="text-sky hover:underline">
              edital
            </Link>{" "}
            ou volte à{" "}
            <Link href="/inscricoes" className="text-sky hover:underline">
              informação de admissões
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-10 md:py-14 overflow-x-hidden">
        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start">
          <Suspense fallback={null}>
            <div className="space-y-5">
              <AdmissaoSidebar />
              <InscricaoSidebar />
            </div>
          </Suspense>
          <div className="min-w-0 max-w-full">
            <Suspense fallback={<p className="text-sm text-navy-900/50">A carregar o boletim…</p>}>
              <InscricaoForm />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
