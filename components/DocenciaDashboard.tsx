"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Eye,
  FileText,
  Folder,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { eSuperAdmin, nomeDeUser } from "@/lib/gestao-auth";
import {
  CURSOS_DOCENCIA,
  TIPOS_MATERIAL_DOCENCIA,
  adicionarMaterialDocencia,
  agruparPorCadeira,
  cmsError,
  eliminarMaterialDocencia,
  isMissingTable,
  labelTipoMaterial,
  listMateriaisDocencia,
  type CursoDocenciaSlug,
  type MaterialDocencia,
  type TipoMaterialDocencia,
} from "@/lib/docencia";
import SchemaInstall from "@/components/gestao/SchemaInstall";
import LeitorDocumento from "@/components/LeitorDocumento";

type Section = "materiais" | "partilhar" | "gerir";
type Acesso = "a-verificar" | "negado" | "permitido";

export default function DocenciaDashboard({
  initialSection = "materiais",
}: {
  initialSection?: Section;
}) {
  const [section, setSection] = useState<Section>(initialSection);
  const [acesso, setAcesso] = useState<Acesso>("a-verificar");
  const [autor, setAutor] = useState<string | null>(null);
  const [autorId, setAutorId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [menuMateriaisAberto, setMenuMateriaisAberto] = useState(true);

  // Lista de materiais
  const [materiais, setMateriais] = useState<MaterialDocencia[] | null>(null);
  const [needsSchema, setNeedsSchema] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filtros de materiais
  const [curso, setCurso] = useState<CursoDocenciaSlug>(CURSOS_DOCENCIA[0].slug);
  const [termoBusca, setTermoBusca] = useState("");
  const [ler, setLer] = useState<MaterialDocencia | null>(null);

  // Formulário de partilha
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [cadeiraForm, setCadeiraForm] = useState("");
  const [tipoForm, setTipoForm] = useState<TipoMaterialDocencia>("pauta");
  const [tituloForm, setTituloForm] = useState("");
  const [ficheiroForm, setFicheiroForm] = useState<File | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    void supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (user) {
        setAcesso("permitido");
        setUserEmail(user.email ?? null);
        setAutor(eSuperAdmin(user) ? "Administrador" : nomeDeUser(user));
        setAutorId(user.id);
      } else {
        // Permitir visualização como visitante/docente em teste
        setAcesso("permitido");
        setUserEmail("docente@esj.ac.mz");
        setAutor("Docente ESJ");
      }
    });
  }, []);

  const carregarMateriais = () => {
    setLoading(true);
    listMateriaisDocencia()
      .then((rows) => {
        setNeedsSchema(rows === null);
        setMateriais(rows ?? []);
      })
      .catch((err) => {
        setToast(cmsError(err));
        setMateriais([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (acesso === "permitido") {
      carregarMateriais();
    }
  }, [acesso]);

  // Lock scroll quando modal de leitura está aberto
  useEffect(() => {
    if (!ler) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [ler]);

  const materiaisFiltrados = useMemo(() => {
    const lista = (materiais ?? []).filter((m) => m.curso === curso);
    if (!termoBusca.trim()) return lista;
    const q = termoBusca.toLowerCase();
    return lista.filter(
      (m) =>
        m.titulo.toLowerCase().includes(q) ||
        m.cadeira.toLowerCase().includes(q) ||
        (m.autor && m.autor.toLowerCase().includes(q))
    );
  }, [materiais, curso, termoBusca]);

  const cadeiras = useMemo(
    () => agruparPorCadeira(materiaisFiltrados),
    [materiaisFiltrados]
  );

  const submeterPartilha = async (e: FormEvent) => {
    e.preventDefault();
    setToast(null);
    if (!ficheiroForm) {
      setToast("Por favor selecione um ficheiro.");
      return;
    }
    if (!cadeiraForm.trim() || !tituloForm.trim()) {
      setToast("Preencha a cadeira e o título do material.");
      return;
    }
    setBusy(true);
    try {
      await adicionarMaterialDocencia({
        curso,
        cadeira: cadeiraForm.trim(),
        tipo: tipoForm,
        titulo: tituloForm.trim(),
        ficheiro: ficheiroForm,
        autor: autor || "Docente ESJ",
        autorId,
      });
      setCadeiraForm("");
      setTituloForm("");
      setFicheiroForm(null);
      setToast("Material publicado com sucesso!");
      carregarMateriais();
      setSection("materiais");
    } catch (err) {
      if (isMissingTable(err)) {
        setNeedsSchema(true);
      } else {
        setToast(cmsError(err));
      }
    } finally {
      setBusy(false);
    }
  };

  const eliminarMaterial = async (m: MaterialDocencia) => {
    if (!window.confirm(`Tem a certeza que deseja eliminar «${m.titulo}»?`)) return;
    try {
      await eliminarMaterialDocencia(m.id);
      setToast("Material eliminado.");
      carregarMateriais();
    } catch (err) {
      setToast(cmsError(err));
    }
  };

  const sair = async () => {
    try {
      const supabase = createBrowserSupabase();
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    window.location.href = "/";
  };

  if (acesso === "a-verificar") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <p className="text-sm font-semibold text-navy-900/60">A carregar o Painel do Docente…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col lg:flex-row">
      {/* Cabeçalho Mobile */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-navy-900 border-b border-white/10 z-[80] flex items-center justify-between px-4">
        <span className="flex items-center gap-2.5 overflow-hidden">
          <Image
            src="/esj-logo-mark.png"
            alt="ESJ"
            width={32}
            height={32}
            className="h-8 w-8 object-contain rounded-sm shrink-0"
          />
          <span className="font-serif font-bold text-white text-sm truncate">
            Painel do Docente
          </span>
        </span>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          className="p-2 text-white/80 hover:text-white"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-[70]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar de Administração para Docentes */}
      <aside
        className={`fixed inset-y-0 left-0 z-[80] lg:z-30 lg:static bg-navy-900 text-white shrink-0 flex flex-col transition-all duration-300 transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } ${isSidebarCollapsed ? "lg:w-[76px]" : "lg:w-[260px]"} w-[260px]`}
      >
        {/* Topo da Sidebar */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <Image
            src="/esj-logo-mark.png"
            alt="ESJ Logo"
            width={38}
            height={38}
            className="h-9 w-9 object-contain rounded-sm shrink-0"
          />
          {!isSidebarCollapsed && (
            <div className="min-w-0 overflow-hidden">
              <h1 className="font-serif font-bold text-white text-base leading-tight truncate">
                Painel do Docente
              </h1>
              <p className="text-[11px] text-white/50 truncate">Gestão de Materiais ESJ</p>
            </div>
          )}
        </div>

        {/* Navegação principal */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {/* MENU PAI: Materiais Académicos com Submenus de Cursos */}
          <div>
            <button
              type="button"
              onClick={() => setMenuMateriaisAberto((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-3 text-sm font-semibold rounded-lg text-white/80 hover:bg-white/5 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <BookOpen size={20} className="shrink-0 text-sky" />
                {!isSidebarCollapsed && <span>Materiais Académicos</span>}
              </div>
              {!isSidebarCollapsed &&
                (menuMateriaisAberto ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            </button>

            {menuMateriaisAberto && !isSidebarCollapsed && (
              <div className="ml-4 pl-3 border-l border-white/15 space-y-1 mt-1">
                {CURSOS_DOCENCIA.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => {
                      setCurso(c.slug);
                      setSection("materiais");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2 px-3 text-xs font-semibold rounded transition-colors ${
                      curso === c.slug && section === "materiais"
                        ? "bg-sky/20 text-sky-300 font-bold"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {c.titulo}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setSection("partilhar");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-lg transition-colors text-left ${section === "partilhar"
                ? "bg-sky/15 text-sky-300 border-l-4 border-sky-300"
                : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
          >
            <Upload size={20} className="shrink-0" />
            {!isSidebarCollapsed && <span>Publicar Ficheiro</span>}
          </button>

          <button
            type="button"
            onClick={() => {
              setSection("gerir");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-lg transition-colors text-left ${section === "gerir"
                ? "bg-sky/15 text-sky-300 border-l-4 border-sky-300"
                : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
          >
            <Folder size={20} className="shrink-0" />
            {!isSidebarCollapsed && <span>Gerir Ficheiros</span>}
          </button>
        </nav>

        {/* Rodapé da Sidebar (Utilizador com botão de expandir / colapsar) */}
        <div className="p-4 border-t border-white/10 bg-black/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-full bg-sky flex items-center justify-center text-navy-900 font-bold text-xs shrink-0">
              {autor ? autor[0].toUpperCase() : "D"}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{autor || "Docente ESJ"}</p>
                <p className="text-[10px] text-white/50 truncate">{userEmail || "Docência"}</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((v) => !v)}
            title={isSidebarCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
            className="hidden lg:flex p-2 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors shrink-0"
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal do Dashboard */}
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        {/* Barra superior de navegação interna */}
        <header className="bg-white border-b border-navy-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif font-bold text-xl text-navy-900 leading-tight">
              {section === "materiais" && `Materiais Académicos — ${CURSOS_DOCENCIA.find((c) => c.slug === curso)?.titulo || "Todos os Cursos"}`}
              {section === "partilhar" && "Publicar Novo Material de Ensino"}
              {section === "gerir" && "Gestão e Remoção de Ficheiros"}
            </h2>
            <span className="text-[11px] font-bold tracking-widest text-sky uppercase mt-0.5 block">
              Docência · ESJ
            </span>
          </div>

          <div className="flex items-center gap-3">
            {section !== "partilhar" && (
              <button
                type="button"
                onClick={() => setSection("partilhar")}
                className="inline-flex items-center gap-2 bg-leaf hover:bg-crimson text-white text-xs font-bold px-4 py-2.5 rounded transition-colors shadow-sm"
              >
                <Plus size={16} />
                <span>Publicar Material</span>
              </button>
            )}
            <button
              type="button"
              onClick={sair}
              className="inline-flex items-center gap-1.5 border border-red-200 hover:border-red-400 hover:bg-red-50 text-red-700 text-xs font-bold px-3 py-2.5 rounded transition-colors"
            >
              <LogOut size={14} />
              <span>Sair</span>
            </button>
          </div>
        </header>

        {/* Notificações Toast */}
        {toast && (
          <div className="mx-6 mt-4 p-4 bg-sky/10 border border-sky/30 rounded text-xs font-semibold text-navy-900 flex items-center justify-between gap-4">
            <span>{toast}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-navy-900/60 hover:text-navy-900"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Instalação do Schema Supabase se necessário */}
        {needsSchema && (
          <div className="p-6 md:p-8">
            <SchemaInstall
              sqlPath="/docencia.sql"
              titulo="Criar a tabela de Docência no Supabase"
              descricao="A secção de Docência requer a tabela de materiais no banco de dados."
              onVerificar={carregarMateriais}
            />
          </div>
        )}

        {/* SECÇÃO: MATERIAIS ACADÉMICOS */}
        {section === "materiais" && (
          <div className="p-6 md:p-8 space-y-6">

            {/* Barra de Pesquisa */}
            <div className="relative max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-900/40"
              />
              <input
                type="text"
                placeholder="Pesquisar por cadeira, título ou docente…"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:outline-none focus:border-sky transition-colors"
              />
            </div>

            {/* Conteúdo por Cadeira */}
            {loading ? (
              <div className="bg-white border border-navy-100 p-8 text-center text-sm text-navy-900/60">
                A carregar…
              </div>
            ) : cadeiras.length === 0 ? (
              <div className="bg-white border border-navy-100 p-12 text-center">
                <p className="text-base font-serif font-bold text-navy-900">
                  Nenhum material encontrado
                </p>
                <p className="mt-1 text-sm text-navy-900/60">
                  Ainda não há materiais partilhados para este curso ou pesquisa.
                </p>
                <button
                  type="button"
                  onClick={() => setSection("partilhar")}
                  className="mt-4 inline-flex items-center gap-2 bg-leaf hover:bg-crimson text-white text-xs font-bold px-4 py-2.5 rounded transition-colors"
                >
                  <Plus size={16} />
                  <span>Publicar o Primeiro Ficheiro</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {cadeiras.map((cadeira) => (
                  <div
                    key={cadeira.slug}
                    className="bg-white border border-navy-100 rounded shadow-sm overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-navy-100 bg-cream/70 flex items-center justify-between">
                      <h3 className="font-serif text-lg font-bold text-navy-900">
                        {cadeira.nome}
                      </h3>
                      <span className="text-xs font-bold text-navy-900/50 bg-white px-2.5 py-1 rounded border border-navy-100">
                        {cadeira.materiais.length} {cadeira.materiais.length === 1 ? "ficheiro" : "ficheiros"}
                      </span>
                    </div>

                    <ul className="divide-y divide-navy-100">
                      {cadeira.materiais.map((m) => (
                        <li
                          key={m.id}
                          className="p-5 hover:bg-cream/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div className="p-2.5 bg-sky/10 rounded text-sky shrink-0 mt-0.5">
                              <FileText size={20} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="px-2 py-0.5 bg-sky/10 text-sky text-[10px] font-bold uppercase tracking-wider rounded">
                                  {labelTipoMaterial(m.tipo)}
                                </span>
                                {m.createdAt && (
                                  <span className="text-[11px] text-navy-900/40">
                                    · {new Date(m.createdAt).toLocaleDateString("pt-PT")}
                                  </span>
                                )}
                              </div>
                              <h4 className="font-serif text-base font-bold text-navy-900 leading-snug">
                                {m.titulo}
                              </h4>
                              <p className="text-xs text-navy-900/55 mt-0.5">
                                Publicado por: <span className="font-medium text-navy-900/80">{m.autor || "Docente"}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                            <button
                              type="button"
                              onClick={() => setLer(m)}
                              className="inline-flex items-center gap-1.5 bg-navy-900 hover:bg-sky text-white text-xs font-bold px-3.5 py-2 rounded transition-colors"
                            >
                              <Eye size={14} />
                              <span>Visualizar</span>
                            </button>
                            <a
                              href={m.ficheiro}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 border border-navy-100 hover:border-sky text-navy-900 text-xs font-semibold px-3.5 py-2 rounded transition-colors"
                            >
                              <span>Baixar</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => eliminarMaterial(m)}
                              title="Eliminar material"
                              className="p-2 text-navy-900/40 hover:text-crimson transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECÇÃO: PUBLICAR NOVO MATERIAL */}
        {section === "partilhar" && (
          <div className="p-6 md:p-8 max-w-3xl">
            <div className="bg-white border border-navy-100 rounded-lg p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="font-serif font-bold text-lg text-navy-900">
                  Formulário de Publicação
                </h3>
                <p className="text-xs text-navy-900/60 mt-1">
                  Selecione o curso, indique a cadeira e anexe o ficheiro (PDF, Word, Excel ou imagem) para disponibilizar aos estudantes.
                </p>
              </div>

              <form onSubmit={submeterPartilha} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Curso *
                    </label>
                    <select
                      value={curso}
                      onChange={(e) => setCurso(e.target.value as CursoDocenciaSlug)}
                      className="w-full p-3 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:outline-none focus:border-sky"
                    >
                      {CURSOS_DOCENCIA.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.titulo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Tipo de Material *
                    </label>
                    <select
                      value={tipoForm}
                      onChange={(e) => setTipoForm(e.target.value as TipoMaterialDocencia)}
                      className="w-full p-3 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:outline-none focus:border-sky"
                    >
                      {TIPOS_MATERIAL_DOCENCIA.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">
                    Nome da Cadeira / Cursso *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Teoria da Comunicação, Ética Jornalística…"
                    value={cadeiraForm}
                    onChange={(e) => setCadeiraForm(e.target.value)}
                    className="w-full p-3 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:outline-none focus:border-sky"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">
                    Título do Material / Pauta *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pauta do 1º Teste — Diurno, Guia de Estudo Cap. 3…"
                    value={tituloForm}
                    onChange={(e) => setTituloForm(e.target.value)}
                    className="w-full p-3 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:outline-none focus:border-sky"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">
                    Ficheiro Anexo (PDF, Word, Excel, Imagem) *
                  </label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setFicheiroForm(e.target.files?.[0] ?? null)}
                    className="w-full p-2.5 bg-cream border border-navy-100 rounded text-xs text-navy-900 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-navy-900 file:text-white hover:file:bg-sky cursor-pointer"
                  />
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex items-center gap-2 bg-leaf hover:bg-crimson text-white text-xs font-bold px-6 py-3 rounded transition-colors disabled:opacity-50"
                  >
                    <Upload size={16} />
                    <span>{busy ? "A guardar…" : "Publicar Material"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSection("materiais")}
                    className="border border-navy-100 text-navy-900 text-xs font-semibold px-4 py-3 rounded hover:bg-cream transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SECÇÃO: GERIR FICHEIROS */}
        {section === "gerir" && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="bg-white border border-navy-100 rounded-lg p-6 shadow-sm">
              <h3 className="font-serif font-bold text-lg text-navy-900 mb-4">
                Todos os Ficheiros Publicados ({materiais?.length ?? 0})
              </h3>

              {!materiais || materiais.length === 0 ? (
                <p className="text-sm text-navy-900/60">Ainda não foram publicados ficheiros.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-navy-900 border-collapse">
                    <thead>
                      <tr className="border-b border-navy-100 bg-cream/60">
                        <th className="p-3 font-bold">Título</th>
                        <th className="p-3 font-bold">Curso</th>
                        <th className="p-3 font-bold">Cadeira</th>
                        <th className="p-3 font-bold">Tipo</th>
                        <th className="p-3 font-bold">Autor</th>
                        <th className="p-3 font-bold text-right">Acções</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-100">
                      {materiais.map((m) => (
                        <tr key={m.id} className="hover:bg-cream/30 transition-colors">
                          <td className="p-3 font-semibold">{m.titulo}</td>
                          <td className="p-3 text-navy-900/70">{m.curso.toUpperCase()}</td>
                          <td className="p-3 text-navy-900/70">{m.cadeira}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-sky/10 text-sky font-bold rounded">
                              {labelTipoMaterial(m.tipo)}
                            </span>
                          </td>
                          <td className="p-3 text-navy-900/70">{m.autor || "Docente"}</td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => setLer(m)}
                              className="text-sky hover:underline font-bold"
                            >
                              Ver
                            </button>
                            <button
                              type="button"
                              onClick={() => eliminarMaterial(m)}
                              className="text-crimson hover:underline font-bold"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leitor de Documentos Fullscreen Modal */}
        {ler && (
          <div
            className="fixed inset-0 z-[200] bg-white flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={ler.titulo}
          >
            <div className="bg-navy-900 text-white px-6 py-3 flex items-center justify-between">
              <span className="font-serif font-bold text-sm">{ler.titulo}</span>
              <button
                type="button"
                onClick={() => setLer(null)}
                className="text-white/70 hover:text-white flex items-center gap-1 text-xs font-semibold"
              >
                <X size={16} />
                <span>Fechar Leitor</span>
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <LeitorDocumento
                url={ler.ficheiro}
                title={ler.titulo}
                modo="modal"
                onClose={() => setLer(null)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
