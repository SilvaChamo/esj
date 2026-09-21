import Link from "next/link";
import BannerInterior from "@/components/BannerInterior";

export const metadata = {
  title: "Sobre a ESJ | ESJ",
  description:
    "Conheça a Escola Superior de Jornalismo: missão, valores, organograma, Conselho Científico-Pedagógico, história e corpo docente.",
};

export default function SobrePage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="SOBRE A ESJ"
        title="Quem Somos"
        description="A ESJ é uma instituição pública de ensino superior, vocacionada para a formação de quadros nas áreas das ciências de informação, com sede em Maputo e delegação académica em Manica. Forma profissionais críticos, éticos e capazes de responder aos desafios da comunicação em Moçambique."
      />

      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8 space-y-16 md:space-y-20">
        <section className="grid sm:grid-cols-2 gap-5">
          <article className="bg-white border border-navy-100 p-8">
            <h2 className="font-serif text-2xl font-bold text-navy-900">Missão</h2>
            <p className="mt-4 text-sm text-navy-900/70 leading-relaxed">
              A missão da Escola Superior de Jornalismo será publicada aqui.
            </p>
            <p className="mt-4 text-xs font-semibold tracking-wide text-navy-900/40">Em breve</p>
          </article>
          <article className="bg-white border border-navy-100 p-8">
            <h2 className="font-serif text-2xl font-bold text-navy-900">Valores</h2>
            <p className="mt-4 text-sm text-navy-900/70 leading-relaxed">
              Os valores da Escola Superior de Jornalismo serão publicados aqui.
            </p>
            <p className="mt-4 text-xs font-semibold tracking-wide text-navy-900/40">Em breve</p>
          </article>
        </section>

        <section id="organograma" className="scroll-mt-24">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy-900">Organograma</h2>
          <div className="mt-6 bg-white border border-navy-100 p-8">
            <p className="text-sm text-navy-900/70 leading-relaxed">
              O organograma da Escola Superior de Jornalismo será publicado aqui.
            </p>
            <p className="mt-4 text-xs font-semibold tracking-wide text-navy-900/40">Em breve</p>
          </div>
        </section>

        <section id="conselho-cientifico-pedagogico" className="scroll-mt-24">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy-900">
            Conselho Científico-Pedagógico
          </h2>
          <div className="mt-6 bg-white border border-navy-100 p-8">
            <p className="text-sm text-navy-900/70 leading-relaxed">
              O Conselho Científico-Pedagógico reúne o Conselho Científico, o Conselho Pedagógico e
              os demais órgãos colegiais da Escola Superior de Jornalismo. As minutas das suas
              reuniões estão disponíveis para toda a comunidade académica na área de{" "}
              <Link href="/minutas" className="text-sky hover:text-crimson transition-colors">
                Minutas
              </Link>
              .
            </p>
          </div>
        </section>

        <section id="historia" className="scroll-mt-24">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy-900">A Nossa História</h2>
          <div className="mt-6 bg-white border border-navy-100 p-8">
            <p className="text-sm text-navy-900/70 leading-relaxed">
              A Escola Superior de Jornalismo é uma instituição pública de ensino superior, fundada
              em 2008. Desde então, tem formado profissionais críticos, éticos e competentes nas
              Ciências da Comunicação e da Informação, com sede em Maputo e delegação académica em
              Manica, ao serviço de Moçambique.
            </p>
          </div>
        </section>

        <section id="qualificacao-docentes" className="scroll-mt-24">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy-900">
            Qualificação dos Docentes
          </h2>
          <div className="mt-6 bg-white border border-navy-100 p-8">
            <p className="text-sm text-navy-900/70 leading-relaxed">
              A ESJ conta com um corpo docente experiente nas Ciências da Comunicação.
            </p>
            <p className="mt-4 text-xs font-semibold tracking-wide text-navy-900/40">Em breve</p>
          </div>
        </section>
      </div>
    </main>
  );
}
