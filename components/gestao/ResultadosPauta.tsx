"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import {
  ANO_LECTIVO,
  NIVEIS,
  REGIME_LABEL,
  REGIMES,
  classificacao,
  corResultado,
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

type LinhaCompleta = Linha & { ano_lectivo: string; nivel: string; curso: string; regime: string };

export default function ResultadosPauta({ onAction }: { onAction: (m: string) => void }) {
  const [nivel, setNivel] = useState<Nivel>("Licenciatura");
  const [regime, setRegime] = useState<Regime>("Diurno");
  const [curso, setCurso] = useState("Jornalismo");
  const [items, setItems] = useState<LinhaCompleta[]>([]);
  const [missing, setMissing] = useState(false);
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

  /**
   * Publicar/despublicar sem reabrir Candidaturas — mantém todos os outros
   * campos da linha tal como estão, só troca "publicado".
   */
  const alternarPublicado = async (row: LinhaCompleta) => {
    try {
      await savePautaLinha({
        id: row.id,
        anoLectivo: row.ano_lectivo,
        nivel: row.nivel,
        curso: row.curso,
        regime: row.regime,
        apelido: row.apelido,
        nome: row.nome,
        notaPortugues: Number(row.nota_portugues),
        notaHistoria: Number(row.nota_historia),
        publicado: !row.publicado,
      });
      refresh();
      onAction(row.publicado ? "Resultado despublicado." : "Resultado publicado.");
    } catch (error) {
      onAction(cmsError(error));
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
          Média final = (Português × 50%) + (História × 50%). Admitido se média ≥ 10,00. Esta lista é só de
          consulta — os resultados lançam-se em <span className="font-semibold text-navy-900">Candidaturas</span> e
          aparecem aqui e na{" "}
          <Link href="/resultados" className="text-sky hover:underline">
            pauta pública
          </Link>{" "}
          automaticamente, sem nada duplicado à mão.
        </p>
        {missing && <SchemaInstall />}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
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

      {items.length === 0 ? (
        <div className="bg-white border border-navy-100 px-5 py-8 text-center text-navy-900/50 text-xs">
          Ainda não há resultados lançados para este curso/regime — lance-os em Candidaturas.
        </div>
      ) : (
        <div className="lg:hidden bg-navy-100 border border-navy-100 grid grid-cols-1 md:grid-cols-2 gap-px">
          {itemsPagina.map((row, i) => {
            const media = mediaFinal(Number(row.nota_portugues), Number(row.nota_historia));
            const resultado = classificacao(media);
            const ordem = (paginaAtual - 1) * porPagina + i + 1;
            return (
              <div key={row.id} className={`p-3 text-xs space-y-1.5 ${i % 2 === 1 ? "bg-slate-100/70" : "bg-white"}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-navy-900">
                    <span className="text-navy-900/40 font-normal">{ordem}.</span>{" "}
                    <span className="uppercase">{row.apelido}</span> {row.nome}
                  </p>
                  <button
                    type="button"
                    onClick={() => void remover(row.id)}
                    title="Remover"
                    className="shrink-0 text-crimson hover:text-navy-900 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-cream text-navy-900/60">
                    Português: {formatNota(Number(row.nota_portugues))}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cream text-navy-900/60">
                    História: {formatNota(Number(row.nota_historia))}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cream text-navy-900 font-semibold">
                    Média: {formatNota(media)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-semibold ${corResultado(resultado).texto} ${
                      corResultado(resultado).fundo
                    }`}
                  >
                    {resultado}
                  </span>
                  <button
                    type="button"
                    onClick={() => void alternarPublicado(row)}
                    className={`px-2 py-0.5 rounded font-semibold ${
                      row.publicado ? "text-sky bg-sky/10" : "text-navy-900/50 bg-navy-100"
                    }`}
                  >
                    {row.publicado ? "Publicado" : "Rascunho — clique para publicar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="hidden lg:block bg-white border border-navy-100 overflow-x-auto">
        <table className="w-full min-w-[760px] text-xs">
          <thead>
            <tr className="bg-cream text-left text-[11px] font-bold tracking-wide text-navy-900/70">
              <th className="px-3 py-3 w-12 text-center border-r border-navy-100">Ord.</th>
              <th className="px-3 py-3">Apelido</th>
              <th className="px-3 py-3">Nome</th>
              <th className="px-3 py-3 text-center">Português (50%)</th>
              <th className="px-3 py-3 text-center">História (50%)</th>
              <th className="px-3 py-3 text-center">Média final</th>
              <th className="px-3 py-3 text-center">Resultado</th>
              <th className="px-3 py-3 text-center">Publicação</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {itemsPagina.map((row, i) => {
              const media = mediaFinal(Number(row.nota_portugues), Number(row.nota_historia));
              const resultado = classificacao(media);
              const ordem = (paginaAtual - 1) * porPagina + i + 1;
              return (
                <tr
                  key={row.id}
                  className={`border-t border-navy-100 ${i % 2 === 1 ? "bg-cream/60" : ""}`}
                >
                  <td className="px-3 py-1.5 text-center text-xs text-navy-900/50 border-r border-navy-100">
                    {ordem}
                  </td>
                  <td className="px-3 py-1.5 text-[11px] font-semibold text-navy-900 uppercase">
                    {row.apelido}
                  </td>
                  <td className="px-3 py-1.5 text-navy-900">{row.nome}</td>
                  <td className="px-3 py-1.5 text-center tabular-nums">
                    {formatNota(Number(row.nota_portugues))}
                  </td>
                  <td className="px-3 py-1.5 text-center tabular-nums">
                    {formatNota(Number(row.nota_historia))}
                  </td>
                  <td className="px-3 py-1.5 text-center tabular-nums font-semibold text-navy-900">
                    {formatNota(media)}
                  </td>
                  <td
                    className={`px-3 py-1.5 text-center whitespace-nowrap font-semibold ${
                      corResultado(resultado).texto
                    }`}
                  >
                    {resultado}
                  </td>
                  <td className="px-3 py-1.5 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => void alternarPublicado(row)}
                      className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                        row.publicado ? "text-sky bg-sky/10" : "text-navy-900/50 bg-navy-100"
                      }`}
                    >
                      {row.publicado ? "Publicado" : "Rascunho"}
                    </button>
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <button
                      type="button"
                      onClick={() => void remover(row.id)}
                      title="Remover"
                      className="text-crimson hover:text-navy-900 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {items.length > 0 && (
        <div className="bg-white lg:border-x lg:border-b border-navy-100 px-4 py-3 lg:border-t-0 border-t flex flex-wrap items-center justify-between gap-3">
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
  );
}
