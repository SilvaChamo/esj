import BannerInterior from "@/components/BannerInterior";

export const metadata = {
  title: "Eventos | ESJ",
  description:
    "Conferência Internacional, Semana da Comunicação e Informação, Cerimónia de Graduação e Colóquios da Escola Superior de Jornalismo.",
};

const SECCOES = [
  {
    id: "conferencia-internacional",
    titulo: "Conferência Internacional",
    texto: "Informação sobre a Conferência Internacional da ESJ será publicada aqui.",
  },
  {
    id: "semana-comunicacao",
    titulo: "Semana da Comunicação e Informação",
    texto: "Informação sobre a Semana da Comunicação e Informação será publicada aqui.",
  },
  {
    id: "cerimonia-graduacao",
    titulo: "Cerimónia de Graduação",
    texto: "Informação sobre a Cerimónia de Graduação será publicada aqui.",
  },
  {
    id: "coloquios",
    titulo: "Colóquios",
    texto: "Informação sobre os Colóquios da ESJ será publicada aqui.",
  },
];

export default function EventosPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="EVENTOS"
        title="Eventos"
        description="Conferência Internacional, Semana da Comunicação e Informação, Cerimónia de Graduação e Colóquios da Escola Superior de Jornalismo."
      />
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8 space-y-6">
        {SECCOES.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <article className="bg-white border border-navy-100 p-8 max-w-2xl">
              <h2 className="font-serif text-2xl font-bold text-navy-900">{s.titulo}</h2>
              <p className="mt-4 text-sm text-navy-900/70 leading-relaxed">{s.texto}</p>
              <p className="mt-4 text-xs font-semibold tracking-wide text-navy-900/40">Em breve</p>
            </article>
          </section>
        ))}
      </div>
    </main>
  );
}
