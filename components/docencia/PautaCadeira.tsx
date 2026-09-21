"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { CursoDocenciaSlug } from "@/lib/docencia";
import type { RegimeCurso } from "@/lib/curriculo";
import { listarPautaCadeira, type NotaEstudante, type ResultadoNota } from "@/lib/notas";
import { listarTurma, type EstudanteTurma } from "@/lib/turma";

type LinhaPauta = {
  numeroEstudante: string;
  apelido: string;
  primeiroNome: string;
  regime: RegimeCurso;
  estudanteId: string | null;
  teste1: string;
  teste2: string;
  trabalho: string;
  exame: string;
  guardando: boolean;
  erro: string | null;
  ok: boolean;
};

/** Separa o último segmento como apelido e o resto como primeiro(s) nome(s). */
function splitNome(nomeCompleto: string): { apelido: string; primeiroNome: string } {
  const partes = nomeCompleto.trim().split(/\s+/);
  if (partes.length === 1) return { apelido: partes[0], primeiroNome: "" };
  return {
    apelido: partes[partes.length - 1],
    primeiroNome: partes.slice(0, -1).join(" "),
  };
}

export type AvaliacaoResultado = {
  mf: number | null;
  mediaFinal: number | null;
  resultado: ResultadoNota;
  podeExame: boolean;
};

/**
 * Calcula a situação académica do estudante segundo o regulamento do ESJ:
 * - 3 notas de frequência (T1 30%, T2 30%, Trabalho 40%)
 * - MF >= 14.0: DISPENSADO (sem exame)
 * - 10.0 <= MF < 14.0: ADMITIDO ao Exame
 * - 7.0 <= MF < 10.0: RECORRÊNCIA
 * - MF < 7.0: EXCLUÍDO
 * - Com Exame: Média Final = 50% MF + 50% Exame (Aprovado se MF >= 10 e Exame >= 10)
 */
export function calcularResultadoPauta(
  t1Str: string,
  t2Str: string,
  trStr: string,
  exStr: string
): AvaliacaoResultado {
  const n1 = t1Str.trim() !== "" ? Number(t1Str) : null;
  const n2 = t2Str.trim() !== "" ? Number(t2Str) : null;
  const n3 = trStr.trim() !== "" ? Number(trStr) : null;
  const nEx = exStr.trim() !== "" ? Number(exStr) : null;

  const hasT1 = n1 !== null && !isNaN(n1) && Number.isFinite(n1);
  const hasT2 = n2 !== null && !isNaN(n2) && Number.isFinite(n2);
  const hasTr = n3 !== null && !isNaN(n3) && Number.isFinite(n3);
  const hasEx = nEx !== null && !isNaN(nEx) && Number.isFinite(nEx);

  if (!hasT1 || !hasT2 || !hasTr) {
    return {
      mf: null,
      mediaFinal: null,
      resultado: "Em Frequência",
      podeExame: false,
    };
  }

  const mf = Math.round(((n1 as number) * 0.3 + (n2 as number) * 0.3 + (n3 as number) * 0.4) * 10) / 10;

  if (mf >= 14.0) {
    return {
      mf,
      mediaFinal: mf,
      resultado: "Dispensado",
      podeExame: false,
    };
  }

  if (mf >= 10.0) {
    if (hasEx) {
      const exVal = nEx as number;
      const mediaFinal = Math.round((mf * 0.5 + exVal * 0.5) * 10) / 10;
      const pass = mediaFinal >= 10.0 && exVal >= 10.0;
      return {
        mf,
        mediaFinal,
        resultado: pass ? "Aprovado" : "Reprovado",
        podeExame: true,
      };
    }
    return {
      mf,
      mediaFinal: mf,
      resultado: "Admitido",
      podeExame: true,
    };
  }

  if (mf >= 7.0) {
    if (hasEx) {
      const exVal = nEx as number;
      const mediaFinal = Math.round((mf * 0.5 + exVal * 0.5) * 10) / 10;
      const pass = mediaFinal >= 10.0 && exVal >= 10.0;
      return {
        mf,
        mediaFinal,
        resultado: pass ? "Aprovado" : "Reprovado",
        podeExame: true,
      };
    }
    return {
      mf,
      mediaFinal: mf,
      resultado: "Recorrência",
      podeExame: true,
    };
  }

  return {
    mf,
    mediaFinal: mf,
    resultado: "Excluído",
    podeExame: false,
  };
}

