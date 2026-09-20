"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import {
  ANO_LECTIVO,
  REGIME_LABEL,
  formatNota,
  tituloPauta,
  type CursoAdmissao,
  type Regime,
} from "@/lib/admissao";
import { type LinhaPauta } from "@/lib/pauta";

type Props = {
  curso: CursoAdmissao;
  regime: Regime;
  anoLectivo?: string;
  linhas: LinhaPauta[];
};

export default function PautaAdmissao({
  curso,
  regime,
  anoLectivo = ANO_LECTIVO,
  linhas,
}: Props) {
  const [query, setQuery] = useState("");
  const [pagina, setPagina] = useState(1);
  const porPagina = 40;
  const comOrdem = linhas.map((linha, index) => ({ linha, ordem: index + 1 }));
  const termo = query.trim().toLowerCase();
  const visiveis = termo
    ? comOrdem.filter(({ linha }) =>
        `${linha.apelido} ${linha.nome}`.toLowerCase().includes(termo)
      )
    : comOrdem;
  const totalPaginas = Math.max(1, Math.ceil(visiveis.length / porPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);

  useEffect(() => {
    setPagina(1);
  }, [termo]);

  return (
    <article className="bg-white border border-navy-100 print:border-0">
      <header className="border-b border-navy-100 px-5 sm:px-8 py-5 flex items-center gap-4">
        <img
          src="/esj-logo-mark.png"
          alt="Escola Superior de Jornalismo"
          className="h-16 w-16 object-contain rounded-sm shrink-0"
        />
        <div className="min-w-0">
          <p className="text-[9px] font-bold tracking-widest text-sky">
            ESCOLA SUPERIOR DE JORNALISMO
          </p>
          <h1 className="font-serif text-lg sm:text-xl font-bold text-navy-900 leading-tight">
            {tituloPauta()}
          </h1>
          <p className="mt-0.5 text-[11px] text-navy-900/50">
            {anoLectivo} · {REGIME_LABEL[regime]}
          </p>
        </div>
      </header>

      <div className="px-5 sm:px-8 py-3 border-b border-navy-100 print:hidden flex flex-wrap items-center gap-4">
        <label className="relative flex items-center w-1/2 h-9 border border-navy-100 bg-white focus-within:border-sky">
          <Search size={14} className="pointer-events-none ml-3 shrink-0 text-navy-900/40" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Procurar pelo nome e apelido…"
            className="w-full min-w-0 h-full bg-transparent px-2 text-xs text-navy-900 outline-none placeholder:text-navy-900/40"
          />
        </label>
        <button
          type="button"
          onClick={() => window.print()}
          className="ml-auto inline-flex items-center gap-1.5 text-sm text-sky hover:underline"
        >
          <Download size={14} />
          Baixar PDF
        </button>
      </div>

      {visiveis.length === 0 && (
        <p className="px-5 sm:px-8 py-6 md:py-8 text-center text-navy-900/50 text-xs">
          {linhas.length === 0
            ? "Ainda não há resultados publicados para este curso e regime."
            : "Nenhum nome corresponde à procura."}
        </p>
      )}

      {visiveis.length > 0 && (
        <div className="lg:hidden print:hidden grid grid-cols-1 md:grid-cols-2 gap-px bg-navy-100">
          {visiveis.map(({ linha, ordem }, i) => {
            const naPagina = Math.floor(i / porPagina) + 1 === paginaAtual;
            if (!naPagina) return null;
            return (
              <div key={linha.id} className="bg-white px-4 py-2.5 text-xs space-y-1">
                <p className="font-semibold text-navy-900">
                  <span className="text-navy-900/40 font-normal">{ordem}.</span>{" "}
                  <span className="uppercase">{linha.apelido}</span> {linha.nome}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-cream text-navy-900/60">
                    Português: {formatNota(linha.notaPortugues)}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cream text-navy-900/60">
                    História: {formatNota(linha.notaHistoria)}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cream text-navy-900 font-semibold">
                    Média: {formatNota(linha.media)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-semibold ${
                      linha.resultado === "Admitido" ? "text-leaf bg-leaf/10" : "text-crimson bg-crimson/10"
                    }`}
                  >
                    {linha.resultado}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {visiveis.length > 0 && (
      <div className="hidden lg:block print:block overflow-x-auto">
        <table className="w-full min-w-[720px] text-xs">
          <thead>
            <tr className="bg-cream text-left text-[11px] font-bold tracking-wide text-navy-900/70">
              <th className="px-3 py-3 w-12 text-center border-r border-navy-100">Ord.</th>
              <th className="px-3 py-3">Apelido</th>
              <th className="px-3 py-3">Nome</th>
              <th className="px-3 py-3 text-center">Português (50%)</th>
              <th className="px-3 py-3 text-center">História (50%)</th>
              <th className="px-3 py-3 text-center">Média final</th>
              <th className="px-3 py-3 text-center">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map(({ linha, ordem }, i) => {
              const naPagina = Math.floor(i / porPagina) + 1 === paginaAtual;
              return (
              <tr
                key={linha.id}
                className={`border-t border-navy-100 ${i % 2 === 1 ? "bg-cream/60" : ""} ${
                  naPagina ? "" : "hidden print:table-row"
                }`}
              >
                <td className="px-3 py-1.5 text-center text-xs text-navy-900/50 border-r border-navy-100">
                  {ordem}
                </td>
                <td className="px-3 py-1.5 text-[11px] font-semibold text-navy-900 uppercase">
                  {linha.apelido}
                </td>
                <td className="px-3 py-1.5 text-navy-900">{linha.nome}</td>
                <td className="px-3 py-1.5 text-center tabular-nums">
                  {formatNota(linha.notaPortugues)}
                </td>
                <td className="px-3 py-1.5 text-center tabular-nums">
                  {formatNota(linha.notaHistoria)}
                </td>
                <td className="px-3 py-1.5 text-center tabular-nums font-semibold text-navy-900">
                  {formatNota(linha.media)}
                </td>
                <td
                  className={`px-3 py-1.5 text-center whitespace-nowrap font-semibold ${
                    linha.resultado === "Admitido" ? "text-leaf" : "text-crimson"
                  }`}
                >
                  {linha.resultado}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      {totalPaginas > 1 && (
        <div className="px-5 sm:px-8 py-4 border-t border-navy-100 flex items-center justify-center gap-1.5 print:hidden">
          <button
            type="button"
            disabled={paginaAtual === 1}
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            className="flex h-8 w-8 items-center justify-center border border-navy-100 text-navy-900 disabled:opacity-30 hover:border-sky"
            aria-label="Página anterior"
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPagina(n)}
              aria-current={n === paginaAtual ? "page" : undefined}
              className={`flex h-8 w-8 items-center justify-center text-xs font-bold ${
                n === paginaAtual
                  ? "bg-navy-800 text-white"
                  : "border border-navy-100 text-navy-900 hover:border-sky"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            disabled={paginaAtual === totalPaginas}
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            className="flex h-8 w-8 items-center justify-center border border-navy-100 text-navy-900 disabled:opacity-30 hover:border-sky"
            aria-label="Página seguinte"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </article>
  );
}
