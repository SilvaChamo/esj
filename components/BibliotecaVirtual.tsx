"use client";

import Image from "next/image";
import EntradaHome from "@/components/EntradaHome";

/** Actualize este endereço quando a biblioteca virtual tiver URL própria. */
const BIBLIOTECA_VIRTUAL_URL = "https://esj.edondzo.ac.mz";

export default function BibliotecaVirtual() {
  return (
    <section id="biblioteca-virtual" className="relative isolate overflow-hidden scroll-mt-24">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/Biblioteca.jpeg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority={false}
        />
        <div className="absolute inset-0 bg-navy-900/70" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/85 via-navy-900/55 to-navy-900/35" aria-hidden />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-20 md:py-28">
        <EntradaHome>
          <div className="max-w-xl text-white">
            <p className="text-sky-300 font-bold tracking-widest text-sm mb-3">BIBLIOTECA VIRTUAL</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight">
              Abra o acervo da ESJ onde estiver
            </h2>
            <p className="mt-5 text-white/85 text-sm md:text-base leading-relaxed">
              Consulte obras, revistas e recursos digitais em Ciências da Comunicação e da
              Informação — um clique e está dentro da biblioteca.
            </p>
            <a
              href={BIBLIOTECA_VIRTUAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="esj-btn-move mt-8 inline-flex items-center bg-white text-navy-900 hover:bg-crimson hover:text-white font-semibold text-[13px] tracking-wide px-6 py-3.5 transition-colors"
            >
              Aceder à biblioteca virtual
            </a>
          </div>
        </EntradaHome>
      </div>
    </section>
  );
}
