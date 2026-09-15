import { Suspense } from "react";
import DocumentosEnsino from "@/components/DocumentosEnsino";
import Carregando from "@/components/Carregando";

export const metadata = {
  title: "Documentos | ESJ",
  description:
    "Minutas, regulamentos e documentos académicos da Escola Superior de Jornalismo.",
};

export default function DocumentosPage() {
  return (
    <Suspense fallback={<Carregando texto="A carregar os documentos…" />}>
      <DocumentosEnsino />
    </Suspense>
  );
}
