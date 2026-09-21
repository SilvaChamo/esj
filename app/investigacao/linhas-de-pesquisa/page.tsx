import BannerInterior from "@/components/BannerInterior";

export const metadata = {
  title: "Linhas de Pesquisa | ESJ",
  description: "Áreas e temas de investigação em curso na Escola Superior de Jornalismo.",
};

export default function LinhasDePesquisaPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="INVESTIGAÇÃO"
        title="Linhas de Pesquisa"
        description="Áreas e temas de investigação em curso na Escola Superior de Jornalismo."
        compact
      />
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <article className="bg-white border border-navy-100 p-8 max-w-2xl">
          <p className="text-sm text-navy-900/70 leading-relaxed">
            As linhas de pesquisa da ESJ serão publicadas aqui pelo Centro de Pesquisa em Ciências
            da Comunicação da Informação.
          </p>
          <p className="mt-4 text-xs font-semibold tracking-wide text-navy-900/40">Em breve</p>
        </article>
      </div>
    </main>
  );
}
