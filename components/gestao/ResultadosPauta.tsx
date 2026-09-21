"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import {
  ANO_LECTIVO,
  CURSOS_POR_NIVEL,
  NIVEIS,
  REGIME_LABEL,
  REGIMES,
  classificacao,
  corResultado,
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
  listTurmaLigadaACandidaturas,
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
  candidatura_protocolo?: string | null;
};

type LinhaCompleta = Linha & { ano_lectivo: string; nivel: string; curso: string; regime: string };

/** Todos os cursos de todos os níveis, sem repetir pelo nome — usado quando o filtro de nível está em "todos". */
const TODOS_OS_CURSOS = Array.from(
  new Map(Object.values(CURSOS_POR_NIVEL).flat().map((c) => [c.nome, c])).values()
);

export default function ResultadosPauta({ onAction }: { onAction: (m: string) => void }) {
  const [nivel, setNivel] = useState<Nivel | "todos">("todos");
  const [regime, setRegime] = useState<Regime | "todos">("todos");
  const [curso, setCurso] = useState("todos");
  const [items, setItems] = useState<LinhaCompleta[]>([]);
  const [missing, setMissing] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [numeroPorProtocolo, setNumeroPorProtocolo] = useState<Record<string, string>>({});
  const porPagina = 40;

  const cursos = nivel === "todos" ? TODOS_OS_CURSOS : CURSOS_POR_NIVEL[nivel];

  // Pauta interna = só admitidos, para acompanhar quem vai mesmo entrar —
  // reprovados/suplentes geram-se e repescam-se em Candidaturas, não aqui.
  // A pauta pública (/resultados) é que mostra todos, tal como vêm da
  // candidatura.
  const aprovados = items.filter(
    (row) => classificacao(mediaFinal(Number(row.nota_portugues), Number(row.nota_historia))) === "Admitido"
  );
  const totalPaginas = Math.max(1, Math.ceil(aprovados.length / porPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const itemsPagina = aprovados.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);

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
    // Nº de estudante — só existe depois de "Criar conta"/repescagem em
    // Candidaturas (turma_estudantes), por isso vem à parte da pauta e
    // liga-se pelo mesmo candidatura_protocolo.
    listTurmaLigadaACandidaturas()
      .then((rows) => {
        const mapa: Record<string, string> = {};
        for (const r of rows) {
          if (r.candidatura_protocolo) mapa[r.candidatura_protocolo] = r.numero_estudante;
        }
        setNumeroPorProtocolo(mapa);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (nivel !== "todos" && curso !== "todos" && !CURSOS_POR_NIVEL[nivel].some((c) => c.nome === curso)) {
      setCurso("todos");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nivel]);

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
      <div className="gestao-list-card">
        <div className="gestao-list-header flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <h2 className="flex flex-wrap items-center gap-3">
            Pauta de resultados — admitidos
          </h2>
          <span>
            {aprovados.length} admitido{aprovados.length === 1 ? "" : "s"}
          </span>
        </div>
        <p className="px-4 py-2 text-xs text-navy-900/65 border-b border-navy-100">
          Só consulta — os resultados lançam-se em Candidaturas.{" "}
          <Link href="/resultados" className="text-sky hover:underline">
            Ver a pauta pública
          </Link>
        </p>
        {missing && <SchemaInstall />}
        <div className="p-4 grid md:grid-cols-3 gap-3">
          <label className="block">
            <span className="block text-xs font-bold text-navy-900 mb-1">Nível</span>
            <select
              className="esj-field"
              value={nivel}
              onChange={(e) => setNivel(e.target.value as Nivel | "todos")}
            >
              <option value="todos">Todos os níveis</option>
              {NIVEIS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-navy-900 mb-1">Regime</span>
            <select
              className="esj-field"
              value={regime}
              onChange={(e) => setRegime(e.target.value as Regime | "todos")}
            >
              <option value="todos">Todos os regimes</option>
              {REGIMES.map((r) => (
                <option key={r} value={r}>
                  {REGIME_LABEL[r]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-navy-900 mb-1">Curso</span>
            <select className="esj-field" value={curso} onChange={(e) => setCurso(e.target.value)}>
              <option value="todos">Todos os cursos</option>
              {cursos.map((c) => (
                <option key={c.slug} value={c.nome}>
                  {c.nome}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {aprovados.length === 0 ? (
        <div className="bg-white border border-navy-100 px-5 py-8 text-center text-navy-900/50 text-xs">
          Ainda não há admitidos com este filtro — lance resultados em Candidaturas.
        </div>
      ) : (
        <>
          {/* < lg: cartões — 1 coluna em telemóvel, 2 em tablet (md), mesmo padrão da lista de candidaturas. */}
          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-px bg-navy-100">
            {itemsPagina.map((row, i) => {
              const media = mediaFinal(Number(row.nota_portugues), Number(row.nota_historia));
              const resultado = classificacao(media);
              const ordem = (paginaAtual - 1) * porPagina + i + 1;
              return (
                <div key={row.id} className={`p-3 text-xs space-y-1.5 ${i % 2 === 1 ? "bg-slate-100/70" : "bg-white"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-navy-900">
                      <span className="text-navy-900/40 font-normal">{ordem}.</span>{" "}
                      {row.candidatura_protocolo && numeroPorProtocolo[row.candidatura_protocolo] && (
                        <span className="font-mono font-bold text-sky">
                          {numeroPorProtocolo[row.candidatura_protocolo]}{" "}
                        </span>
                      )}
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

          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-cream/70 border-b border-navy-100 text-[11px] font-bold uppercase tracking-wider text-navy-900/70">
                  <th className="px-2 py-2.5 whitespace-nowrap w-10 text-center border-r border-navy-100/60">Ord.</th>
                  <th className="px-2 py-2.5 whitespace-nowrap border-r border-navy-100/60">Nº Estudante</th>
                  <th className="px-2 py-2.5 whitespace-nowrap border-r border-navy-100/60">Apelido</th>
                  <th className="px-2 py-2.5 whitespace-nowrap border-r border-navy-100/60">Nome</th>
                  <th className="px-3 py-2.5 text-center">Português (50%)</th>
                  <th className="px-3 py-2.5 text-center">História (50%)</th>
                  <th className="px-3 py-2.5 text-center">Média final</th>
                  <th className="px-3 py-2.5 text-center">Resultado</th>
                  <th className="px-3 py-2.5 text-center">Publicação</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {itemsPagina.map((row, i) => {
                  const media = mediaFinal(Number(row.nota_portugues), Number(row.nota_historia));
                  const resultado = classificacao(media);
                  const ordem = (paginaAtual - 1) * porPagina + i + 1;
                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors ${
                        i % 2 === 1 ? "bg-slate-100/70 hover:bg-sky/5" : "bg-white hover:bg-sky/5"
                      }`}
                    >
                      <td className="px-2 py-2 text-center text-navy-900/50 font-mono border-r border-navy-100/60">
                        {ordem}
                      </td>
                      <td className="px-2 py-2 font-mono font-bold text-sky whitespace-nowrap border-r border-navy-100/60">
                        {(row.candidatura_protocolo && numeroPorProtocolo[row.candidatura_protocolo]) || "—"}
                      </td>
                      <td className="px-2 py-2 text-[11px] font-semibold text-navy-900 uppercase border-r border-navy-100/60">
                        {row.apelido}
                      </td>
                      <td className="px-2 py-2 text-navy-900 border-r border-navy-100/60">{row.nome}</td>
                      <td className="px-3 py-2 text-center tabular-nums">
                        {formatNota(Number(row.nota_portugues))}
                      </td>
                      <td className="px-3 py-2 text-center tabular-nums">
                        {formatNota(Number(row.nota_historia))}
                      </td>
                      <td className="px-3 py-2 text-center tabular-nums font-semibold text-navy-900">
                        {formatNota(media)}
                      </td>
                      <td
                        className={`px-3 py-2 text-center whitespace-nowrap font-semibold ${
                          corResultado(resultado).texto
                        }`}
                      >
                        {resultado}
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
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
                      <td className="px-3 py-2 text-right">
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
        </>
      )}
      {aprovados.length > 0 && (
        <div className="bg-white lg:border-x lg:border-b border-navy-100 px-4 py-3 lg:border-t-0 border-t flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-navy-900/50">
            {aprovados.length} admitido{aprovados.length === 1 ? "" : "s"} nesta pauta
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
