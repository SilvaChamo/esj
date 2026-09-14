"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import {
  ANO_LECTIVO,
  REGIME_LABEL,
  formatNota,
  tituloPauta,
  type CursoAdmissao,
  type Regime,
} from "@/lib/admissao";
import { rankingMerito, type LinhaPauta } from "@/lib/pauta";

type Props = {
  curso: CursoAdmissao;
  regime: Regime;
  anoLectivo?: string;
  linhas: LinhaPauta[];
  voltarHref: string;
};

export default function PautaAdmissao({
  curso,
  regime,
  anoLectivo = ANO_LECTIVO,
  linhas,
  voltarHref,
}: Props) {
  const [query, setQuery] = useState("");
  const merito = rankingMerito(linhas);
  const comOrdem = linhas.map((linha, index) => ({ linha, ordem: index + 1 }));
  const termo = query.trim().toLowerCase();
  const visiveis = termo
    ? comOrdem.filter(({ linha }) =>
        `${linha.apelido} ${linha.nome}`.toLowerCase().includes(termo)
      )
    : comOrdem;

  return (
    <article className="bg-white border border-navy-100 print:border-0">
      <header className="border-b border-navy-100 px-5 sm:px-8 py-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <img
          src="/esj-logo-mark.png"
          alt="Escola Superior de Jornalismo"
          className="h-16 w-16 object-contain"
        />
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-widest text-sky">
            ESCOLA SUPERIOR DE JORNALISMO
          </p>
          <h1 className="font-serif text-lg sm:text-xl font-bold text-navy-900 mt-1 leading-tight">
            {tituloPauta(curso, regime)}
          </h1>
          <p className="mt-1 text-sm text-navy-900/65">
            Ano lectivo {anoLectivo} · Lista única · {REGIME_LABEL[regime]}
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
        <Link
          href={voltarHref}
          className="inline-flex items-center gap-1.5 text-sm text-sky hover:underline"
        >
          <ArrowLeft size={14} />
          Voltar aos cursos
        </Link>
      </div>

      <div className="overflow-x-auto">
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
              <th className="px-3 py-3 text-center">Mérito</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-navy-900/50">
                  {linhas.length === 0
                    ? "Ainda não há resultados publicados para este curso e regime."
                    : "Nenhum nome corresponde à procura."}
                </td>
              </tr>
            )}
            {visiveis.map(({ linha, ordem }, i) => (
              <tr
                key={linha.id}
                className={`border-t border-navy-100 ${i % 2 === 1 ? "bg-cream/60" : ""}`}
              >
                <td className="px-3 py-1.5 text-center text-xs text-navy-900/50 border-r border-navy-100">
                  {ordem}
                </td>
                <td className="px-3 py-1.5 font-semibold text-navy-900 uppercase">{linha.apelido}</td>
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
                  className={`px-3 py-1.5 text-center font-semibold ${
                    linha.resultado === "Admitido" ? "text-leaf" : "text-crimson"
                  }`}
                >
                  {linha.resultado}
                </td>
                <td className="px-3 py-1.5 text-center text-navy-900/60">
                  {merito.get(linha.id)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
