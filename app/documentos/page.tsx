import { Suspense } from "react";
import BannerInterior from "@/components/BannerInterior";
import DocumentosEnsino from "@/components/DocumentosEnsino";
import Carregando from "@/components/Carregando";

export const metadata = {
  title: "Documentos | ESJ",
  description:
    "Minutas, regulamentos e documentos académicos da Escola Superior de Jornalismo.",
};

export default function DocumentosPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="SECRETARIA ACADÉMICA"
        title="Documentos e Regulamentos"
        description="Minutas de requerimentos, estatuto do estudante, regulamento académico e normas da Escola Superior de Jornalismo."
      />
      <Suspense fallback={<Carregando texto="A carregar os documentos…" />}>
        <DocumentosEnsino />
      </Suspense>
    </main>
  );
}
