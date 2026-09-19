"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, FileText } from "lucide-react";
import { CURSOS_DOCENCIA, type CursoDocenciaSlug } from "@/lib/docencia";
import { getCurriculoPorCurso, type RegimeCurso } from "@/lib/curriculo";
import { listarPautaFinalPublica, type NotaEstudante } from "@/lib/notas";

const REGIMES: { valor: RegimeCurso; label: string }[] = [
  { valor: "diurno", label: "Diurno" },
  { valor: "pos-laboral", label: "Pós-laboral" },
];

export default function PautasFinais() {
  const [curso, setCurso] = useState<CursoDocenciaSlug>(CURSOS_DOCENCIA[0].slug);
  const [regime, setRegime] = useState<RegimeCurso>("diurno");
  const [cadeiraCodigo, setCadeiraCodigo] = useState<string | null>(null);
  const [pauta, setPauta] = useState<NotaEstudante[] | null>(null);
  const [carregando, setCarregando] = useState(false);

  const cadeiras = useMemo(() => getCurriculoPorCurso(curso, regime), [curso, regime]);
  const cadeiraSel = cadeiras.find((c) => c.codigo === cadeiraCodigo) || null;

  useEffect(() => {
    setCadeiraCodigo(null);
    setPauta(null);
  }, [curso, regime]);

  useEffect(() => {
    if (!cadeiraCodigo) return;
    setCarregando(true);
    listarPautaFinalPublica(curso, regime, cadeiraCodigo)
      .then((rows) => setPauta(rows ?? []))
      .catch(() => setPauta([]))
      .finally(() => setCarregando(false));
  }, [curso, regime, cadeiraCodigo]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start">
        <div className="lg:sticky lg:top-24 space-y-5">
          <div className="bg-white border border-navy-100 p-5">
            <span className="block text-xs font-bold text-navy-900 mb-2 uppercase tracking-wide">
              Curso
            </span>
            <div className="space-y-1">
              {CURSOS_DOCENCIA.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setCurso(c.slug)}
                  className={`w-full text-left px-3 py-2 rounded text-sm font-semibold transition-colors ${
                    curso === c.slug
                      ? "bg-navy-900 text-white"
                      : "text-navy-900/70 hover:bg-cream"
                  }`}
                >
                  {c.titulo}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-navy-100 p-5">
            <span className="block text-xs font-bold text-navy-900 mb-2 uppercase tracking-wide">
              Regime
            </span>
            <div className="flex gap-2">
              {REGIMES.map((r) => (
                <button
                  key={r.valor}
                  type="button"
                  onClick={() => setRegime(r.valor)}
                  className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition-colors border ${
                    regime === r.valor
                      ? "bg-leaf text-white border-leaf"
                      : "text-navy-900/70 border-navy-100 hover:border-sky"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-5">
          <div className="bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-3 bg-cream/70 border-b border-navy-100">
              <h2 className="font-serif font-bold text-navy-900">Cadeiras</h2>
            </div>
            {cadeiras.length === 0 ? (
              <p className="p-6 text-sm text-navy-900/60">
                Ainda sem currículo publicado para este curso/regime.
              </p>
            ) : (
              <div className="divide-y divide-navy-100">
                {cadeiras.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCadeiraCodigo(c.codigo)}
                    className={`w-full text-left px-5 py-3 flex items-center justify-between gap-3 transition-colors ${
                      cadeiraCodigo === c.codigo ? "bg-sky/10" : "hover:bg-cream/50"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-navy-900 truncate">
                        {c.nome}
                      </span>
                      <span className="block text-[11px] text-navy-900/50 font-mono">
                        {c.codigo} · {c.ano}º Ano · {c.semestre}º Semestre
                      </span>
                    </span>
                    <FileText size={16} className="text-navy-900/30 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {cadeiraSel && (
            <div className="bg-white border border-navy-100 overflow-hidden">
              <div className="px-5 py-4 bg-cream/70 border-b border-navy-100">
                <h3 className="font-serif font-bold text-lg text-navy-900">{cadeiraSel.nome}</h3>
                <p className="text-xs text-navy-900/60 mt-0.5">
                  {cadeiraSel.codigo} · Docente: {cadeiraSel.docente} · {cadeiraSel.ano}º Ano ·{" "}
                  {cadeiraSel.semestre}º Semestre
                </p>
              </div>

              {carregando ? (
                <div className="p-8 text-center text-sm text-navy-900/60">A carregar pauta…</div>
              ) : !pauta || pauta.length === 0 ? (
                <div className="p-8 text-center">
                  <ClipboardList size={28} className="mx-auto text-navy-900/30 mb-2" />
                  <p className="text-sm font-bold text-navy-900">Pauta ainda não publicada</p>
                  <p className="text-xs text-navy-900/60 mt-1">
                    O registo académico ainda não publicou o resultado final desta cadeira.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-navy-900 border-collapse">
                    <thead>
                      <tr className="bg-navy-900 text-white">
                        <th className="p-3 text-center w-12">#</th>
                        <th className="p-3">Nº Estudante</th>
                        <th className="p-3">Nome Completo</th>
                        <th className="p-3 text-center">Nota de Frequência</th>
                        <th className="p-3 text-center">Exame Normal</th>
                        <th className="p-3 text-center">Exame Recorrência</th>
                        <th className="p-3 text-center">Média</th>
                        <th className="p-3 text-center">Observação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-100">
                      {pauta.map((e, idx) => (
                        <tr key={e.id} className={idx % 2 === 1 ? "bg-cream/40" : "bg-white"}>
                          <td className="p-3 text-center font-bold">{idx + 1}</td>
                          <td className="p-3 font-mono font-bold text-sky">{e.numeroEstudante}</td>
                          <td className="p-3">{e.nomeEstudante}</td>
                          <td className="p-3 text-center font-bold">
                            {e.notaFrequencia?.toFixed(1) ?? "-"}
                          </td>
                          <td className="p-3 text-center">{e.exameNormal?.toFixed(1) ?? "-"}</td>
                          <td className="p-3 text-center">{e.exameRecorrencia?.toFixed(1) ?? "-"}</td>
                          <td className="p-3 text-center font-bold">{e.mediaFinal?.toFixed(1) ?? "-"}</td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                e.resultado === "Aprovado"
                                  ? "bg-leaf/20 text-leaf"
                                  : e.resultado === "Reprovado" || e.resultado === "Excluído"
                                  ? "bg-crimson/20 text-crimson"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {e.resultado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
