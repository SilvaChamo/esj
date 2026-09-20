"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  Bell,
  Book,
  BookOpen,
  BookPlus,
  Calendar,
  CalendarDays,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  ExternalLink,
  Eye,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Images,
  KeyRound,
  LayoutDashboard,
  Mail,
  Menu,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  ScrollText,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  Video,
  LogOut,
  X,
} from "lucide-react";
import {
  DEFAULT_CALENDARIO,
  loadCalendario,
  type Calendario,
} from "@/lib/calendario";
import {
  type Categoria,
} from "@/lib/publicacao";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { COURSES } from "@/lib/inscricao";
import { ANO_LECTIVO, classificacao, cursoPorTitulo, mediaFinal } from "@/lib/admissao";
import { CURSOS_DOCENCIA, type CursoDocenciaSlug } from "@/lib/docencia";
import {
  cmsError,
  isMissingTable,
  listAnunciosGestao,
  listInscricoesGestao,
  listPautaLigadaACandidaturas,
  listTurmaLigadaACandidaturas,
  savePautaLinha,
  listNewsletterGestao,
  deleteNewsletter,
  listTelefonesInscricoes,
  listVideosGestao,
  listEditaisGestao,
  addEdital,
  updateEdital,
  deleteEdital,
  setEditalVigente,
  publishCalendario,
  guardarNoticia,
  addPublicacaoImagem,
  listPublicacoesGestao,
  updatePublicacaoImagem,
  deletePublicacao,
  setPublicacaoDestaque,
  publishVideo,
  updateVideo,
  deleteVideo,
  setVideoPrincipal,
  statsAnoLectivo,
  type EstadoNoticia,
} from "@/lib/cms";
import { destEhSubscritores, segmentosSms, telemoveisDeContactos, telemoveisUnicos } from "@/lib/sms";
import { videoEmbedSrc } from "@/lib/videos";
import { tipoFicheiroEdital } from "@/lib/editais";
import SchemaInstall from "@/components/gestao/SchemaInstall";
import ResultadosPauta from "@/components/gestao/ResultadosPauta";
import Galeria from "@/components/gestao/Galeria";
import AlbunsGaleria from "@/components/gestao/AlbunsGaleria";
import ImageSelector from "@/components/gestao/ImageSelector";
import NoticiaEditor from "@/components/gestao/NoticiaEditor";
import Documentos from "@/components/gestao/Documentos";
import ContasDocentes from "@/components/gestao/ContasDocentes";
import ContasEstudantes from "@/components/gestao/ContasEstudantes";
import ContasAdministradores from "@/components/gestao/ContasAdministradores";
import Cadeiras from "@/components/gestao/Cadeiras";
import SituacaoEstudantes from "@/components/gestao/SituacaoEstudantes";
import NewsletterEnvio from "@/components/gestao/NewsletterEnvio";
import FolhaAcademica from "@/components/gestao/FolhaAcademica";
import BibliotecaCientificaGestao from "@/components/gestao/BibliotecaCientifica";
import { textoDeHtml } from "@/lib/html-noticia";
import type { CursoBibliotecaCodigo } from "@/lib/producao-cientifica";

type Section =
  | "painel"
  | "candidaturas"
  | "resultados"
  | "calendario"
  | "edital"
  | "noticias"
  | "anuncios"
  | "newsletter"
  | "folha"
  | "eventos"
  | "galeria"
  | "albuns"
  | "videos"
  | "documentos"
  | "subscritores"
  | "cadeiras"
  | "docentes"
  | "estudantes"
  | "administradores"
  | "situacao"
  | "bib-jj"
  | "bib-pm"
  | "bib-rp"
  | "bib-bd";

type NavIcon = typeof LayoutDashboard;
type NavLeaf = { id: Section; label: string; icon: NavIcon };
type NavGroup = { label: string; icon: NavIcon; children: NavLeaf[] };
type NavEntry = NavLeaf | NavGroup;

function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry;
}

const BIB_SECTION: Record<
  "bib-jj" | "bib-pm" | "bib-rp" | "bib-bd",
  CursoBibliotecaCodigo
> = {
  "bib-jj": "JJ",
  "bib-pm": "PM",
  "bib-rp": "RP",
  "bib-bd": "BD",
};

function isBibSection(section: Section): section is keyof typeof BIB_SECTION {
  return section in BIB_SECTION;
}

/** Mesmo fundo da zona da conta (avatar) no fundo da barra lateral. */
const SIDEBAR_MUTED = "bg-black/20";

const NAV: NavEntry[] = [
  { id: "painel", label: "Painel", icon: LayoutDashboard },
  {
    label: "Ano lectivo",
    icon: GraduationCap,
    children: [
      { id: "candidaturas", label: "Candidaturas", icon: Users },
      { id: "resultados", label: "Pautas", icon: ClipboardList },
      { id: "calendario", label: "Calendário Académico", icon: Calendar },
      { id: "edital", label: "Edital", icon: FileText },
    ],
  },
  {
    label: "Publicações",
    icon: BookOpen,
    children: [
      { id: "noticias", label: "Notícias", icon: Newspaper },
      { id: "newsletter", label: "Newsletter", icon: Send },
      { id: "folha", label: "Folha académica", icon: ScrollText },
      { id: "anuncios", label: "SMS", icon: Bell },
      { id: "eventos", label: "Eventos", icon: CalendarDays },
      { id: "videos", label: "Vídeos", icon: Video },
    ],
  },
  {
    label: "Biblioteca",
    icon: Book,
    children: [
      { id: "bib-jj", label: "Jornalismo", icon: BookOpen },
      { id: "bib-pm", label: "P. marketing", icon: BookOpen },
      { id: "bib-rp", label: "Relações Públicas", icon: BookOpen },
      { id: "bib-bd", label: "B. Documentação", icon: BookOpen },
    ],
  },
  {
    label: "Galeria",
    icon: Images,
    children: [
      { id: "albuns", label: "Álbum", icon: Images },
      { id: "galeria", label: "Imagens", icon: ImageIcon },
      { id: "documentos", label: "Documentos", icon: FileText },
    ],
  },
  { id: "cadeiras", label: "Cadeiras", icon: BookPlus },
  { id: "situacao", label: "Situação dos estudantes", icon: UserCheck },
  {
    label: "Contas",
    icon: Users,
    children: [
      { id: "docentes", label: "Docentes", icon: GraduationCap },
      { id: "estudantes", label: "Estudantes", icon: Users },
      { id: "administradores", label: "Administradores", icon: ShieldCheck },
      { id: "subscritores", label: "Subscritores", icon: Mail },
    ],
  },
];

function sectionLabel(section: Section): string {
  for (const entry of NAV) {
    if (isNavGroup(entry)) {
      const child = entry.children.find((c) => c.id === section);
      if (child) return child.label;
    } else if (entry.id === section) {
      return entry.label;
    }
  }
  return "";
}

function groupOf(section: Section): NavGroup | undefined {
  return NAV.find(
    (entry): entry is NavGroup => isNavGroup(entry) && entry.children.some((c) => c.id === section)
  );
}

