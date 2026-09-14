"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  ANO_LECTIVO,
  NIVEIS,
  REGIME_LABEL,
  REGIMES,
  classificacao,
  cursosDoNivel,
  formatNota,
  mediaFinal,
  type Nivel,
  type Regime,
} from "@/lib/admissao";
import {
  cmsError,
  deletePautaLinha,
  isMissingTable,
  listPautaGestao,
  savePautaLinha,
} from "@/lib/cms";
import SchemaInstall from "@/components/gestao/SchemaInstall";

type Linha = {
  id: string;
  apelido: string;
  nome: string;
  nota_portugues: number | string;
  nota_historia: number | string;
  publicado: boolean;
};

export default function ResultadosPauta({ onAction }: { onAction: (m: string) => void }) {
  const [nivel, setNivel] = useState<Nivel>("Licenciatura");
  const [regime, setRegime] = useState<Regime>("Diurno");
  const [curso, setCurso] = useState("Jornalismo");
  const [items, setItems] = useState<Linha[]>([]);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pagina, setPagina] = useState(1);
  const porPagina = 40;

  const cursos = cursosDoNivel(nivel);
  const totalPaginas = Math.max(1, Math.ceil(items.length / porPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const itemsPagina = items.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);

  const refresh = () => {
    listPautaGestao({
      anoLectivo: ANO_LECTIVO,
      nivel,
      curso,
      regime,
    })
      .then((rows) => {
        setItems(rows);
        setMissing(false);
      })
      .catch((err) => {
        if (isMissingTable(err)) setMissing(true);
        else onAction(cmsError(err));
      });
  };

  useEffect(() => {
    const first = cursos[0]?.nome;
    if (first && !cursos.some((c) => c.nome === curso)) setCurso(first);
  }, [nivel, cursos, curso]);

  useEffect(() => {
    refresh();
    setPagina(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nivel, curso, regime]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const notaPortugues = Number(fd.get("nota_portugues"));
    const notaHistoria = Number(fd.get("nota_historia"));
    setBusy(true);
    try {
      await savePautaLinha({
        anoLectivo: ANO_LECTIVO,
        nivel,
        curso,
        regime,
        apelido: String(fd.get("apelido") || ""),
        nome: String(fd.get("nome") || ""),
        notaPortugues,
        notaHistoria,
        publicado: fd.get("publicado") === "on",
      });
      form.reset();
      refresh();
      onAction("Candidato gravado na pauta.");
    } catch (error) {
      if (isMissingTable(error)) setMissing(true);
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  const remover = async (id: string) => {
    try {
      await deletePautaLinha(id);
      refresh();
      onAction("Linha retirada da pauta.");
    } catch (error) {
      onAction(cmsError(error));
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-white border border-navy-100 p-6 md:p-8">
        <h2 className="font-serif text-2xl font-bold text-navy-900">Pauta de resultados</h2>
        <p className="mt-2 text-sm text-navy-900/65 leading-relaxed">
          Média final = (Português × 50%) + (História × 50%). Admitido se média ≥ 10,00.
          A pauta pública aparece em{" "}
          <Link href="/resultados" className="text-sky hover:underline">
            /resultados
          </Link>
          .
        </p>
        {missing && <SchemaInstall />}
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <label className="block">
            <span className="block text-sm font-bold text-navy-900 mb-1.5">Nível</span>
            <select
              className="esj-field"
              value={nivel}
              onChange={(e) => setNivel(e.target.value as Nivel)}
            >
              {NIVEIS.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-bold text-navy-900 mb-1.5">Regime</span>
            <select
              className="esj-field"
              value={regime}
              onChange={(e) => setRegime(e.target.value as Regime)}
            >
              {REGIMES.map((r) => (
                <option key={r} value={r}>
                  {REGIME_LABEL[r]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-bold text-navy-900 mb-1.5">Curso</span>
            <select className="esj-field" value={curso} onChange={(e) => setCurso(e.target.value)}>
              {cursos.map((c) => (
                <option key={c.slug} value={c.nome}>
                  {c.nome}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-white border border-navy-100 p-6 md:p-8 grid sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end"
      >
        <label className="block lg:col-span-1">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Apelido</span>
          <input name="apelido" required className="esj-field" />
        </label>
        <label className="block lg:col-span-1">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Nome</span>
          <input name="nome" required className="esj-field" />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Português</span>
          <input
            name="nota_portugues"
            type="number"
            min="0"
            max="20"
            step="0.01"
            required
            className="esj-field"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">História</span>
          <input
            name="nota_historia"
            type="number"
            min="0"
            max="20"
            step="0.01"
            required
            className="esj-field"
          />
        </label>
        <label className="flex items-center gap-2 h-11">
          <input type="checkbox" name="publicado" defaultChecked className="accent-leaf" />
          <span className="text-sm font-semibold text-navy-900">Publicar</span>
        </label>
        <button
          type="submit"
          disabled={busy}
          className="bg-leaf hover:bg-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide px-5 py-3.5 transition-colors"
        >
          {busy ? "A GRAVAR…" : "ADICIONAR"}
        </button>
      </form>

      <div className="bg-white border border-navy-100 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-cream text-left text-[11px] font-bold tracking-wide text-navy-900/70">
              <th className="px-4 py-3">Apelido</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3 text-right">Português</th>
              <th className="px-4 py-3 text-right">História</th>
              <th className="px-4 py-3 text-right">Média</th>
              <th className="px-4 py-3">Resultado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-navy-900/50">
                  Ainda sem candidatos nesta pauta.
                </td>
              </tr>
            )}
            {itemsPagina.map((row) => {
              const media = mediaFinal(Number(row.nota_portugues), Number(row.nota_historia));
              const resultado = classificacao(media);
              return (
                <tr key={row.id} className="border-t border-navy-100">
                  <td className="px-4 py-3 font-semibold">{row.apelido}</td>
                  <td className="px-4 py-3">{row.nome}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatNota(Number(row.nota_portugues))}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatNota(Number(row.nota_historia))}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">
                    {formatNota(media)}
                  </td>
                  <td className={`px-4 py-3 font-semibold ${resultado === "Admitido" ? "text-leaf" : "text-crimson"}`}>
                    {resultado}
                    {!row.publicado ? " · rascunho" : ""}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => void remover(row.id)}
                      className="text-xs font-semibold text-crimson hover:underline"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length > 0 && (
          <div className="px-4 py-3 border-t border-navy-100 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-navy-900/50">
              {items.length} candidato{items.length === 1 ? "" : "s"} nesta pauta
            </p>
            {totalPaginas > 1 && (
              <div className="flex items-center gap-1.5">
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
          </div>
        )}
      </div>
    </div>
  );
}
