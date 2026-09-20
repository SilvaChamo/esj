"use client";

import { useEffect, useMemo, useState } from "react";
import { BookPlus, Pencil, RotateCcw, Search, Trash2, X } from "lucide-react";
import { CURSOS_DOCENCIA, type CursoDocenciaSlug } from "@/lib/docencia";
import {
  montarCatalogo,
  cadeirasBaseRemovidas,
  listarCadeirasExtras,
  listarCadeirasOverrides,
  type CadeiraCatalogo,
  type CadeiraExtra,
  type CadeiraOverride,
  type CadeiraRemovida,
} from "@/lib/docencia-cadeiras";

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Não foi possível completar o pedido.");
  return json as T;
}

// Cadeira a editar: "extra" (acrescentada de raiz, tudo editável, tabela
// cadeiras_adicionais) ou "base" (do catálogo estático — só nome/ano/semestre
// são editáveis, o código fica fixo porque é a chave usada em
// docencia_cadeiras/materiais/notas; guardado como correcção em cadeiras_overrides).
type Editando = { tipo: "extra"; id: string } | { tipo: "base"; curso: CursoDocenciaSlug; codigoOriginal: string };

export default function Cadeiras() {
  const [extras, setExtras] = useState<CadeiraExtra[]>([]);
  const [extrasTabelaFalta, setExtrasTabelaFalta] = useState(false);
  const [overrides, setOverrides] = useState<CadeiraOverride[]>([]);
  const catalogo = useMemo(() => montarCatalogo(extras, overrides), [extras, overrides]);

  const [busca, setBusca] = useState("");
  const [cursoFiltro, setCursoFiltro] = useState("todos");
  const [anoFiltro, setAnoFiltro] = useState("todos");
  const [semestreFiltro, setSemestreFiltro] = useState("todos");
  const [verEliminadas, setVerEliminadas] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeErro, setNoticeErro] = useState(false);

  const eliminadas = useMemo(() => cadeirasBaseRemovidas(overrides), [overrides]);

  // Popup "Adicionar/Editar Cadeira"
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Editando | null>(null);
  const [cursoNovo, setCursoNovo] = useState<CursoDocenciaSlug>(CURSOS_DOCENCIA[0].slug);
  const [nomeNovo, setNomeNovo] = useState("");
  const [codigoNovo, setCodigoNovo] = useState("");
  const [anoNovo, setAnoNovo] = useState("1");
  const [semestreNovo, setSemestreNovo] = useState("1");
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastErro, setToastErro] = useState(false);

  const carregarTudo = () => {
    listarCadeirasExtras().then(({ extras, tabelaFalta }) => {
      setExtras(extras);
      setExtrasTabelaFalta(tabelaFalta);
    });
    listarCadeirasOverrides().then(({ overrides }) => setOverrides(overrides));
  };

  useEffect(carregarTudo, []);

  const abrirModal = () => {
    setEditando(null);
    setCursoNovo(cursoFiltro !== "todos" ? (cursoFiltro as CursoDocenciaSlug) : CURSOS_DOCENCIA[0].slug);
    setNomeNovo("");
    setCodigoNovo("");
    setAnoNovo("1");
    setSemestreNovo("1");
    setToast(null);
    setModalAberto(true);
  };

  const abrirModalEdicaoExtra = (extra: CadeiraExtra) => {
    setEditando({ tipo: "extra", id: extra.id });
    setCursoNovo(extra.curso);
    setNomeNovo(extra.nome);
    setCodigoNovo(extra.codigo);
    setAnoNovo(String(extra.ano));
    setSemestreNovo(String(extra.semestre));
    setToast(null);
    setModalAberto(true);
  };

  const abrirModalEdicaoBase = (curso: CursoDocenciaSlug, cad: CadeiraCatalogo) => {
    setEditando({ tipo: "base", curso, codigoOriginal: cad.codigo });
    setCursoNovo(curso);
    setNomeNovo(cad.nome);
    setCodigoNovo(cad.codigo);
    setAnoNovo(String(cad.ano));
    setSemestreNovo(String(cad.semestre));
    setToast(null);
    setModalAberto(true);
  };

  const guardarCadeira = async () => {
    const nome = nomeNovo.trim();
    const codigo = codigoNovo.trim();
    if (!nome || !codigo) {
      setToast("Indique o código e o nome da cadeira.");
      setToastErro(true);
      return;
    }
    setGuardando(true);
    setToast(null);
    try {
      if (editando?.tipo === "base") {
        await pedir("/api/cadeiras-base", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            curso: editando.curso,
            codigo: editando.codigoOriginal,
            nome,
            ano: Number(anoNovo),
            semestre: Number(semestreNovo),
          }),
        });
      } else {
        await pedir("/api/cadeiras-adicionais", {
          method: editando ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(editando ? { id: editando.id } : {}),
            curso: cursoNovo,
            codigo,
            nome,
            ano: Number(anoNovo),
            semestre: Number(semestreNovo),
          }),
        });
      }
      carregarTudo();
      setModalAberto(false);
    } catch (err) {
      setToast(
        err instanceof Error ? err.message : `Não foi possível ${editando ? "guardar" : "acrescentar"} a cadeira.`
      );
      setToastErro(true);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarExtra = async (extra: CadeiraExtra) => {
    if (!window.confirm(`Eliminar a cadeira "${extra.nome}"?`)) return;
    try {
      await pedir(`/api/cadeiras-adicionais?id=${encodeURIComponent(extra.id)}`, { method: "DELETE" });
      carregarTudo();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Não foi possível eliminar a cadeira.");
      setNoticeErro(true);
    }
  };

  const eliminarBase = async (curso: CursoDocenciaSlug, cad: CadeiraCatalogo) => {
    if (
      !window.confirm(
        `Esconder a cadeira "${cad.nome}" do catálogo? Fica fora das listas, mas pode ser reposta mais tarde.`
      )
    )
      return;
    try {
      await pedir(
        `/api/cadeiras-base?curso=${encodeURIComponent(curso)}&codigo=${encodeURIComponent(cad.codigo)}`,
        { method: "DELETE" }
      );
      carregarTudo();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Não foi possível esconder a cadeira.");
      setNoticeErro(true);
    }
  };

  const reporBase = async (cad: CadeiraRemovida) => {
    try {
      await pedir("/api/cadeiras-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curso: cad.curso, codigo: cad.codigo }),
      });
      setNotice(`Cadeira "${cad.nome}" reposta no catálogo.`);
      setNoticeErro(false);
      carregarTudo();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Não foi possível repor a cadeira.");
      setNoticeErro(true);
    }
  };

  const q = busca.trim().toLowerCase();
  const extrasPorChave = new Map(extras.map((e) => [`${e.curso}::${e.codigo}`, e]));

  return (
    <div className="space-y-6">
      {/* Botão oculto para acionamento a partir do cabeçalho do painel */}
      <button id="btn-criar-cadeira-modal" type="button" onClick={abrirModal} className="hidden" />

      <div className="bg-white border border-navy-100">
        <div className="px-6 py-4 border-b border-navy-100 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <h2 className="font-serif text-lg font-bold text-navy-900">Cadeiras</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-navy-900/40" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar cadeira por nome ou código…"
                className="w-full border border-navy-100 pl-8 pr-3 h-9 text-xs outline-none focus:border-sky bg-white"
              />
            </div>
            <select
              value={cursoFiltro}
              onChange={(e) => setCursoFiltro(e.target.value)}
              className="border border-navy-100 px-3 h-9 text-xs outline-none focus:border-sky bg-white sm:w-56"
            >
              <option value="todos">Todos os cursos</option>
              {CURSOS_DOCENCIA.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.titulo}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setVerEliminadas((v) => !v)}
              title={verEliminadas ? "Ver cadeiras do catálogo" : "Ver cadeiras eliminadas"}
              className={`shrink-0 inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-bold border transition-colors ${
                verEliminadas
                  ? "bg-crimson/10 border-crimson/30 text-crimson"
                  : "border-navy-100 text-navy-900/50 hover:text-crimson hover:border-crimson/30"
              }`}
            >
              <Trash2 size={14} />
              {eliminadas.length > 0 && <span>{eliminadas.length}</span>}
            </button>
            <select
              value={anoFiltro}
              onChange={(e) => setAnoFiltro(e.target.value)}
              className="border border-navy-100 px-3 h-9 text-xs outline-none focus:border-sky bg-white sm:w-28"
            >
              <option value="todos">Todos os anos</option>
              {[1, 2, 3, 4].map((a) => (
                <option key={a} value={a}>
                  {a}º ano
                </option>
              ))}
            </select>
            <select
              value={semestreFiltro}
              onChange={(e) => setSemestreFiltro(e.target.value)}
              className="border border-navy-100 px-3 h-9 text-xs outline-none focus:border-sky bg-white sm:w-36"
            >
              <option value="todos">Todos os semestres</option>
              {[1, 2].map((s) => (
                <option key={s} value={s}>
                  {s}º semestre
                </option>
              ))}
            </select>
          </div>
        </div>

        {notice && (
          <p className={`mx-6 mt-4 text-xs font-semibold ${noticeErro ? "text-crimson" : "text-leaf"}`}>{notice}</p>
        )}

        {extrasTabelaFalta && (
          <div className="mx-6 mt-4 border border-amber-300 bg-amber-50 p-3 text-xs text-navy-900/80">
            A tabela <code className="font-mono">cadeiras_adicionais</code> ainda não existe no Supabase —
            corra <code className="font-mono">supabase/cadeiras-adicionais.sql</code>. Até lá, só vê o catálogo
            base dos cursos.
          </div>
        )}

        <div className="p-6 space-y-6">
          {verEliminadas
            ? (() => {
                const lista = eliminadas
                  .filter((c) => cursoFiltro === "todos" || c.curso === cursoFiltro)
                  .filter((c) => anoFiltro === "todos" || String(c.ano) === anoFiltro)
                  .filter((c) => semestreFiltro === "todos" || String(c.semestre) === semestreFiltro)
                  .filter((c) => !q || c.nome.toLowerCase().includes(q) || c.codigo.toLowerCase().includes(q))
                  .sort((a, b) => a.cursoNome.localeCompare(b.cursoNome, "pt") || a.nome.localeCompare(b.nome, "pt"));
                if (lista.length === 0) {
                  return <p className="text-xs text-navy-900/45 italic">Sem cadeiras eliminadas.</p>;
                }
                return (
                  <div className="border border-navy-100">
                    <div className="grid grid-cols-[90px_1fr_110px_60px_92px_70px] gap-3 px-3 py-1.5 bg-cream/50 border-b border-navy-100 text-[10px] font-bold uppercase tracking-wider text-navy-900/45">
                      <span>Código</span>
                      <span>Nome</span>
                      <span>Curso</span>
                      <span>Ano</span>
                      <span>Semestre</span>
                      <span className="text-right">Gestão</span>
                    </div>
                    <div className="divide-y divide-navy-100">
                      {lista.map((cad) => (
                        <div
                          key={`${cad.curso}::${cad.codigo}`}
                          className="grid grid-cols-[90px_1fr_110px_60px_92px_70px] gap-3 items-center px-3 py-2 text-xs"
                        >
                          <span className="font-mono text-navy-900/50">{cad.codigo}</span>
                          <span className="text-navy-900/70">{cad.nome}</span>
                          <span className="text-navy-900/40">{cad.cursoNome}</span>
                          <span className="text-navy-900/40">{cad.ano}º ano</span>
                          <span className="text-navy-900/40">{cad.semestre}º semestre</span>
                          <span className="flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => void reporBase(cad)}
                              title="Repor cadeira no catálogo"
                              aria-label={`Repor ${cad.nome}`}
                              className="shrink-0 inline-flex items-center gap-1 p-1.5 text-navy-900/40 hover:text-leaf transition-colors"
                            >
                              <RotateCcw size={13} />
                            </button>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()
            : catalogo
                .filter((grupo) => cursoFiltro === "todos" || grupo.curso === cursoFiltro)
                .map((grupo) => {
                  const cadeiras = grupo.cadeiras
                    .filter((c) => !q || c.nome.toLowerCase().includes(q) || c.codigo.toLowerCase().includes(q))
                    .filter((c) => anoFiltro === "todos" || String(c.ano) === anoFiltro)
                    .filter((c) => semestreFiltro === "todos" || String(c.semestre) === semestreFiltro)
                    .sort((a, b) => a.ano - b.ano || a.semestre - b.semestre || a.nome.localeCompare(b.nome, "pt"));
                  if (cadeiras.length === 0) return null;
                  return (
                    <div key={grupo.curso}>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-sky mb-2">
                        {grupo.cursoNome}{" "}
                        <span className="text-navy-900/40 normal-case font-semibold">({cadeiras.length})</span>
                      </p>
                      <div className="border border-navy-100">
                        <div className="grid grid-cols-[80px_1fr_60px_92px_76px] gap-3 px-3 py-1.5 bg-cream/50 border-b border-navy-100 text-[10px] font-bold uppercase tracking-wider text-navy-900/45">
                          <span>Código</span>
                          <span>Nome</span>
                          <span>Ano</span>
                          <span>Semestre</span>
                          <span className="text-right">Gestão</span>
                        </div>
                        <div className="divide-y divide-navy-100">
                          {cadeiras.map((cad) => {
                            const extra = extrasPorChave.get(`${grupo.curso}::${cad.codigo}`);
                            return (
                              <div
                                key={cad.id}
                                className="grid grid-cols-[80px_1fr_60px_92px_76px] gap-3 items-center px-3 py-2 text-xs"
                              >
                                <span className="font-mono text-navy-900/50">{cad.codigo}</span>
                                <span className="text-navy-900">{cad.nome}</span>
                                <span className="text-navy-900/40">{cad.ano}º ano</span>
                                <span className="text-navy-900/40">{cad.semestre}º semestre</span>
                                <span className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      extra ? abrirModalEdicaoExtra(extra) : abrirModalEdicaoBase(grupo.curso, cad)
                                    }
                                    title="Editar cadeira"
                                    aria-label={`Editar ${cad.nome}`}
                                    className="shrink-0 p-1.5 text-navy-900/40 hover:text-sky transition-colors"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void (extra ? eliminarExtra(extra) : eliminarBase(grupo.curso, cad))}
                                    title={extra ? "Eliminar cadeira" : "Esconder cadeira"}
                                    aria-label={`${extra ? "Eliminar" : "Esconder"} ${cad.nome}`}
                                    className="shrink-0 p-1.5 text-navy-900/40 hover:text-crimson transition-colors"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
        </div>
      </div>

      {/* MODAL: Adicionar/Editar Cadeira */}
      {modalAberto && (
        <div className="fixed inset-0 z-[250] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-navy-100 w-full max-w-xl p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <h3 className="font-serif font-bold text-navy-900 text-base flex items-center gap-2">
                {editando ? <Pencil size={18} className="text-sky" /> : <BookPlus size={18} className="text-sky" />}
                {editando ? "Editar Cadeira" : "Adicionar Cadeira"}
              </h3>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="text-navy-900/50 hover:text-navy-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Curso *</label>
                <select
                  value={cursoNovo}
                  disabled={editando?.tipo === "base"}
                  onChange={(e) => setCursoNovo(e.target.value as CursoDocenciaSlug)}
                  className="w-full p-2.5 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 focus:outline-none focus:border-sky disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {CURSOS_DOCENCIA.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.titulo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Nome da cadeira *</label>
                <input
                  type="text"
                  value={nomeNovo}
                  onChange={(e) => setNomeNovo(e.target.value)}
                  placeholder="Ex.: Ética e Deontologia Profissional"
                  className="w-full p-2.5 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 focus:outline-none focus:border-sky"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Código *</label>
                  <input
                    type="text"
                    value={codigoNovo}
                    disabled={editando?.tipo === "base"}
                    onChange={(e) => setCodigoNovo(e.target.value)}
                    placeholder="Ex.: BD131"
                    className="w-full p-2.5 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 focus:outline-none focus:border-sky disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Ano</label>
                  <select
                    value={anoNovo}
                    onChange={(e) => setAnoNovo(e.target.value)}
                    className="w-full p-2.5 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 focus:outline-none focus:border-sky"
                  >
                    {[1, 2, 3, 4].map((a) => (
                      <option key={a} value={a}>
                        {a}º ano
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Semestre</label>
                  <select
                    value={semestreNovo}
                    onChange={(e) => setSemestreNovo(e.target.value)}
                    className="w-full p-2.5 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 focus:outline-none focus:border-sky"
                  >
                    {[1, 2].map((s) => (
                      <option key={s} value={s}>
                        {s}º semestre
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {editando?.tipo === "base" && (
                <p className="text-[11px] text-navy-900/45">
                  Curso e código são fixos nesta cadeira — fazem parte do plano curricular e identificam-na noutras
                  partes do sistema (atribuições, materiais, notas).
                </p>
              )}

              {toast && (
                <p className={`text-xs font-semibold ${toastErro ? "text-crimson" : "text-leaf"}`}>{toast}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-navy-100">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-3 py-2 border border-navy-100 text-xs font-semibold rounded text-navy-900/70 hover:bg-cream"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => void guardarCadeira()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-crimson text-white text-xs font-bold rounded shadow-sm disabled:opacity-60 transition-colors"
                >
                  {editando ? <Pencil size={14} /> : <BookPlus size={14} />}
                  {guardando
                    ? editando
                      ? "A guardar…"
                      : "A acrescentar…"
                    : editando
                    ? "Guardar Alterações"
                    : "Acrescentar Cadeira"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
