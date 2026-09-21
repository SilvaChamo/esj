import { Suspense } from "react";
import BannerInterior from "@/components/BannerInterior";
import EventosArquivoClient from "@/components/EventosArquivoClient";

export const metadata = {
  title: "Arquivo de Eventos | ESJ",
  description: "Arquivo visual dos eventos da Escola Superior de Jornalismo, organizado por ano.",
};

export default function EventosArquivoPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="MEMÓRIA"
        title={
          <>
            Arquivo de <span className="text-sky">eventos</span>
          </>
        }
        description="Cartazes e edições ao longo dos anos — a história académica da ESJ em imagens."
      />
      <Suspense fallback={<p className="mx-auto max-w-7xl px-4 py-10 text-sm text-navy-900/50">A carregar…</p>}>
        <EventosArquivoClient />
      </Suspense>
    </main>
  );
}
