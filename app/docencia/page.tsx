import BannerInterior from "@/components/BannerInterior";
import DocenciaClient from "@/components/DocenciaClient";

export const metadata = {
  title: "Docência | ESJ",
  description: "Materiais de ensino partilhados pelos docentes: pautas, livros e recursos por cadeira.",
};

export default function DocenciaPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="ENSINO"
        title="Docência"
        description="Materiais de ensino partilhados pelos docentes — pautas, livros e recursos, organizados por cadeira."
      />
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12 md:py-16">
        <DocenciaClient />
      </div>
    </main>
  );
}
