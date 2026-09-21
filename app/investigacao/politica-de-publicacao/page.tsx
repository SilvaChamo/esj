import BannerInterior from "@/components/BannerInterior";

export const metadata = {
  title: "Política de Publicação | ESJ",
  description: "Critérios e procedimentos para publicação científica na Escola Superior de Jornalismo.",
};

export default function PoliticaDePublicacaoPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="INVESTIGAÇÃO"
        title="Política de Publicação"
        description="Critérios e procedimentos para publicação científica na ESJ."
        compact
      />
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <article className="bg-white border border-navy-100 p-8 max-w-2xl">
          <p className="text-sm text-navy-900/70 leading-relaxed">
            O documento da Política de Publicação da ESJ será publicado aqui.
          </p>
          <p className="mt-4 text-xs font-semibold tracking-wide text-navy-900/40">Em breve</p>
        </article>
      </div>
    </main>
  );
}
