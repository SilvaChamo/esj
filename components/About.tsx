import Link from "next/link";
import { FotoACarregar } from "@/components/Carregando";
import EntradaHome from "@/components/EntradaHome";

export default function About() {
  return (
    <section className="mx-auto max-w-7xl px-4 lg:px-8 py-20">
      <div className="grid md:grid-cols-2 gap-14 md:items-stretch">
        <EntradaHome>
          <div className="relative">
            <div className="relative h-[420px] rounded-sm overflow-hidden">
              <FotoACarregar
                src="/Graduacao-ESJ.webp"
                alt="Estudantes finalistas da ESJ na cerimónia de graduação"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover object-[50%_35%]"
                texto="A carregar a fotografia…"
              />
            </div>
          </div>
        </EntradaHome>

        <EntradaHome atraso={0.08} className="flex">
          <div className="flex h-full min-h-[420px] flex-col justify-center">
            <p className="text-sky font-bold tracking-widest text-sm mb-3">BEM-VINDA À</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-900">
              Escola Superior de Jornalismo
            </h2>
            <p className="mt-5 text-navy-900/70 leading-relaxed">
              A ESJ é uma instituição pública de ensino superior, vocacionada para a formação de
              quadros nas áreas do Jornalismo, Publicidade e Marketing, Relações Públicas e
              Biblioteconomia e Documentação.
            </p>
            <p className="mt-4 text-sm text-navy-900/70 leading-relaxed">
              Com sede em Maputo e delegação académica em Manica, forma profissionais críticos,
              éticos e capazes de responder aos desafios da comunicação em Moçambique.
            </p>

            <div className="mt-6">
              <Link
                href="#ensino"
                className="esj-btn-move inline-flex items-center gap-2 bg-sky hover:bg-crimson text-white font-semibold text-[13px] tracking-wide px-5 py-3"
              >
                Saiba mais sobre a ESJ
              </Link>
            </div>
          </div>
        </EntradaHome>
      </div>
    </section>
  );
}
