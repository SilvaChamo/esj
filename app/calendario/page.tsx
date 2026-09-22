import Link from "next/link";
import BannerInterior from "@/components/BannerInterior";
import CalendarioAnual from "@/components/CalendarioAnual";

export const metadata = {
  title: "Calendário Académico | ESJ",
  description: "Datas do ano lectivo da Escola Superior de Jornalismo.",
};

export const dynamic = "force-dynamic";

export default function CalendarioPage() {
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
        <CalendarioAnual />
      </div>
    </main>
  );
}
