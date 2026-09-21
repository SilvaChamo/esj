import BannerInterior from "@/components/BannerInterior";
import EventoAreaClient from "@/components/EventoAreaClient";

export const metadata = {
  title: "Conferência Internacional | Eventos ESJ",
  description: "Conferência Internacional das Ciências da Comunicação — edições, programa e memória.",
};

export default function ConferenciaPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="EVENTOS"
        title={
          <>
            Conferência <span className="text-sky">Internacional</span>
          </>
        }
        description="Prestígio académico, oradores e programa das edições da ESJ."
      />
      <EventoAreaClient tipo="conferencia" />
    </main>
  );
}
