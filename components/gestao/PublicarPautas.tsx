"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Globe, GlobeLock } from "lucide-react";
import { CURSOS_DOCENCIA, type CursoDocenciaSlug } from "@/lib/docencia";
import type { RegimeCurso } from "@/lib/curriculo";
import { cmsError, isMissingTable } from "@/lib/cms";
import { listarCadeirasComNotas, type CadeiraComNotas } from "@/lib/notas";
import SchemaInstall from "@/components/gestao/SchemaInstall";

const REGIMES: { valor: RegimeCurso; label: string }[] = [
  { valor: "diurno", label: "Diurno" },
  { valor: "pos-laboral", label: "Pós-laboral" },
];

export default function PublicarPautas({ onAction }: { onAction: (m: string) => void }) {
  const [curso, setCurso] = useState<CursoDocenciaSlug>(CURSOS_DOCENCIA[0].slug);
  const [regime, setRegime] = useState<RegimeCurso>("diurno");
  const [cadeiras, setCadeiras] = useState<CadeiraComNotas[] | null>(null);
  const [missing, setMissing] = useState(false);
  const [busyCodigo, setBusyCodigo] = useState<string | null>(null);

  const refresh = () => {
    listarCadeirasComNotas(curso, regime)
      .then((rows) => {
        setCadeiras(rows);
        setMissing(rows === null);
      })
      .catch((err) => {
        if (isMissingTable(err)) setMissing(true);
        else onAction(cmsError(err));
      });
  };

  useEffect(refresh, [curso, regime]);

  const publicar = async (cadeiraCodigo: string, publicado: boolean) => {
    setBusyCodigo(cadeiraCodigo);
    try {
      const res = await fetch("/api/pautas-publicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curso, regime, cadeiraCodigo, publicado }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Não foi possível actualizar a pauta.");
      onAction(publicado ? "Pauta publicada — já visível em /pautas." : "Pauta despublicada.");
      refresh();
    } catch (error) {
      onAction(error instanceof Error ? error.message : "Não foi possível actualizar a pauta.");
    } finally {
      setBusyCodigo(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-white border border-navy-100 p-6 md:p-8">
        <h2 className="font-serif text-2xl font-bold text-navy-900">Publicar pautas finais</h2>
        <p className="mt-2 text-sm text-navy-900/65 leading-relaxed">
          O estudante já vê a sua própria nota assim que o docente a lança. Publicar aqui torna a
          pauta da turma inteira pública em{" "}
          <span className="font-mono text-navy-900">/pautas</span> — confirme com o docente que as
          notas estão fechadas antes de publicar.
        </p>
        {missing && <SchemaInstall />}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-bold text-navy-900 mb-1.5">Curso</span>
            <select
              className="esj-field"
              value={curso}
              onChange={(e) => setCurso(e.target.value as CursoDocenciaSlug)}
            >
              {CURSOS_DOCENCIA.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.titulo}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-bold text-navy-900 mb-1.5">Regime</span>
            <select
              className="esj-field"
              value={regime}
              onChange={(e) => setRegime(e.target.value as RegimeCurso)}
            >
              {REGIMES.map((r) => (
                <option key={r.valor} value={r.valor}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="bg-white border border-navy-100 overflow-x-auto">
        <table className="w-full min-w-[640px] text-xs">
          <thead>
            <tr className="bg-cream text-left text-[11px] font-bold tracking-wide text-navy-900/70">
              <th className="px-3 py-3">Cadeira</th>
              <th className="px-3 py-3 text-center">Ano/Semestre</th>
              <th className="px-3 py-3 text-center">Notas lançadas</th>
              <th className="px-3 py-3 text-center">Situação</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(cadeiras ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 md:py-8 text-center text-navy-900/50">
                  Ainda sem notas lançadas para este curso/regime.
                </td>
              </tr>
            )}
            {(cadeiras ?? []).map((c) => {
              const totalmentePublicada = c.total > 0 && c.publicadas === c.total;
              return (
                <tr key={c.cadeiraCodigo} className="border-t border-navy-100">
                  <td className="px-3 py-2.5 font-semibold text-navy-900">
                    {c.cadeiraNome}
                    <span className="text-navy-900/40 font-mono font-normal"> ({c.cadeiraCodigo})</span>
                  </td>
                  <td className="px-3 py-2.5 text-center text-navy-900/70">
                    {c.ano}º Ano · {c.semestre}º Sem.
                  </td>
                  <td className="px-3 py-2.5 text-center text-navy-900/70">{c.total}</td>
                  <td className="px-3 py-2.5 text-center">
                    {totalmentePublicada ? (
                      <span className="inline-flex items-center gap-1 text-leaf font-bold">
                        <CheckCircle2 size={13} /> Publicada
                      </span>
                    ) : c.publicadas > 0 ? (
                      <span className="text-sky font-bold">
                        Parcial ({c.publicadas}/{c.total})
                      </span>
                    ) : (
                      <span className="text-navy-900/50">Rascunho</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      disabled={busyCodigo === c.cadeiraCodigo}
                      onClick={() => publicar(c.cadeiraCodigo, !totalmentePublicada)}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded transition-colors disabled:opacity-50 ${
                        totalmentePublicada
                          ? "text-navy-900/60 hover:text-crimson"
                          : "bg-leaf hover:bg-crimson text-white"
                      }`}
                    >
                      {totalmentePublicada ? (
                        <>
                          <GlobeLock size={13} /> Despublicar
                        </>
                      ) : (
                        <>
                          <Globe size={13} /> Publicar
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
