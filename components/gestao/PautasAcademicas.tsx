"use client";

import { useEffect, useState } from "react";
import {
  listarCadeirasComNotas,
  type CadeiraComNotas,
} from "@/lib/notas";
import { CURSOS_DOCENCIA, type CursoDocenciaSlug } from "@/lib/docencia";
import type { RegimeCurso } from "@/lib/curriculo";

export default function PautasAcademicas({ onAction }: { onAction: (m: string) => void }) {
  const [curso, setCurso] = useState<CursoDocenciaSlug>("jornalismo");
  const [regime, setRegime] = useState<RegimeCurso>("diurno");
  const [lista, setLista] = useState<CadeiraComNotas[] | null>(null);
  const [busy, setBusy] = useState("");

  const carregar = () => {
    listarCadeirasComNotas(curso, regime)
      .then(setLista)
      .catch(() => setLista([]));
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curso, regime]);

  const publicar = async (cadeiraCodigo: string, publicado: boolean) => {
    setBusy(cadeiraCodigo);
    try {
      const res = await fetch("/api/gestao-notas-publicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curso, cadeiraCodigo, regime, publicado }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Falha ao actualizar.");
      onAction(
        publicado
          ? `Pauta final de ${cadeiraCodigo} aprovada — visível aos estudantes.`
          : `Pauta final de ${cadeiraCodigo} retirada (só frequência).`
      );
      carregar();
    } catch (e) {
      onAction(e instanceof Error ? e.message : "Erro ao publicar pauta.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="font-semibold text-[15px] text-[#1d2327]">Pautas académicas (aprovação DP)</h2>
        <p className="mt-1 text-sm text-navy-900/60">
          O docente lança a frequência em tempo real. A pauta final só aparece no painel do
          estudante e em /pautas depois de aprovar aqui.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={curso}
          onChange={(e) => setCurso(e.target.value as CursoDocenciaSlug)}
          className="border border-navy-100 bg-white px-3 py-2 text-sm"
        >
          {CURSOS_DOCENCIA.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.titulo}
            </option>
          ))}
        </select>
        <select
          value={regime}
          onChange={(e) => setRegime(e.target.value as RegimeCurso)}
          className="border border-navy-100 bg-white px-3 py-2 text-sm"
        >
          <option value="diurno">Diurno</option>
          <option value="pos-laboral">Pós-laboral</option>
        </select>
      </div>

      {lista === null ? (
        <p className="text-sm text-navy-900/50">A carregar…</p>
      ) : lista.length === 0 ? (
        <p className="text-sm text-navy-900/50">Ainda sem notas lançadas neste curso/regime.</p>
      ) : (
        <ul className="divide-y divide-navy-100 border border-navy-100 bg-white">
          {lista.map((c) => {
            const pendente = c.publicadas < c.total;
            return (
              <li
                key={c.cadeiraCodigo}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-sm text-navy-900">
                    {c.cadeiraNome}{" "}
                    <span className="font-mono text-xs text-navy-900/45">({c.cadeiraCodigo})</span>
                  </p>
                  <p className="text-xs text-navy-900/55 mt-0.5">
                    {c.ano}º ano · {c.semestre}º sem · {c.publicadas}/{c.total} aprovadas
                  </p>
                </div>
                <div className="flex gap-2">
                  {pendente ? (
                    <button
                      type="button"
                      disabled={busy === c.cadeiraCodigo}
                      onClick={() => void publicar(c.cadeiraCodigo, true)}
                      className="px-3 py-1.5 text-xs font-bold bg-navy-900 text-white disabled:opacity-50"
                    >
                      Aprovar pauta final
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy === c.cadeiraCodigo}
                      onClick={() => void publicar(c.cadeiraCodigo, false)}
                      className="px-3 py-1.5 text-xs font-bold border border-navy-100 text-navy-900 disabled:opacity-50"
                    >
                      Retirar aprovação
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
