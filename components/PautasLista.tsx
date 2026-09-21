"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { CURSOS_DOCENCIA } from "@/lib/docencia";
import PautasSidebar, { useFiltroPautas } from "@/components/PautasSidebar";

const REGIME_LABEL: Record<string, string> = {
  diurno: "Diurno (laboral)",
  "pos-laboral": "Pós-laboral",
};

export default function PautasLista() {
  const { regime } = useFiltroPautas();

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-5 items-start">
        <PautasSidebar />
        <div className="min-w-0">
          <div className="grid sm:grid-cols-2 gap-5">
            {CURSOS_DOCENCIA.map((curso) => (
              <Link
                key={curso.slug}
                href={`/pautas/${curso.slug}?regime=${regime}`}
                className="esj-card-move bg-white border border-navy-100 p-6 hover:border-sky flex flex-col"
              >
                <FileText size={20} className="text-sky" />
                <h2 className="font-serif text-lg font-bold text-navy-900 mt-3">{curso.titulo}</h2>
                <p className="mt-2 text-sm text-navy-900/65 leading-relaxed">
                  Licenciatura em {curso.titulo} — {REGIME_LABEL[regime]}
                </p>
                <span className="mt-4 inline-flex items-center text-sm text-sky">
                  Ver pautas do curso →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
