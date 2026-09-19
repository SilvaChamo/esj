"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  Eye,
  FileText,
  Folder,
  GraduationCap,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Save,
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
import { listarMinhasCadeiras, type CadeiraAtribuida } from "@/lib/docencia-cadeiras";
import { listarPautaCadeira, type NotaEstudante, type ResultadoNota } from "@/lib/notas";
import SchemaInstall from "@/components/gestao/SchemaInstall";
import LeitorDocumento from "@/components/LeitorDocumento";

type Section = "materiais" | "partilhar" | "gerir" | "cadeiras" | "notas";
type Acesso = "a-verificar" | "negado" | "permitido";

type EstudanteBusca = {
  id: string;
  email: string | null;
  nome: string | null;
  numeroEstudante: string | null;
  curso: CursoDocenciaSlug | null;
};

const RESULTADOS_NOTA: ResultadoNota[] = ["Aprovado", "Em Frequência", "Reprovado", "Excluído"];

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
  const [souSuperAdmin, setSouSuperAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [menuMateriaisAberto, setMenuMateriaisAberto] = useState(true);

  // Lista de materiais
  const [materiais, setMateriais] = useState<MaterialDocencia[] | null>(null);
  const [needsSchema, setNeedsSchema] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cadeiras atribuídas ao docente autenticado
  const [minhasCadeiras, setMinhasCadeiras] = useState<CadeiraAtribuida[] | null>(null);

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

  // Formulário de lançamento de notas
  const [cadeiraNotaSel, setCadeiraNotaSel] = useState("");
  const [buscaEstudante, setBuscaEstudante] = useState("");
  const [resultadosBusca, setResultadosBusca] = useState<EstudanteBusca[]>([]);
  const [buscandoEstudante, setBuscandoEstudante] = useState(false);
  const [estudanteSel, setEstudanteSel] = useState<EstudanteBusca | null>(null);
  const [teste1Form, setTeste1Form] = useState("");
  const [teste2Form, setTeste2Form] = useState("");
  const [trabalhoForm, setTrabalhoForm] = useState("");
  const [exameForm, setExameForm] = useState("");
  const [resultadoForm, setResultadoForm] = useState<ResultadoNota>("Em Frequência");
  const [notaBusy, setNotaBusy] = useState(false);
  const [notaToast, setNotaToast] = useState<string | null>(null);
  const [notaToastErro, setNotaToastErro] = useState(false);
  const [pautaCadeiraAtual, setPautaCadeiraAtual] = useState<NotaEstudante[] | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    void supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (user) {
        setAcesso("permitido");
        setUserEmail(user.email ?? null);
        setSouSuperAdmin(eSuperAdmin(user));
        setAutor(eSuperAdmin(user) ? "Administrador" : nomeDeUser(user));
        setAutorId(user.id);
        listarMinhasCadeiras()
          .then(setMinhasCadeiras)
          .catch(() => setMinhasCadeiras([]));
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

  // Cursos onde este docente tem pelo menos uma cadeira atribuída (admin vê sempre tudo)
  const cursosPermitidos = useMemo(() => {
    if (souSuperAdmin || !minhasCadeiras || minhasCadeiras.length === 0) return CURSOS_DOCENCIA;
    const slugs = new Set(minhasCadeiras.map((c) => c.curso));
    return CURSOS_DOCENCIA.filter((c) => slugs.has(c.slug));
  }, [souSuperAdmin, minhasCadeiras]);

  // Cadeiras atribuídas ao docente dentro do curso selecionado no formulário de partilha
  const minhasCadeirasDoCurso = useMemo(
    () => (minhasCadeiras ?? []).filter((c) => c.curso === curso),
    [minhasCadeiras, curso]
  );

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

  // Cadeira selecionada no formulário de lançamento de notas (curso::codigo)
  const cadeiraNotaInfo = useMemo(() => {
    const [cursoSel, codigoSel] = cadeiraNotaSel.split("::");
    return (minhasCadeiras ?? []).find((c) => c.curso === cursoSel && c.cadeiraCodigo === codigoSel) || null;
  }, [cadeiraNotaSel, minhasCadeiras]);

  const mediaCalculada = useMemo(() => {
    const t1 = Number(teste1Form);
    const t2 = Number(teste2Form);
    const tr = Number(trabalhoForm);
    if (!teste1Form || !teste2Form || !trabalhoForm) return null;
    if (!Number.isFinite(t1) || !Number.isFinite(t2) || !Number.isFinite(tr)) return null;
    return Math.round((t1 * 0.3 + t2 * 0.3 + tr * 0.4) * 10) / 10;
  }, [teste1Form, teste2Form, trabalhoForm]);

  useEffect(() => {
    if (!cadeiraNotaInfo) {
      setPautaCadeiraAtual(null);
      return;
    }
    listarPautaCadeira(cadeiraNotaInfo.curso, cadeiraNotaInfo.cadeiraCodigo).then(setPautaCadeiraAtual);
  }, [cadeiraNotaInfo]);

  useEffect(() => {
    const q = buscaEstudante.trim();
    if (q.length < 2) {
      setResultadosBusca([]);
      return;
    }
    setBuscandoEstudante(true);
    const t = setTimeout(() => {
      fetch(`/api/estudantes-busca?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((r) => setResultadosBusca(r.estudantes ?? []))
        .catch(() => setResultadosBusca([]))
        .finally(() => setBuscandoEstudante(false));
    }, 350);
    return () => clearTimeout(t);
  }, [buscaEstudante]);

  const limparFormularioNota = () => {
    setEstudanteSel(null);
    setBuscaEstudante("");
    setResultadosBusca([]);
    setTeste1Form("");
    setTeste2Form("");
    setTrabalhoForm("");
    setExameForm("");
    setResultadoForm("Em Frequência");
  };

  const carregarNotaExistente = (linha: NotaEstudante) => {
    setEstudanteSel({
      id: linha.estudanteId,
      email: null,
      nome: linha.nomeEstudante,
      numeroEstudante: linha.numeroEstudante,
      curso: linha.curso,
    });
    setBuscaEstudante("");
    setResultadosBusca([]);
    setTeste1Form(linha.teste1 !== null ? String(linha.teste1) : "");
    setTeste2Form(linha.teste2 !== null ? String(linha.teste2) : "");
    setTrabalhoForm(linha.trabalho !== null ? String(linha.trabalho) : "");
    setExameForm(linha.exameNormal !== null ? String(linha.exameNormal) : "");
    setResultadoForm(linha.resultado);
  };

  const lancarNota = async (e: FormEvent) => {
    e.preventDefault();
    setNotaToast(null);
    if (!cadeiraNotaInfo) {
      setNotaToast("Selecione a cadeira.");
      setNotaToastErro(true);
      return;
    }
    if (!estudanteSel) {
      setNotaToast("Pesquise e selecione o estudante a avaliar.");
      setNotaToastErro(true);
      return;
    }
    if (!estudanteSel.numeroEstudante) {
      setNotaToast("Este estudante não tem número de estudante definido na conta — peça-lhe para o preencher em Configurações.");
      setNotaToastErro(true);
      return;
    }
    setNotaBusy(true);
    try {
      const res = await fetch("/api/docencia-notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estudanteId: estudanteSel.id,
          numeroEstudante: estudanteSel.numeroEstudante,
          nomeEstudante: estudanteSel.nome || estudanteSel.email,
          curso: cadeiraNotaInfo.curso,
          cadeiraCodigo: cadeiraNotaInfo.cadeiraCodigo,
          cadeiraNome: cadeiraNotaInfo.cadeiraNome,
          ano: cadeiraNotaInfo.ano,
          semestre: cadeiraNotaInfo.semestre,
          teste1: teste1Form || null,
          teste2: teste2Form || null,
          trabalho: trabalhoForm || null,
          exameNormal: exameForm || null,
          mediaFinal: mediaCalculada,
          resultado: resultadoForm,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Não foi possível lançar a nota.");
      setNotaToast(`Nota de ${estudanteSel.nome || estudanteSel.email} publicada — já visível no painel do estudante.`);
      setNotaToastErro(false);
      limparFormularioNota();
      listarPautaCadeira(cadeiraNotaInfo.curso, cadeiraNotaInfo.cadeiraCodigo).then(setPautaCadeiraAtual);
    } catch (err) {
      setNotaToast(err instanceof Error ? err.message : "Não foi possível lançar a nota.");
      setNotaToastErro(true);
    } finally {
      setNotaBusy(false);
    }
  };

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
                {cursosPermitidos.map((c) => (
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
              setSection("cadeiras");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-lg transition-colors text-left ${section === "cadeiras"
                ? "bg-sky/15 text-sky-300 border-l-4 border-sky-300"
                : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
          >
            <GraduationCap size={20} className="shrink-0" />
            {!isSidebarCollapsed && <span>Minhas Cadeiras</span>}
          </button>

          <button
            type="button"
            onClick={() => {
              setSection("notas");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-lg transition-colors text-left ${section === "notas"
                ? "bg-sky/15 text-sky-300 border-l-4 border-sky-300"
                : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
          >
            <ClipboardList size={20} className="shrink-0" />
            {!isSidebarCollapsed && <span>Lançar Notas</span>}
          </button>

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
              {section === "cadeiras" && "Minhas Cadeiras Leccionadas"}
              {section === "notas" && "Lançamento de Notas & Pautas"}
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

        {minhasCadeiras === null && (
          <div className="p-6 md:p-8">
            <SchemaInstall
              sqlPath="/docencia-cadeiras.sql"
              titulo="Criar a tabela de Cadeiras de Docência no Supabase"
              descricao="Para atribuir cadeiras aos docentes e mostrar «Minhas Cadeiras» é preciso criar esta tabela."
              onVerificar={() => listarMinhasCadeiras().then(setMinhasCadeiras)}
            />
          </div>
        )}

        {(section === "notas") && pautaCadeiraAtual === null && cadeiraNotaInfo && (
          <div className="p-6 md:p-8">
            <SchemaInstall
              sqlPath="/estudantes-notas.sql"
              titulo="Criar a tabela de Notas dos Estudantes no Supabase"
              descricao="Para lançar notas e alimentar a pauta do estudante é preciso criar esta tabela."
              onVerificar={() =>
                listarPautaCadeira(cadeiraNotaInfo.curso, cadeiraNotaInfo.cadeiraCodigo).then(setPautaCadeiraAtual)
              }
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

        {/* SECÇÃO: MINHAS CADEIRAS */}
        {section === "cadeiras" && (
          <div className="p-6 md:p-8 space-y-6 max-w-4xl">
            {souSuperAdmin && (
              <div className="p-4 bg-sky/10 border border-sky/30 rounded text-xs font-semibold text-navy-900">
                Como administrador, tem acesso a todos os cursos e cadeiras, independentemente de atribuição.
              </div>
            )}

            {!minhasCadeiras || minhasCadeiras.length === 0 ? (
              <div className="bg-white border border-navy-100 p-12 text-center">
                <GraduationCap size={36} className="mx-auto text-navy-900/30 mb-3" />
                <p className="text-base font-serif font-bold text-navy-900">
                  Ainda não tem cadeiras atribuídas
                </p>
                <p className="mt-1 text-sm text-navy-900/60">
                  Peça à Gestão da ESJ para lhe atribuir as cadeiras que lecciona — só depois poderá lançar notas nelas.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-navy-100 rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-navy-100 bg-cream/70">
                  <h3 className="font-serif text-lg font-bold text-navy-900">
                    {minhasCadeiras.length} cadeira{minhasCadeiras.length === 1 ? "" : "s"} atribuída{minhasCadeiras.length === 1 ? "" : "s"}
                  </h3>
                </div>
                <ul className="divide-y divide-navy-100">
                  {minhasCadeiras.map((c) => (
                    <li key={c.id} className="p-5 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-serif font-bold text-navy-900">{c.cadeiraNome}</p>
                        <p className="text-xs text-navy-900/55 mt-0.5">
                          {CURSOS_DOCENCIA.find((cur) => cur.slug === c.curso)?.titulo} · {c.cadeiraCodigo}
                          {c.ano && c.semestre ? ` · ${c.ano}º Ano · ${c.semestre}º Semestre` : ""}
                        </p>
                      </div>
                      <span className="shrink-0 px-2.5 py-1 bg-leaf/10 text-leaf text-[11px] font-bold rounded border border-leaf/30">
                        Atribuída
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* SECÇÃO: LANÇAR NOTAS */}
        {section === "notas" && (
          <div className="p-6 md:p-8 space-y-6 max-w-4xl">
            {(!minhasCadeiras || minhasCadeiras.length === 0) && !souSuperAdmin ? (
              <div className="bg-white border border-navy-100 p-12 text-center">
                <ClipboardList size={36} className="mx-auto text-navy-900/30 mb-3" />
                <p className="text-base font-serif font-bold text-navy-900">
                  Sem cadeiras atribuídas
                </p>
                <p className="mt-1 text-sm text-navy-900/60">
                  Só pode lançar notas em cadeiras que lhe tenham sido atribuídas pela Gestão.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-white border border-navy-100 rounded-lg p-6 shadow-sm space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Cadeira *
                    </label>
                    <select
                      value={cadeiraNotaSel}
                      onChange={(e) => {
                        setCadeiraNotaSel(e.target.value);
                        limparFormularioNota();
                      }}
                      className="w-full p-3 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:outline-none focus:border-sky"
                    >
                      <option value="">— Selecione a cadeira —</option>
                      {(minhasCadeiras ?? []).map((c) => (
                        <option key={c.id} value={`${c.curso}::${c.cadeiraCodigo}`}>
                          {c.cadeiraNome} ({c.cadeiraCodigo}) — {CURSOS_DOCENCIA.find((cur) => cur.slug === c.curso)?.titulo}
                        </option>
                      ))}
                    </select>
                  </div>

                  {cadeiraNotaInfo && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-navy-900 mb-1.5">
                          Estudante *
                        </label>
                        {estudanteSel ? (
                          <div className="flex items-center justify-between gap-3 p-3 bg-sky/10 border border-sky/30 rounded">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-navy-900 truncate">{estudanteSel.nome || estudanteSel.email}</p>
                              <p className="text-xs text-navy-900/60">
                                Nº {estudanteSel.numeroEstudante || "—"} {estudanteSel.email ? `· ${estudanteSel.email}` : ""}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={limparFormularioNota}
                              className="shrink-0 text-xs font-bold text-navy-900/60 hover:text-crimson"
                            >
                              Trocar
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-900/40" />
                            <input
                              type="text"
                              value={buscaEstudante}
                              onChange={(e) => setBuscaEstudante(e.target.value)}
                              placeholder="Pesquisar por nome, número ou e-mail do estudante…"
                              className="w-full pl-9 pr-3 p-3 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:outline-none focus:border-sky"
                            />
                            {buscandoEstudante && (
                              <p className="mt-1 text-[11px] text-navy-900/50">A pesquisar…</p>
                            )}
                            {resultadosBusca.length > 0 && (
                              <ul className="mt-2 border border-navy-100 rounded divide-y divide-navy-100 bg-white shadow-sm max-h-56 overflow-y-auto">
                                {resultadosBusca.map((e) => (
                                  <li key={e.id}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEstudanteSel(e);
                                        setBuscaEstudante("");
                                        setResultadosBusca([]);
                                      }}
                                      className="w-full text-left px-3 py-2.5 hover:bg-cream/60 transition-colors"
                                    >
                                      <p className="text-sm font-semibold text-navy-900">{e.nome || e.email}</p>
                                      <p className="text-[11px] text-navy-900/55">
                                        Nº {e.numeroEstudante || "—"} · {e.email}
                                      </p>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>

                      {estudanteSel && (
                        <form onSubmit={lancarNota} className="space-y-4 pt-2 border-t border-navy-100">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                            <div>
                              <label className="block text-[11px] font-bold text-navy-900/70 mb-1">1º Teste</label>
                              <input
                                type="number"
                                min={0}
                                max={20}
                                step={0.1}
                                value={teste1Form}
                                onChange={(e) => setTeste1Form(e.target.value)}
                                className="w-full p-2.5 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:outline-none focus:border-sky"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-navy-900/70 mb-1">2º Teste</label>
                              <input
                                type="number"
                                min={0}
                                max={20}
                                step={0.1}
                                value={teste2Form}
                                onChange={(e) => setTeste2Form(e.target.value)}
                                className="w-full p-2.5 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:outline-none focus:border-sky"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-navy-900/70 mb-1">Trabalho</label>
                              <input
                                type="number"
                                min={0}
                                max={20}
                                step={0.1}
                                value={trabalhoForm}
                                onChange={(e) => setTrabalhoForm(e.target.value)}
                                className="w-full p-2.5 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:outline-none focus:border-sky"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-navy-900/70 mb-1">Exame (opc.)</label>
                              <input
                                type="number"
                                min={0}
                                max={20}
                                step={0.1}
                                value={exameForm}
                                onChange={(e) => setExameForm(e.target.value)}
                                className="w-full p-2.5 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:outline-none focus:border-sky"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="min-w-[160px]">
                              <label className="block text-[11px] font-bold text-navy-900/70 mb-1">Resultado</label>
                              <select
                                value={resultadoForm}
                                onChange={(e) => setResultadoForm(e.target.value as ResultadoNota)}
                                className="w-full p-2.5 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:outline-none focus:border-sky"
                              >
                                {RESULTADOS_NOTA.map((r) => (
                                  <option key={r} value={r}>
                                    {r}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {mediaCalculada !== null && (
                              <div className="text-xs font-bold text-navy-900">
                                Média calculada (30/30/40): <span className="text-leaf font-mono text-sm">{mediaCalculada.toFixed(1)}</span>
                              </div>
                            )}
                          </div>

                          {notaToast && (
                            <p className={`text-xs font-semibold flex items-center gap-1.5 ${notaToastErro ? "text-crimson" : "text-leaf"}`}>
                              {notaToastErro ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                              {notaToast}
                            </p>
                          )}

                          <button
                            type="submit"
                            disabled={notaBusy}
                            className="inline-flex items-center gap-2 bg-leaf hover:bg-crimson text-white text-xs font-bold px-6 py-3 rounded transition-colors disabled:opacity-50"
                          >
                            <Save size={16} />
                            <span>{notaBusy ? "A publicar…" : "Lançar Nota"}</span>
                          </button>
                        </form>
                      )}
                    </>
                  )}
                </div>

                {cadeiraNotaInfo && pautaCadeiraAtual && pautaCadeiraAtual.length > 0 && (
                  <div className="bg-white border border-navy-100 rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-navy-100 bg-cream/70">
                      <h3 className="font-serif text-lg font-bold text-navy-900">
                        Notas já lançadas — {cadeiraNotaInfo.cadeiraNome}
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-navy-900/5 border-b border-navy-100 text-navy-900 font-bold uppercase tracking-wider">
                            <th className="p-3">Nº</th>
                            <th className="p-3">Estudante</th>
                            <th className="p-3 text-center">Média Final</th>
                            <th className="p-3 text-center">Resultado</th>
                            <th className="p-3 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-100 text-navy-900">
                          {pautaCadeiraAtual.map((n) => (
                            <tr key={n.id} className="hover:bg-cream/40 transition-colors">
                              <td className="p-3 font-mono font-bold text-sky">{n.numeroEstudante}</td>
                              <td className="p-3 font-semibold">{n.nomeEstudante}</td>
                              <td className="p-3 text-center font-mono font-bold">{n.mediaFinal?.toFixed(1) ?? "—"}</td>
                              <td className="p-3 text-center">{n.resultado}</td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => carregarNotaExistente(n)}
                                  className="text-sky hover:underline font-bold"
                                >
                                  Editar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
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
                      onChange={(e) => {
                        setCurso(e.target.value as CursoDocenciaSlug);
                        setCadeiraForm("");
                      }}
                      className="w-full p-3 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:outline-none focus:border-sky"
                    >
                      {cursosPermitidos.map((c) => (
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
                  {minhasCadeirasDoCurso.length > 0 ? (
                    <select
                      required
                      value={cadeiraForm}
                      onChange={(e) => setCadeiraForm(e.target.value)}
                      className="w-full p-3 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:outline-none focus:border-sky"
                    >
                      <option value="">— Selecione a cadeira —</option>
                      {minhasCadeirasDoCurso.map((c) => (
                        <option key={c.id} value={c.cadeiraNome}>
                          {c.cadeiraNome} ({c.cadeiraCodigo})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Ex: Teoria da Comunicação, Ética Jornalística…"
                      value={cadeiraForm}
                      onChange={(e) => setCadeiraForm(e.target.value)}
                      className="w-full p-3 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:outline-none focus:border-sky"
                    />
                  )}
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
