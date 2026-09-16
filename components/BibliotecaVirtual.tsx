"use client";

import Image from "next/image";
import EntradaHome from "@/components/EntradaHome";

/** Actualize este endereço quando a biblioteca virtual tiver URL própria. */
const BIBLIOTECA_VIRTUAL_URL = "https://esj.edondzo.ac.mz";

export default function BibliotecaVirtual() {
  return (
    <section id="biblioteca-virtual" className="scroll-mt-24">
      <div className="relative isolate min-h-[420px] md:min-h-[520px] lg:min-h-[600px]">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/Biblioteca.jpeg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority={false}
          />
        </div>
      </div>

      <div className="relative bg-cream flow-root">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 pb-16 md:pb-20">
          <EntradaHome>
            <div className="relative z-10 -mt-[100px] w-full bg-white px-5 py-12 sm:px-8 sm:py-14 md:px-10 md:py-16 text-center shadow-[0_12px_40px_rgba(12,29,59,0.18)]">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="h-px w-[40px] shrink-0 bg-leaf" aria-hidden />
                <p className="text-leaf font-bold tracking-widest text-sm">BIBLIOTECA VIRTUAL</p>
                <span className="h-px w-[40px] shrink-0 bg-leaf" aria-hidden />
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-900 leading-tight">
                Abra o acervo da ESJ <span className="text-sky">onde estiver</span>
              </h2>
              <p className="mt-5 mx-auto max-w-2xl text-navy-900/70 text-sm md:text-base leading-relaxed">
                Consulte obras, revistas e recursos digitais em Ciências da Comunicação e da
                Informação — um clique e está dentro.
              </p>
              <a
                href={BIBLIOTECA_VIRTUAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="esj-btn-move mt-8 inline-flex items-center justify-center rounded-full bg-navy-900 text-white font-semibold text-[13px] tracking-wide px-8 py-3.5 transition-colors"
              >
                Aceder à biblioteca virtual
              </a>
            </div>
          </EntradaHome>
        </div>
      </div>
    </section>
  );
}
