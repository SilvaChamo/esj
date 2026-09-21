import BannerInterior from "@/components/BannerInterior";
import EventosHubClient from "@/components/EventosHubClient";

export const metadata = {
  title: "Eventos | ESJ",
  description:
    "Conferência Internacional, Semana da Comunicação e Colóquios — arquivo editorial e memória académica da ESJ.",
};

export default function EventosPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="AGENDA ACADÉMICA"
        title={
          <>
            Eventos <span className="text-sky">ESJ</span>
          </>
        }
        description="Conheça os principais eventos da Escola Superior de Jornalismo."
      />
      <EventosHubClient />
    </main>
  );
}
