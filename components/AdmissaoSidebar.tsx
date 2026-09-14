"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ANO_LECTIVO,
  NIVEIS,
  REGIME_LABEL,
  REGIMES,
  filtroQuery,
  parseFiltro,
  type FiltroAdmissao,
} from "@/lib/admissao";

type Props = {
  inscricoesHref?: boolean;
  mostrarMedia?: boolean;
};

export default function AdmissaoSidebar({ inscricoesHref = false, mostrarMedia = true }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { filtro } = parseFiltro(searchParams);

  const apply = (next: FiltroAdmissao) => {
    router.replace(`${pathname}?${filtroQuery(next)}`, { scroll: false });
  };

  return (
    <aside className="space-y-5 print:hidden">
      <div className="bg-white border border-navy-100 p-5">
        <p className="text-[11px] font-bold tracking-widest text-sky">FILTROS</p>
        <h2 className="font-serif font-bold text-navy-900 mt-1">Inscrições {ANO_LECTIVO}</h2>
        <p className="mt-2 text-sm text-navy-900/65 leading-relaxed">
          Escolha o nível e o regime. Os mesmos dados passam para o boletim de
          pré-inscrição e para a pauta de resultados.
        </p>

        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-navy-900 mb-2">Nível</legend>
          <div className="space-y-2">
            {NIVEIS.map((nivel) => (
              <label key={nivel} className="flex items-center gap-2 text-sm text-navy-900/80">
                <input
                  type="radio"
                  name="filtro-nivel"
                  checked={filtro.nivel === nivel}
                  onChange={() => apply({ ...filtro, nivel })}
                  className="accent-leaf"
                />
                {nivel}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-navy-900 mb-2">Regime</legend>
          <div className="space-y-2">
            {REGIMES.map((regime) => (
              <label key={regime} className="flex items-center gap-2 text-sm text-navy-900/80">
                <input
                  type="radio"
                  name="filtro-regime"
                  checked={filtro.regime === regime}
                  onChange={() => apply({ ...filtro, regime })}
                  className="accent-leaf"
                />
                {REGIME_LABEL[regime]}
              </label>
            ))}
          </div>
        </fieldset>

        {inscricoesHref && (
          <Link
            href={`/inscricao?${filtroQuery(filtro)}`}
            className="mt-5 inline-flex w-full items-center justify-center bg-navy-800 hover:bg-crimson text-white font-semibold text-xs tracking-wide px-4 py-3 transition-colors"
          >
            INSCREVER-SE
          </Link>
        )}
      </div>

      {mostrarMedia && (
        <div className="bg-white border border-navy-100 p-5">
          <h2 className="font-serif font-bold text-navy-900">Cálculo da média</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-navy-900/75">
            <li>Português — 50%</li>
            <li>História — 50%</li>
            <li>Admitido: média ≥ 10,00</li>
          </ul>
        </div>
      )}
    </aside>
  );
}

export function useFiltroAdmissao() {
  const searchParams = useSearchParams();
  return parseFiltro(searchParams);
}
