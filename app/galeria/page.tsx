import BannerInterior from "@/components/BannerInterior";
import GaleriaPageClient from "@/components/GaleriaPageClient";

export const metadata = {
  title: "Galeria | ESJ",
  description: "Álbuns fotográficos da Escola Superior de Jornalismo.",
};

export default function GaleriaPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="GALERIA"
        title={
          <>
            Galeria da <span className="text-sky">ESJ</span>
          </>
        }
        description="Álbuns e momentos da vida académica da Escola Superior de Jornalismo."
      />
      <GaleriaPageClient />
    </main>
  );
}
