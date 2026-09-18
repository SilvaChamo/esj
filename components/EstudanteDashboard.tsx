"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  FileText,
  GraduationCap,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Search,
  ShieldCheck,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { MINUTAS } from "@/lib/ensino-docs";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import {
  CURSOS_DOCENCIA,
  agruparPorCadeira,
  labelTipoMaterial,
  listMateriaisDocencia,
  type CursoDocenciaSlug,
  type MaterialDocencia,
  type TipoMaterialDocencia,
} from "@/lib/docencia";
import {
  readCalendarioDetalhado,
  labelCategoriaCalendario,
  type EventoCalendarioDetalhado,
} from "@/lib/calendario-detalhado";
import { getCurriculoPorCurso, type CadeiraCurriculo, type RegimeCurso } from "@/lib/curriculo";
import { EXEMPLO_EPAUTA_JORNALISMO, exportarEpautaPDF, type EPautaEletronica } from "@/lib/epauta";
import { getPerfilActual, savePerfilActual, clearPerfilActual, type PerfilUtilizador } from "@/lib/auth-perfil";
import LeitorDocumento from "@/components/LeitorDocumento";

type Section =
  | "conta"
  | "financeiro"
  | "materiais"
  | "curso-jornalismo"
  | "curso-publicidade"
  | "curso-rp"
  | "curso-bd"
  | "cadeiras"
  | "pautas"
  | "calendario"
  | "doc-minutas"
  | "doc-requerimentos";

