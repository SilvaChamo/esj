"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { RegimeCurso } from "@/lib/curriculo";

const REGIMES: { valor: RegimeCurso; label: string }[] = [
  { valor: "diurno", label: "Diurno (laboral)" },
  { valor: "pos-laboral", label: "Pós-laboral" },
];

export function useFiltroPautas() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("regime");
  const regime: RegimeCurso = raw === "pos-laboral" ? "pos-laboral" : "diurno";
  return { regime };
}

export default function PautasSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { regime } = useFiltroPautas();

  const apply = (next: RegimeCurso) => {
    router.replace(`${pathname}?regime=${next}`, { scroll: false });
  };

  return (
    <aside className="space-y-5">
      <div className="bg-white border border-navy-100 p-5">
        <p className="text-[11px] font-bold tracking-widest text-sky">FILTROS</p>
        <h2 className="font-serif font-bold text-navy-900 mt-1">Pautas Finais</h2>
        <p className="mt-2 text-sm text-navy-900/65 leading-relaxed">
          Escolha o regime. O mesmo filtro passa para a pauta do curso.
        </p>

        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-navy-900 mb-2">Regime</legend>
          <div className="space-y-2">
            {REGIMES.map((r) => (
              <label key={r.valor} className="flex items-center gap-2 text-sm text-navy-900/80">
                <input
                  type="radio"
                  name="filtro-regime-pautas"
                  checked={regime === r.valor}
                  onChange={() => apply(r.valor)}
                  className="accent-leaf"
                />
                {r.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </aside>
  );
}
