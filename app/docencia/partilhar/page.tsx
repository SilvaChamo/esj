import BannerInterior from "@/components/BannerInterior";
import DocenciaPartilharClient from "@/components/DocenciaPartilharClient";

export const metadata = {
  title: "Partilhar material | Docência | ESJ",
};

export default function DocenciaPartilharPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="DOCÊNCIA"
        title="Partilhar material"
        description="Publique pautas, livros e outros recursos de ensino para a cadeira que lecciona."
        busca={false}
      />
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12 md:py-16">
        <DocenciaPartilharClient />
      </div>
    </main>
  );
}
