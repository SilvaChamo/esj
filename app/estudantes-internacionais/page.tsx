import Link from "next/link";
import BannerInterior from "@/components/BannerInterior";

export const metadata = {
  title: "Estudantes internacionais | ESJ",
  description:
    "Informação sobre intercâmbio e inscrição de estudantes internacionais na Escola Superior de Jornalismo.",
};

export default function EstudantesInternacionaisPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="ENSINO"
        title="Estudantes internacionais"
        description="Acolhemos estudantes de outros países em intercâmbio e em inscrição regular."
      />
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12 md:py-16 grid md:grid-cols-2 gap-6">
        <article className="bg-white border border-navy-100 p-8">
          <h2 className="font-serif text-2xl font-bold text-navy-900">Intercâmbio</h2>
          <p className="mt-4 text-sm text-navy-900/70 leading-relaxed">
            Programas de mobilidade e intercâmbio académico com instituições parceiras. Os
            detalhes e os prazos serão publicados aqui e anunciados pela Secretaria Académica.
          </p>
          <p className="mt-4 text-xs font-semibold tracking-wide text-navy-900/40">Em breve</p>
        </article>
        <article className="bg-white border border-navy-100 p-8">
          <h2 className="font-serif text-2xl font-bold text-navy-900">Inscrição</h2>
          <p className="mt-4 text-sm text-navy-900/70 leading-relaxed">
            Candidatos internacionais podem iniciar a pré-inscrição pelos mesmos canais dos
            estudantes nacionais, sujeitos às regras do edital de admissão em vigor.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/inscricoes"
              className="esj-btn-move inline-flex items-center bg-navy-800 hover:bg-crimson text-white font-semibold text-xs tracking-wide px-6 py-3.5"
            >
              VER ADMISSÕES
            </Link>
            <Link
              href="/edital"
              className="esj-btn-move inline-flex items-center bg-white border border-navy-100 hover:border-sky text-navy-800 font-semibold text-xs tracking-wide px-6 py-3.5"
            >
              VER EDITAL
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
