import Image from "next/image";
import Link from "next/link";

export default function About() {
  return (
    <section className="mx-auto max-w-7xl px-4 lg:px-8 py-20 grid md:grid-cols-2 gap-14 items-center">
      <div className="relative">
        <div className="relative h-[420px] rounded-sm overflow-hidden">
          <Image
            src="/Graduacao-ESJ.jpg"
            alt="Estudantes finalistas da ESJ na cerimónia de graduação"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-[50%_35%]"
          />
        </div>
      </div>

      <div>
        <p className="text-sky font-bold tracking-widest text-sm mb-3">BEM-VINDA À</p>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-900">
          Escola Superior de Jornalismo
        </h2>
        <p className="mt-5 text-navy-900/70 leading-relaxed">
          A ESJ é uma instituição pública de ensino superior, vocacionada para a formação de
          quadros nas áreas do Jornalismo, Publicidade e Marketing, Relações Públicas e
          Biblioteconomia e Documentação. Com sede em Maputo e delegação académica em Manica, a
          ESJ forma profissionais críticos, éticos e capazes de responder aos desafios da
          comunicação em Moçambique.
        </p>

        <div className="mt-6">
          <Link
            href="#ensino"
            className="inline-flex items-center gap-2 bg-sky hover:bg-crimson text-white font-semibold text-[13px] tracking-wide px-5 py-3 transition-colors"
          >
            Saiba mais sobre a ESJ
          </Link>
        </div>
      </div>
    </section>
  );
}
