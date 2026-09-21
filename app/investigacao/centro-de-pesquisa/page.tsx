import BannerInterior from "@/components/BannerInterior";

export const metadata = {
  title: "Centro de Pesquisa em Ciências da Comunicação da Informação | ESJ",
  description: "Missão, actividades e publicações do Centro de Pesquisa em Ciências da Comunicação da Informação.",
};

export default function CentroDePesquisaPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="INVESTIGAÇÃO"
        title="Centro de Pesquisa em Ciências da Comunicação da Informação"
        description="Missão, actividades e publicações do centro de pesquisa da ESJ."
        compact
      />
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <article className="bg-white border border-navy-100 p-8 max-w-2xl">
          <p className="text-sm text-navy-900/70 leading-relaxed">
            A apresentação do Centro de Pesquisa em Ciências da Comunicação da Informação — missão,
            equipa e actividades — será publicada aqui.
          </p>
          <p className="mt-4 text-xs font-semibold tracking-wide text-navy-900/40">Em breve</p>
        </article>
      </div>
    </main>
  );
}
