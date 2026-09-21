import BannerInterior from "@/components/BannerInterior";
import EventoAreaClient from "@/components/EventoAreaClient";

export const metadata = {
  title: "Colóquios | Eventos ESJ",
  description: "Arquivo visual dos colóquios da ESJ — cartazes A4, temas e memória dos debates.",
};

export default function ColoquiosPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="EVENTOS"
        title={
          <>
            Colóquios da <span className="text-sky">ESJ</span>
          </>
        }
        description="Cartazes A4, temas diversos e arquivo dos debates académicos."
      />
      <EventoAreaClient tipo="coloquio" />
    </main>
  );
}