export default function EstudanteDashboard({
  initialSection = "materiais",
}: {
  initialSection?: Section;
}) {
  const [section, setSection] = useState<Section>(initialSection);
  const [perfil, setPerfil] = useState<PerfilUtilizador | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Estados dos menus sanfona
  const [menuMateriaisAberto, setMenuMateriaisAberto] = useState(true);
  const [menuDocumentosAberto, setMenuDocumentosAberto] = useState(false);

  // Lista de materiais
  const [materiais, setMateriais] = useState<MaterialDocencia[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros do estudante
  const [curso, setCurso] = useState<CursoDocenciaSlug>("jornalismo");
  const [regime, setRegime] = useState<RegimeCurso>("diurno");
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | TipoMaterialDocencia>("todos");
  const [anoSelecionado, setAnoSelecionado] = useState<1 | 2 | 3 | 4>(1);
  const [cadeirasExpandidas, setCadeirasExpandidas] = useState<Record<string, boolean>>({});
  const [abaFinanceira, setAbaFinanceira] = useState<"recibos" | "recorrencia" | "mudanca" | "taxas">("recibos");
  const [metodoPagamento, setMetodoPagamento] = useState<"mpesa" | "emola" | "banco">("mpesa");
  const [telefonePagamento, setTelefonePagamento] = useState("");
  const [sucessoFin, setSucessoFin] = useState<string | null>(null);
  const [ler, setLer] = useState<MaterialDocencia | null>(null);

  // Pauta eletrónica ativa
  const [epauta, setEpauta] = useState<EPautaEletronica>(EXEMPLO_EPAUTA_JORNALISMO);

  // Calendário
  const calendario = readCalendarioDetalhado();

  // Calcula o semestre académico actual com base na data real do sistema
  // Calendário ESJ: 1º Sem (Fev–Jul) · 2º Sem (Ago–Jan)
  const getSemestreActual = (): string => {
    const agora = new Date();
    const mes = agora.getMonth() + 1; // 1=Jan … 12=Dez
    const ano = agora.getFullYear();
    // Agosto a Dezembro → 2º Semestre do ano em curso
    // Janeiro             → 2º Semestre do ano anterior
    // Fevereiro a Julho   → 1º Semestre do ano em curso
    if (mes >= 8) {
      return `2º Semestre · Ano Lectivo ${ano}`;
    } else if (mes === 1) {
      return `2º Semestre · Ano Lectivo ${ano - 1}`;
    } else {
      return `1º Semestre · Ano Lectivo ${ano}`;
    }
  };
  const semestreActual = getSemestreActual();

  useEffect(() => {
    // 1. Verificar se já temos perfil guardado localmente (vindo do registo ou sessão anterior)
    const perfilGuardado = getPerfilActual();
    if (perfilGuardado && perfilGuardado.tipo === "estudante") {
      setPerfil(perfilGuardado);
      if (perfilGuardado.curso) setCurso(perfilGuardado.curso);
      if (perfilGuardado.regime) setRegime(perfilGuardado.regime);
    }

    // 2. Sempre ir buscar os dados reais ao Supabase para garantir que estão actualizados
    const supabase = createBrowserSupabase();
    void supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user?.email) return; // Não há sessão activa

      const meta = user.user_metadata ?? {};

      // Extrair nome real: prioridade full_name > nome > name > prefixo do email
      const nomeReal: string =
        meta.full_name ||
        meta.nome ||
        meta.name ||
        user.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

      // Extrair curso, regime e número de estudante do user_metadata
      const cursoReal = (meta.curso as CursoDocenciaSlug) || perfilGuardado?.curso || "jornalismo";
      const regimeReal = (meta.regime as RegimeCurso) || perfilGuardado?.regime || "diurno";
      const numEstudante: string =
        meta.numero_estudante ||
        meta.numeroEstudante ||
        perfilGuardado?.numeroEstudante ||
        "20260104MP";

      const perfilActualizado: PerfilUtilizador = {
        id: user.id,
        email: user.email,
        nome: nomeReal,
        tipo: "estudante",
        numeroEstudante: numEstudante,
        curso: cursoReal,
        regime: regimeReal,
        anoLectivo: meta.anoLectivo || "2026",
      };

      // Guardar o perfil actualizado no localStorage
      savePerfilActual(perfilActualizado);

      setPerfil(perfilActualizado);
      setCurso(cursoReal);
      setRegime(regimeReal);
    });

    setLoading(true);
    listMateriaisDocencia()
      .then((rows) => setMateriais(rows ?? []))
      .catch(() => setMateriais([]))
      .finally(() => setLoading(false));
  }, []);


  useEffect(() => {
    if (!ler) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [ler]);

  const cadeirasCurriculo = useMemo(
    () => getCurriculoPorCurso(curso, regime),
    [curso, regime]
  );

  const materiaisFiltrados = useMemo(() => {
    let lista = (materiais ?? []).filter((m) => m.curso === curso);
    if (filtroTipo !== "todos") {
      lista = lista.filter((m) => m.tipo === filtroTipo);
    }
    if (!termoBusca.trim()) return lista;
    const q = termoBusca.toLowerCase();
    return lista.filter(
      (m) =>
        m.titulo.toLowerCase().includes(q) ||
        m.cadeira.toLowerCase().includes(q) ||
        (m.autor && m.autor.toLowerCase().includes(q))
    );
  }, [materiais, curso, filtroTipo, termoBusca]);

  const cadeirasComMateriais = useMemo(
    () => agruparPorCadeira(materiaisFiltrados),
    [materiaisFiltrados]
  );

  const sair = async () => {
    clearPerfilActual();
    try {
      const supabase = createBrowserSupabase();
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    window.location.href = "/";
  };

  const selecionarCursoMenu = (cSlug: CursoDocenciaSlug, sec: Section) => {
    setCurso(cSlug);
    setSection(sec);
    setIsMobileMenuOpen(false);
  };

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
            Portal do Estudante
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

      {/* Sidebar de Navegação para Estudantes */}
      <aside
        className={`fixed inset-y-0 left-0 z-[80] lg:z-30 lg:static bg-navy-900 text-white shrink-0 flex flex-col transition-all duration-300 transform ${isSidebarCollapsed ? "lg:w-20" : "lg:w-[260px]"
          } ${isMobileMenuOpen ? "translate-x-0 w-[260px]" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Topo da Sidebar */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
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
                Portal do Estudante
              </h1>
              <p className="text-[11px] text-white/50 truncate">Escola Superior de Jornalismo</p>
            </div>
          )}
        </div>

        {/* Navegação Principal */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {/* DASHBOARD & Situação Académica */}
          <button
            type="button"
            onClick={() => {
              setSection("conta");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-lg transition-colors text-left ${section === "conta"
              ? "bg-sky/15 text-sky-300 border-l-4 border-sky-300 font-bold"
              : "text-white/80 hover:bg-white/5 hover:text-white"
              }`}
          >
            <UserCheck size={20} className="shrink-0 text-sky" />
            {!isSidebarCollapsed && <span>DASHBOARD</span>}
          </button>

          {/* Situação Financeira & Pagamentos */}
          <button
            type="button"
            onClick={() => {
              setSection("financeiro");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-lg transition-colors text-left ${section === "financeiro"
              ? "bg-sky/15 text-sky-300 border-l-4 border-sky-300 font-bold"
              : "text-white/80 hover:bg-white/5 hover:text-white"
              }`}
          >
            <CreditCard size={20} className="shrink-0 text-leaf" />
            {!isSidebarCollapsed && <span>Situação Financeira</span>}
          </button>

          {/* Material de Estudo */}
          <button
            type="button"
            onClick={() => {
              setSection("materiais");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-lg transition-colors text-left ${section === "materiais" || section.startsWith("curso-")
              ? "bg-sky/15 text-sky-300 border-l-4 border-sky-300 font-bold"
              : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
          >
            <BookOpen size={20} className="shrink-0" />
            {!isSidebarCollapsed && <span>Material de Estudo</span>}
          </button>

          {/* Cadeiras do Meu Curso */}
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
            {!isSidebarCollapsed && <span>Cadeiras & Docentes</span>}
          </button>

          {/* Pautas & Resultados */}
          <button
            type="button"
            onClick={() => {
              setSection("pautas");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-lg transition-colors text-left ${section === "pautas"
              ? "bg-sky/15 text-sky-300 border-l-4 border-sky-300"
              : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
          >
            <ClipboardList size={20} className="shrink-0" />
            {!isSidebarCollapsed && <span>Pautas Eletrónicas</span>}
          </button>

          {/* Calendário Académico */}
          <button
            type="button"
            onClick={() => {
              setSection("calendario");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-lg transition-colors text-left ${section === "calendario"
              ? "bg-sky/15 text-sky-300 border-l-4 border-sky-300"
              : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
          >
            <Calendar size={20} className="shrink-0" />
            {!isSidebarCollapsed && <span>Calendário Académico</span>}
          </button>

          {/* MENU PAI: Documentos com Submenus Minutas e Requerimentos */}
          <div>
            <button
              type="button"
              onClick={() => setMenuDocumentosAberto((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-3 text-sm font-semibold rounded-lg text-white/80 hover:bg-white/5 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText size={20} className="shrink-0" />
                {!isSidebarCollapsed && <span>Documentos</span>}
              </div>
              {!isSidebarCollapsed &&
                (menuDocumentosAberto ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            </button>

            {menuDocumentosAberto && !isSidebarCollapsed && (
              <div className="ml-4 pl-3 border-l border-white/15 space-y-1 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSection("doc-minutas");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left py-2 px-3 text-xs font-semibold rounded transition-colors ${section === "doc-minutas"
                    ? "bg-sky/20 text-sky-300 font-bold"
                    : "text-white/60 hover:text-white"
                    }`}
                >
                  Minutas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSection("doc-requerimentos");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left py-2 px-3 text-xs font-semibold rounded transition-colors ${section === "doc-requerimentos"
                    ? "bg-sky/20 text-sky-300 font-bold"
                    : "text-white/60 hover:text-white"
                    }`}
                >
                  Requerimentos
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Rodapé da Sidebar (Conta do Estudante com Botão de Expandir / Colapsar) */}
        <div className="p-4 border-t border-white/10 bg-black/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-full bg-leaf flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden">
              {perfil?.avatar_url ? (
                <img src={perfil.avatar_url} alt={perfil.nome} className="h-full w-full object-cover" />
              ) : (
                <span>{perfil?.nome ? perfil.nome[0].toUpperCase() : "E"}</span>
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{perfil?.nome || "Amélia Zacarias Macuácua"}</p>
                <p className="text-[10px] text-white/60 truncate">{perfil?.email || "estudante@esj.ac.mz"}</p>
              </div>
            )}
          </div>

          {/* Botão de Expandir / Colapsar a barra lateral na posição da conta */}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((v) => !v)}
            title={isSidebarCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
            className="hidden lg:flex p-2 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors shrink-0"
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal do Dashboard do Estudante */}
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        {/* Barra Superior */}
        <header className="bg-white border-b border-navy-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif font-[800] text-2xl text-navy-900 tracking-tight" style={{ fontWeight: 800 }}>
              {section === "conta" && "DASHBOARD"}
              {section === "financeiro" && "Situação Financeira & Pagamentos Online"}
              {(section.startsWith("curso-") || section === "materiais") && `Material de Estudo — ${CURSOS_DOCENCIA.find((c) => c.slug === curso)?.titulo || "Meu Curso"}`}
              {section === "cadeiras" && `Cadeiras e Docentes Leccionadores (${regime.toUpperCase()})`}
              {section === "pautas" && "Pautas Eletrónicas e Frequências"}
              {section === "calendario" && "Calendário Académico Oficial 2026"}
              {section === "doc-minutas" && "Documentos — Minutas Académicas"}
              {section === "doc-requerimentos" && "Documentos — Requerimentos Oficiais"}
            </h2>
            <span className="text-[11px] font-bold tracking-widest text-sky uppercase mt-0.5 block">
              Portal do Estudante · ESJ
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-leaf/10 border border-leaf/30 text-leaf text-xs font-bold px-3 py-1.5 rounded">
              <UserCheck size={14} />
              <span>Nº {perfil?.numeroEstudante || "20260104MP"}</span>
            </div>

            <span className="px-2.5 py-1.5 bg-sky/10 border border-sky/30 text-sky text-[11px] font-extrabold uppercase tracking-wider rounded">
              {regime.toUpperCase()}
            </span>

            {/* Botão Sair no topo */}
            <button
              type="button"
              onClick={sair}
              className="inline-flex items-center gap-1.5 bg-crimson/10 hover:bg-crimson text-crimson hover:text-white text-xs font-bold px-3.5 py-1.5 rounded transition-colors"
            >
              <LogOut size={14} />
              <span>Sair</span>
            </button>
          </div>
        </header>

        {/* SECÇÃO: MINHA CONTA E SITUAÇÃO ACADÉMICA */}
        {section === "conta" && (
          <div className="p-6 md:p-8 space-y-8">
            {/* Cartão do Perfil do Estudante */}
            {(() => {
              const isRegularizado = perfil?.regularizado !== false;
              return (
                <div
                  className={`rounded-xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${isRegularizado
                      ? "bg-gradient-to-r from-navy-900 to-navy-800 text-white border border-navy-800"
                      : "bg-gradient-to-r from-navy-900 via-crimson/30 to-navy-900 text-white border-2 border-crimson/60 shadow-crimson/20"
                    }`}
                >
                  <div className="flex items-center gap-5">
                    <div className="relative h-16 w-16 rounded-full bg-leaf flex items-center justify-center text-white font-bold text-2xl shadow-inner border-2 border-white/20 shrink-0 overflow-hidden">
                      {perfil?.avatar_url ? (
                        <img src={perfil.avatar_url} alt={perfil.nome} className="h-full w-full object-cover" />
                      ) : (
                        <span>{perfil?.nome ? perfil.nome[0].toUpperCase() : "E"}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-2xl text-white">
                        {perfil?.nome || "Amélia Zacarias Macuácua"}
                      </h3>
                      <div className="text-xs text-white/70 mt-2 space-y-1">
                        <div>N.º de Estudante: <strong className="text-sky-300 font-mono text-sm">{perfil?.numeroEstudante || "20260104MP"}</strong></div>
                        <div className="text-emerald-400 text-xs font-bold tracking-wide mt-0.5">{semestreActual}</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t md:border-t-0 md:border-l border-white/15 pt-4 md:pt-0 md:pl-6 space-y-1 shrink-0 text-xs">
                    <p className="text-white/60">Curso Frequentado:</p>
                    <p className="font-serif font-bold text-white text-base">
                      {CURSOS_DOCENCIA.find((c) => c.slug === curso)?.titulo || "Jornalismo"}
                    </p>
                    <p className="text-white/70 mt-1.5">
                      Delegação de: <span className="font-bold text-white">Maputo - MP</span>
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Painel de Indicadores (Resumo de Desempenho) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-lg border border-navy-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-leaf/10 text-leaf rounded-lg shrink-0">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-navy-900/60 uppercase tracking-wider">Cadeiras Aprovadas</p>
                  <p className="font-serif font-bold text-2xl text-navy-900 mt-0.5">7 Cadeiras</p>
                  <p className="text-[11px] text-leaf font-bold">Passado com Sucesso</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-navy-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-sky/10 text-sky rounded-lg shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-navy-900/60 uppercase tracking-wider">Em Frequência</p>
                  <p className="font-serif font-bold text-2xl text-navy-900 mt-0.5">2 Cadeiras</p>
                  <p className="text-[11px] text-sky font-bold">Aulas Em Curso</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-navy-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-crimson/10 text-crimson rounded-lg shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-navy-900/60 uppercase tracking-wider">Chumbadas / Reprovadas</p>
                  <p className="font-serif font-bold text-2xl text-navy-900 mt-0.5">1 Cadeira</p>
                  <p className="text-[11px] text-crimson font-bold">Necessita de Recorrência</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-navy-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-navy-900/10 text-navy-900 rounded-lg shrink-0">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-navy-900/60 uppercase tracking-wider">Média Acumulada</p>
                  <p className="font-serif font-bold text-2xl text-navy-900 mt-0.5">14.8 <span className="text-xs font-sans font-normal text-navy-900/50">/ 20 V</span></p>
                  <p className="text-[11px] text-navy-900/70 font-bold">Bom Desempenho</p>
                </div>
              </div>
            </div>

            {/* Tabela da Situação Académica por Disciplina com Tabs de Anos */}
            <div className="bg-white border border-navy-100 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-navy-100 bg-cream/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-serif text-lg font-bold text-navy-900">
                    Situação Académica Detalhada por Disciplina
                  </h3>
                  <p className="text-xs text-navy-900/60 mt-0.5">
                    Histórico das disciplinas passadas, chumbadas e em frequência no curso de {CURSOS_DOCENCIA.find((c) => c.slug === curso)?.titulo}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1 bg-white p-1 border border-navy-100 rounded self-start sm:self-auto">
                  <span className="text-[11px] font-bold text-navy-900/60 px-2 uppercase tracking-wider">Ano Lectivo:</span>
                  {([1, 2, 3, 4] as const).map((ano) => (
                    <button
                      key={ano}
                      type="button"
                      onClick={() => setAnoSelecionado(ano)}
                      className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${anoSelecionado === ano
                        ? "bg-navy-900 text-white shadow-sm"
                        : "text-navy-900/60 hover:text-navy-900 hover:bg-cream"
                        }`}
                    >
                      {ano}º Ano
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-navy-900/5 border-b border-navy-100 text-navy-900 font-bold uppercase tracking-wider">
                      <th className="p-4">Cadeira / Disciplina</th>
                      <th className="p-4">Ano & Semestre</th>
                      <th className="p-4 text-center">Nota Final</th>
                      <th className="p-4 text-center">Resultado</th>
                      <th className="p-4 text-right">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-100 text-navy-900 font-medium">
                    {anoSelecionado === 1 && (
                      <>
                        <tr
                          onClick={() => setCadeirasExpandidas((p) => ({ ...p, jor1: !p.jor1 }))}
                          className="hover:bg-cream/40 transition-colors cursor-pointer"
                        >
                          <td className="p-4 font-bold font-serif text-sm flex items-center gap-2">
                            <button type="button" className="p-1 text-navy-900/60 hover:text-sky">
                              {cadeirasExpandidas.jor1 ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            <span>Teoria da Comunicação I</span>
                          </td>
                          <td className="p-4 text-navy-900/70">1º Ano · 1º Semestre</td>
                          <td className="p-4 text-center font-bold text-sm font-mono">15.1 V</td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1 bg-leaf/10 border border-leaf/30 text-leaf font-bold px-2.5 py-1 rounded text-[11px]">
                              <CheckCircle2 size={12} /> Aprovado
                            </span>
                          </td>
                          <td className="p-4 text-right text-leaf font-bold font-sans">Passada</td>
                        </tr>
                        {cadeirasExpandidas.jor1 && (
                          <tr className="bg-cream/40">
                            <td colSpan={5} className="p-4 pl-10 border-t border-navy-100/60">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">1º Teste Escrito</span>
                                  <span className="font-mono font-bold text-sm text-navy-900">14.5 V</span> <span className="text-[10px] text-navy-900/50">(30%)</span>
                                </div>
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">2º Teste Escrito</span>
                                  <span className="font-mono font-bold text-sm text-navy-900">15.0 V</span> <span className="text-[10px] text-navy-900/50">(30%)</span>
                                </div>
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">Trabalho de Pesquisa</span>
                                  <span className="font-mono font-bold text-sm text-navy-900">16.0 V</span> <span className="text-[10px] text-navy-900/50">(20%)</span>
                                </div>
                                <div className="p-3 bg-white rounded border border-leaf/40 shadow-sm">
                                  <span className="text-leaf text-[10px] uppercase font-bold block">Média Final</span>
                                  <span className="font-mono font-bold text-sm text-leaf">15.1 V</span> <span className="text-[10px] text-leaf block font-semibold">Aprovado</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}

                        <tr
                          onClick={() => setCadeirasExpandidas((p) => ({ ...p, jor2: !p.jor2 }))}
                          className="hover:bg-cream/40 transition-colors cursor-pointer"
                        >
                          <td className="p-4 font-bold font-serif text-sm flex items-center gap-2">
                            <button type="button" className="p-1 text-navy-900/60 hover:text-sky">
                              {cadeirasExpandidas.jor2 ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            <span>Técnicas de Expressão em Língua Portuguesa</span>
                          </td>
                          <td className="p-4 text-navy-900/70">1º Ano · 1º Semestre</td>
                          <td className="p-4 text-center font-bold text-sm font-mono">14.0 V</td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1 bg-leaf/10 border border-leaf/30 text-leaf font-bold px-2.5 py-1 rounded text-[11px]">
                              <CheckCircle2 size={12} /> Aprovado
                            </span>
                          </td>
                          <td className="p-4 text-right text-leaf font-bold font-sans">Passada</td>
                        </tr>
                        {cadeirasExpandidas.jor2 && (
                          <tr className="bg-cream/40">
                            <td colSpan={5} className="p-4 pl-10 border-t border-navy-100/60">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">1º Teste Escrito</span>
                                  <span className="font-mono font-bold text-sm text-navy-900">13.5 V</span>
                                </div>
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">2º Teste Escrito</span>
                                  <span className="font-mono font-bold text-sm text-navy-900">14.0 V</span>
                                </div>
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">Redações Práticas</span>
                                  <span className="font-mono font-bold text-sm text-navy-900">14.5 V</span>
                                </div>
                                <div className="p-3 bg-white rounded border border-leaf/40 shadow-sm">
                                  <span className="text-leaf text-[10px] uppercase font-bold block">Média Final</span>
                                  <span className="font-mono font-bold text-sm text-leaf">14.0 V</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}

                        <tr
                          onClick={() => setCadeirasExpandidas((p) => ({ ...p, jor1_3: !p.jor1_3 }))}
                          className="hover:bg-cream/40 transition-colors cursor-pointer"
                        >
                          <td className="p-4 font-bold font-serif text-sm flex items-center gap-2">
                            <button type="button" className="p-1 text-navy-900/60 hover:text-sky">
                              {cadeirasExpandidas.jor1_3 ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            <span>Introdução ao Jornalismo & História da Imprensa</span>
                          </td>
                          <td className="p-4 text-navy-900/70">1º Ano · 1º Semestre</td>
                          <td className="p-4 text-center font-bold text-sm font-mono">16.0 V</td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1 bg-leaf/10 border border-leaf/30 text-leaf font-bold px-2.5 py-1 rounded text-[11px]">
                              <CheckCircle2 size={12} /> Aprovado
                            </span>
                          </td>
                          <td className="p-4 text-right text-leaf font-bold font-sans">Passada</td>
                        </tr>
                        {cadeirasExpandidas.jor1_3 && (
                          <tr className="bg-cream/40">
                            <td colSpan={5} className="p-4 pl-10 border-t border-navy-100/60">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">1º Teste</span>
                                  <span className="font-mono font-bold text-sm text-navy-900">15.5 V</span>
                                </div>
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">2º Teste</span>
                                  <span className="font-mono font-bold text-sm text-navy-900">16.5 V</span>
                                </div>
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">Trabalho de Campo</span>
                                  <span className="font-mono font-bold text-sm text-navy-900">16.0 V</span>
                                </div>
                                <div className="p-3 bg-white rounded border border-leaf/40 shadow-sm">
                                  <span className="text-leaf text-[10px] uppercase font-bold block">Média Final</span>
                                  <span className="font-mono font-bold text-sm text-leaf">16.0 V</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}

                        <tr
                          onClick={() => setCadeirasExpandidas((p) => ({ ...p, jor3: !p.jor3 }))}
                          className="hover:bg-cream/40 transition-colors cursor-pointer bg-crimson/5"
                        >
                          <td className="p-4 font-bold font-serif text-sm text-crimson flex items-center gap-2">
                            <button type="button" className="p-1 text-crimson hover:text-navy-900">
                              {cadeirasExpandidas.jor3 ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            <span>Economia Política da Comunicação</span>
                          </td>
                          <td className="p-4 text-navy-900/70">1º Ano · 2º Semestre</td>
                          <td className="p-4 text-center font-bold text-sm font-mono text-crimson">8.5 V</td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1 bg-crimson/10 border border-crimson/30 text-crimson font-bold px-2.5 py-1 rounded text-[11px]">
                              <AlertTriangle size={12} /> Reprovado / Excluído
                            </span>
                          </td>
                          <td className="p-4 text-right text-crimson font-bold font-sans">Chumbada</td>
                        </tr>
                        {cadeirasExpandidas.jor3 && (
                          <tr className="bg-crimson/5">
                            <td colSpan={5} className="p-4 pl-10 border-t border-crimson/20">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="p-3 bg-white rounded border border-crimson/20 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">1º Teste Escrito</span>
                                  <span className="font-mono font-bold text-sm text-crimson">7.0 V</span>
                                </div>
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">2º Teste Escrito</span>
                                  <span className="font-mono font-bold text-sm text-navy-900">8.5 V</span>
                                </div>
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">Trabalho Prático</span>
                                  <span className="font-mono font-bold text-sm text-navy-900">10.0 V</span>
                                </div>
                                <div className="p-3 bg-white rounded border border-crimson/40 shadow-sm">
                                  <span className="text-crimson text-[10px] uppercase font-bold block">Situação de Exame</span>
                                  <span className="font-bold text-xs text-crimson">Recorrência (500,00 MT)</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}

                        <tr
                          onClick={() => setCadeirasExpandidas((p) => ({ ...p, jor1_5: !p.jor1_5 }))}
                          className="hover:bg-cream/40 transition-colors cursor-pointer"
                        >
                          <td className="p-4 font-bold font-serif text-sm flex items-center gap-2">
                            <button type="button" className="p-1 text-navy-900/60 hover:text-sky">
                              {cadeirasExpandidas.jor1_5 ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            <span>Gêneros Jornalísticos I (Notícia e Reportagem)</span>
                          </td>
                          <td className="p-4 text-navy-900/70">1º Ano · 2º Semestre</td>
                          <td className="p-4 text-center font-bold text-sm font-mono">13.8 V</td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1 bg-leaf/10 border border-leaf/30 text-leaf font-bold px-2.5 py-1 rounded text-[11px]">
                              <CheckCircle2 size={12} /> Aprovado
                            </span>
                          </td>
                          <td className="p-4 text-right text-leaf font-bold font-sans">Passada</td>
                        </tr>
                        {cadeirasExpandidas.jor1_5 && (
                          <tr className="bg-cream/40">
                            <td colSpan={5} className="p-4 pl-10 border-t border-navy-100/60">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">1º Teste</span>
                                  <span className="font-mono font-bold text-sm text-navy-900">13.0 V</span>
                                </div>
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">2º Teste</span>
                                  <span className="font-mono font-bold text-sm text-navy-900">14.0 V</span>
                                </div>
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">Reportagem de Campo</span>
                                  <span className="font-mono font-bold text-sm text-navy-900">14.5 V</span>
                                </div>
                                <div className="p-3 bg-white rounded border border-leaf/40 shadow-sm">
                                  <span className="text-leaf text-[10px] uppercase font-bold block">Média Final</span>
                                  <span className="font-mono font-bold text-sm text-leaf">13.8 V</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )}

                    {anoSelecionado === 2 && (
                      <>
                        <tr
                          onClick={() => setCadeirasExpandidas((p) => ({ ...p, jor2_1: !p.jor2_1 }))}
                          className="hover:bg-cream/40 transition-colors cursor-pointer"
                        >
                          <td className="p-4 font-bold font-serif text-sm flex items-center gap-2">
                            <button type="button" className="p-1 text-navy-900/60 hover:text-sky">
                              {cadeirasExpandidas.jor2_1 ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            <span>Jornalismo de Investigação</span>
                          </td>
                          <td className="p-4 text-navy-900/70">2º Ano · 1º Semestre</td>
                          <td className="p-4 text-center font-bold text-sm font-mono">15.5 V</td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1 bg-leaf/10 border border-leaf/30 text-leaf font-bold px-2.5 py-1 rounded text-[11px]">
                              <CheckCircle2 size={12} /> Aprovado
                            </span>
                          </td>
                          <td className="p-4 text-right text-leaf font-bold font-sans">Passada</td>
                        </tr>
                        {cadeirasExpandidas.jor2_1 && (
                          <tr className="bg-cream/40">
                            <td colSpan={5} className="p-4 pl-10 border-t border-navy-100/60">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">1º Teste</span>
                                  <span className="font-mono font-bold text-sm text-navy-900">15.0 V</span>
                                </div>
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">Dossiê Investigativo</span>
                                  <span className="font-mono font-bold text-sm text-navy-900">16.0 V</span>
                                </div>
                                <div className="p-3 bg-white rounded border border-leaf/40 shadow-sm">
                                  <span className="text-leaf text-[10px] uppercase font-bold block">Média Final</span>
                                  <span className="font-mono font-bold text-sm text-leaf">15.5 V</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}

                        <tr
                          onClick={() => setCadeirasExpandidas((p) => ({ ...p, jor2_2: !p.jor2_2 }))}
                          className="hover:bg-cream/40 transition-colors cursor-pointer bg-sky/5"
                        >
                          <td className="p-4 font-bold font-serif text-sm flex items-center gap-2">
                            <button type="button" className="p-1 text-navy-900/60 hover:text-sky">
                              {cadeirasExpandidas.jor2_2 ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            <span>Ciberjornalismo & Mídias Digitais</span>
                          </td>
                          <td className="p-4 text-navy-900/70">2º Ano · 1º Semestre</td>
                          <td className="p-4 text-center font-bold text-sm font-mono text-sky">—</td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1 bg-sky/10 border border-sky/30 text-sky font-bold px-2.5 py-1 rounded text-[11px]">
                              <Clock size={12} /> Em Frequência
                            </span>
                          </td>
                          <td className="p-4 text-right text-sky font-bold font-sans">A Decorrer</td>
                        </tr>
                        {cadeirasExpandidas.jor2_2 && (
                          <tr className="bg-sky/5">
                            <td colSpan={5} className="p-4 pl-10 border-t border-sky/20">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">1º Teste Prático</span>
                                  <span className="font-mono font-bold text-sm text-navy-900">14.0 V</span>
                                </div>
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">Projeto Web</span>
                                  <span className="font-mono font-bold text-sm text-sky">Em Avaliação</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}

                        <tr
                          onClick={() => setCadeirasExpandidas((p) => ({ ...p, jor2_3: !p.jor2_3 }))}
                          className="hover:bg-cream/40 transition-colors cursor-pointer bg-sky/5"
                        >
                          <td className="p-4 font-bold font-serif text-sm flex items-center gap-2">
                            <button type="button" className="p-1 text-navy-900/60 hover:text-sky">
                              {cadeirasExpandidas.jor2_3 ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            <span>Ateliê de Imprensa Escrita</span>
                          </td>
                          <td className="p-4 text-navy-900/70">2º Ano · 1º Semestre</td>
                          <td className="p-4 text-center font-bold text-sm font-mono text-sky">—</td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1 bg-sky/10 border border-sky/30 text-sky font-bold px-2.5 py-1 rounded text-[11px]">
                              <Clock size={12} /> Em Frequência
                            </span>
                          </td>
                          <td className="p-4 text-right text-sky font-bold font-sans">A Decorrer</td>
                        </tr>
                        {cadeirasExpandidas.jor2_3 && (
                          <tr className="bg-sky/5">
                            <td colSpan={5} className="p-4 pl-10 border-t border-sky/20">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">Edição de Jornal</span>
                                  <span className="font-mono font-bold text-sm text-navy-900">15.0 V</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}

                        <tr
                          onClick={() => setCadeirasExpandidas((p) => ({ ...p, jor2_4: !p.jor2_4 }))}
                          className="hover:bg-cream/40 transition-colors cursor-pointer"
                        >
                          <td className="p-4 font-bold font-serif text-sm flex items-center gap-2">
                            <button type="button" className="p-1 text-navy-900/60 hover:text-sky">
                              {cadeirasExpandidas.jor2_4 ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            <span>Direito da Comunicação e Liberdade de Imprensa</span>
                          </td>
                          <td className="p-4 text-navy-900/70">2º Ano · 2º Semestre</td>
                          <td className="p-4 text-center font-mono text-navy-900/40">—</td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1 bg-navy-900/5 text-navy-900/60 font-bold px-2.5 py-1 rounded text-[11px]">
                              Pendente
                            </span>
                          </td>
                          <td className="p-4 text-right text-navy-900/50 font-sans">A Iniciar</td>
                        </tr>
                        {cadeirasExpandidas.jor2_4 && (
                          <tr className="bg-cream/40">
                            <td colSpan={5} className="p-4 pl-10 border-t border-navy-100/60">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">Estado da Disciplina</span>
                                  <span className="font-bold text-xs text-navy-900">A iniciar no 2º Semestre</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )}

                    {anoSelecionado === 3 && (
                      <>
                        <tr
                          onClick={() => setCadeirasExpandidas((p) => ({ ...p, jor3_1: !p.jor3_1 }))}
                          className="hover:bg-cream/40 transition-colors cursor-pointer"
                        >
                          <td className="p-4 font-bold font-serif text-sm flex items-center gap-2">
                            <button type="button" className="p-1 text-navy-900/60 hover:text-sky">
                              {cadeirasExpandidas.jor3_1 ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            <span>Radiojornalismo e Produção Áudio</span>
                          </td>
                          <td className="p-4 text-navy-900/70">3º Ano · 1º Semestre</td>
                          <td className="p-4 text-center font-mono text-navy-900/40">—</td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1 bg-navy-900/5 text-navy-900/60 font-bold px-2.5 py-1 rounded text-[11px]">
                              Pendente
                            </span>
                          </td>
                          <td className="p-4 text-right text-navy-900/50 font-sans">A Iniciar</td>
                        </tr>
                        {cadeirasExpandidas.jor3_1 && (
                          <tr className="bg-cream/40">
                            <td colSpan={5} className="p-4 pl-10 border-t border-navy-100/60">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">Estado</span>
                                  <span className="font-bold text-xs text-navy-900">Programada para 3º Ano</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}

                        <tr
                          onClick={() => setCadeirasExpandidas((p) => ({ ...p, jor3_2: !p.jor3_2 }))}
                          className="hover:bg-cream/40 transition-colors cursor-pointer"
                        >
                          <td className="p-4 font-bold font-serif text-sm flex items-center gap-2">
                            <button type="button" className="p-1 text-navy-900/60 hover:text-sky">
                              {cadeirasExpandidas.jor3_2 ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            <span>Telejornalismo e Edição de Vídeo</span>
                          </td>
                          <td className="p-4 text-navy-900/70">3º Ano · 1º Semestre</td>
                          <td className="p-4 text-center font-mono text-navy-900/40">—</td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1 bg-navy-900/5 text-navy-900/60 font-bold px-2.5 py-1 rounded text-[11px]">
                              Pendente
                            </span>
                          </td>
                          <td className="p-4 text-right text-navy-900/50 font-sans">A Iniciar</td>
                        </tr>
                        {cadeirasExpandidas.jor3_2 && (
                          <tr className="bg-cream/40">
                            <td colSpan={5} className="p-4 pl-10 border-t border-navy-100/60">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">Estado</span>
                                  <span className="font-bold text-xs text-navy-900">Programada para 3º Ano</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )}

                    {anoSelecionado === 4 && (
                      <>
                        <tr
                          onClick={() => setCadeirasExpandidas((p) => ({ ...p, jor4_1: !p.jor4_1 }))}
                          className="hover:bg-cream/40 transition-colors cursor-pointer"
                        >
                          <td className="p-4 font-bold font-serif text-sm flex items-center gap-2">
                            <button type="button" className="p-1 text-navy-900/60 hover:text-sky">
                              {cadeirasExpandidas.jor4_1 ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            <span>Seminário de Projeto de Licenciatura</span>
                          </td>
                          <td className="p-4 text-navy-900/70">4º Ano · 1º Semestre</td>
                          <td className="p-4 text-center font-mono text-navy-900/40">—</td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1 bg-navy-900/5 text-navy-900/60 font-bold px-2.5 py-1 rounded text-[11px]">
                              Pendente
                            </span>
                          </td>
                          <td className="p-4 text-right text-navy-900/50 font-sans">A Iniciar</td>
                        </tr>
                        {cadeirasExpandidas.jor4_1 && (
                          <tr className="bg-cream/40">
                            <td colSpan={5} className="p-4 pl-10 border-t border-navy-100/60">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="p-3 bg-white rounded border border-navy-100 shadow-sm">
                                  <span className="text-navy-900/60 text-[10px] uppercase font-bold block">Projeto Final</span>
                                  <span className="font-bold text-xs text-navy-900">A iniciar no 4º Ano</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECÇÃO: SITUAÇÃO FINANCEIRA E PAGAMENTOS ONLINE */}
        {section === "financeiro" && (
          <div className="p-6 md:p-8 space-y-8">
            {/* Cartão de Situação Financeira com Fundo Azul — Estilo Perfil */}
            {(() => {
              const isRegularizado = perfil?.regularizado !== false;
              return (
                <div className={`rounded-xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${isRegularizado
                    ? "bg-gradient-to-r from-navy-900 to-navy-800 text-white border border-navy-800"
                    : "bg-gradient-to-r from-navy-900 via-crimson/30 to-navy-900 text-white border-2 border-crimson/60"
                  }`}>
                  {/* Esquerda: Dados do Estudante */}
                  <div className="flex items-center gap-5">
                    <div className="relative h-16 w-16 rounded-full bg-leaf flex items-center justify-center text-white font-bold text-2xl shadow-inner border-2 border-white/20 shrink-0 overflow-hidden">
                      {perfil?.avatar_url ? (
                        <img src={perfil.avatar_url} alt={perfil.nome} className="h-full w-full object-cover" />
                      ) : (
                        <span>{perfil?.nome ? perfil.nome[0].toUpperCase() : "E"}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-2xl text-white">
                        {perfil?.nome || "Amélia Zacarias Macuácua"}
                      </h3>
                      <div className="text-xs text-white/70 mt-1 space-y-1">
                        <div>N.º de Estudante: <strong className="text-sky-300 font-mono text-sm">{perfil?.numeroEstudante || "20260104MP"}</strong></div>
                        <div className="text-emerald-400 text-xs font-bold tracking-wide mt-0.5">{semestreActual}</div>
                      </div>

                    </div>
                  </div>

                  {/* Direita: Resumo Financeiro */}
                  <div className="border-t md:border-t-0 md:border-l border-white/15 pt-4 md:pt-0 md:pl-6 shrink-0 space-y-2 text-xs">
                    <p className="text-white/60 text-[11px] uppercase font-bold tracking-wider">Situação Financeira 2026</p>
                    <div className="flex items-center gap-2">
                      <span className="text-white/70">Total Pendente:</span>
                      <span className="font-serif font-bold text-lg text-leaf-300">0,00 MT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/70">Matrícula 2026:</span>
                      <span className="font-bold text-white text-xs">1.500,00 MT</span>
                      <span className="text-[10px] text-leaf-300 font-bold">✓ Pago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/70">Mensalidades:</span>
                      <span className="font-bold text-white text-xs">Fev — Set 2026</span>
                      <span className="text-[10px] text-leaf-300 font-bold">✓ Pagas</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 3 Cards de Estatísticas Financeiras (fora do card azul) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-lg border border-navy-100 shadow-sm space-y-1">
                <p className="text-[11px] text-navy-900/60 font-bold uppercase tracking-wider">TOTAL PENDENTE / DÍVIDA</p>
                <p className="font-serif font-extrabold text-2xl text-leaf">0,00 MT</p>
                <p className="text-[11px] text-leaf font-bold">Propinas em dia</p>
              </div>
              <div className="bg-white p-5 rounded-lg border border-navy-100 shadow-sm space-y-1">
                <p className="text-[11px] text-navy-900/60 font-bold uppercase tracking-wider">TAXA DE MATRÍCULA 2026</p>
                <p className="font-serif font-extrabold text-2xl text-navy-900">1.500,00 MT</p>
                <p className="text-[11px] text-leaf font-bold">✓ Liquidado</p>
              </div>
              <div className="bg-white p-5 rounded-lg border border-navy-100 shadow-sm space-y-1">
                <p className="text-[11px] text-navy-900/60 font-bold uppercase tracking-wider">MENSALIDADES 2026</p>
                <p className="font-serif font-extrabold text-2xl text-navy-900">Fev — Set 2026</p>
                <p className="text-[11px] text-leaf font-bold">✓ Todas Pagas</p>
              </div>
            </div>

            {/* Submenu de Tabs Financeiras */}
            <div className="bg-white border border-navy-100 rounded-lg p-1.5 flex flex-wrap items-center gap-1 shadow-sm">
              <button
                type="button"
                onClick={() => setAbaFinanceira("recibos")}
                className={`flex-1 min-w-[140px] px-4 py-3 text-xs font-bold rounded transition-colors flex items-center justify-center gap-2 ${abaFinanceira === "recibos"
                  ? "bg-navy-900 text-white shadow-sm"
                  : "text-navy-900/70 hover:text-navy-900 hover:bg-cream"
                  }`}
              >
                <Receipt size={16} />
                <span>a) Recibos de Pagamento</span>
              </button>

              <button
                type="button"
                onClick={() => setAbaFinanceira("recorrencia")}
                className={`flex-1 min-w-[140px] px-4 py-3 text-xs font-bold rounded transition-colors flex items-center justify-center gap-2 ${abaFinanceira === "recorrencia"
                  ? "bg-navy-900 text-white shadow-sm"
                  : "text-navy-900/70 hover:text-navy-900 hover:bg-cream"
                  }`}
              >
                <AlertTriangle size={16} />
                <span>b) Pagamento de Recorrências</span>
              </button>

              <button
                type="button"
                onClick={() => setAbaFinanceira("mudanca")}
                className={`flex-1 min-w-[140px] px-4 py-3 text-xs font-bold rounded transition-colors flex items-center justify-center gap-2 ${abaFinanceira === "mudanca"
                  ? "bg-navy-900 text-white shadow-sm"
                  : "text-navy-900/70 hover:text-navy-900 hover:bg-cream"
                  }`}
              >
                <FileText size={16} />
                <span>c) Mudança de Curso/Regime</span>
              </button>

              <button
                type="button"
                onClick={() => setAbaFinanceira("taxas")}
                className={`flex-1 min-w-[140px] px-4 py-3 text-xs font-bold rounded transition-colors flex items-center justify-center gap-2 ${abaFinanceira === "taxas"
                  ? "bg-navy-900 text-white shadow-sm"
                  : "text-navy-900/70 hover:text-navy-900 hover:bg-cream"
                  }`}
              >
                <Download size={16} />
                <span>d) Outras Taxas & Minutas</span>
              </button>
            </div>

            {/* Toast de Sucesso para Transações Financeiras */}
            {sucessoFin && (
              <div className="p-4 bg-leaf/15 border border-leaf/40 rounded-lg text-xs font-bold text-leaf flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  <span>{sucessoFin}</span>
                </div>
                <button type="button" onClick={() => setSucessoFin(null)} className="text-leaf hover:underline">
                  Fechar
                </button>
              </div>
            )}

            {/* TAB a) RECIBOS DE PAGAMENTO */}
            {abaFinanceira === "recibos" && (
              <div className="bg-white border border-navy-100 rounded-lg shadow-sm overflow-hidden space-y-4">
                <div className="p-6 border-b border-navy-100 bg-cream/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-navy-900">
                      Histórico de Recibos & Propinas Pagas em 2026
                    </h4>
                    <p className="text-xs text-navy-900/60 mt-0.5">
                      Descarregue ou consulte a via oficial dos seus recibos de matrícula e mensalidades.
                    </p>
                  </div>
                  <div className="text-xs font-bold text-navy-900 bg-white px-3 py-1.5 border border-navy-100 rounded shrink-0">
                    Total Quitado: 27.100,00 MT
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-navy-900/5 border-b border-navy-100 text-navy-900 font-bold uppercase tracking-wider">
                        <th className="p-4">N.º do Recibo</th>
                        <th className="p-4">Descrição do Serviço / Mês</th>
                        <th className="p-4 text-center">Data do Pagamento</th>
                        <th className="p-4 text-center">Valor Pago</th>
                        <th className="p-4 text-center">Método</th>
                        <th className="p-4 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-100 font-medium text-navy-900">
                      <tr className="hover:bg-cream/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-sky">REC-2026-00412</td>
                        <td className="p-4 font-bold font-serif">Taxa de Matrícula & Inscrição 2026</td>
                        <td className="p-4 text-center text-navy-900/70">12/01/2026</td>
                        <td className="p-4 text-center font-mono font-bold">1.500,00 MT</td>
                        <td className="p-4 text-center"><span className="px-2 py-0.5 bg-navy-900/10 text-navy-900 font-bold rounded text-[10px]">Millennium BIM</span></td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSucessoFin("Recibo REC-2026-00412 transferido com sucesso!")}
                            className="inline-flex items-center gap-1 bg-navy-900 hover:bg-sky text-white text-xs font-bold px-3 py-1.5 rounded transition-colors"
                          >
                            <Download size={13} /> Baixar Recibo PDF
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-cream/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-sky">REC-2026-01102</td>
                        <td className="p-4 font-bold font-serif">Propina Mensal — Fevereiro 2026</td>
                        <td className="p-4 text-center text-navy-900/70">03/02/2026</td>
                        <td className="p-4 text-center font-mono font-bold">3.200,00 MT</td>
                        <td className="p-4 text-center"><span className="px-2 py-0.5 bg-leaf/10 text-leaf font-bold rounded text-[10px]">M-Pesa</span></td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSucessoFin("Recibo REC-2026-01102 transferido com sucesso!")}
                            className="inline-flex items-center gap-1 bg-navy-900 hover:bg-sky text-white text-xs font-bold px-3 py-1.5 rounded transition-colors"
                          >
                            <Download size={13} /> Baixar Recibo PDF
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-cream/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-sky">REC-2026-02450</td>
                        <td className="p-4 font-bold font-serif">Propina Mensal — Março 2026</td>
                        <td className="p-4 text-center text-navy-900/70">04/03/2026</td>
                        <td className="p-4 text-center font-mono font-bold">3.200,00 MT</td>
                        <td className="p-4 text-center"><span className="px-2 py-0.5 bg-leaf/10 text-leaf font-bold rounded text-[10px]">M-Pesa</span></td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSucessoFin("Recibo REC-2026-02450 transferido com sucesso!")}
                            className="inline-flex items-center gap-1 bg-navy-900 hover:bg-sky text-white text-xs font-bold px-3 py-1.5 rounded transition-colors"
                          >
                            <Download size={13} /> Baixar Recibo PDF
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-cream/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-sky">REC-2026-08991</td>
                        <td className="p-4 font-bold font-serif">Propina Mensal — Abril a Setembro 2026 (Pacote Semestral)</td>
                        <td className="p-4 text-center text-navy-900/70">05/04/2026</td>
                        <td className="p-4 text-center font-mono font-bold">19.200,00 MT</td>
                        <td className="p-4 text-center"><span className="px-2 py-0.5 bg-navy-900/10 text-navy-900 font-bold rounded text-[10px]">BCI Net</span></td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSucessoFin("Recibo REC-2026-08991 transferido com sucesso!")}
                            className="inline-flex items-center gap-1 bg-navy-900 hover:bg-sky text-white text-xs font-bold px-3 py-1.5 rounded transition-colors"
                          >
                            <Download size={13} /> Baixar Recibo PDF
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB b) PAGAMENTO DE RECORRÊNCIAS */}
            {abaFinanceira === "recorrencia" && (
              <div className="bg-white border border-navy-100 rounded-lg p-6 shadow-sm space-y-6">
                <div>
                  <h4 className="font-serif text-lg font-bold text-navy-900">
                    Pagamento Online de Exame de Recorrência
                  </h4>
                  <p className="text-xs text-navy-900/60 mt-0.5">
                    Selecione a cadeira pendente para efetuar o pagamento da taxa de inscrição de exame de recorrência (500,00 MT por disciplina).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Cadeira Elegível para Recorrência *
                      </label>
                      <select className="w-full p-3 bg-white border border-navy-100 rounded text-xs font-semibold text-navy-900">
                        <option value="jor108">Economia Política da Comunicação (Nota: 8.5 V - Reprovado)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Taxa do Exame
                      </label>
                      <input
                        type="text"
                        disabled
                        value="500,00 MT (Fixado por cadeira)"
                        className="w-full p-3 bg-cream/70 border border-navy-100 rounded text-xs font-bold text-navy-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Método de Pagamento Online *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setMetodoPagamento("mpesa")}
                          className={`p-3 border rounded text-xs font-bold text-center transition-colors ${metodoPagamento === "mpesa" ? "bg-leaf/10 border-leaf text-leaf" : "bg-white border-navy-100 text-navy-900/70"
                            }`}
                        >
                          M-Pesa
                        </button>
                        <button
                          type="button"
                          onClick={() => setMetodoPagamento("emola")}
                          className={`p-3 border rounded text-xs font-bold text-center transition-colors ${metodoPagamento === "emola" ? "bg-leaf/10 border-leaf text-leaf" : "bg-white border-navy-100 text-navy-900/70"
                            }`}
                        >
                          e-Mola
                        </button>
                        <button
                          type="button"
                          onClick={() => setMetodoPagamento("banco")}
                          className={`p-3 border rounded text-xs font-bold text-center transition-colors ${metodoPagamento === "banco" ? "bg-leaf/10 border-leaf text-leaf" : "bg-white border-navy-100 text-navy-900/70"
                            }`}
                        >
                          BIM / BCI
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Número de Telefone M-Pesa / Referência Bancária *
                      </label>
                      <input
                        type="text"
                        placeholder="ex: 84 123 4567 ou Referência Bancária"
                        value={telefonePagamento}
                        onChange={(e) => setTelefonePagamento(e.target.value)}
                        className="w-full p-3 bg-white border border-navy-100 rounded text-xs text-navy-900"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSucessoFin("Pagamento de 500,00 MT para Exame de Recorrência (Economia Política) efetuado com sucesso! Guia de exame emitida e registada na sua conta.");
                        setTelefonePagamento("");
                      }}
                      className="w-full bg-leaf hover:bg-navy-900 text-white font-bold text-xs py-3.5 rounded transition-colors shadow-sm"
                    >
                      PAGAR RECORRÊNCIA ONLINE (500,00 MT)
                    </button>
                  </div>

                  <div className="p-5 bg-cream/60 border border-navy-100 rounded-lg space-y-3 text-xs">
                    <h5 className="font-serif font-bold text-sm text-navy-900 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-leaf" /> Instalações de Exames de Recorrência
                    </h5>
                    <ul className="space-y-2 text-navy-900/80 leading-relaxed list-disc pl-4">
                      <li>O pagamento confere acesso automático à pauta de Exames de Recorrência da época especial.</li>
                      <li>A confirmação do pagamento é processada em tempo real e notificada na conta do estudante.</li>
                      <li>Dúvidas pedagógicas devem ser remetidas ao regente da cadeira através da aba Cadeiras.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB c) PAGAMENTO DE PEDIDO DE MUDANÇA DE CURSO / REGIME */}
            {abaFinanceira === "mudanca" && (
              <div className="bg-white border border-navy-100 rounded-lg p-6 shadow-sm space-y-6">
                <div>
                  <h4 className="font-serif text-lg font-bold text-navy-900">
                    Pedido & Pagamento de Mudança de Curso ou Regime
                  </h4>
                  <p className="text-xs text-navy-900/60 mt-0.5">
                    Submeta o seu pedido oficial de transferência interna de curso ou alteração de regime (Diurno / Pós-laboral) com taxa de 1.200,00 MT.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Tipo de Solicitação *
                      </label>
                      <select className="w-full p-3 bg-white border border-navy-100 rounded text-xs font-semibold text-navy-900">
                        <option value="curso">Mudança de Curso (Atual: Jornalismo)</option>
                        <option value="regime">Mudança de Regime (Atual: Diurno para Pós-Laboral)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Curso / Regime Pretendido *
                      </label>
                      <select className="w-full p-3 bg-white border border-navy-100 rounded text-xs font-semibold text-navy-900">
                        <option value="rp">Licenciatura em Relações Públicas</option>
                        <option value="pm">Licenciatura em Publicidade e Marketing</option>
                        <option value="bd">Licenciatura em Biblioteconomia e Documentação</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Minuta Oficial Exigida (Download)
                      </label>
                      <a
                        href="https://esj.ac.mz/wp-content/uploads/2026/05/Minuta-de-Pedido-de-Mudanca-de-Curso.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold text-sky hover:underline"
                      >
                        <Download size={14} /> Descarregar Minuta de Pedido de Mudança de Curso (PDF)
                      </a>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Taxa Administrativa (1.200,00 MT)
                      </label>
                      <input
                        type="text"
                        disabled
                        value="1.200,00 MT"
                        className="w-full p-3 bg-cream/70 border border-navy-100 rounded text-xs font-bold text-navy-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Número para Pagamento (M-Pesa / e-Mola) *
                      </label>
                      <input
                        type="text"
                        placeholder="84 / 86 123 4567"
                        value={telefonePagamento}
                        onChange={(e) => setTelefonePagamento(e.target.value)}
                        className="w-full p-3 bg-white border border-navy-100 rounded text-xs text-navy-900"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSucessoFin("Pedido de Mudança de Curso & Pagamento de 1.200,00 MT submetido com sucesso! Acompanhe o despacho da Secretaria Académica na sua conta.");
                        setTelefonePagamento("");
                      }}
                      className="w-full bg-navy-800 hover:bg-sky text-white font-bold text-xs py-3.5 rounded transition-colors shadow-sm"
                    >
                      SUBMETER PEDIDO & PAGAR ONLINE (1.200,00 MT)
                    </button>
                  </div>

                  <div className="p-5 bg-cream/60 border border-navy-100 rounded-lg space-y-3 text-xs">
                    <h5 className="font-serif font-bold text-sm text-navy-900">
                      Regulamento de Mudança de Curso ESJ
                    </h5>
                    <p className="text-navy-900/80 leading-relaxed">
                      Os pedidos de mudança de curso decorrem mediante o preenchimento da minuta regulamentar, liquidação da taxa e validação das equivalências pelo Conselho Científico.
                    </p>
                    <div className="p-3 bg-white border border-navy-100 rounded">
                      <p className="font-bold text-navy-900">Estado dos Pedidos Anteriores:</p>
                      <p className="text-navy-900/60 mt-1">Nenhum pedido pendente registrado.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB d) OUTRAS TAXAS & MINUTAS ONLINE */}
            {abaFinanceira === "taxas" && (
              <div className="bg-white border border-navy-100 rounded-lg p-6 shadow-sm space-y-6">
                <div>
                  <h4 className="font-serif text-lg font-bold text-navy-900">
                    Solicitação & Pagamento de Requerimentos / Documentos
                  </h4>
                  <p className="text-xs text-navy-900/60 mt-0.5">
                    Requeira declarações de notas, certificados ou revisões com integração de minuta oficial e pagamento online.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Selecione o Requerimento / Documento Pretendido *
                      </label>
                      <select className="w-full p-3 bg-white border border-navy-100 rounded text-xs font-semibold text-navy-900">
                        <option value="notas">Declaração de Notas / Histórico (Taxa: 350,00 MT)</option>
                        <option value="freq">Declaração de Frequência (Taxa: 250,00 MT)</option>
                        <option value="cert">Certificado de Licenciatura (Taxa: 2.500,00 MT)</option>
                        <option value="cartao">2ª Via de Cartão de Estudante (Taxa: 300,00 MT)</option>
                        <option value="revisao">Revisão de Prova / Exame (Taxa: 450,00 MT)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Minuta Oficial Correspondente (Download)
                      </label>
                      <a
                        href="https://esj.ac.mz/wp-content/uploads/2026/05/Minuta-de-Pedido-de-Declaracao-de-Notas.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold text-sky hover:underline"
                      >
                        <Download size={14} /> Descarregar Minuta Oficial do Requerimento (PDF)
                      </a>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Número M-Pesa / e-Mola para Validação do Pagamento *
                      </label>
                      <input
                        type="text"
                        placeholder="84 / 86 123 4567"
                        value={telefonePagamento}
                        onChange={(e) => setTelefonePagamento(e.target.value)}
                        className="w-full p-3 bg-white border border-navy-100 rounded text-xs text-navy-900"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSucessoFin("Pedido de Requerimento e Pagamento Efetuado com Sucesso! A Declaração/Documento estará disponível para download na sua conta assim que for assinado.");
                        setTelefonePagamento("");
                      }}
                      className="w-full bg-leaf hover:bg-navy-900 text-white font-bold text-xs py-3.5 rounded transition-colors shadow-sm"
                    >
                      PAGAR & SUBMETER REQUERIMENTO ONLINE
                    </button>
                  </div>

                  <div className="p-5 bg-cream/60 border border-navy-100 rounded-lg space-y-4 text-xs">
                    <h5 className="font-serif font-bold text-sm text-navy-900 flex items-center gap-2">
                      <FileText size={16} className="text-sky" /> Lista de Minutas Académicas Rápidas
                    </h5>
                    <ul className="space-y-2 text-navy-900/80">
                      {MINUTAS.slice(0, 5).map((m, idx) => (
                        <li key={idx} className="flex items-center justify-between gap-2 p-2 bg-white rounded border border-navy-100/60">
                          <span className="font-medium truncate">{m.label}</span>
                          <a
                            href={m.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky font-bold hover:underline shrink-0"
                          >
                            PDF
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECÇÃO: MATERIAL DE ESTUDO POR CURSO */}
        {(section.startsWith("curso-") || section === "materiais") && (
          <div className="p-6 md:p-8 space-y-6">

            {/* Barra de Pesquisa */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative max-w-md flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-900/40"
                />
                <input
                  type="text"
                  placeholder="Pesquisar por cadeira, matéria ou docente…"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:outline-none focus:border-sky transition-colors"
                />
              </div>

              <div className="flex items-center gap-1 bg-white p-1 border border-navy-100 rounded">
                <button
                  type="button"
                  onClick={() => setFiltroTipo("todos")}
                  className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${filtroTipo === "todos"
                    ? "bg-sky/20 text-navy-900"
                    : "text-navy-900/60 hover:text-navy-900"
                    }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroTipo("pauta")}
                  className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${filtroTipo === "pauta"
                    ? "bg-sky/20 text-navy-900"
                    : "text-navy-900/60 hover:text-navy-900"
                    }`}
                >
                  Pautas
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroTipo("livro")}
                  className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${filtroTipo === "livro"
                    ? "bg-sky/20 text-navy-900"
                    : "text-navy-900/60 hover:text-navy-900"
                    }`}
                >
                  Livros
                </button>
              </div>
            </div>

            {/* Ficheiros por Cadeira */}
            {loading ? (
              <div className="bg-white border border-navy-100 p-8 text-center text-sm text-navy-900/60">
                A carregar materiais de estudo…
              </div>
            ) : cadeirasComMateriais.length === 0 ? (
              <div className="bg-white border border-navy-100 p-12 text-center">
                <BookOpen size={36} className="mx-auto text-navy-900/30 mb-3" />
                <p className="text-base font-serif font-bold text-navy-900">
                  Nenhum material disponível
                </p>
                <p className="mt-1 text-sm text-navy-900/60">
                  Ainda não há materiais partilhados para este curso.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {cadeirasComMateriais.map((cadeira) => (
                  <div
                    key={cadeira.slug}
                    className="bg-white border border-navy-100 rounded shadow-sm overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-navy-100 bg-cream/70 flex items-center justify-between">
                      <h3 className="font-serif text-lg font-bold text-navy-900">
                        {cadeira.nome}
                      </h3>
                      <span className="text-xs font-bold text-navy-900/50 bg-white px-2.5 py-1 rounded border border-navy-100">
                        {cadeira.materiais.length} {cadeira.materiais.length === 1 ? "recurso" : "recursos"}
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
                              </div>
                              <h4 className="font-serif text-base font-bold text-navy-900 leading-snug">
                                {m.titulo}
                              </h4>
                              <p className="text-xs text-navy-900/55 mt-0.5">
                                Docente: <span className="font-medium text-navy-900/80">{m.autor || "ESJ Docência"}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                            <button
                              type="button"
                              onClick={() => setLer(m)}
                              className="inline-flex items-center gap-1.5 bg-navy-900 hover:bg-sky text-white text-xs font-bold px-4 py-2.5 rounded transition-colors shadow-sm"
                            >
                              <Eye size={15} />
                              <span>Ler Documento</span>
                            </button>
                            <a
                              href={m.ficheiro}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 border border-navy-100 hover:border-sky text-navy-900 text-xs font-semibold px-3.5 py-2.5 rounded transition-colors"
                            >
                              <Download size={14} />
                              <span>Baixar</span>
                            </a>
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

        {/* SECÇÃO: CADEIRAS & DOCENTES LECCIONADORES */}
        {section === "cadeiras" && (
          <div className="p-6 md:p-8 space-y-6 max-w-5xl">
            <div className="bg-white border border-navy-100 rounded-lg p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-serif font-bold text-xl text-navy-900">
                    Plano de Estudos do Curso — {CURSOS_DOCENCIA.find((c) => c.slug === curso)?.titulo}
                  </h3>
                  <p className="text-xs text-navy-900/60 mt-1">
                    Regime: <strong className="uppercase">{regime}</strong> · Docente leccionador e planos analíticos por cadeira.
                  </p>
                </div>

                {/* Alternar Regime */}
                <div className="flex items-center gap-2 bg-cream p-1 rounded border border-navy-100">
                  <button
                    type="button"
                    onClick={() => setRegime("diurno")}
                    className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${regime === "diurno" ? "bg-navy-900 text-white" : "text-navy-900/60"
                      }`}
                  >
                    Diurno
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegime("pos-laboral")}
                    className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${regime === "pos-laboral" ? "bg-navy-900 text-white" : "text-navy-900/60"
                      }`}
                  >
                    Pós-Laboral
                  </button>
                </div>
              </div>

              {cadeirasCurriculo.length === 0 ? (
                <p className="text-sm text-navy-900/60 p-4">Sem cadeiras cadastradas para este regime.</p>
              ) : (
                <div className="space-y-4">
                  {cadeirasCurriculo.map((cad) => (
                    <div
                      key={cad.id}
                      className="p-5 border border-navy-100 rounded bg-cream/30 hover:border-sky transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-navy-900 text-white text-[10px] font-bold rounded">
                            {cad.codigo}
                          </span>
                          <span className="text-xs font-bold text-sky">
                            {cad.ano}º Ano · {cad.semestre}º Semestre
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-lg text-navy-900">{cad.nome}</h4>
                        <p className="text-xs text-navy-900/70">
                          Docente Responsável: <strong className="text-navy-900">{cad.docente}</strong>
                          {cad.docenteEmail && ` (${cad.docenteEmail})`}
                        </p>
                        {cad.descricao && <p className="text-xs text-navy-900/55 mt-1">{cad.descricao}</p>}
                      </div>

                      <div className="shrink-0">
                        {cad.planoAnaliticoUrl ? (
                          <a
                            href={cad.planoAnaliticoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-leaf hover:bg-crimson text-white text-xs font-bold px-4 py-2.5 rounded transition-colors shadow-sm"
                          >
                            <FileText size={15} />
                            <span>Plano Analítico (PDF)</span>
                          </a>
                        ) : (
                          <span className="text-xs text-navy-900/40 italic">Plano analítico pendente</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECÇÃO: PAUTAS ELETRÓNICAS E RESULTADOS */}
        {section === "pautas" && (
          <div className="p-6 md:p-8 space-y-6 max-w-5xl">
            <div className="bg-white border border-navy-100 rounded-lg p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-serif font-bold text-xl text-navy-900">
                    Pauta Eletrónica de Avaliação — {epauta.cadeira}
                  </h3>
                  <p className="text-xs text-navy-900/60 mt-1">
                    Cadeira: <strong>{epauta.codigoCadeira}</strong> · Docente: <strong>{epauta.docenteNome}</strong> · Ano Lectivo: <strong>{epauta.anoLectivo}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => exportarEpautaPDF(epauta)}
                  className="inline-flex items-center gap-2 bg-navy-900 hover:bg-sky text-white text-xs font-bold px-4 py-2.5 rounded transition-colors shadow-sm"
                >
                  <Printer size={16} />
                  <span>Descarregar Pauta (PDF)</span>
                </button>
              </div>

              {/* Tabela da Pauta Eletrónica */}
              <div className="overflow-x-auto border border-navy-100 rounded">
                <table className="w-full text-left text-xs text-navy-900 border-collapse">
                  <thead>
                    <tr className="bg-navy-900 text-white border-b border-navy-900">
                      <th className="p-3 text-center w-12">#</th>
                      <th className="p-3">Nº Estudante</th>
                      <th className="p-3">Nome do Estudante</th>
                      <th className="p-3 text-center">Teste 1</th>
                      <th className="p-3 text-center">Teste 2</th>
                      <th className="p-3 text-center">Trabalho</th>
                      <th className="p-3 text-center">Média Freq.</th>
                      <th className="p-3 text-center">Exame</th>
                      <th className="p-3 text-center">Média Final</th>
                      <th className="p-3 text-center">Resultado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-100">
                    {epauta.estudantes.map((e, idx) => {
                      const eEu = perfil?.numeroEstudante === e.numeroEstudante;
                      return (
                        <tr
                          key={e.numeroEstudante}
                          className={`transition-colors ${eEu ? "bg-sky/15 font-bold" : idx % 2 === 1 ? "bg-cream/40" : "bg-white"
                            }`}
                        >
                          <td className="p-3 text-center font-bold">{idx + 1}</td>
                          <td className="p-3 font-mono font-bold text-sky">{e.numeroEstudante}</td>
                          <td className="p-3">{e.nomeEstudante} {eEu && "(Você)"}</td>
                          <td className="p-3 text-center">{e.teste1?.toFixed(1) ?? "-"}</td>
                          <td className="p-3 text-center">{e.teste2?.toFixed(1) ?? "-"}</td>
                          <td className="p-3 text-center">{e.trabalho?.toFixed(1) ?? "-"}</td>
                          <td className="p-3 text-center font-bold">{e.mediaFrequencia?.toFixed(1) ?? "-"}</td>
                          <td className="p-3 text-center">{e.exameNormal?.toFixed(1) ?? "-"}</td>
                          <td className="p-3 text-center font-bold text-navy-900">{e.mediaFinal?.toFixed(1) ?? "-"}</td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${e.resultado === "Aprovado"
                                ? "bg-leaf/20 text-leaf"
                                : e.resultado === "Excluído"
                                  ? "bg-crimson/20 text-crimson"
                                  : "bg-amber-100 text-amber-800"
                                }`}
                            >
                              {e.resultado || "Pendente"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECÇÃO: CALENDÁRIO ACADÉMICO DETALHADO */}
        {section === "calendario" && (
          <div className="p-6 md:p-8 space-y-6 max-w-5xl">
            <div className="bg-white border border-navy-100 rounded-lg p-6 shadow-sm">
              <h3 className="font-serif font-bold text-xl text-navy-900 mb-1">
                Calendário Académico Oficial {calendario.anoLectivo}
              </h3>
              <p className="text-xs text-navy-900/60 mb-6">
                Feriados, exames, festivais e períodos de férias do ano lectivo da ESJ.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {calendario.eventos.map((ev) => {
                  const cat = labelCategoriaCalendario(ev.categoria);
                  return (
                    <div
                      key={ev.id}
                      className={`p-4 border rounded transition-colors ${ev.destaque ? "bg-cream/40 border-navy-200" : "bg-white border-navy-100"
                        }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold border rounded ${cat.bg} ${cat.color}`}>
                          {cat.label}
                        </span>
                        <span className="text-xs font-bold text-navy-900/70">{ev.dataRepresentativa}</span>
                      </div>
                      <h4 className="font-serif font-bold text-navy-900 text-base">{ev.titulo}</h4>
                      {ev.descricao && <p className="text-xs text-navy-900/60 mt-1">{ev.descricao}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SECÇÃO: DOCUMENTOS — MINUTAS & REQUERIMENTOS */}
        {(section === "doc-minutas" || section === "doc-requerimentos") && (
          <div className="p-6 md:p-8 space-y-6 max-w-4xl">
            <div className="bg-white border border-navy-100 rounded-lg p-6 shadow-sm">
              <h3 className="font-serif font-bold text-xl text-navy-900 mb-2">
                Documentos Académicos — {section === "doc-minutas" ? "Minutas" : "Requerimentos"}
              </h3>
              <p className="text-xs text-navy-900/60 mb-6">
                Modelos de cartas e formulários oficiais para submissão na Secretaria Académica.
              </p>

              <div className="space-y-4">
                <Link
                  href="/minutas"
                  className="p-5 border border-navy-100 rounded hover:border-sky transition-colors bg-cream/30 flex items-center justify-between gap-4 block"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={24} className="text-sky shrink-0" />
                    <div>
                      <h4 className="font-serif font-bold text-navy-900 text-base">Minutas de Requerimento Geral</h4>
                      <p className="text-xs text-navy-900/60 mt-0.5">Modelos de declaração de frequência, pedido de revisão de provas e anulação.</p>
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-sky shrink-0" />
                </Link>

                <Link
                  href="/regulamentos"
                  className="p-5 border border-navy-100 rounded hover:border-sky transition-colors bg-cream/30 flex items-center justify-between gap-4 block"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen size={24} className="text-leaf shrink-0" />
                    <div>
                      <h4 className="font-serif font-bold text-navy-900 text-base">Regulamentos Académicos e Normas</h4>
                      <p className="text-xs text-navy-900/60 mt-0.5">Estatuto do estudante, avaliação pedagógica e regime disciplinar.</p>
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-leaf shrink-0" />
                </Link>
              </div>
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
