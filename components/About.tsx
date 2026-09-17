import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Landmark, MapPinned, Radio } from "lucide-react";
import EntradaHome from "@/components/EntradaHome";

const destaques = [
  { icon: Landmark, valor: "2008", label: "Instituição pública" },
  { icon: MapPinned, valor: "2", label: "Delegações" },
  { icon: BookOpen, valor: "4", label: "Licenciaturas" },
  { icon: Radio, valor: "100%", label: "Compromisso" },
];

export default function About() {
  return (
    <section className="relative overflow-x-clip bg-cream">
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8 py-16 md:py-24 w-full">
        <EntradaHome>
          <div className="w-full grid md:grid-cols-2 md:items-center gap-8 md:gap-10 lg:gap-12">
            <div className="relative w-full">
              <Image
                src="/esj-20262.webp"
                alt="Campus e comunidade da Escola Superior de Jornalismo"
                width={720}
                height={552}
                priority
                unoptimized
                sizes="(min-width: 768px) 40vw, 100vw"
                className="h-auto w-full"
              />
            </div>

            <div className="w-full flex min-w-0 flex-col justify-center gap-8 text-left">
              <div>
                <p className="flex items-center gap-3 text-leaf font-bold tracking-widest text-sm mb-3 uppercase">
                  <span className="h-px w-[40px] shrink-0 bg-leaf" aria-hidden />
                  Bem-vinda à
                </p>
                <h2 className="font-serif text-3xl md:text-[35px] font-bold text-navy-900 leading-tight">
                  Escola Superior de <span className="text-sky">Jornalismo</span>
                </h2>
                <p className="mt-5 text-navy-900/70 leading-relaxed text-[14px]">
                  A ESJ é uma instituição pública de ensino superior, vocacionada para a formação de
                  quadros nas áreas das ciências de informação, com sede em Maputo e delegação
                  académica em Manica. Forma profissionais críticos, éticos e capazes de responder
                  aos desafios da comunicação em Moçambique.
                </p>
              </div>

              <div>
                <div className="mb-6 h-px w-full bg-sky/30" aria-hidden />

                <div className="relative grid grid-cols-2 gap-y-5 sm:grid-cols-4">
                  <div
                    className="pointer-events-none absolute inset-y-0 left-1/4 hidden w-px -translate-x-1/2 bg-sky/30 sm:block"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-sky/30 sm:block"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute inset-y-0 left-3/4 hidden w-px -translate-x-1/2 bg-sky/30 sm:block"
                    aria-hidden
                  />

                  {destaques.map(({ icon: Icon, valor, label }) => (
                    <div key={label} className="relative z-[1] flex justify-center py-1">
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <Icon className="text-sky shrink-0" size={22} strokeWidth={1.75} />
                          <p className="font-serif font-bold text-lg text-navy-900 leading-none">{valor}</p>
                        </div>
                        <p className="mt-1 text-[11px] text-navy-900/55 leading-snug">{label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 h-px w-full bg-sky/30" aria-hidden />

                <div className="mt-8">
                  <Link
                    href="#ensino"
                    className="esj-btn-move inline-flex items-center gap-2 bg-navy-900 text-white font-semibold text-[12px] tracking-wide px-5 py-3.5"
                  >
                    Saiba mais sobre a ESJ
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </EntradaHome>
      </div>
    </section>
  );
}
