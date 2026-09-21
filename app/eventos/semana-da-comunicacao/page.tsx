import BannerInterior from "@/components/BannerInterior";
import EventoAreaClient from "@/components/EventoAreaClient";

export const metadata = {
  title: "Semana da Comunicação e Informação | Eventos ESJ",
  description: "Semana da Comunicação e Informação da ESJ — programa, galeria e edições.",
};

export default function SemanaPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="EVENTOS"
        title={
          <>
            Semana da Comunicação e <span className="text-sky">Informação</span>
          </>
        }
        description="Actividades, participação estudantil e registo das edições."
      />
      <EventoAreaClient tipo="semana" />
    </main>
  );
}