/** Badge do resultado — partilhado entre a tabela (desktop) e os cartões (telemóvel). */
function badgeResultado(resultado: ResultadoNota) {
  const estilos: Record<ResultadoNota, string> = {
    Dispensado: "bg-leaf/10 text-leaf border-leaf/30",
    Aprovado: "bg-leaf/10 text-leaf border-leaf/30",
    Admitido: "bg-sky/10 text-sky border-sky/30",
    "Recorrência": "bg-amber-500/10 text-amber-600 border-amber-500/30",
    "Em Frequência": "bg-slate-100 text-slate-600 border-transparent",
    Reprovado: "bg-crimson/10 text-crimson border-crimson/30",
    "Excluído": "bg-crimson/10 text-crimson border-crimson/30",
  };
  return (
    <span className={`px-2 py-0.5 font-bold rounded text-[11px] border inline-block ${estilos[resultado]}`}>
      {resultado}
    </span>
  );
}

export default function PautaCadeira({
  curso,
  cadeiraCodigo,
  cadeiraNome,
  ano,
  semestre,
  regime,
}: {
  curso: CursoDocenciaSlug;
  cadeiraCodigo: string;
  cadeiraNome: string;
  ano: number | null;
  semestre: number | null;
  regime: "diurno" | "pos-laboral";
}) {
  const [linhas, setLinhas] = useState<LinhaPauta[] | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregar, setErroCarregar] = useState<string | null>(null);

  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErroCarregar(null);
    setLinhas(null);

    const anoTurma = ano ?? 1;
    Promise.all([
      listarTurma(curso, regime, anoTurma),
      listarPautaCadeira(curso, cadeiraCodigo),
    ])
      .then(([turmaRaw, notas]) => {
        if (cancelado) return;
        const turma: (EstudanteTurma & { regime: RegimeCurso })[] = (turmaRaw ?? []).map((e) => ({
          ...e,
          regime,
        }));
        const porNumero = new Map<string, NotaEstudante>();
        for (const n of notas ?? []) porNumero.set(n.numeroEstudante, n);

        const linhasIniciais: LinhaPauta[] = turma.map((aluno) => {
          const existente = porNumero.get(aluno.numeroEstudante);
          const { apelido, primeiroNome } = splitNome(aluno.nome);
          return {
            numeroEstudante: aluno.numeroEstudante,
            apelido,
            primeiroNome,
            regime: aluno.regime,
            estudanteId: existente?.estudanteId ?? null,
            teste1: existente?.teste1 !== null && existente?.teste1 !== undefined ? String(existente.teste1) : "",
            teste2: existente?.teste2 !== null && existente?.teste2 !== undefined ? String(existente.teste2) : "",
            trabalho: existente?.trabalho !== null && existente?.trabalho !== undefined ? String(existente.trabalho) : "",
            exame: existente?.exameNormal !== null && existente?.exameNormal !== undefined ? String(existente.exameNormal) : "",
            guardando: false,
            erro: null,
            ok: Boolean(existente),
          };
        });

        // Ordenar alfabeticamente por apelido
        linhasIniciais.sort((a, b) =>
          a.apelido.localeCompare(b.apelido, "pt", { sensitivity: "base" })
        );

        setLinhas(linhasIniciais);
      })
      .catch((err) => {
        if (cancelado) return;
        setErroCarregar(err instanceof Error ? err.message : "Não foi possível carregar a turma.");
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [curso, cadeiraCodigo, ano, regime]);

  const guardarLinhaNoServidor = async (linha: LinhaPauta) => {
    setLinhas((prev) =>
      (prev ?? []).map((l) =>
        l.numeroEstudante === linha.numeroEstudante ? { ...l, guardando: true, erro: null } : l
      )
    );

    let estudanteId = linha.estudanteId;
    if (!estudanteId) {
      try {
        const res = await fetch(`/api/estudantes-busca?q=${encodeURIComponent(linha.numeroEstudante)}`);
        const json = await res.json().catch(() => ({}));
        const encontrado = (json.estudantes ?? []).find(
          (e: { numeroEstudante: string | null }) => e.numeroEstudante === linha.numeroEstudante
        );
        if (!encontrado) {
          setLinhas((prev) =>
            (prev ?? []).map((l) =>
              l.numeroEstudante === linha.numeroEstudante
                ? {
                    ...l,
                    guardando: false,
                    erro: "Sem conta registada — não é possível gravar notas deste estudante.",
                    ok: false,
                  }
                : l
            )
          );
          return;
        }
        estudanteId = encontrado.id;
      } catch {
        setLinhas((prev) =>
          (prev ?? []).map((l) =>
            l.numeroEstudante === linha.numeroEstudante
              ? {
                  ...l,
                  guardando: false,
                  erro: "Não foi possível confirmar conta do estudante.",
                  ok: false,
                }
              : l
          )
        );
        return;
      }
    }

    const calc = calcularResultadoPauta(linha.teste1, linha.teste2, linha.trabalho, linha.exame);
    const nomeCompleto = `${linha.primeiroNome} ${linha.apelido}`.trim();

    try {
      const res = await fetch("/api/docencia-notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estudanteId,
          numeroEstudante: linha.numeroEstudante,
          nomeEstudante: nomeCompleto,
          curso,
          cadeiraCodigo,
          cadeiraNome,
          regime,
          ano,
          semestre,
          teste1: linha.teste1 || null,
          teste2: linha.teste2 || null,
          trabalho: linha.trabalho || null,
          exameNormal: linha.exame || null,
          mediaFinal: calc.mediaFinal,
          resultado: calc.resultado,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Não foi possível gravar.");

      setLinhas((prev) =>
        (prev ?? []).map((l) =>
          l.numeroEstudante === linha.numeroEstudante
            ? { ...l, estudanteId, guardando: false, ok: true, erro: null }
            : l
        )
      );
    } catch (err) {
      setLinhas((prev) =>
        (prev ?? []).map((l) =>
          l.numeroEstudante === linha.numeroEstudante
            ? {
                ...l,
                guardando: false,
                ok: false,
                erro: err instanceof Error ? err.message : "Não foi possível gravar.",
              }
            : l
        )
      );
    }
  };

  const actualizarLinhaEGuardar = (numeroEstudante: string, patch: Partial<LinhaPauta>) => {
    setLinhas((prev) => {
      const novalistas = (prev ?? []).map((l) => {
        if (l.numeroEstudante !== numeroEstudante) return l;
        const actualizada = { ...l, ...patch, ok: false };

        // Limpar temporizador anterior para debouncing de autosave
        if (debounceTimers.current[numeroEstudante]) {
          clearTimeout(debounceTimers.current[numeroEstudante]);
        }

        debounceTimers.current[numeroEstudante] = setTimeout(() => {
          void guardarLinhaNoServidor(actualizada);
        }, 600);

        return actualizada;
      });
      return novalistas;
    });
  };

  if (carregando) {
    return <div className="p-8 text-center text-sm text-navy-900/60">A carregar a turma…</div>;
  }

  if (erroCarregar) {
    return (
      <div className="p-8 text-center border border-crimson/30 rounded bg-crimson/5">
        <p className="text-sm font-bold text-crimson flex items-center justify-center gap-1.5">
          <AlertTriangle size={16} /> Não foi possível carregar a turma
        </p>
        <p className="text-xs text-navy-900/60 mt-1">{erroCarregar}</p>
      </div>
    );
  }

  if (!linhas || linhas.length === 0) {
    return (
      <div className="p-8 text-center border border-navy-100 rounded bg-cream/40">
        <p className="text-sm font-bold text-navy-900">Sem turma registada para este regime</p>
        <p className="text-xs text-navy-900/60 mt-1">
          Ainda não há lista de estudantes para {cadeiraNome} neste regime — peça à secretaria para a carregar.
        </p>
      </div>
    );
  }

  const tituloRegime = regime === "diurno" ? "Laboral (Diurno)" : "Pós-Laboral";

  return (
    <div className="bg-white border border-navy-100 rounded-lg shadow-sm overflow-hidden">
      {/* Cabeçalho da pauta */}
      <div className="px-5 py-3 bg-cream/70 border-b border-navy-100 flex items-center gap-3">
        <h4 className="font-serif font-bold text-navy-900">{cadeiraNome}</h4>
        <span className="px-2 py-0.5 bg-sky/10 text-sky text-[11px] font-bold rounded border border-sky/20 uppercase tracking-wide">
          {tituloRegime}
        </span>
        <span className="text-navy-900/50 font-sans font-normal text-xs ml-auto">
          {linhas.length} estudante{linhas.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Cartões (telemóvel/tablet) — mesmos campos e cálculo da tabela; 1
          coluna em telemóvel, 2 em tablet (md). */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-px bg-navy-100">
        {linhas.map((l, idx) => {
          const calc = calcularResultadoPauta(l.teste1, l.teste2, l.trabalho, l.exame);
          const campo = (
            label: string,
            valor: string,
            campoNome: "teste1" | "teste2" | "trabalho" | "exame",
            disabled = false
          ) => (
            <label className="block">
              <span className="block text-[10px] font-bold uppercase tracking-wide text-navy-900/45 mb-1">
                {label}
              </span>
              <input
                type="number"
                min={0}
                max={20}
                step={0.1}
                disabled={disabled}
                value={valor}
                onChange={(e) => actualizarLinhaEGuardar(l.numeroEstudante, { [campoNome]: e.target.value })}
                className={`w-full p-2 text-center rounded text-xs font-semibold focus:outline-none ${
                  disabled
                    ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-white border border-navy-100 focus:border-sky"
                }`}
                placeholder={disabled ? "—" : "0-20"}
              />
            </label>
          );
          return (
            <div
              key={l.numeroEstudante}
              className={`p-4 space-y-3 text-xs ${idx % 2 === 1 ? "bg-slate-100/70" : "bg-white"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono font-bold text-sky text-[13px]">
                    <span className="text-navy-900/40 font-normal">{idx + 1}.</span> {l.numeroEstudante}
                  </p>
                  <p className="font-bold text-navy-900 uppercase tracking-wide">
                    {l.apelido} <span className="font-normal normal-case">{l.primeiroNome}</span>
                  </p>
                </div>
                {badgeResultado(calc.resultado)}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {campo("1º Teste", l.teste1, "teste1")}
                {campo("2º Teste", l.teste2, "teste2")}
                {campo("Trabalho", l.trabalho, "trabalho")}
                {campo("Exame", l.exame, "exame", !calc.podeExame)}
              </div>
              <p className="font-mono font-bold">
                Média:{" "}
                {calc.mediaFinal !== null ? (
                  <span className={calc.mediaFinal >= 10 ? "text-leaf" : "text-crimson"}>
                    {calc.mediaFinal.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-navy-900/30">—</span>
                )}
              </p>
            </div>
          );
        })}
      </div>

      {/* Tabela com cabeçalho fixo – scroll feito pela página */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 z-20">
            <tr className="bg-cream border-b-2 border-navy-100 text-navy-900/70 text-[11px] font-bold uppercase tracking-wider">
              <th className="p-2.5 text-center w-10 whitespace-nowrap">#</th>
              <th className="p-2.5 w-36 whitespace-nowrap">Nº Estudante</th>
              <th className="p-2.5 w-36 whitespace-nowrap">Apelido</th>
              <th className="p-2.5 whitespace-nowrap">Nome</th>
              <th className="p-2.5 text-center w-20 whitespace-nowrap">1º Teste</th>
              <th className="p-2.5 text-center w-20 whitespace-nowrap">2º Teste</th>
              <th className="p-2.5 text-center w-20 whitespace-nowrap">Trabalho</th>
              <th className="p-2.5 text-center w-20 whitespace-nowrap">Exame</th>
              <th className="p-2.5 text-center w-16 whitespace-nowrap">Média</th>
              <th className="p-2.5 text-center w-36 whitespace-nowrap">Resultado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100 text-navy-900">
            {linhas.map((l, idx) => {
              const calc = calcularResultadoPauta(l.teste1, l.teste2, l.trabalho, l.exame);

              return (
                <tr
                  key={l.numeroEstudante}
                  className={`transition-colors hover:bg-sky/5 ${
                    idx % 2 === 1 ? "bg-slate-100/70" : "bg-white"
                  }`}
                >
                  {/* Nº de ordem */}
                  <td className="p-2 text-center font-mono text-navy-900/40 text-[11px] select-none">
                    {idx + 1}
                  </td>
                  {/* Nº de estudante */}
                  <td className="p-2 font-mono font-bold text-sky whitespace-nowrap text-[13px]">
                    {l.numeroEstudante}
                  </td>
                  {/* APELIDO (maiúsculas) */}
                  <td className="p-2 font-bold text-navy-900 whitespace-nowrap uppercase tracking-wide">
                    {l.apelido}
                  </td>
                  {/* Nome */}
                  <td className="p-2 text-navy-900/80 whitespace-nowrap">
                    {l.primeiroNome}
                  </td>

                  {/* 1º Teste */}
                  <td className="p-1.5 text-center">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.1}
                      value={l.teste1}
                      onChange={(e) => actualizarLinhaEGuardar(l.numeroEstudante, { teste1: e.target.value })}
                      className="w-16 p-1.5 text-center bg-white border border-navy-100 rounded text-xs focus:outline-none focus:border-sky font-semibold"
                      placeholder="0-20"
                    />
                  </td>

                  {/* 2º Teste */}
                  <td className="p-1.5 text-center">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.1}
                      value={l.teste2}
                      onChange={(e) => actualizarLinhaEGuardar(l.numeroEstudante, { teste2: e.target.value })}
                      className="w-16 p-1.5 text-center bg-white border border-navy-100 rounded text-xs focus:outline-none focus:border-sky font-semibold"
                      placeholder="0-20"
                    />
                  </td>

                  {/* Trabalho */}
                  <td className="p-1.5 text-center">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.1}
                      value={l.trabalho}
                      onChange={(e) => actualizarLinhaEGuardar(l.numeroEstudante, { trabalho: e.target.value })}
                      className="w-16 p-1.5 text-center bg-white border border-navy-100 rounded text-xs focus:outline-none focus:border-sky font-semibold"
                      placeholder="0-20"
                    />
                  </td>

                  {/* Exame Normal / Recorrência (Ativo se Admitido ou Recorrência) */}
                  <td className="p-1.5 text-center">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.1}
                      disabled={!calc.podeExame}
                      value={l.exame}
                      onChange={(e) => actualizarLinhaEGuardar(l.numeroEstudante, { exame: e.target.value })}
                      className={`w-16 p-1.5 text-center rounded text-xs font-semibold focus:outline-none ${
                        calc.podeExame
                          ? "bg-white border border-sky/50 text-sky focus:border-sky shadow-sm"
                          : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                      placeholder={calc.podeExame ? "0-20" : "—"}
                    />
                  </td>

                  {/* Média Calculada */}
                  <td className="p-2 text-center font-mono font-bold text-xs">
                    {calc.mediaFinal !== null ? (
                      <span className={calc.mediaFinal >= 10 ? "text-leaf font-bold" : "text-crimson font-bold"}>
                        {calc.mediaFinal.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-navy-900/30">—</span>
                    )}
                  </td>

                  {/* Resultado Calculado Automaticamente */}
                  <td className="p-2 text-center whitespace-nowrap">{badgeResultado(calc.resultado)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