export default function GestaoDashboard() {
  const [section, setSection] = useState<Section>("painel");
  const [note, setNote] = useState("");
  const [needsSchema, setNeedsSchema] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [smsBloqueado, setSmsBloqueado] = useState<{ telefones: string[] } | null>(null);
  const [eventosTab, setEventosTab] = useState<"coloquio" | "livro">("coloquio");
  // Filtro inicial da lista de estudantes quando se chega lá a partir de uma
  // cadeira específica na lista de docentes (ver comentário em verEstudantesCadeira).
  const [filtroEstudantesInicial, setFiltroEstudantesInicial] = useState<{ curso: string; ano: number } | null>(
    null
  );

  useEffect(() => {
    const active = groupOf(section);
    if (active) setOpenGroup(active.label);
  }, [section]);

  // Clicar no cabeçalho de um grupo abre-o e navega logo para o seu
  // primeiro item — o chevron, à parte, só expande/colapsa sem navegar.
  const goToGroup = (label: string, firstId: Section) => {
    setSmsBloqueado(null);
    setFiltroEstudantesInicial(null);
    setOpenGroup(label);
    setSection(firstId);
    setIsMobileMenuOpen(false);
  };

  const toggleGroupOnly = (label: string) => {
    setOpenGroup((prev) => (prev === label ? null : label));
  };

  const goToLeaf = (id: Section) => {
    setSmsBloqueado(null);
    setFiltroEstudantesInicial(null);
    setSection(id);
    setIsMobileMenuOpen(false);
  };

  // Clicar numa cadeira na lista de docentes leva à lista de estudantes já
  // filtrada por curso + ano dessa cadeira (turma_estudantes não guarda a
  // cadeira em si, só curso/regime/ano — é a mesma turma usada na pauta do docente).
  const verEstudantesCadeira = (curso: string, ano: number) => {
    setFiltroEstudantesInicial({ curso, ano });
    setSection("estudantes");
  };

  useEffect(() => {
    try {
      const supabase = createBrowserSupabase();
      void supabase
        .from("noticias")
        .select("slug")
        .limit(1)
        .then(({ error }) => {
          if (error && isMissingTable(error)) setNeedsSchema(true);
        });
      void supabase.auth.getUser().then(({ data }) => {
        if (data.user?.email) setUserEmail(data.user.email);
      });
    } catch {
      /* env em falta */
    }
  }, []);

  const showNote = (msg: string) => {
    const limpo = msg.replace(/\s+/g, " ").trim();
    setNote(limpo.length > 180 ? `${limpo.slice(0, 177)}…` : limpo);
    window.setTimeout(() => setNote(""), 4200);
  };

  const sair = async () => {
    try {
      const supabase = createBrowserSupabase();
      await supabase.auth.signOut();
    } catch {
      /* env em falta */
    }
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Barra móvel */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-navy-900 border-b border-white/10 z-[80] flex items-center justify-between px-4">
        <span className="flex items-center gap-2.5 overflow-hidden">
          <Image
            src="/esj-logo-mark.png"
            alt="ESJ"
            width={32}
            height={32}
            className="h-8 w-8 object-contain rounded-sm shrink-0"
          />
          <span className="font-serif font-bold text-white text-sm truncate">Área de gestão</span>
        </span>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          className="p-2 text-white/80 hover:text-white"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-[70]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[80] lg:z-30 bg-navy-900 text-white flex flex-col transition-all duration-300 transform
          ${isCollapsed ? "w-20" : "w-[240px]"}
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div
          className={`flex items-center gap-3 border-b border-white/10 transition-all ${
            isCollapsed ? "justify-center py-5 px-2" : "px-5 py-5"
          }`}
        >
          <Image
            src="/esj-logo-mark.png"
            alt="ESJ"
            width={40}
            height={40}
            className="h-10 w-10 object-contain rounded-sm shrink-0"
          />
          {!isCollapsed && (
            <div className="overflow-hidden min-w-0">
              <p className="font-serif font-bold leading-tight truncate">Área de gestão</p>
              <p className="text-[11px] text-white/50 truncate">Secretaria académica</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map((entry) => {
            if (!isNavGroup(entry)) {
              const { id, label, icon: Icon } = entry;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => goToLeaf(id)}
                  title={isCollapsed ? label : undefined}
                  className={`w-full flex items-center gap-3 text-sm text-left transition-colors ${
                    isCollapsed ? "justify-center px-2 py-3" : "px-5 py-3"
                  } ${
                    section === id
                      ? "bg-sky/10 text-sky-300 font-bold border-l-2 border-sky-300"
                      : "text-white/70 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
                  }`}
                >
                  <Icon size={16} className="shrink-0" />
                  {!isCollapsed && label}
                </button>
              );
            }

            const GroupIcon = entry.icon;
            const isOpen = openGroup === entry.label;
            const hasActiveChild = entry.children.some((c) => c.id === section);

            if (isCollapsed) {
              return (
                <button
                  key={entry.label}
                  type="button"
                  onClick={() => goToGroup(entry.label, entry.children[0].id)}
                  title={entry.label}
                  className={`w-full flex items-center justify-center px-2 py-3 transition-colors ${
                    hasActiveChild ? "text-sky-300" : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <GroupIcon size={16} className="shrink-0" />
                </button>
              );
            }

            return (
              <div key={entry.label}>
                <div
                  className={`flex items-center transition-colors ${
                    hasActiveChild ? "text-sky-300" : "text-white/70"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => goToGroup(entry.label, entry.children[0].id)}
                    className="flex-1 min-w-0 flex items-center gap-3 pl-5 pr-2 py-3 text-sm font-bold text-left hover:text-white transition-colors"
                  >
                    <GroupIcon size={16} className="shrink-0" />
                    <span className="truncate">{entry.label}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleGroupOnly(entry.label)}
                    title={isOpen ? "Colapsar" : "Expandir"}
                    className="pl-2 pr-5 py-3 text-white/50 hover:text-white transition-colors"
                  >
                    <ChevronRight size={14} className={`transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  </button>
                </div>
                {isOpen && (
                  <div className={`relative ${SIDEBAR_MUTED} py-0.5`}>
                    <div className="absolute left-[26px] top-1 bottom-1 w-px bg-white/10" />
                    {entry.children.map((child) => {
                      const ChildIcon = child.icon;
                      const active = section === child.id;
                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => goToLeaf(child.id)}
                          className={`relative w-full flex items-center gap-3 pl-11 pr-5 py-1.5 text-[13px] text-left transition-colors ${
                            active
                              ? "text-sky-300 font-bold"
                              : "text-white/60 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {active && (
                            <div className="absolute left-[26px] top-1/2 -translate-y-1/2 h-4 w-[2px] bg-sky-300" />
                          )}
                          <ChildIcon size={14} className="shrink-0" />
                          {child.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div
          className={`border-t border-white/10 ${SIDEBAR_MUTED} flex items-center gap-2 ${
            isCollapsed ? "justify-center px-2 py-4" : "px-5 py-4"
          }`}
        >
          <div className="h-9 w-9 shrink-0 rounded-full bg-sky flex items-center justify-center text-sm font-bold text-navy-900">
            {userEmail ? userEmail[0].toUpperCase() : "?"}
          </div>
          {!isCollapsed && (
            <p className="flex-1 min-w-0 text-xs text-white/70 truncate">{userEmail || "Utilizador"}</p>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed((v) => !v)}
            className="hidden lg:block shrink-0 text-white/50 hover:text-white transition-colors p-1.5"
            title={isCollapsed ? "Expandir" : "Colapsar"}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
      </aside>

      <div
        className={`flex flex-col min-h-screen transition-all duration-300 mt-16 lg:mt-0 ${
          isCollapsed ? "lg:ml-20" : "lg:ml-[240px]"
        }`}
      >
        <header className="sticky top-0 z-30 bg-white border-b border-navy-100 px-4 sm:px-8 py-3 flex items-center justify-between gap-4 shadow-sm">
          <div>
            <h1 className="font-serif text-xl font-bold text-navy-900">
              {sectionLabel(section)}
            </h1>
            {section === "noticias" ? (
              <p className="mt-0.5 text-[15px] font-bold text-sky">Adicionar notícia</p>
            ) : section === "estudantes" ? (
              <p className="mt-0.5 text-xs text-navy-900/60 font-medium">
                Gestão de Contas de Estudantes · Visualize e garanta o acesso dos estudantes por curso/regime
              </p>
            ) : (
              <p className="mt-0.5 text-[11px] font-bold tracking-widest text-sky">SECRETARIA ACADÉMICA</p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {section === "edital" && (
              <button
                type="button"
                onClick={() => document.getElementById("edital-adicionar")?.click()}
                className="flex items-center px-3 py-2 bg-white border border-[#2271b1] text-[#2271b1] text-sm font-semibold hover:bg-[#f6f7f7] whitespace-nowrap"
              >
                Adicionar edital
              </button>
            )}
            {section === "galeria" && (
              <>
                <button
                  type="button"
                  id="galeria-importar-site"
                  onClick={() => document.getElementById("galeria-importar-site-btn")?.click()}
                  className="flex items-center px-3 py-2 bg-white border border-[#2271b1] text-[#2271b1] text-sm font-semibold hover:bg-[#f6f7f7] whitespace-nowrap"
                >
                  Importar fotos do site
                </button>
                <label
                  htmlFor="galeria-upload"
                  className="flex items-center px-3 py-2 bg-white border border-[#2271b1] text-[#2271b1] text-sm font-semibold hover:bg-[#f6f7f7] cursor-pointer whitespace-nowrap"
                >
                  Adicionar ficheiros multimédia
                </label>
              </>
            )}
            {section === "albuns" && (
              <button
                type="button"
                id="albuns-adicionar"
                onClick={() => document.getElementById("albuns-novo")?.click()}
                className="flex items-center px-3 py-2 bg-white border border-[#2271b1] text-[#2271b1] text-sm font-semibold hover:bg-[#f6f7f7] whitespace-nowrap"
              >
                Adicionar álbum
              </button>
            )}
            {section === "eventos" && (
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById(
                      eventosTab === "livro" ? "livros-adicionar" : "eventos-adicionar"
                    )
                    ?.click()
                }
                className="flex items-center px-3 py-2 bg-white border border-[#2271b1] text-[#2271b1] text-sm font-semibold hover:bg-[#f6f7f7] whitespace-nowrap"
              >
                {eventosTab === "livro" ? "Adicionar livro" : "Adicionar cartaz"}
              </button>
            )}
            {isBibSection(section) && (
              <button
                type="button"
                onClick={() =>
                  document.getElementById(`biblioteca-adicionar-${BIB_SECTION[section]}`)?.click()
                }
                className="flex items-center px-3 py-2 bg-white border border-[#2271b1] text-[#2271b1] text-sm font-semibold hover:bg-[#f6f7f7] whitespace-nowrap"
              >
                Adicionar projecto
              </button>
            )}
            {section === "videos" && (
              <button
                type="button"
                onClick={() => document.getElementById("videos-adicionar")?.click()}
                className="flex items-center px-3 py-2 bg-white border border-[#2271b1] text-[#2271b1] text-sm font-semibold hover:bg-[#f6f7f7] whitespace-nowrap"
              >
                Adicionar vídeos
              </button>
            )}
            {section === "documentos" && (
              <label
                id="documentos-upload-label"
                htmlFor="documentos-upload"
                className="flex items-center px-3 py-2 bg-white border border-[#2271b1] text-[#2271b1] text-sm font-semibold hover:bg-[#f6f7f7] cursor-pointer whitespace-nowrap"
              >
                Adicionar ficheiro
              </label>
            )}
            {section === "subscritores" && (
              <button
                type="button"
                onClick={() => document.getElementById("subscritores-baixar-pdf")?.click()}
                className="flex items-center px-3 py-2 bg-white border border-[#2271b1] text-[#2271b1] text-sm font-semibold hover:bg-[#f6f7f7] whitespace-nowrap"
              >
                Baixar PDF
              </button>
            )}
            {section === "estudantes" && (
              <button
                type="button"
                onClick={() => document.getElementById("btn-criar-estudante-modal")?.click()}
                className="inline-flex items-center gap-1.5 bg-sky hover:bg-sky/90 text-white font-bold text-xs px-3.5 py-2 rounded shadow-sm transition-colors whitespace-nowrap"
              >
                <UserPlus size={14} />
                Criar Conta
              </button>
            )}
            {section === "docentes" && (
              <button
                type="button"
                onClick={() => document.getElementById("btn-criar-docente-modal")?.click()}
                className="inline-flex items-center gap-1.5 bg-sky hover:bg-sky/90 text-white font-bold text-xs px-3.5 py-2 rounded shadow-sm transition-colors whitespace-nowrap"
              >
                <UserPlus size={14} />
                Adicionar Docente
              </button>
            )}
            {section === "administradores" && (
              <button
                type="button"
                onClick={() => document.getElementById("btn-criar-administrador-modal")?.click()}
                className="inline-flex items-center gap-1.5 bg-sky hover:bg-sky/90 text-white font-bold text-xs px-3.5 py-2 rounded shadow-sm transition-colors whitespace-nowrap"
              >
                <UserPlus size={14} />
                Adicionar Administrador
              </button>
            )}
            {section === "cadeiras" && (
              <button
                type="button"
                onClick={() => document.getElementById("btn-criar-cadeira-modal")?.click()}
                className="inline-flex items-center gap-1.5 bg-sky hover:bg-sky/90 text-white font-bold text-xs px-3.5 py-2 rounded shadow-sm transition-colors whitespace-nowrap"
              >
                <BookPlus size={14} />
                Adicionar Cadeira
              </button>
            )}
            <button
              type="button"
              onClick={sair}
              className="flex items-center gap-2 text-sm font-bold text-navy-900/70 hover:text-sky transition-colors"
            >
              <LogOut size={15} />
              Sair
            </button>
          </div>
        </header>

        {section === "eventos" && (
          <div className="bg-white border-b border-navy-100 px-4 sm:px-8">
            <div className="flex">
              {(
                [
                  { id: "coloquio" as const, label: "Colóquios" },
                  { id: "livro" as const, label: "Lançamento de livro" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEventosTab(t.id)}
                  className={`relative -mb-px px-5 py-2.5 text-sm font-bold tracking-wide transition-colors ${
                    eventosTab === t.id
                      ? "z-10 text-navy-900 border-b-2 border-sky"
                      : "text-navy-900/55 hover:text-navy-900"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <main className="flex-1 px-4 sm:px-8 py-4 sm:py-5">
          {needsSchema && <SchemaInstall />}
          {section === "painel" && (
            <Painel
              onGo={(id) => {
                setSmsBloqueado(null);
                setFiltroEstudantesInicial(null);
                setSection(id);
              }}
              userEmail={userEmail}
            />
          )}
          {section === "edital" && <Edital onAction={showNote} />}
          {section === "eventos" && (
            <Publicacoes
              key={eventosTab}
              onAction={showNote}
              categoria={eventosTab === "livro" ? "livro" : "evento"}
            />
          )}
          {isBibSection(section) && (
            <BibliotecaCientificaGestao
              key={section}
              curso={BIB_SECTION[section]}
              onAction={showNote}
            />
          )}
          {section === "galeria" && <Galeria />}
          {section === "albuns" && <AlbunsGaleria />}
          {section === "calendario" && <CalendarioAcademico onAction={showNote} />}
          {section === "resultados" && <ResultadosPauta onAction={showNote} />}
          {section === "noticias" && <Noticias onAction={showNote} />}
          {section === "newsletter" && <NewsletterEnvio onAction={showNote} />}
          {section === "folha" && <FolhaAcademica onAction={showNote} />}
          {section === "videos" && <Videos onAction={showNote} />}
          {section === "documentos" && <Documentos />}
          {section === "cadeiras" && <Cadeiras />}
          {section === "docentes" && <ContasDocentes onVerEstudantesCadeira={verEstudantesCadeira} />}
          {section === "estudantes" && <ContasEstudantes filtroInicial={filtroEstudantesInicial} />}
          {section === "administradores" && <ContasAdministradores />}
          {section === "situacao" && <SituacaoEstudantes onAction={showNote} />}
          {section === "candidaturas" && <Candidaturas />}
          {section === "anuncios" && (
            <Anuncios
              key={smsBloqueado ? "sms-subscritores" : "sms"}
              onAction={showNote}
              bloqueado={smsBloqueado}
            />
          )}
          {section === "subscritores" && (
            <Subscritores
              onAction={showNote}
              onEnviarSms={(telefones) => {
                setSmsBloqueado({ telefones });
                setOpenGroup("Publicações");
                setSection("anuncios");
                setIsMobileMenuOpen(false);
              }}
            />
          )}
        </main>
      </div>

      {note && (
        <div
          className="fixed bottom-6 right-6 z-[200] max-w-sm bg-navy-800 text-white text-sm font-semibold px-5 py-4 shadow-lg"
          role="status"
        >
          {note}
        </div>
      )}
    </div>
  );
}

const CARD_COLORS = [
  { bg: "bg-sky/10", text: "text-sky" },
  { bg: "bg-leaf/10", text: "text-leaf" },
  { bg: "bg-crimson/10", text: "text-crimson" },
  { bg: "bg-navy-100", text: "text-navy-800" },
];

function Painel({ onGo, userEmail }: { onGo: (s: Section) => void; userEmail: string }) {
  const [stats, setStats] = useState<{ total: number; porCurso: { curso: string; total: number }[] }>({
    total: 0,
    porCurso: [],
  });
  useEffect(() => {
    statsAnoLectivo()
      .then(setStats)
      .catch(() => setStats({ total: 0, porCurso: [] }));
  }, []);

  const cursosComTotais = COURSES.map((curso) => ({
    curso,
    nome: curso.replace(/^Licenciatura em\s+/i, ""),
    total: stats.porCurso.find((c) => c.curso === curso)?.total ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white border border-navy-100 p-8">
        <h2 className="font-serif text-base font-bold text-navy-900">Bem-vindo ao painel de administração</h2>
        <p className="mt-1 text-xs text-navy-900/65">
          Olá, {userEmail || "utilizador"}. Este é o seu painel de gestão.
        </p>

        <div className="mt-6 pt-6 border-t border-navy-100 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-[11px] font-bold tracking-widest text-sky">INTRODUÇÃO</p>
            <p className="mt-2 text-sm text-navy-900/65">Veja todas as notícias ou</p>
            <button
              type="button"
              onClick={() => onGo("noticias")}
              className="mt-3 bg-leaf hover:bg-crimson text-white font-semibold text-xs tracking-wide px-4 py-2.5 transition-colors"
            >
              ADICIONAR NOVA NOTÍCIA
            </button>
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-widest text-sky">PRÓXIMOS PASSOS</p>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-navy-900 hover:text-crimson"
                >
                  <ExternalLink size={13} /> Ver o seu sítio
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onGo("candidaturas")}
                  className="inline-flex items-center gap-1.5 text-navy-900 hover:text-crimson"
                >
                  <Users size={13} /> Gerir candidaturas
                </button>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-widest text-sky">MAIS ACÇÕES</p>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onGo("galeria")}
                  className="inline-flex items-center gap-1.5 text-navy-900 hover:text-crimson"
                >
                  <Images size={13} /> Adicionar multimédia
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onGo("videos")}
                  className="inline-flex items-center gap-1.5 text-navy-900 hover:text-crimson"
                >
                  <Video size={13} /> Gerir vídeos
                </button>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-widest text-sky flex items-center gap-1.5">
              <GraduationCap size={13} /> RESUMO DO ANO LECTIVO
            </p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li className="flex items-center justify-between gap-4">
                <span className="text-navy-900/70">Inscritos</span>
                <strong className="text-navy-900">{stats.total}</strong>
              </li>
              <li className="flex items-center justify-between gap-4">
                <span className="text-navy-900/70">Cursos</span>
                <strong className="text-navy-900">{stats.porCurso.length}</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cursosComTotais.map((c, i) => {
            const color = CARD_COLORS[i % CARD_COLORS.length];
            return (
              <button
                key={c.curso}
                type="button"
                onClick={() => onGo("candidaturas")}
                className="bg-white border border-navy-100 p-6 flex flex-col items-center text-center hover:border-sky transition-colors"
              >
                <span className={`h-11 w-11 rounded-full ${color.bg} ${color.text} flex items-center justify-center mb-3`}>
                  <GraduationCap size={18} />
                </span>
                <span className="text-2xl font-bold text-navy-900">{c.total}</span>
                <span className="mt-1 text-[11px] font-semibold tracking-wide text-navy-900/55">
                  {c.nome.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Edital({ onAction }: { onAction: (m: string) => void }) {
  const [items, setItems] = useState<
    { id: string; title: string; file_url: string; vigente?: boolean }[]
  >([]);
  const [busy, setBusy] = useState(false);
  const [abrir, setAbrir] = useState(false);
  const [editar, setEditar] = useState<{ id: string; title: string; file_url: string } | null>(null);
  const [titulo, setTitulo] = useState("");
  const [ficheiroUrl, setFicheiroUrl] = useState("");
  const [selectorAberto, setSelectorAberto] = useState(false);
  const [selectorTab, setSelectorTab] = useState<"upload" | "galeria">("upload");

  const refresh = () => {
    listEditaisGestao()
      .then(setItems)
      .catch(() => setItems([]));
  };

  useEffect(() => {
    refresh();
  }, []);

  const abrirNovo = () => {
    setEditar(null);
    setTitulo("");
    setFicheiroUrl("");
    setAbrir(true);
  };

  const abrirEditar = (item: { id: string; title: string; file_url: string }) => {
    setEditar(item);
    setTitulo(item.title);
    setFicheiroUrl(item.file_url);
    setAbrir(true);
  };

  const fechar = () => {
    setAbrir(false);
    setEditar(null);
    setFicheiroUrl("");
    setSelectorAberto(false);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = titulo.trim();
    if (!title) {
      onAction("Indique o título do edital.");
      return;
    }
    if (!editar && !ficheiroUrl) {
      onAction("Escolha o ficheiro do edital.");
      return;
    }
    setBusy(true);
    try {
      if (editar) {
        const novo = ficheiroUrl && ficheiroUrl !== editar.file_url ? ficheiroUrl : undefined;
        await updateEdital(editar.id, title, novo);
        onAction("O edital foi actualizado.");
      } else {
        await addEdital(title, ficheiroUrl);
        onAction("O edital foi gravado.");
      }
      fechar();
      refresh();
    } catch (error) {
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  const tornarVigente = async (item: { id: string; title: string }) => {
    setBusy(true);
    try {
      await setEditalVigente(item.id);
      refresh();
      onAction("Este edital é o visível no sítio.");
    } catch (error) {
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  const eliminar = async (item: { id: string; title: string }) => {
    if (!window.confirm(`Eliminar «${item.title}»?`)) return;
    setBusy(true);
    try {
      await deleteEdital(item.id);
      refresh();
      onAction("O edital foi eliminado.");
    } catch (error) {
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button id="edital-adicionar" type="button" className="hidden" onClick={abrirNovo} />

      {items.length === 0 ? (
        <p className="text-sm text-navy-900/50">Ainda sem editais na base.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const tipo = tipoFicheiroEdital(item.file_url);
            return (
            <div key={item.id} className="bg-white border border-navy-100">
              <div className="relative aspect-[210/297] bg-cream overflow-hidden">
                {tipo === "imagem" ? (
                  <img
                    src={item.file_url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain p-2"
                  />
                ) : tipo === "pdf" ? (
                  <iframe
                    src={item.file_url}
                    title={item.title}
                    className="absolute inset-0 w-full h-full"
                  />
                ) : (
                  <a
                    href={item.file_url}
                    download
                    className="absolute inset-0 flex items-center justify-center text-navy-900/70 text-sm p-4 text-center underline"
                  >
                    Descarregar
                  </a>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-[13px] font-semibold text-navy-900 leading-snug line-clamp-2">
                  {item.title}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <button
                    type="button"
                    onClick={() => abrirEditar(item)}
                    className="text-[12px] text-sky hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void eliminar(item)}
                    className="text-[12px] text-crimson hover:underline disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                  <button
                    type="button"
                    disabled={busy || item.vigente}
                    onClick={() => void tornarVigente(item)}
                    className="text-[12px] text-sky hover:underline disabled:opacity-50"
                  >
                    {item.vigente ? "Fixado" : "Fixar"}
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {abrir && (
        <div className="fixed inset-0 z-[180] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white border border-navy-100 p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="font-serif text-xl font-bold text-navy-900">
                {editar ? "Editar edital" : "Adicionar edital"}
              </h2>
              <button type="button" onClick={fechar} className="text-navy-900/50 hover:text-navy-900">
                <X size={18} />
              </button>
            </div>
            <form className="space-y-5" onSubmit={onSubmit}>
              <label className="block">
                <span className="block text-sm font-bold text-navy-900 mb-1.5">Título</span>
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  className="esj-field"
                />
              </label>
              <div className="block">
                <span className="block text-sm font-bold text-navy-900 mb-1.5">
                  {editar ? "Ficheiro" : "Ficheiro (PDF, imagem ou documento)"}
                </span>
                {ficheiroUrl ? (
                  <div className="space-y-2">
                    {tipoFicheiroEdital(ficheiroUrl) === "imagem" ? (
                      <img src={ficheiroUrl} alt="" className="max-h-40 w-auto border border-navy-100" />
                    ) : (
                      <p className="text-sm text-navy-900/70 break-all">
                        {decodeURIComponent(ficheiroUrl.split("/").pop()?.split("?")[0] || "Ficheiro escolhido")}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectorTab("upload");
                        setSelectorAberto(true);
                      }}
                      className="text-[#2271b1] text-[13px] hover:underline underline-offset-2"
                    >
                      {editar ? "Substituir ficheiro" : "Trocar ficheiro"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectorTab("upload");
                      setSelectorAberto(true);
                    }}
                    className="w-full min-h-[120px] p-6 border-2 border-dashed border-[#ccd0d4] bg-white/50 flex flex-col items-center justify-center gap-2"
                  >
                    <Upload className="w-10 h-10 text-[#ccd0d4]" />
                    <span className="text-[14px] text-[#3c434a]">Escolher ficheiro</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectorTab("galeria");
                  setSelectorAberto(true);
                }}
                className="bg-sky hover:bg-crimson text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
              >
                BUSCAR DA GALERIA
              </button>
              <button
                type="submit"
                disabled={busy}
                className="bg-leaf hover:bg-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
              >
                {busy ? "A GRAVAR…" : editar ? "GUARDAR" : "ADICIONAR"}
              </button>
            </form>
          </div>
        </div>
      )}
      {selectorAberto && (
        <ImageSelector
          key={selectorTab}
          initialTab={selectorTab}
          titulo="Ficheiro do edital"
          accept=".pdf,image/*,.doc,.docx,.odt,.zip"
          pasta="editais"
          onClose={() => setSelectorAberto(false)}
          onSelect={setFicheiroUrl}
        />
      )}
    </div>
  );
}

function Publicacoes({
  onAction,
  categoria,
}: {
  onAction: (m: string) => void;
  categoria: Categoria;
}) {
  const [items, setItems] = useState<{ id: string; title: string; image: string; destaque?: boolean }[]>([]);
  const [selectorAberto, setSelectorAberto] = useState(false);
  const [editarId, setEditarId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState(false);
  const livro = categoria === "livro";
  const botaoId = livro ? "livros-adicionar" : "eventos-adicionar";

  const refresh = () => {
    listPublicacoesGestao(categoria)
      .then(setItems)
      .catch((error) => {
        if (isMissingTable(error)) setMissing(true);
        setItems([]);
      });
  };

  useEffect(() => {
    refresh();
  }, [categoria]);

  const abrirNovo = () => {
    setEditarId(null);
    setSelectorAberto(true);
  };

  const aplicarFoto = async (image: string) => {
    setSelectorAberto(false);
    setBusy(true);
    try {
      if (editarId) {
        await updatePublicacaoImagem(editarId, image);
        onAction(livro ? "A imagem do livro foi actualizada." : "A imagem do cartaz foi actualizada.");
      } else {
        await addPublicacaoImagem(image, categoria);
        onAction(livro ? "O livro foi publicado." : "O cartaz foi publicado.");
      }
      setMissing(false);
      refresh();
    } catch (error) {
      if (isMissingTable(error)) setMissing(true);
      onAction(cmsError(error));
    } finally {
      setEditarId(null);
      setBusy(false);
    }
  };

  const tornarFixado = async (item: { id: string; title: string }) => {
    setBusy(true);
    try {
      await setPublicacaoDestaque(item.id, categoria);
      refresh();
      onAction(livro ? "Este livro está fixado na página inicial." : "Este cartaz está fixado na página inicial.");
    } catch (error) {
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  const eliminar = async (item: { id: string; title: string }) => {
    if (!window.confirm(`Eliminar «${item.title}»?`)) return;
    setBusy(true);
    try {
      await deletePublicacao(item.id);
      refresh();
      onAction(livro ? "O livro foi eliminado." : "O cartaz foi eliminado.");
    } catch (error) {
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button id={botaoId} type="button" className="hidden" onClick={abrirNovo} />
      {missing && <SchemaInstall />}
      {items.length === 0 ? (
        <p className="text-sm text-navy-900/50">
          {livro ? "Ainda sem livros na base." : "Ainda sem cartazes na base."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-navy-100">
              <div
                className={`relative overflow-hidden bg-cream ${
                  livro ? "aspect-square" : "aspect-[210/297]"
                }`}
              >
                <img
                  src={item.image}
                  alt=""
                  className={
                    livro
                      ? "absolute inset-0 w-full h-full object-contain p-2"
                      : "absolute inset-0 w-full h-full object-cover"
                  }
                />
              </div>
              <div className="p-2.5">
                <p className="text-[13px] font-semibold text-navy-900 leading-snug line-clamp-2">
                  {item.title}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditarId(item.id);
                      setSelectorAberto(true);
                    }}
                    className="text-[12px] text-sky hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void eliminar(item)}
                    className="text-[12px] text-crimson hover:underline disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                  <button
                    type="button"
                    disabled={busy || item.destaque}
                    onClick={() => void tornarFixado(item)}
                    className="text-[12px] text-sky hover:underline disabled:opacity-50"
                  >
                    {item.destaque ? "Fixado" : "Fixar"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectorAberto && (
        <ImageSelector
          initialTab="upload"
          onClose={() => {
            setSelectorAberto(false);
            setEditarId(null);
          }}
          onSelect={(url) => void aplicarFoto(url)}
        />
      )}
    </>
  );
}

function CalendarioAcademico({ onAction }: { onAction: (m: string) => void }) {
  const [data, setData] = useState<Calendario>(DEFAULT_CALENDARIO);
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    loadCalendario().then(setData);
  }, []);

  const palavrasDe = (texto: string) =>
    texto.trim() ? texto.trim().split(/\s+/).filter(Boolean).length : 0;

  const actualizarCampo = (key: keyof Calendario, valor: string) => {
    if (palavrasDe(valor) > 30) return;
    setData({ ...data, [key]: valor });
  };

  const publish = async () => {
    setBusy(true);
    try {
      await publishCalendario(data);
      setMissing(false);
      onAction("O calendário académico foi actualizado em /#ensino.");
    } catch (error) {
      if (isMissingTable(error)) setMissing(true);
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  const fields: { key: keyof Calendario; label: string }[] = [
    { key: "inscricoes", label: "Inscrições" },
    { key: "exames", label: "Exames de admissão" },
    { key: "resultados", label: "Publicação de resultados" },
    { key: "inicioAno", label: "Início do ano lectivo" },
  ];

  return (
    <div className="w-full bg-white border border-navy-100 p-8 space-y-4">
      <h2 className="font-serif text-2xl font-bold text-navy-900">Calendário Académico</h2>
      <p className="text-sm text-navy-900/65 leading-relaxed">
        Estes textos aparecem na secção Ensino e História, separador &ldquo;Calendário
        Académico&rdquo;, em /#ensino. Máximo de 30 palavras por campo.
      </p>
      {missing && <SchemaInstall />}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {fields.map((f) => {
          const palavras = palavrasDe(data[f.key]);
          return (
            <label key={f.key} className="block">
              <span className="block text-sm font-bold text-navy-900 mb-1.5">{f.label}</span>
              <textarea
                className="esj-field min-h-[11rem] py-3 leading-relaxed resize-y"
                value={data[f.key]}
                onChange={(e) => actualizarCampo(f.key, e.target.value)}
              />
              <span
                className={`mt-1.5 block text-xs ${
                  palavras >= 30 ? "text-crimson font-semibold" : "text-navy-900/55"
                }`}
              >
                {palavras}/30 palavras
              </span>
            </label>
          );
        })}
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={publish}
        className="bg-leaf hover:bg-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
      >
        {busy ? "A GRAVAR…" : "GUARDAR CALENDÁRIO"}
      </button>
    </div>
  );
}

const noticiaInputClass =
  "w-full bg-white text-[#2c3338] border border-[#ccd0d4] outline-none focus:border-[#2271b1] shadow-sm";

const RASCUNHO_NOTICIA_KEY = "esj-rascunho-noticia";

function Noticias({ onAction }: { onAction: (m: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [estado, setEstado] = useState<EstadoNoticia>("publicado");
  const [slugAtual, setSlugAtual] = useState("");
  const [filtro, setFiltro] = useState<EstadoNoticia>("publicado");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RASCUNHO_NOTICIA_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        setTitle(draft.title || "");
        setExcerpt(draft.excerpt || "");
        setBody(draft.body || "");
        setImageUrl(draft.imageUrl || "");
        setEstado(draft.estado || "publicado");
        setFiltro(draft.estado || "publicado");
        setSlugAtual(draft.slug || "");
      }
    } catch {
      /* rascunho inválido, ignora */
    }
  }, []);

  const gravar = async (proximo: EstadoNoticia) => {
    const titulo = title.trim() || (proximo === "rascunho" ? "Sem título" : "");
    if (!titulo) {
      onAction("Indique o título da notícia.");
      return;
    }
    if (proximo !== "rascunho" && !excerpt.trim()) {
      onAction("Escreva o resumo da notícia.");
      return;
    }
    if (proximo !== "rascunho" && !textoDeHtml(body)) {
      onAction("Escreva o texto da notícia.");
      return;
    }
    setBusy(true);
    try {
      const slug = await guardarNoticia({
        slug: slugAtual || undefined,
        title: titulo,
        excerpt: excerpt.trim() || textoDeHtml(body).slice(0, 180),
        body: body.trim(),
        image: imageUrl || null,
        estado: proximo,
      });
      setSlugAtual(slug);
      setEstado(proximo);
      setTitle(titulo);
      window.localStorage.setItem(
        RASCUNHO_NOTICIA_KEY,
        JSON.stringify({ title: titulo, excerpt, body, imageUrl, estado: proximo, slug })
      );
      setFiltro(proximo);
      if (proximo === "publicado") {
        window.localStorage.removeItem(RASCUNHO_NOTICIA_KEY);
        onAction("A notícia foi publicada em /noticias.");
      } else if (proximo === "revisao") {
        onAction("A notícia ficou pendente para revisão.");
      } else {
        onAction("Rascunho guardado.");
      }
    } catch (error) {
      if (proximo === "rascunho") {
        try {
          window.localStorage.setItem(
            RASCUNHO_NOTICIA_KEY,
            JSON.stringify({ title, excerpt, body, imageUrl, estado: "rascunho", slug: slugAtual })
          );
          onAction("Rascunho guardado neste dispositivo.");
        } catch {
          onAction(cmsError(error));
        }
      } else {
        onAction(cmsError(error));
      }
    } finally {
      setBusy(false);
    }
  };

  const hoje = new Date().toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const estadoLabel =
    filtro === "publicado" ? "Publicado" : filtro === "revisao" ? "Pendente para revisão" : "Rascunho";

  return (
    <div className="text-[#2c3338]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void gravar(filtro);
        }}
        className="flex flex-col lg:flex-row gap-5 items-start"
      >
        <div className="flex-1 w-full space-y-5 min-w-0">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Adicionar título"
            className={`${noticiaInputClass} h-[50px] px-3 text-[1.4rem]`}
          />

          <div className="bg-white border border-[#ccd0d4] overflow-hidden shadow-sm">
            <div className="p-2.5 bg-[#f6f7f7] border-b border-[#dcdcde]">
              <h2 className="font-semibold text-[14px] text-[#1d2327]">Resumo</h2>
            </div>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Duas linhas para a página inicial"
              className="w-full bg-white text-[#2c3338] p-3 text-[14px] border-0 outline-none resize-y shadow-none"
            />
          </div>

          <div className="bg-white border border-[#ccd0d4] overflow-hidden shadow-sm">
            <NoticiaEditor value={body} onChange={setBody} placeholder="Comece a escrever…" />
          </div>
        </div>

        <div className="w-full lg:w-[280px] space-y-5 shrink-0">
          <div className="bg-white border border-[#ccd0d4] overflow-hidden shadow-sm">
            <div className="p-2.5 bg-[#f6f7f7] border-b border-[#dcdcde]">
              <h2 className="font-semibold text-[14px] text-[#1d2327]">Imagem em destaque</h2>
            </div>
            <div className="p-3">
              {imageUrl ? (
                <div className="space-y-3">
                  <img src={imageUrl} className="w-full h-auto border border-[#ccd0d4]" alt="" />
                  <button type="button" onClick={() => setIsImageSelectorOpen(true)} className="text-[#2271b1] text-[13px] hover:underline underline-offset-2">
                    Substituir imagem
                  </button>
                  <br />
                  <button type="button" onClick={() => setImageUrl("")} className="text-[#d63638] text-[13px] hover:underline underline-offset-2">
                    Remover imagem
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsImageSelectorOpen(true)}
                  className="w-full min-h-[160px] p-8 border-2 border-dashed border-[#ccd0d4] bg-white/50 flex flex-col items-center justify-center gap-3"
                >
                  <Upload className="w-12 h-12 text-[#ccd0d4]" />
                  <span className="text-[14px] text-[#3c434a]">Imagem em destaque</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-white border border-[#ccd0d4] overflow-hidden shadow-sm">
            <div className="p-2.5 bg-[#f6f7f7] border-b border-[#dcdcde] flex items-center justify-between">
              <h2 className="font-semibold text-[14px] text-[#1d2327]">Publicar</h2>
              <ChevronUp className="w-4 h-4 text-[#787c82]" />
            </div>
            <div className="p-3 space-y-2.5 text-[13px] text-[#1d2327]">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#787c82] shrink-0" />
                <span>
                  Estado: <strong>{estadoLabel}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#787c82] shrink-0" />
                <span>
                  Visibilidade: <strong>{filtro === "publicado" ? "Público" : "Privado"}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#787c82] shrink-0" />
                <span className="border border-[#ccd0d4] px-2.5 py-1 text-[#1d2327]">{hoje}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value as EstadoNoticia)}
              className="w-full h-9 px-2 text-[13px] text-[#1d2327] bg-white border border-[#ccd0d4] outline-none focus:border-[#2271b1]"
            >
              <option value="rascunho">Rascunho</option>
              <option value="revisao">Pendente para revisão</option>
              <option value="publicado">Publicadas</option>
            </select>
            <button
              type="submit"
              disabled={busy}
              className="w-full px-4 py-2 bg-[#2271b1] text-white text-[13px] font-medium hover:bg-[#135e96] disabled:opacity-50"
            >
              {busy ? "A gravar…" : "Publicar"}
            </button>
          </div>
        </div>
      </form>

      {isImageSelectorOpen && (
        <ImageSelector
          onClose={() => setIsImageSelectorOpen(false)}
          onSelect={(url) => setImageUrl(url)}
        />
      )}
    </div>
  );
}

function Videos({ onAction }: { onAction: (m: string) => void }) {
  const [items, setItems] = useState<{ id: string; title: string; url: string; principal?: boolean }[]>([]);
  const [busy, setBusy] = useState(false);
  const [abrir, setAbrir] = useState(false);
  const [editar, setEditar] = useState<{ id: string; title: string; url: string } | null>(null);
  const [titulo, setTitulo] = useState("");
  const [ligacao, setLigacao] = useState("");

  const refresh = () => {
    listVideosGestao()
      .then(setItems)
      .catch(() => setItems([]));
  };

  useEffect(() => {
    refresh();
  }, []);

  const abrirNovo = () => {
    setEditar(null);
    setTitulo("");
    setLigacao("");
    setAbrir(true);
  };

  const abrirEditar = (v: { id: string; title: string; url: string }) => {
    setEditar(v);
    setTitulo(v.title);
    setLigacao(v.url);
    setAbrir(true);
  };

  const fechar = () => {
    setAbrir(false);
    setEditar(null);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = titulo.trim();
    const url = ligacao.trim();
    if (!title || !url) {
      onAction("Indique o título e a ligação do vídeo.");
      return;
    }
    setBusy(true);
    try {
      if (editar) {
        await updateVideo(editar.id, title, url);
        onAction("O vídeo foi actualizado.");
      } else {
        await publishVideo(title, url);
        onAction("O vídeo foi gravado.");
      }
      fechar();
      refresh();
    } catch (error) {
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  const tornarPrincipal = async (v: { id: string; title: string }) => {
    setBusy(true);
    try {
      await setVideoPrincipal(v.id);
      refresh();
      onAction("Este vídeo é o principal da playlist.");
    } catch (error) {
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  const eliminar = async (v: { id: string; title: string }) => {
    if (!window.confirm(`Eliminar «${v.title}»?`)) return;
    setBusy(true);
    try {
      await deleteVideo(v.id);
      refresh();
      onAction("O vídeo foi eliminado.");
    } catch (error) {
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button id="videos-adicionar" type="button" className="hidden" onClick={abrirNovo} />

      {items.length === 0 ? (
        <p className="text-sm text-navy-900/50">Ainda sem vídeos na base.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((v) => {
            const src = videoEmbedSrc(v.url);
            return (
              <div key={v.id} className="bg-white border border-navy-100">
                <div className="relative aspect-video bg-black">
                  {src ? (
                    <iframe
                      src={src}
                      title={v.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  ) : (
                    <a
                      href={v.url}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute inset-0 flex items-center justify-center text-white text-sm p-4 text-center"
                    >
                      {v.title}
                    </a>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-[13px] font-semibold text-navy-900 leading-snug line-clamp-2">{v.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <button
                      type="button"
                      onClick={() => abrirEditar(v)}
                      className="text-[12px] text-sky hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void eliminar(v)}
                      className="text-[12px] text-crimson hover:underline disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                    <button
                      type="button"
                      disabled={busy || v.principal}
                      onClick={() => void tornarPrincipal(v)}
                      className="text-[12px] text-sky hover:underline disabled:opacity-50"
                    >
                      {v.principal ? "Fixado" : "Fixar"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {abrir && (
        <div className="fixed inset-0 z-[180] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-navy-100 p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="font-serif text-xl font-bold text-navy-900">
                {editar ? "Editar vídeo" : "Adicionar vídeos"}
              </h2>
              <button type="button" onClick={fechar} className="text-navy-900/50 hover:text-navy-900">
                <X size={18} />
              </button>
            </div>
            <form className="space-y-5" onSubmit={onSubmit}>
              <label className="block">
                <span className="block text-sm font-bold text-navy-900 mb-1.5">Título</span>
                <div className="bg-white border border-[#ccd0d4]">
                  <textarea
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                    rows={4}
                    placeholder="Escreva o título…"
                    className="w-full min-h-[6rem] px-4 py-3 text-[16px] text-[#2c3338] leading-relaxed border-0 outline-none resize-y bg-transparent"
                  />
                </div>
              </label>
              <label className="block">
                <span className="block text-sm font-bold text-navy-900 mb-1.5">Ligação YouTube ou Vimeo</span>
                <input
                  value={ligacao}
                  onChange={(e) => setLigacao(e.target.value)}
                  type="url"
                  required
                  className="esj-field"
                  placeholder="https://"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="bg-leaf hover:bg-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
              >
                {busy ? "A GRAVAR…" : editar ? "GUARDAR" : "PUBLICAR VÍDEO"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

type CandidaturaItem = {
  protocolo: string;
  nome: string;
  email: string | null;
  curso: string;
  turno: string | null;
  nivel: string | null;
  delegacao: string | null;
  created_at: string;
};

type PautaLigada = { id: string; nota_portugues: number; nota_historia: number; publicado: boolean };
type TurmaLigada = { numero_estudante: string };

/** Último termo = apelido (maiúsculas), resto = nome — mesma regra usada nas listas de contas. */
function separarApelido(nomeCompleto: string): { apelido: string; nome: string } {
  const partes = nomeCompleto.trim().split(/\s+/);
  if (partes.length === 1) return { apelido: partes[0], nome: "" };
  return { apelido: partes[partes.length - 1], nome: partes.slice(0, -1).join(" ") };
}

function Candidaturas() {
  const [items, setItems] = useState<CandidaturaItem[]>([]);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [eliminando, setEliminando] = useState(false);

  // Resultados de exame e contas de estudante já ligados a cada candidatura
  // (supabase/candidatura-pauta-numeracao.sql) — dinâmico: assim que se
  // lança uma nota aqui, o Admitido/Não admitido e a pauta pública em
  // /resultados actualizam-se sozinhos, sem reescrever nada.
  const [pautaPorProtocolo, setPautaPorProtocolo] = useState<Record<string, PautaLigada>>({});
  const [turmaPorProtocolo, setTurmaPorProtocolo] = useState<Record<string, TurmaLigada>>({});

  const [resultadoAberto, setResultadoAberto] = useState<string | null>(null);
  const [notaPortugues, setNotaPortugues] = useState("");
  const [notaHistoria, setNotaHistoria] = useState("");
  const [guardandoResultado, setGuardandoResultado] = useState(false);
  const [criandoConta, setCriandoConta] = useState<Set<string>>(new Set());
  const [aviso, setAviso] = useState<{ texto: string; erro: boolean } | null>(null);

  // Modal "Numeração" — a secretaria digita o número inicial UMA vez por
  // curso/regime; o sistema gera os seguintes sozinho a partir daí.
  const [modalNumeracaoAberto, setModalNumeracaoAberto] = useState(false);
  const [numCurso, setNumCurso] = useState<CursoDocenciaSlug>(CURSOS_DOCENCIA[0].slug);
  const [numRegime, setNumRegime] = useState<"diurno" | "pos-laboral">("diurno");
  const [numAtual, setNumAtual] = useState<string | null>(null);
  const [numInicial, setNumInicial] = useState("");
  const [numBusy, setNumBusy] = useState(false);
  const [numMsg, setNumMsg] = useState<{ texto: string; erro: boolean } | null>(null);

  const carregar = () => {
    listInscricoesGestao()
      .then((rows) =>
        setItems(
          [...rows].sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt")) as CandidaturaItem[]
        )
      )
      .catch((err) => {
        if (isMissingTable(err)) setMissing(true);
        else setError(cmsError(err));
      });
    listPautaLigadaACandidaturas()
      .then((rows) => {
        const mapa: Record<string, PautaLigada> = {};
        for (const r of rows) {
          if (r.candidatura_protocolo) {
            mapa[r.candidatura_protocolo] = {
              id: r.id,
              nota_portugues: Number(r.nota_portugues),
              nota_historia: Number(r.nota_historia),
              publicado: r.publicado,
            };
          }
        }
        setPautaPorProtocolo(mapa);
      })
      .catch(() => {});
    listTurmaLigadaACandidaturas()
      .then((rows) => {
        const mapa: Record<string, TurmaLigada> = {};
        for (const r of rows) {
          if (r.candidatura_protocolo) mapa[r.candidatura_protocolo] = { numero_estudante: r.numero_estudante };
        }
        setTurmaPorProtocolo(mapa);
      })
      .catch(() => {});
  };

  useEffect(carregar, []);

  const toggleSelecionar = (protocolo: string) => {
    setSelecionados((prev) => {
      const novo = new Set(prev);
      if (novo.has(protocolo)) novo.delete(protocolo);
      else novo.add(protocolo);
      return novo;
    });
  };

  const todosSelecionados = items.length > 0 && items.every((c) => selecionados.has(c.protocolo));
  const toggleSelecionarTodos = () => {
    if (todosSelecionados) setSelecionados(new Set());
    else setSelecionados(new Set(items.map((c) => c.protocolo)));
  };

  const eliminarSelecionados = async () => {
    if (selecionados.size === 0) return;
    if (
      !window.confirm(
        `Eliminar ${selecionados.size} candidatura${selecionados.size === 1 ? "" : "s"}? Esta acção não pode ser desfeita.`
      )
    )
      return;
    setEliminando(true);
    try {
      const res = await fetch("/api/candidaturas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ protocolos: Array.from(selecionados) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Não foi possível eliminar.");
      setSelecionados(new Set());
      carregar();
    } catch (err) {
      setAviso({ texto: err instanceof Error ? err.message : "Não foi possível eliminar.", erro: true });
    } finally {
      setEliminando(false);
    }
  };

  const abrirResultado = (c: CandidaturaItem) => {
    const pauta = pautaPorProtocolo[c.protocolo];
    setNotaPortugues(pauta ? String(pauta.nota_portugues) : "");
    setNotaHistoria(pauta ? String(pauta.nota_historia) : "");
    setResultadoAberto(c.protocolo);
  };

  const guardarResultado = async (c: CandidaturaItem) => {
    const np = Number(notaPortugues);
    const nh = Number(notaHistoria);
    if (Number.isNaN(np) || Number.isNaN(nh) || np < 0 || np > 20 || nh < 0 || nh > 20) {
      setAviso({ texto: "Indique as duas notas, entre 0 e 20.", erro: true });
      return;
    }
    const cursoInfo = cursoPorTitulo(c.curso);
    if (!cursoInfo) {
      setAviso({ texto: `Curso "${c.curso}" não reconhecido — não foi possível gravar.`, erro: true });
      return;
    }
    const { apelido, nome } = separarApelido(c.nome);
    setGuardandoResultado(true);
    try {
      await savePautaLinha({
        id: pautaPorProtocolo[c.protocolo]?.id,
        anoLectivo: ANO_LECTIVO,
        nivel: c.nivel || "Licenciatura",
        curso: cursoInfo.nome,
        regime: c.turno || "Diurno",
        apelido: apelido || c.nome,
        nome,
        notaPortugues: np,
        notaHistoria: nh,
        // Publicado de imediato — a pauta pública em /resultados passa a
        // reflectir este lançamento sem passo extra.
        publicado: true,
        candidaturaProtocolo: c.protocolo,
      });
      setResultadoAberto(null);
      setAviso({ texto: `Resultado de ${c.nome} gravado — já visível na pauta pública.`, erro: false });
      carregar();
    } catch (err) {
      setAviso({ texto: err instanceof Error ? err.message : "Não foi possível gravar o resultado.", erro: true });
    } finally {
      setGuardandoResultado(false);
    }
  };

  const criarConta = async (c: CandidaturaItem) => {
    const cursoInfo = cursoPorTitulo(c.curso);
    if (!cursoInfo) {
      setAviso({ texto: `Curso "${c.curso}" não reconhecido — não foi possível criar a conta.`, erro: true });
      return;
    }
    if (!c.email) {
      setAviso({ texto: `A candidatura de ${c.nome} não tem e-mail — não é possível criar a conta.`, erro: true });
      return;
    }
    const regime = c.turno === "Pós-laboral" ? "pos-laboral" : "diurno";
    setCriandoConta((prev) => new Set(prev).add(c.protocolo));
    setAviso(null);
    try {
      const numRes = await fetch("/api/numeracao-estudantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curso: cursoInfo.slug, regime }),
      });
      const numJson = await numRes.json();
      if (!numRes.ok) throw new Error(numJson.error || "Não foi possível gerar o número de estudante.");
      const numeroEstudante = numJson.numeroAtribuido as string;

      const contaRes = await fetch("/api/estudantes-contas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "criar_unico",
          numeroEstudante,
          nome: c.nome,
          curso: cursoInfo.slug,
          regime,
          ano: 1,
          email: c.email,
          candidaturaProtocolo: c.protocolo,
        }),
      });
      const contaJson = await contaRes.json();
      if (!contaRes.ok) throw new Error(contaJson.error || "Não foi possível criar a conta.");

      setTurmaPorProtocolo((prev) => ({ ...prev, [c.protocolo]: { numero_estudante: numeroEstudante } }));
      setAviso({
        texto: contaJson.passwordTemporaria
          ? `Conta criada — nº ${numeroEstudante}. Senha temporária (comunique com segurança): ${contaJson.passwordTemporaria}`
          : `Conta ligada ao nº ${numeroEstudante} (já existia uma conta com este e-mail).`,
        erro: false,
      });
    } catch (err) {
      setAviso({ texto: err instanceof Error ? err.message : "Não foi possível criar a conta.", erro: true });
    } finally {
      setCriandoConta((prev) => {
        const novo = new Set(prev);
        novo.delete(c.protocolo);
        return novo;
      });
    }
  };

  const abrirNumeracao = () => {
    setModalNumeracaoAberto(true);
    setNumMsg(null);
    setNumInicial("");
  };

  useEffect(() => {
    if (!modalNumeracaoAberto) return;
    setNumAtual(null);
    fetch(`/api/numeracao-estudantes?curso=${numCurso}&regime=${numRegime}`)
      .then((r) => r.json())
      .then((j) => setNumAtual(j.proximoNumero ?? null))
      .catch(() => setNumAtual(null));
  }, [modalNumeracaoAberto, numCurso, numRegime]);

  const guardarNumeracao = async () => {
    if (!numInicial.trim()) {
      setNumMsg({ texto: "Indique o número inicial.", erro: true });
      return;
    }
    setNumBusy(true);
    setNumMsg(null);
    try {
      const res = await fetch("/api/numeracao-estudantes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curso: numCurso, regime: numRegime, numeroInicial: numInicial.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Não foi possível guardar.");
      setNumAtual(json.proximoNumero);
      setNumInicial("");
      setNumMsg({ texto: "Número inicial guardado.", erro: false });
    } catch (err) {
      setNumMsg({ texto: err instanceof Error ? err.message : "Erro ao guardar.", erro: true });
    } finally {
      setNumBusy(false);
    }
  };

  /** Badge/acção da coluna "Resultado" + "Conta", partilhado entre cartão e tabela. */
  const colunaResultado = (c: CandidaturaItem) => {
    const pauta = pautaPorProtocolo[c.protocolo];
    if (resultadoAberto === c.protocolo) {
      return (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <input
            type="number"
            min={0}
            max={20}
            step={0.1}
            value={notaPortugues}
            onChange={(e) => setNotaPortugues(e.target.value)}
            placeholder="Port."
            title="Nota de Português"
            className="w-14 border border-navy-100 px-1 py-1 text-xs text-center outline-none focus:border-sky"
          />
          <input
            type="number"
            min={0}
            max={20}
            step={0.1}
            value={notaHistoria}
            onChange={(e) => setNotaHistoria(e.target.value)}
            placeholder="Hist."
            title="Nota de História"
            className="w-14 border border-navy-100 px-1 py-1 text-xs text-center outline-none focus:border-sky"
          />
          <button
            type="button"
            disabled={guardandoResultado}
            onClick={() => void guardarResultado(c)}
            className="text-leaf hover:text-leaf/80 font-bold disabled:opacity-50"
          >
            {guardandoResultado ? "…" : "Guardar"}
          </button>
          <button type="button" onClick={() => setResultadoAberto(null)} className="text-navy-900/40 hover:text-navy-900">
            Cancelar
          </button>
        </div>
      );
    }
    if (!pauta) {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            abrirResultado(c);
          }}
          className="text-sky hover:underline font-semibold"
        >
          Lançar resultado
        </button>
      );
    }
    const media = mediaFinal(pauta.nota_portugues, pauta.nota_historia);
    const resultado = classificacao(media);
    const admitido = resultado === "Admitido";
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          abrirResultado(c);
        }}
        title="Clique para corrigir as notas"
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
          admitido ? "bg-leaf/10 text-leaf" : "bg-crimson/10 text-crimson"
        }`}
      >
        <Pencil size={10} /> {resultado} ({media.toFixed(1)})
      </button>
    );
  };

  const colunaConta = (c: CandidaturaItem) => {
    const pauta = pautaPorProtocolo[c.protocolo];
    if (!pauta) return <span className="text-navy-900/30">—</span>;
    const media = mediaFinal(pauta.nota_portugues, pauta.nota_historia);
    if (classificacao(media) !== "Admitido") return <span className="text-navy-900/30">—</span>;
    const turma = turmaPorProtocolo[c.protocolo];
    if (turma) {
      return <span className="font-mono font-bold text-navy-900">Nº {turma.numero_estudante}</span>;
    }
    const aCriar = criandoConta.has(c.protocolo);
    return (
      <button
        type="button"
        disabled={aCriar}
        onClick={(e) => {
          e.stopPropagation();
          void criarConta(c);
        }}
        className="inline-flex items-center gap-1 text-sky hover:underline font-semibold disabled:opacity-50"
      >
        <UserPlus size={11} /> {aCriar ? "A criar…" : "Criar conta"}
      </button>
    );
  };

  return (
    <>
    <div className="gestao-list-card">
      <div className="gestao-list-header flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-3">
          Candidaturas
          <button
            type="button"
            onClick={abrirNumeracao}
            className="normal-case tracking-normal text-[11px] font-semibold text-sky hover:underline"
          >
            Numeração de estudantes
          </button>
        </h2>
        {selecionados.size > 0 ? (
          <div className="flex items-center gap-3 normal-case tracking-normal">
            <span className="text-navy-900/70">
              {selecionados.size} selecionada{selecionados.size === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              disabled={eliminando}
              onClick={() => void eliminarSelecionados()}
              className="inline-flex items-center gap-1 text-crimson hover:text-[#b32d2e] font-bold disabled:opacity-50"
            >
              <Trash2 size={12} /> {eliminando ? "A eliminar…" : "Eliminar"}
            </button>
            <button
              type="button"
              onClick={() => setSelecionados(new Set())}
              className="text-navy-900/50 hover:text-navy-900"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <span>{items.length} candidatura{items.length === 1 ? "" : "s"}</span>
        )}
      </div>
      {missing && <SchemaInstall />}
      {error && <p className="px-4 py-2 text-sm text-crimson">{error}</p>}
      {aviso && (
        <p className={`px-4 py-2 text-xs font-semibold ${aviso.erro ? "text-crimson" : "text-leaf"}`}>{aviso.texto}</p>
      )}
      {items.length === 0 && !error && !missing ? (
        <p className="px-6 py-8 text-sm text-navy-900/55 italic">Ainda não há candidaturas.</p>
      ) : items.length === 0 ? null : (
        <>
          {/* < lg: cartões — 1 coluna em telemóvel, 2 em tablet (md). */}
          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-px bg-navy-100">
            {items.map((c, idx) => {
              const selecionada = selecionados.has(c.protocolo);
              return (
                <div key={c.protocolo} className={`p-3 text-xs space-y-1.5 ${selecionada ? "bg-sky/10" : "bg-white"}`}>
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={selecionada}
                      onChange={() => toggleSelecionar(c.protocolo)}
                      className="mt-0.5 w-3.5 h-3.5 rounded-[2px] border-navy-300 accent-sky cursor-pointer shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p>
                        <span className="text-navy-900/40 font-normal">{idx + 1}.</span>{" "}
                        <span className="font-mono font-bold text-sky">{c.protocolo}</span>
                      </p>
                      <p className="font-semibold text-navy-900">{c.nome}</p>
                      <p className="text-navy-900/70">
                        {c.curso}
                        {c.delegacao ? ` · ${c.delegacao}` : ""}
                      </p>
                      {c.email && <p className="text-navy-900/50">{c.email}</p>}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {colunaResultado(c)}
                        {colunaConta(c)}
                      </div>
                      <p className="text-navy-900/40 text-[11px]">
                        {new Date(c.created_at).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-cream/70 border-b border-navy-100 text-[11px] font-bold uppercase tracking-wider text-navy-900/70">
                  <th className="px-2 py-2.5 text-center w-8 border-r border-navy-100/60">
                    <input
                      type="checkbox"
                      checked={todosSelecionados}
                      onChange={toggleSelecionarTodos}
                      className="w-3 h-3 rounded-[2px] border-navy-300 accent-sky cursor-pointer"
                    />
                  </th>
                  <th className="px-2 py-2.5 whitespace-nowrap border-r border-navy-100/60">Nº</th>
                  <th className="px-2 py-2.5 whitespace-nowrap border-r border-navy-100/60">Nº Candidatura</th>
                  <th className="px-2 py-2.5 whitespace-nowrap border-r border-navy-100/60">Nome</th>
                  <th className="px-3 py-2.5">Curso</th>
                  <th className="px-3 py-2.5">Delegação</th>
                  <th className="px-3 py-2.5">E-mail</th>
                  <th className="px-3 py-2.5">Resultado</th>
                  <th className="px-3 py-2.5">Conta</th>
                  <th className="px-3 py-2.5 text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {items.map((c, idx) => {
                  const selecionada = selecionados.has(c.protocolo);
                  return (
                    <tr
                      key={c.protocolo}
                      className={`transition-colors ${selecionada ? "bg-sky/10" : "hover:bg-cream/40"}`}
                    >
                      <td className="px-2 py-2 text-center border-r border-navy-100/60">
                        <input
                          type="checkbox"
                          checked={selecionada}
                          onChange={() => toggleSelecionar(c.protocolo)}
                          className="w-3 h-3 rounded-[2px] border-navy-300 accent-sky cursor-pointer"
                        />
                      </td>
                      <td className="px-2 py-2 text-navy-900/50 font-mono whitespace-nowrap border-r border-navy-100/60">
                        {idx + 1}
                      </td>
                      <td className="px-2 py-2 font-mono font-bold text-sky whitespace-nowrap border-r border-navy-100/60">
                        {c.protocolo}
                      </td>
                      <td className="px-2 py-2 font-semibold text-navy-900 whitespace-nowrap border-r border-navy-100/60">
                        {c.nome}
                      </td>
                      <td className="px-3 py-2 text-navy-900/70">{c.curso}</td>
                      <td className="px-3 py-2 text-navy-900/70">{c.delegacao || "—"}</td>
                      <td className="px-3 py-2 text-navy-900/70">{c.email || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{colunaResultado(c)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{colunaConta(c)}</td>
                      <td className="px-3 py-2 text-right text-navy-900/50 whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString("pt-PT")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>

    {/* MODAL: Numeração de estudantes — fora do gestao-list-card, mesmo
        padrão de todos os outros popups "fixed" neste painel. */}
    {modalNumeracaoAberto && (
      <div className="fixed inset-0 z-[180] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl border border-navy-100 w-full max-w-md p-6 space-y-4 animate-scale-in">
          <div className="flex items-center justify-between border-b border-navy-100 pb-3">
            <h3 className="font-serif font-bold text-navy-900 text-base flex items-center gap-2">
              <Users size={16} className="text-sky" /> Numeração de estudantes
            </h3>
            <button
              type="button"
              onClick={() => setModalNumeracaoAberto(false)}
              className="text-navy-900/50 hover:text-navy-900"
            >
              <X size={18} />
            </button>
          </div>
          <p className="text-xs text-navy-900/60 leading-relaxed">
            Digite o número inicial uma única vez por curso/regime (ex.: <span className="font-mono">20260001MP</span>).
            A partir daí, ao criar uma conta a partir de uma candidatura admitida, o sistema atribui sempre o número
            seguinte sozinho — nunca mais se digita um número de estudante à mão.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Curso</label>
              <select
                value={numCurso}
                onChange={(e) => setNumCurso(e.target.value as CursoDocenciaSlug)}
                className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 focus:outline-none focus:border-sky"
              >
                {CURSOS_DOCENCIA.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.titulo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Regime</label>
              <select
                value={numRegime}
                onChange={(e) => setNumRegime(e.target.value as "diurno" | "pos-laboral")}
                className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 focus:outline-none focus:border-sky"
              >
                <option value="diurno">Diurno</option>
                <option value="pos-laboral">Pós-laboral</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-navy-900/70">
            Próximo número guardado:{" "}
            <span className="font-mono font-bold text-navy-900">{numAtual ?? "ainda não definido"}</span>
          </p>
          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              {numAtual ? "Substituir por" : "Número inicial"}
            </label>
            <input
              type="text"
              value={numInicial}
              onChange={(e) => setNumInicial(e.target.value)}
              placeholder="Ex.: 20260001MP"
              className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs font-mono text-navy-900 focus:outline-none focus:border-sky"
            />
          </div>
          {numMsg && (
            <p className={`text-xs font-semibold ${numMsg.erro ? "text-crimson" : "text-leaf"}`}>{numMsg.texto}</p>
          )}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-navy-100">
            <button
              type="button"
              onClick={() => setModalNumeracaoAberto(false)}
              className="px-3 py-2 border border-navy-100 text-xs font-semibold rounded text-navy-900/70 hover:bg-cream"
            >
              Fechar
            </button>
            <button
              type="button"
              disabled={numBusy}
              onClick={() => void guardarNumeracao()}
              className="px-4 py-2 bg-sky hover:bg-sky/90 text-white text-xs font-bold rounded shadow-sm disabled:opacity-50"
            >
              {numBusy ? "A guardar…" : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

type SubscritorLinha = { email: string; telefone?: string | null; created_at: string };

function textoPdf(s: string) {
  let out = "";
  const t = s.replace(/[—–]/g, "-").replace(/[“”«»]/g, '"').replace(/’/g, "'");
  for (const ch of t) {
    const c = ch.codePointAt(0) ?? 63;
    if (c === 40 || c === 41 || c === 92) out += `\\${ch}`;
    else if (c >= 32 && c <= 126) out += ch;
    else if (c <= 255) out += `\\${c.toString(8).padStart(3, "0")}`;
    else out += "?";
  }
  return out;
}

function pdfListaSubscritores(linhas: SubscritorLinha[]) {
  const left = 48;
  const top = 792;
  const fundo = 48;
  const passo = 16;
  const paginas: string[] = [];
  let y = top;
  let stream = "";

  const linhaPdf = (txt: string, x: number, yy: number, tam: number) => {
    stream += `BT /F1 ${tam} Tf 1 0 0 1 ${x} ${yy} Tm (${textoPdf(txt)}) Tj ET\n`;
  };

  const cabecalho = () => {
    stream = "";
    y = top;
    linhaPdf("ESJ — Lista de subscritores", left, y, 14);
    y -= 22;
    linhaPdf("E-mail", left, y, 9);
    linhaPdf("Telemovel", left + 280, y, 9);
    linhaPdf("Data de registo", left + 400, y, 9);
    y -= 14;
  };

  cabecalho();
  for (const s of linhas) {
    if (y < fundo) {
      paginas.push(stream);
      cabecalho();
    }
    linhaPdf(s.email, left, y, 9);
    linhaPdf(s.telefone || "-", left + 280, y, 9);
    linhaPdf(new Date(s.created_at).toLocaleDateString("pt-PT"), left + 400, y, 9);
    y -= passo;
  }
  paginas.push(stream);

  const n = paginas.length;
  const firstContent = 4;
  const firstPage = 4 + n;
  const offsets: number[] = [];
  let body = "%PDF-1.4\n";
  const addObj = (num: number, raw: string) => {
    offsets[num] = body.length;
    body += `${num} 0 obj\n${raw}\nendobj\n`;
  };
  addObj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  addObj(2, `<< /Type /Pages /Kids [${paginas.map((_, i) => `${firstPage + i} 0 R`).join(" ")}] /Count ${n} >>`);
  addObj(3, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  paginas.forEach((s, i) => {
    addObj(firstContent + i, `<< /Length ${s.length} >>\nstream\n${s}endstream`);
  });
  paginas.forEach((_, i) => {
    addObj(
      firstPage + i,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${firstContent + i} 0 R /Resources << /Font << /F1 3 0 R >> >> >>`
    );
  });
  const xrefPos = body.length;
  const last = firstPage + n - 1;
  let xref = `xref\n0 ${last + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= last; i += 1) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  body += `${xref}trailer\n<< /Size ${last + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return new Blob([body], { type: "application/pdf" });
}

function Subscritores({
  onAction,
  onEnviarSms,
}: {
  onAction: (m: string) => void;
  onEnviarSms?: (telefones: string[]) => void;
}) {
  const [items, setItems] = useState<
    { id: string; email: string; telefone?: string | null; created_at: string }[]
  >([]);
  const [escolhidos, setEscolhidos] = useState<string[]>([]);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    listNewsletterGestao()
      .then((rows) => {
        // Ordem alfabética (A → Z) pelo e-mail (sem campo "nome" nos subscritores).
        const ordenados = [...rows].sort((a, b) => (a.email || "").localeCompare(b.email || "", "pt"));
        setItems(ordenados);
        setEscolhidos((prev) => prev.filter((id) => rows.some((r) => r.id === id)));
      })
      .catch((err) => {
        if (isMissingTable(err)) setMissing(true);
        else setError(cmsError(err));
      });
  };

  useEffect(() => {
    refresh();
  }, []);

  const todos = items.length > 0 && escolhidos.length === items.length;
  const alguns = escolhidos.length > 0 && !todos;
  const seleccionados = items.filter((s) => escolhidos.includes(s.id));

  const toggleUm = (id: string) => {
    setEscolhidos((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const baixarPdf = () => {
    const linhas = seleccionados.length > 0 ? seleccionados : items;
    if (linhas.length === 0) return;
    const blob = pdfListaSubscritores(linhas);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "subscritores.pdf";
    a.click();
    URL.revokeObjectURL(a.href);
    onAction("Lista descarregada em PDF.");
  };

  const eliminar = async (ids = escolhidos) => {
    if (ids.length === 0) return;
    if (!window.confirm(`Eliminar ${ids.length} subscritor(es)?`)) return;
    setBusy(true);
    try {
      await deleteNewsletter(ids);
      setEscolhidos((prev) => prev.filter((id) => !ids.includes(id)));
      refresh();
      onAction("Subscritores eliminados.");
    } catch (err) {
      onAction(cmsError(err));
    } finally {
      setBusy(false);
    }
  };

  const linha =
    "gestao-list-row grid grid-cols-[auto_2.5rem_minmax(0,1fr)_10rem_9rem_3.5rem] items-center gap-x-3";
  // Colunas separadas por uma linha vertical até ao e-mail (a coluna
  // identificadora — não há campo "nome" nos subscritores); as restantes
  // ficam livres, como na lista de docentes.
  const celulaComLinha = "self-stretch flex items-center border-r border-navy-100/60 pr-2";

  return (
    <div className="gestao-list-card">
      <button type="button" id="subscritores-baixar-pdf" className="hidden" onClick={baixarPdf} />
      {missing && <SchemaInstall />}
      {error && <p className="text-sm text-crimson">{error}</p>}
      <ul>
        {items.length > 0 && (
          <li className={`${linha} gestao-list-header`}>
            <span className={celulaComLinha}>
              <input
                type="checkbox"
                checked={todos}
                ref={(el) => {
                  if (el) el.indeterminate = alguns;
                }}
                onChange={() => setEscolhidos(todos ? [] : items.map((s) => s.id))}
                aria-label="Seleccionar todos"
              />
            </span>
            <span className={`text-xs font-semibold text-navy-900 ${celulaComLinha}`}>Nº</span>
            {escolhidos.length > 0 ? (
              <span className={`flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0 ${celulaComLinha}`}>
                <span className="text-navy-900/70 font-semibold shrink-0">
                  {escolhidos.length} selecionado{escolhidos.length === 1 ? "" : "s"}
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={baixarPdf}
                  className="text-[12px] text-sky hover:underline disabled:opacity-50 shrink-0"
                >
                  Baixar PDF
                </button>
                {onEnviarSms && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      const telefones = seleccionados
                        .map((s) => s.telefone)
                        .filter((t): t is string => !!t?.trim());
                      if (telefones.length === 0) {
                        onAction("Os seleccionados não têm telemóvel.");
                        return;
                      }
                      onEnviarSms(telefones);
                    }}
                    className="text-[12px] text-sky hover:underline disabled:opacity-50 shrink-0"
                  >
                    Enviar SMS
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void eliminar()}
                  title="Eliminar seleccionados"
                  aria-label="Eliminar seleccionados"
                  className="inline-flex items-center gap-1 text-crimson hover:text-[#b32d2e] font-bold disabled:opacity-50 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
                <button
                  type="button"
                  onClick={() => setEscolhidos([])}
                  className="text-navy-900/50 hover:text-navy-900 font-semibold shrink-0"
                >
                  Cancelar
                </button>
              </span>
            ) : (
              <span className={`text-xs font-semibold text-navy-900 ${celulaComLinha}`}>E-mail</span>
            )}
            <span className="text-xs font-semibold text-navy-900">Telemóvel</span>
            <span className="text-xs font-semibold text-navy-900">Data de registo</span>
            <span className="text-xs font-semibold text-navy-900 text-right">Acção</span>
          </li>
        )}
        {items.map((s, i) => (
          <li key={s.id} className={linha}>
            <span className={celulaComLinha}>
              <input
                type="checkbox"
                checked={escolhidos.includes(s.id)}
                onChange={() => toggleUm(s.id)}
                aria-label={s.email}
              />
            </span>
            <span className={`text-xs text-navy-900/50 font-mono ${celulaComLinha}`}>{i + 1}</span>
            <span className={`min-w-0 truncate text-sm text-navy-900 ${celulaComLinha}`}>{s.email}</span>
            <span className="text-sm text-navy-900/80">{s.telefone || "—"}</span>
            <span className="text-[11px] text-navy-900/50">
              {new Date(s.created_at).toLocaleDateString("pt-PT")}
            </span>
            <span className="flex items-center justify-end">
              <button
                type="button"
                disabled={busy}
                onClick={() => void eliminar([s.id])}
                title="Eliminar"
                aria-label="Eliminar"
                className="text-crimson hover:text-[#b32d2e] disabled:opacity-50 p-0.5"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Anuncios({
  onAction,
  bloqueado,
}: {
  onAction: (m: string) => void;
  bloqueado?: { telefones: string[] } | null;
}) {
  const [items, setItems] = useState<
    { id: string; destinatarios: string; assunto: string; mensagem: string }[]
  >([]);
  const [inscricoes, setInscricoes] = useState<
    { telefone: string | null; curso: string | null; delegacao: string | null }[]
  >([]);
  const [subscritores, setSubscritores] = useState<{ telefone?: string | null }[]>([]);
  const [destinatarios, setDestinatarios] = useState(
    bloqueado?.telefones.length ? "Subscritores" : "Todos os estudantes"
  );
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [extra, setExtra] = useState(
    bloqueado?.telefones.length ? bloqueado.telefones.join("\n") : ""
  );
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState(false);
  const [smsOk, setSmsOk] = useState<boolean | null>(null);

  const refresh = () => {
    listAnunciosGestao("sms")
      .then((rows) => {
        setItems(rows);
        setMissing(false);
      })
      .catch((err) => {
        if (isMissingTable(err)) setMissing(true);
        else setItems([]);
      });
  };

  useEffect(() => {
    refresh();
    listTelefonesInscricoes()
      .then(setInscricoes)
      .catch(() => setInscricoes([]));
    listNewsletterGestao()
      .then(setSubscritores)
      .catch(() => setSubscritores([]));
    fetch("/api/sms")
      .then((res) => res.json())
      .then((data) => setSmsOk(Boolean(data.configurado)))
      .catch(() => setSmsOk(false));
  }, []);

  const numeros =
    destEhSubscritores(destinatarios) && bloqueado?.telefones.length
      ? telemoveisDeContactos([], extra)
      : destEhSubscritores(destinatarios)
        ? telemoveisDeContactos(
            subscritores.map((s) => s.telefone),
            extra
          )
        : telemoveisUnicos(inscricoes, destinatarios, extra);
  const conta = segmentosSms(mensagem);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mensagem.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinatarios,
          assunto: assunto.trim(),
          mensagem: mensagem.trim(),
          extra,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível enviar o SMS.");
      setAssunto("");
      setMensagem("");
      setExtra("");
      refresh();
      onAction(
        data.falhados
          ? `SMS enviado a ${data.enviados} de ${data.total} ${destEhSubscritores(destinatarios) ? "subscritores" : "estudantes"}.`
          : `SMS enviado a ${data.enviados} ${destEhSubscritores(destinatarios) ? "subscritor(es)" : "estudante(s)"}.`
      );
    } catch (error) {
      if (isMissingTable(error)) setMissing(true);
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
      <form className="bg-white border border-navy-100 p-8 space-y-4" onSubmit={onSubmit}>
        <h2 className="font-serif text-2xl font-bold text-navy-900">SMS aos estudantes</h2>
        <p className="text-sm text-navy-900/65 leading-relaxed">
          A mensagem sai para os telemóveis das pré-inscrições. Números de Moçambique
          (82–87) são normalizados automaticamente.
        </p>
        {missing && <SchemaInstall />}
        {smsOk === false && (
          <div className="border border-navy-100 bg-cream p-4 text-sm text-navy-900/80 leading-relaxed">
            Para activar o envio, defina no servidor{" "}
            <span className="font-semibold">TWILIO_ACCOUNT_SID</span>,{" "}
            <span className="font-semibold">TWILIO_AUTH_TOKEN</span> e{" "}
            <span className="font-semibold">TWILIO_FROM</span> (número Twilio com
            envio para Moçambique). Em alternativa,{" "}
            <span className="font-semibold">SMS_API_URL</span>,{" "}
            <span className="font-semibold">SMS_API_TOKEN</span> e{" "}
            <span className="font-semibold">SMS_FROM</span>.
          </div>
        )}
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Destinatários</span>
          <select
            name="destinatarios"
            className="esj-field"
            value={destinatarios}
            onChange={(e) => setDestinatarios(e.target.value)}
          >
            <option>Todos os estudantes</option>
            <option>Maputo — Sede</option>
            <option>Manica — Delegação Académica</option>
            <option>Licenciatura em Jornalismo</option>
            <option>Licenciatura em Publicidade e Marketing</option>
            <option>Licenciatura em Relações Públicas</option>
            <option>Licenciatura em Biblioteconomia e Documentação</option>
            <option>Subscritores</option>
          </select>
          <span className="mt-1.5 block text-xs text-navy-900/55">
            {numeros.length} telemóvel(eis) neste grupo
          </span>
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Assunto interno</span>
          <input
            name="assunto"
            className="esj-field"
            placeholder="Referência na gestão (não vai no SMS)"
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Mensagem</span>
          <textarea
            name="mensagem"
            required
            className="esj-field-area"
            placeholder="Texto do SMS"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
          />
          <span className="mt-1.5 block text-xs text-navy-900/55">
            {conta.caracteres} caracteres
            {conta.segmentos > 0 ? ` · ${conta.segmentos} SMS` : ""}
          </span>
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">
            Números extra (opcional)
          </span>
          <textarea
            name="extra"
            className="esj-field !h-auto min-h-[5.5rem] py-2.5 resize-y"
            placeholder="Um número por linha, se precisar de acrescentar"
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={busy || smsOk === false || numeros.length === 0 || !mensagem.trim()}
          className="bg-leaf hover:bg-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
        >
          {busy ? "A ENVIAR…" : "ENVIAR SMS"}
        </button>
      </form>
      <aside className="bg-white border border-navy-100 p-6">
        <h3 className="font-serif font-bold text-navy-900">SMS enviados</h3>
        <ul className="mt-4 space-y-3 text-sm">
          {items.length === 0 && (
            <li className="text-navy-900/50">Ainda sem envios.</li>
          )}
          {items.map((a) => (
            <li key={a.id}>
              <span className="block font-semibold text-navy-900">{a.assunto}</span>
              <span className="text-navy-900/55 text-xs">{a.destinatarios}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
