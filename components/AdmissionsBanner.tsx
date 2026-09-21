import { GraduationCap, ChevronRight } from "lucide-react";

export default function AdmissionsBanner() {
  return (
    <section id="admissoes" className="bg-navy-800">
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8 flex flex-col md:flex-row items-center gap-5 md:gap-5">
        <div className="w-16 h-16 rounded-full bg-sky/20 flex items-center justify-center shrink-0">
          <GraduationCap className="text-sky" size={30} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-serif text-2xl font-bold text-white">
            Inscrições encerradas — Ano lectivo 2026
          </h3>
          <p className="text-white/70 text-sm mt-1 max-w-2xl">
            O próximo período, relativo ao ano lectivo 2027, deverá abrir em novembro. Exames de
            admissão em Português e História.
          </p>
        </div>
        <a
          href="/inscricoes"
          className="bg-leaf hover:bg-crimson transition-colors text-white font-semibold text-[13px] tracking-wide px-7 py-3.5 flex items-center gap-2 shrink-0"
        >
          INSCREVA-SE <ChevronRight size={16} />
        </a>
      </div>
    </section>
  );
}
