import BannerInterior from "@/components/BannerInterior";

export const metadata = {
  title: "Projectos | ESJ",
  description: "Projectos de investigação e parcerias científicas da Escola Superior de Jornalismo.",
};

export default function ProjectosPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="INVESTIGAÇÃO"
        title="Projectos"
        description="Projectos de investigação e parcerias científicas em desenvolvimento."
        compact
      />
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <article className="bg-white border border-navy-100 p-8 max-w-2xl">
          <p className="text-sm text-navy-900/70 leading-relaxed">
            Os projectos de investigação e as parcerias científicas da ESJ serão publicados aqui
            pelo Centro de Pesquisa em Ciências da Comunicação da Informação.
          </p>
          <p className="mt-4 text-xs font-semibold tracking-wide text-navy-900/40">Em breve</p>
        </article>
      </div>
    </main>
  );
}
