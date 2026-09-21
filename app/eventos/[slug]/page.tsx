import EventoDetalheClient from "@/components/EventoDetalheClient";

export const metadata = {
  title: "Evento | ESJ",
  description: "Detalhe de evento da Escola Superior de Jornalismo.",
};

export default function EventoSlugPage({ params }: { params: { slug: string } }) {
  return (
    <main className="bg-cream min-h-[70vh]">
      <EventoDetalheClient slug={params.slug} />
    </main>
  );
}
