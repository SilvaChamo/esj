import Link from "next/link";
import {
  Award,
  CalendarDays,
  ClipboardList,
  PenLine,
  type LucideIcon,
} from "lucide-react";
import BannerInterior from "@/components/BannerInterior";
import { loadCalendario } from "@/lib/calendario";

export const metadata = {
  title: "Calendário Académico | ESJ",
  description: "Datas do ano lectivo da Escola Superior de Jornalismo.",
};

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const cal = await loadCalendario();
  const datas: {
    titulo: string;
    texto: string;
    icon: LucideIcon;
    numero: number;
    link?: { href: string; label: string };
  }[] = [
    {
      titulo: "Inscrições",
      texto: cal.inscricoes,
      icon: ClipboardList,
      numero: 1,
      link: { href: "/inscricao", label: "Inscrever-se" },
    },
    { titulo: "Exames de admissão", texto: cal.exames, icon: PenLine, numero: 2 },
    {
      titulo: "Publicação de resultados",
      texto: cal.resultados,
      icon: Award,
      numero: 3,
      link: { href: "/resultados", label: "Ver resultados" },
    },
    { titulo: "Início do ano lectivo", texto: cal.inicioAno, icon: CalendarDays, numero: 4 },
  ];

  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="ENSINO"
        title="Calendário Académico"
        description="As datas oficiais e definitivas são as do edital de admissão."
        actions={
          <Link
            href="/edital"
            className="bg-leaf hover:bg-crimson text-white font-semibold text-xs tracking-wide px-6 py-3 transition-colors"
          >
            VER EDITAL
          </Link>
        }
      />
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <div className="relative">
          <div
            aria-hidden
            className="absolute left-4 sm:left-1/2 top-2 bottom-2 w-px bg-sky-300 sm:-translate-x-1/2"
          />
          <div className="space-y-10">
            {datas.map((d, i) => {
              const isRight = i % 2 === 1;
              return (
                <div
                  key={d.titulo}
                  className="relative pl-12 sm:pl-0 sm:grid sm:grid-cols-2 sm:gap-x-10"
                >
                  <span className="absolute left-4 sm:left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white border-2 border-sky-300">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 text-white text-sm font-bold">
                      {d.numero}
                    </span>
                  </span>
                  <div
                    className={`relative overflow-hidden bg-white border border-navy-100 p-6 flex gap-4 ${
                      isRight ? "sm:col-start-2" : "sm:col-start-1"
                    }`}
                  >
                    <d.icon size={22} className="relative shrink-0 mt-0.5 text-sky" />
                    <div className="relative min-w-0">
                      <h2 className="font-serif text-lg font-bold text-navy-900">{d.titulo}</h2>
                      <p className="mt-1.5 text-sm text-navy-900/70 leading-relaxed">{d.texto}</p>
                      {d.link && (
                        <Link
                          href={d.link.href}
                          className="mt-3 inline-block text-sm text-sky hover:underline"
                        >
                          {d.link.label} →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
