"use client";

import { useEffect, useMemo, useState } from "react";
import { BookPlus, Pencil, RotateCcw, Search, Trash2, UserPlus, Users, X } from "lucide-react";
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

type ContaDocente = { id: string; email: string | null; nome: string | null };
type CadeiraAtribuidaRow = { curso: string; cadeira_codigo: string };

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

  // Docentes desta cadeira — mesma lógica recíproca do selector de cadeiras
  // no formulário de docente (ContasDocentes.tsx), mas ao contrário: aqui
  // escolhe-se, para UMA cadeira, quais os docentes que a leccionam.
  const [docentes, setDocentes] = useState<ContaDocente[]>([]);
  const [docentesCadeiras, setDocentesCadeiras] = useState<Record<string, CadeiraAtribuidaRow[]>>({});
  const [docentesSelecionados, setDocentesSelecionados] = useState<Set<string>>(new Set());
  const [buscaDocente, setBuscaDocente] = useState("");
  // Formulário para criar um docente novo sem sair do popup da cadeira —
  // simétrico ao "Nova cadeira" que já existe no formulário de docente.
  const [mostrarFormDocente, setMostrarFormDocente] = useState(false);
  const [novoNomeDocente, setNovoNomeDocente] = useState("");
  const [novoEmailDocente, setNovoEmailDocente] = useState("");
  const [novoPasswordDocente, setNovoPasswordDocente] = useState("");
  const [toastDocente, setToastDocente] = useState<string | null>(null);
  const [toastDocenteErro, setToastDocenteErro] = useState(false);
  // Identidade (curso+código) da cadeira ANTES desta edição — para saber a
  // que atribuições dos docentes ir buscar/substituir. Null ao criar de raiz.
  const [identidadeOriginal, setIdentidadeOriginal] = useState<{ curso: string; codigo: string } | null>(null);

  const carregarTudo = () => {
    listarCadeirasExtras().then(({ extras, tabelaFalta }) => {
      setExtras(extras);
      setExtrasTabelaFalta(tabelaFalta);
    });
    listarCadeirasOverrides().then(({ overrides }) => setOverrides(overrides));
  };

  useEffect(carregarTudo, []);

  const carregarDocentes = () => {
    pedir<{ docentes: ContaDocente[] }>("/api/docencia-contas")
      .then(({ docentes }) => {
        setDocentes(docentes);
        return Promise.all(
          docentes.map((d) =>
            pedir<{ cadeiras: CadeiraAtribuidaRow[] }>(
              `/api/docencia-cadeiras?docenteId=${encodeURIComponent(d.id)}`
            )
              .then((r) => [d.id, r.cadeiras] as const)
              .catch(() => [d.id, []] as const)
          )
        );
      })
      .then((resultados) => {
        if (resultados) setDocentesCadeiras(Object.fromEntries(resultados));
      })
      .catch(() => {
        /* sem permissão/chave de serviço — o selector de docentes fica só sem opções */
      });
  };

  useEffect(carregarDocentes, []);

  const docentesDaCadeira = (curso: string, codigo: string) =>
    new Set(
      docentes.filter((d) => (docentesCadeiras[d.id] ?? []).some((c) => c.curso === curso && c.cadeira_codigo === codigo)).map((d) => d.id)
    );

  const resetFormDocenteNovo = () => {
    setMostrarFormDocente(false);
    setNovoNomeDocente("");
    setNovoEmailDocente("");
    setNovoPasswordDocente("");
    setToastDocente(null);
  };

  const abrirModal = () => {
    setEditando(null);
    setCursoNovo(cursoFiltro !== "todos" ? (cursoFiltro as CursoDocenciaSlug) : CURSOS_DOCENCIA[0].slug);
    setNomeNovo("");
    setCodigoNovo("");
    setAnoNovo("1");
    setSemestreNovo("1");
    setToast(null);
    setIdentidadeOriginal(null);
    setDocentesSelecionados(new Set());
    setBuscaDocente("");
    resetFormDocenteNovo();
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
    setIdentidadeOriginal({ curso: extra.curso, codigo: extra.codigo });
    setDocentesSelecionados(docentesDaCadeira(extra.curso, extra.codigo));
    setBuscaDocente("");
    resetFormDocenteNovo();
    setModalAberto(true);
  };

  const abrirModalEdicaoBase = (curso: CursoDocenciaSlug, cad: CadeiraCatalogo) => {
    setEditando({ tipo: "base", curso, codigoOriginal: cad.codigo });
    setCursoNovo(curso);
    setNomeNovo(cad.nome);
    setCodigoNovo(cad.codigo);
    setIdentidadeOriginal({ curso, codigo: cad.codigo });
    setDocentesSelecionados(docentesDaCadeira(curso, cad.codigo));
    setBuscaDocente("");
    resetFormDocenteNovo();
    setAnoNovo(String(cad.ano));
    setSemestreNovo(String(cad.semestre));
    setToast(null);
    setModalAberto(true);
  };

  /**
   * Depois de a cadeira ficar gravada, aplica a selecção de docentes: para
   * cada docente cuja marcação mudou, vai buscar as SUAS cadeiras actuais
   * (evita pisar o que outra pessoa possa ter alterado entretanto), troca a
   * entrada desta cadeira e grava de novo — a rota /api/docencia-cadeiras
   * substitui sempre o conjunto completo de um docente de cada vez.
   */
  const reconciliarDocentes = async (
    curso: string,
    codigo: string,
    nome: string,
    ano: number,
    semestre: number,
    selecionados: Set<string>,
    listaDocentes: ContaDocente[]
  ) => {
    const antigos = identidadeOriginal ? docentesDaCadeira(identidadeOriginal.curso, identidadeOriginal.codigo) : new Set<string>();
    const afetados = listaDocentes.filter((d) => antigos.has(d.id) !== selecionados.has(d.id));
    if (afetados.length === 0) return;

    await Promise.all(
      afetados.map(async (d) => {
        const atual = await pedir<{ cadeiras: (CadeiraAtribuidaRow & { cadeira_nome: string; ano: number | null; semestre: number | null })[] }>(
          `/api/docencia-cadeiras?docenteId=${encodeURIComponent(d.id)}`
        );
        const semEsta = atual.cadeiras.filter(
          (c) => !(identidadeOriginal && c.curso === identidadeOriginal.curso && c.cadeira_codigo === identidadeOriginal.codigo)
        );
        const cadeiras = selecionados.has(d.id)
          ? [...semEsta, { curso, cadeira_codigo: codigo, cadeira_nome: nome, ano, semestre }]
          : semEsta;
        await pedir("/api/docencia-cadeiras", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            docenteId: d.id,
            docenteEmail: d.email,
            cadeiras: cadeiras.map((c) => ({
              curso: c.curso,
              codigo: c.cadeira_codigo,
              nome: c.cadeira_nome,
              ano: c.ano,
              semestre: c.semestre,
            })),
          }),
        });
      })
    );
  };

  const guardarCadeira = async () => {
    const nome = nomeNovo.trim();
    const codigo = codigoNovo.trim();
    if (!nome || !codigo) {
      setToast("Indique o código e o nome da cadeira.");
      setToastErro(true);
      return;
    }

    // Se o mini-formulário "Novo docente" estiver aberto e com dados, este
    // único botão trata logo da criação da conta antes de gravar a cadeira
    // — não é preciso clicar em dois sítios.
    const novoDocenteEmail = novoEmailDocente.trim();
    const criarDocenteJunto = mostrarFormDocente && (novoDocenteEmail || novoPasswordDocente);
    if (criarDocenteJunto) {
      if (!novoDocenteEmail || !novoDocenteEmail.includes("@")) {
        setToastDocente("Indique um correio válido.");
        setToastDocenteErro(true);
        return;
      }
      if (novoPasswordDocente.length < 6) {
        setToastDocente("A palavra-passe deve ter pelo menos 6 caracteres.");
        setToastDocenteErro(true);
        return;
      }
    }

    setGuardando(true);
    setToast(null);
    try {
      let listaDocentes = docentes;
      let selecaoFinal = docentesSelecionados;

      if (criarDocenteJunto) {
        const nomeDocenteNovo = novoNomeDocente.trim();
        const r = await pedir<{ id?: string; actualizado?: boolean }>("/api/docencia-contas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome: nomeDocenteNovo, email: novoDocenteEmail, password: novoPasswordDocente }),
        });
        if (r.id) {
          if (!listaDocentes.some((d) => d.id === r.id)) {
            listaDocentes = [...listaDocentes, { id: r.id, email: novoDocenteEmail, nome: nomeDocenteNovo || null }];
            setDocentes(listaDocentes);
          }
          selecaoFinal = new Set(selecaoFinal).add(r.id);
          setDocentesSelecionados(selecaoFinal);
        }
        resetFormDocenteNovo();
      }

      const cursoFinal = editando?.tipo === "base" ? editando.curso : cursoNovo;
      const codigoFinal = editando?.tipo === "base" ? editando.codigoOriginal : codigo;
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
      try {
        await reconciliarDocentes(cursoFinal, codigoFinal, nome, Number(anoNovo), Number(semestreNovo), selecaoFinal, listaDocentes);
      } catch (err) {
        setNotice(err instanceof Error ? err.message : "A cadeira ficou gravada, mas não foi possível actualizar os docentes.");
        setNoticeErro(true);
      }
      carregarTudo();
      carregarDocentes();
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
    <>
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
                    <div className="hidden sm:grid grid-cols-[90px_1fr_110px_60px_92px_70px] gap-3 px-3 py-1.5 bg-cream/50 border-b border-navy-100 text-[10px] font-bold uppercase tracking-wider text-navy-900/45">
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
                          className="flex items-start justify-between gap-3 px-3 py-2.5 sm:grid sm:grid-cols-[90px_1fr_110px_60px_92px_70px] sm:items-center sm:py-2 text-xs"
                        >
                          <div className="min-w-0 sm:contents">
                            <span className="font-mono text-navy-900/50 block sm:inline">{cad.codigo}</span>
                            <span className="text-navy-900/70 block sm:inline truncate">{cad.nome}</span>
                            <span className="text-navy-900/40 block sm:inline">{cad.cursoNome}</span>
                            <span className="text-navy-900/40 block sm:inline">{cad.ano}º ano</span>
                            <span className="text-navy-900/40 block sm:inline">{cad.semestre}º semestre</span>
                          </div>
                          <span className="flex items-center justify-end shrink-0">
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
                        <div className="hidden sm:grid grid-cols-[80px_1fr_60px_92px_76px] gap-3 px-3 py-1.5 bg-cream/50 border-b border-navy-100 text-[10px] font-bold uppercase tracking-wider text-navy-900/45">
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
                                className="flex items-start justify-between gap-3 px-3 py-2.5 sm:grid sm:grid-cols-[80px_1fr_60px_92px_76px] sm:items-center sm:py-2 text-xs"
                              >
                                <div className="min-w-0 sm:contents">
                                  <span className="font-mono text-navy-900/50 block sm:inline">{cad.codigo}</span>
                                  <span className="text-navy-900 block sm:inline truncate">{cad.nome}</span>
                                  <span className="text-navy-900/40 block sm:inline">{cad.ano}º ano</span>
                                  <span className="text-navy-900/40 block sm:inline">{cad.semestre}º semestre</span>
                                </div>
                                <span className="flex items-center justify-end gap-1 shrink-0">
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
    </div>

    {/* MODAL: Adicionar/Editar Cadeira — fora do space-y-6, ver nota em ContasDocentes.tsx */}
    {modalAberto && (
        <div className="fixed inset-0 z-[180] bg-black/50 flex items-center justify-center p-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

              <div className="border-t border-navy-100 pt-3">
                <p className="text-xs font-bold text-navy-900 mb-2 flex items-center gap-1.5">
                  <Users size={14} className="text-sky" /> Docentes desta cadeira (opcional)
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-navy-900/40" />
                      <input
                        type="text"
                        value={buscaDocente}
                        onChange={(e) => setBuscaDocente(e.target.value)}
                        placeholder="Pesquisar docente por nome ou correio…"
                        className="w-full border border-navy-100 pl-8 pr-3 h-9 text-xs outline-none focus:border-sky bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setMostrarFormDocente((v) => !v)}
                      className="shrink-0 inline-flex items-center justify-center gap-1.5 h-9 px-3 bg-sky/10 text-sky text-xs font-bold hover:bg-sky/20 transition-colors"
                    >
                      <UserPlus size={14} /> Novo docente
                    </button>
                  </div>

                  {mostrarFormDocente && (
                    <div className="bg-white border border-navy-100 p-3 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-navy-900/45 mb-1">Nome</label>
                          <input
                            type="text"
                            value={novoNomeDocente}
                            onChange={(e) => setNovoNomeDocente(e.target.value)}
                            placeholder="Nome completo"
                            className="w-full border border-navy-100 px-2 h-9 text-xs outline-none focus:border-sky"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-navy-900/45 mb-1">Correio *</label>
                          <input
                            type="email"
                            value={novoEmailDocente}
                            onChange={(e) => setNovoEmailDocente(e.target.value)}
                            placeholder="docente@esj.ac.mz"
                            className="w-full border border-navy-100 px-2 h-9 text-xs outline-none focus:border-sky"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-navy-900/45 mb-1">Palavra-passe *</label>
                          <input
                            type="text"
                            value={novoPasswordDocente}
                            onChange={(e) => setNovoPasswordDocente(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full border border-navy-100 px-2 h-9 text-xs outline-none focus:border-sky"
                          />
                        </div>
                      </div>
                      {toastDocente ? (
                        <p className={`text-xs ${toastDocenteErro ? "text-crimson" : "text-leaf"}`}>{toastDocente}</p>
                      ) : (
                        <p className="text-[11px] text-navy-900/45">
                          A conta é criada e atribuída a esta cadeira ao clicar em "
                          {editando ? "Guardar Alterações" : "Acrescentar Cadeira"}" — não precisa de um botão à
                          parte.
                        </p>
                      )}
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={resetFormDocenteNovo}
                          className="text-xs font-semibold text-navy-900/50 hover:text-navy-900"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {docentes.length === 0 ? (
                    <p className="text-[11px] text-navy-900/45">Ainda não há contas de docente criadas.</p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto space-y-1 bg-white border border-navy-100 p-2">
                      {docentes
                        .filter((d) => {
                          const q = buscaDocente.trim().toLowerCase();
                          if (!q) return true;
                          return (d.nome || "").toLowerCase().includes(q) || (d.email || "").toLowerCase().includes(q);
                        })
                        .map((d) => (
                          <label
                            key={d.id}
                            className="flex items-center gap-2 text-xs text-navy-900 px-2 py-1.5 hover:bg-cream/60 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={docentesSelecionados.has(d.id)}
                              onChange={() =>
                                setDocentesSelecionados((prev) => {
                                  const novo = new Set(prev);
                                  if (novo.has(d.id)) novo.delete(d.id);
                                  else novo.add(d.id);
                                  return novo;
                                })
                              }
                            />
                            <span className="font-semibold">{d.nome || "Sem nome"}</span>
                            <span className="text-navy-900/40 truncate">{d.email}</span>
                          </label>
                        ))}
                    </div>
                  )}
                  {docentesSelecionados.size > 0 && (
                    <p className="text-[11px] font-semibold text-navy-900/60">
                      {docentesSelecionados.size} docente{docentesSelecionados.size === 1 ? "" : "s"} atribuído
                      {docentesSelecionados.size === 1 ? "" : "s"} a esta cadeira.
                    </p>
                  )}
                </div>
              </div>

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
    </>
  );
}
