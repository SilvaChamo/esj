"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import type { CursoDocenciaSlug } from "@/lib/docencia";
import { getCurriculoPorCurso, type RegimeCurso } from "@/lib/curriculo";
import { listarPautaFinalPublica, listarPautaFinalPublicaCurso, type NotaEstudante } from "@/lib/notas";

const REGIMES: { valor: RegimeCurso; label: string }[] = [
  { valor: "diurno", label: "Diurno" },
  { valor: "pos-laboral", label: "Pós-laboral" },
];

const ANOS = [1, 2, 3, 4] as const;

/**
 * Semestre lectivo detectado a partir do mês corrente — só define o ponto de
 * partida do filtro (Março–Agosto = 1º Semestre, Setembro–Fevereiro = 2º),
 * o utilizador continua livre para trocar e ver o outro semestre.
 */
function semestreActual(): 1 | 2 {
  const mes = new Date().getMonth() + 1;
  return mes >= 3 && mes <= 8 ? 1 : 2;
}

export default function PautasFinais({
  curso,
  regimeInicial = "diurno",
}: {
  curso: CursoDocenciaSlug;
  regimeInicial?: RegimeCurso;
}) {
  const [regime, setRegime] = useState<RegimeCurso>(regimeInicial);
  const [ano, setAno] = useState<1 | 2 | 3 | 4>(1);
  const [semestre, setSemestre] = useState<1 | 2>(() => semestreActual());
  const [cadeiraCodigo, setCadeiraCodigo] = useState<string | null>(null);
  const [pauta, setPauta] = useState<NotaEstudante[] | null>(null);
  const [carregando, setCarregando] = useState(false);

  // Ano + Semestre juntos — nunca mistura cadeiras de anos diferentes.
  const cadeirasFiltradas = useMemo(
    () =>
      getCurriculoPorCurso(curso, regime).filter((c) => c.ano === ano && c.semestre === semestre),
    [curso, regime, ano, semestre]
  );
  const cadeiraSel = cadeirasFiltradas.find((c) => c.codigo === cadeiraCodigo) || null;

  useEffect(() => {
    setCadeiraCodigo(null);
  }, [regime, ano, semestre]);

  useEffect(() => {
    setCarregando(true);
    const pedido = cadeiraCodigo
      ? listarPautaFinalPublica(curso, regime, cadeiraCodigo)
      : listarPautaFinalPublicaCurso(curso, regime);
    pedido
      .then((rows) => setPauta(rows ?? []))
      .catch(() => setPauta([]))
      .finally(() => setCarregando(false));
  }, [curso, regime, cadeiraCodigo]);

  // Pauta geral (sem cadeira seleccionada): só o ano/semestre escolhidos.
  const pautaVisivel = useMemo(() => {
    if (!pauta || cadeiraSel) return pauta;
    return pauta.filter((e) => e.ano === ano && e.semestre === semestre);
  }, [pauta, cadeiraSel, ano, semestre]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-5 items-start">
        <div className="lg:sticky lg:top-24 space-y-5">
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

          <div className="bg-white border border-navy-100 p-5 space-y-4">
            <div>
              <label
                htmlFor="pautas-ano"
                className="block text-xs font-bold text-navy-900 mb-1.5 uppercase tracking-wide"
              >
                Ano
              </label>
              <select
                id="pautas-ano"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value) as 1 | 2 | 3 | 4)}
                className="w-full border border-navy-100 rounded px-3 py-2.5 text-sm text-navy-900 bg-white focus:outline-none focus:border-sky"
              >
                {ANOS.map((a) => (
                  <option key={a} value={a}>
                    {a}º Ano
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="pautas-cadeira"
                className="block text-xs font-bold text-navy-900 mb-1.5 uppercase tracking-wide"
              >
                Cadeira
              </label>
              <select
                id="pautas-cadeira"
                value={cadeiraCodigo ?? ""}
                onChange={(e) => setCadeiraCodigo(e.target.value || null)}
                className="w-full border border-navy-100 rounded px-3 py-2.5 text-sm text-navy-900 bg-white focus:outline-none focus:border-sky"
              >
                <option value="">Todas as cadeiras</option>
                {cadeirasFiltradas.map((c) => (
                  <option key={c.id} value={c.codigo}>
                    {c.nome}
                  </option>
                ))}
              </select>
              {cadeirasFiltradas.length === 0 && (
                <p className="text-[11px] text-navy-900/50 mt-1.5">
                  Sem cadeiras neste ano/semestre/regime.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="pautas-semestre"
                className="block text-xs font-bold text-navy-900 mb-1.5 uppercase tracking-wide"
              >
                Semestre
              </label>
              <select
                id="pautas-semestre"
                value={semestre}
                onChange={(e) => setSemestre(Number(e.target.value) as 1 | 2)}
                className="w-full border border-navy-100 rounded px-3 py-2.5 text-sm text-navy-900 bg-white focus:outline-none focus:border-sky"
              >
                <option value={1}>1º Semestre</option>
                <option value={2}>2º Semestre</option>
              </select>
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-5">
          <div className="bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 bg-cream/70 border-b border-navy-100">
              {cadeiraSel ? (
                <>
                  <h3 className="font-serif font-bold text-lg text-navy-900">{cadeiraSel.nome}</h3>
                  <p className="text-xs text-navy-900/60 mt-0.5">
                    {cadeiraSel.codigo} · Docente: {cadeiraSel.docente} · {cadeiraSel.ano}º Ano ·{" "}
                    {cadeiraSel.semestre}º Semestre
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-serif font-bold text-lg text-navy-900">Pauta geral</h3>
                  <p className="text-xs text-navy-900/60 mt-0.5">
                    {ano}º Ano · {semestre}º Semestre — todas as cadeiras já publicadas. Seleccione
                    uma cadeira para filtrar.
                  </p>
                </>
              )}
            </div>

            {carregando ? (
              <div className="p-8 text-center text-sm text-navy-900/60">A carregar pauta…</div>
            ) : !pautaVisivel || pautaVisivel.length === 0 ? (
              <div className="p-8 text-center">
                <ClipboardList size={28} className="mx-auto text-navy-900/30 mb-2" />
                <p className="text-sm font-bold text-navy-900">Pauta ainda não publicada</p>
                <p className="text-xs text-navy-900/60 mt-1">
                  {cadeiraSel
                    ? "O registo académico ainda não publicou o resultado final desta cadeira."
                    : "O registo académico ainda não publicou nenhum resultado final para este ano/semestre."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-navy-900 border-collapse">
                  <thead>
                    <tr className="bg-navy-900 text-white">
                      <th className="p-3 text-center w-12">#</th>
                      {!cadeiraSel && <th className="p-3">Cadeira</th>}
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
                    {pautaVisivel.map((e, idx) => (
                      <tr key={e.id} className={idx % 2 === 1 ? "bg-cream/40" : "bg-white"}>
                        <td className="p-3 text-center font-bold">{idx + 1}</td>
                        {!cadeiraSel && (
                          <td className="p-3 text-navy-900/70">{e.cadeiraNome}</td>
                        )}
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
        </div>
      </div>
    </section>
  );
}
