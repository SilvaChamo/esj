"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Bell,
  Book,
  BookOpen,
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
  loadPublicacao,
  readPublicacao,
  writePublicacao,
  type Categoria,
  type Publicacao,
} from "@/lib/publicacao";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { COURSES } from "@/lib/inscricao";
import {
  cmsError,
  isMissingTable,
  listAnunciosGestao,
  listInscricoesGestao,
  listNewsletterGestao,
  listVideosGestao,
  loadEditalVigente,
  publishAnuncio,
  publishCalendario,
  publishEdital,
  publishNoticia,
  publishPublicacao,
  publishVideo,
  statsAnoLectivo,
} from "@/lib/cms";
import SchemaInstall from "@/components/gestao/SchemaInstall";
import ResultadosPauta from "@/components/gestao/ResultadosPauta";
import Galeria from "@/components/gestao/Galeria";
import ImageSelector from "@/components/gestao/ImageSelector";
import Documentos from "@/components/gestao/Documentos";

type Section =
  | "painel"
  | "candidaturas"
  | "resultados"
  | "calendario"
  | "edital"
  | "noticias"
  | "anuncios"
  | "eventos"
  | "livros"
  | "galeria"
  | "videos"
  | "documentos"
  | "subscritores";

type NavIcon = typeof LayoutDashboard;
type NavLeaf = { id: Section; label: string; icon: NavIcon };
type NavGroup = { label: string; icon: NavIcon; children: NavLeaf[] };
type NavEntry = NavLeaf | NavGroup;

function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry;
}

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
      { id: "anuncios", label: "Anúncios", icon: Bell },
      { id: "eventos", label: "Eventos", icon: CalendarDays },
      { id: "livros", label: "Livros", icon: Book },
    ],
  },
  {
    label: "Galeria",
    icon: Images,
    children: [
      { id: "galeria", label: "Imagens", icon: ImageIcon },
      { id: "videos", label: "Vídeos", icon: Video },
      { id: "documentos", label: "Documentos", icon: FileText },
    ],
  },
  { id: "subscritores", label: "Subscritores", icon: Mail },
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

  useEffect(() => {
    const active = groupOf(section);
    if (active) setOpenGroup(active.label);
  }, [section]);

  // Clicar no cabeçalho de um grupo abre-o e navega logo para o seu
  // primeiro item — o chevron, à parte, só expande/colapsa sem navegar.
  const goToGroup = (label: string, firstId: Section) => {
    setOpenGroup(label);
    setSection(firstId);
    setIsMobileMenuOpen(false);
  };

  const toggleGroupOnly = (label: string) => {
    setOpenGroup((prev) => (prev === label ? null : label));
  };

  const goToLeaf = (id: Section) => {
    setSection(id);
    setIsMobileMenuOpen(false);
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
    setNote(msg);
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
                  <div className="relative pb-1">
                    <div className="absolute left-[26px] top-1 bottom-2 w-px bg-white/10" />
                    {entry.children.map((child) => {
                      const ChildIcon = child.icon;
                      const active = section === child.id;
                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => goToLeaf(child.id)}
                          className={`relative w-full flex items-center gap-3 pl-11 pr-5 py-2.5 text-[13px] text-left transition-colors ${
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
          className={`border-t border-white/10 bg-black/20 flex items-center gap-2 ${
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
        <header className="bg-white border-b border-navy-100 px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-xl font-bold text-navy-900">
              {sectionLabel(section)}
            </h1>
            <p className="mt-0.5 text-[11px] font-bold tracking-widest text-sky">
              SECRETARIA ACADÉMICA
            </p>
          </div>
          <button
            type="button"
            onClick={sair}
            className="flex items-center gap-2 text-sm font-bold text-navy-900/70 hover:text-sky transition-colors"
          >
            <LogOut size={15} />
            Sair
          </button>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-8">
          {needsSchema && <SchemaInstall />}
          {section === "painel" && <Painel onGo={setSection} userEmail={userEmail} />}
          {section === "edital" && <Edital onAction={showNote} />}
          {section === "livros" && (
            <Publicacoes key="livro" onAction={showNote} categoria="livro" />
          )}
          {section === "eventos" && (
            <Publicacoes key="evento" onAction={showNote} categoria="evento" />
          )}
          {section === "galeria" && <Galeria />}
          {section === "calendario" && <CalendarioAcademico onAction={showNote} />}
          {section === "resultados" && <ResultadosPauta onAction={showNote} />}
          {section === "noticias" && <Noticias onAction={showNote} />}
          {section === "videos" && <Videos onAction={showNote} />}
          {section === "documentos" && <Documentos />}
          {section === "candidaturas" && <Candidaturas />}
          {section === "anuncios" && <Anuncios onAction={showNote} />}
          {section === "subscritores" && <Subscritores />}
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
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [current, setCurrent] = useState<{ title: string; file_url: string } | null>(null);

  useEffect(() => {
    loadEditalVigente()
      .then(setCurrent)
      .catch(() => setCurrent(null));
  }, []);

  const publish = async () => {
    if (!file) {
      onAction("Escolha o PDF do novo edital.");
      return;
    }
    setBusy(true);
    try {
      await publishEdital(file, "Edital de Admissão 2026");
      const next = await loadEditalVigente();
      setCurrent(next);
      setFile(null);
      onAction("O edital foi publicado e já aparece em /edital.");
    } catch (error) {
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white border border-navy-100 p-8">
      <h2 className="font-serif text-2xl font-bold text-navy-900">Edital em vigor</h2>
      <p className="mt-2 text-sm text-navy-900/65 leading-relaxed">
        O documento publicado no sítio é o que os candidatos lêem em{" "}
        <Link href="/edital" className="text-sky hover:underline">
          /edital
        </Link>
        .
      </p>
      <div className="mt-6 border border-dashed border-navy-100 px-4 py-5 text-sm">
        <p className="font-bold text-navy-900">Ficheiro actual</p>
        <p className="mt-1 text-navy-900/65">
          {current ? current.title : "Ainda o PDF local (Edital 2020.pdf), até publicar um novo."}
        </p>
      </div>
      <label className="mt-5 block">
        <span className="block text-sm font-bold text-navy-900 mb-1.5">
          Novo PDF do edital
        </span>
        <input
          type="file"
          accept=".pdf"
          className="esj-field-file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <button
        type="button"
        disabled={busy}
        onClick={publish}
        className="mt-6 bg-leaf hover:bg-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
      >
        {busy ? "A PUBLICAR…" : "PUBLICAR EDITAL"}
      </button>
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
  const [data, setData] = useState<Publicacao>(() => readPublicacao(categoria));
  const [selectorAberto, setSelectorAberto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState(false);
  const [geracao, setGeracao] = useState(0);
  const editado = useRef(false);
  const carga = useRef(0);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    const id = ++carga.current;
    loadPublicacao(categoria).then((next) => {
      if (id !== carga.current || editado.current) return;
      setData({ ...next, tipo: categoria === "evento" ? "cartaz" : "livro" });
    });
  }, [categoria]);

  const aplicarFoto = (image: string) => {
    editado.current = true;
    carga.current += 1;
    setGeracao((n) => n + 1);
    setData((prev) => {
      const next = {
        ...prev,
        image,
        tipo: categoria === "evento" ? ("cartaz" as const) : ("livro" as const),
      };
      writePublicacao(next, categoria);
      dataRef.current = next;
      return next;
    });
  };

  const publish = async () => {
    setBusy(true);
    try {
      const publicado = {
        ...dataRef.current,
        tipo: categoria === "evento" ? ("cartaz" as const) : ("livro" as const),
      };
      const image = await publishPublicacao(publicado, null, categoria);
      const gravado = { ...publicado, image };
      dataRef.current = gravado;
      setData(gravado);
      writePublicacao(gravado, categoria);
      setGeracao((n) => n + 1);
      setMissing(false);
      onAction(
        categoria === "livro"
          ? "A imagem do livro foi publicada."
          : "A imagem do evento foi publicada."
      );
    } catch (error) {
      if (isMissingTable(error)) setMissing(true);
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  const srcFoto =
    geracao > 0
      ? `${data.image}${data.image.includes("?") ? "&" : "?"}cb=${geracao}`
      : data.image;

  return (
    <>
      {missing && <SchemaInstall />}
      <div className={categoria === "evento" ? "max-w-sm" : "max-w-lg"}>
        <button
          type="button"
          onClick={() => setSelectorAberto(true)}
          className={`relative w-full overflow-hidden bg-cream border border-navy-100 group ${
            categoria === "evento" ? "aspect-[210/297]" : "aspect-square"
          }`}
          aria-label={categoria === "livro" ? "Substituir imagem do livro" : "Substituir imagem do evento"}
        >
          <img
            key={srcFoto}
            src={srcFoto}
            alt=""
            className={
              categoria === "livro"
                ? "absolute inset-0 w-full h-full object-contain p-2"
                : "absolute inset-0 w-full h-full object-cover"
            }
          />
          <span className="absolute inset-0 flex items-end justify-center bg-navy-900/0 group-hover:bg-navy-900/45 transition-colors">
            <span className="mb-4 px-3 py-1.5 bg-white text-navy-900 text-[10px] font-bold tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
              CLICAR PARA SUBSTITUIR
            </span>
          </span>
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void publish()}
          className="mt-3 h-11 px-4 bg-leaf hover:bg-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide whitespace-nowrap transition-colors"
        >
          {busy ? "A PUBLICAR…" : "PUBLICAR"}
        </button>
      </div>
      {selectorAberto && (
        <ImageSelector
          initialTab="galeria"
          onClose={() => setSelectorAberto(false)}
          onSelect={aplicarFoto}
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
        Académico&rdquo;, em /#ensino.
      </p>
      {missing && <SchemaInstall />}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="block text-sm font-bold text-navy-900 mb-1.5">{f.label}</span>
            <textarea
              className="esj-field min-h-[76px] py-2.5"
              value={data[f.key]}
              onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
            />
          </label>
        ))}
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
  "w-full bg-white text-[#2c3338] border border-[#8c8f94] rounded-[4px] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)]";

const RASCUNHO_NOTICIA_KEY = "esj-rascunho-noticia";

function Noticias({ onAction }: { onAction: (m: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RASCUNHO_NOTICIA_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        setTitle(draft.title || "");
        setExcerpt(draft.excerpt || "");
        setBody(draft.body || "");
        setImageUrl(draft.imageUrl || "");
      }
    } catch {
      /* rascunho inválido, ignora */
    }
  }, []);

  const guardarRascunho = () => {
    try {
      window.localStorage.setItem(
        RASCUNHO_NOTICIA_KEY,
        JSON.stringify({ title, excerpt, body, imageUrl })
      );
      onAction("Rascunho guardado neste dispositivo.");
    } catch {
      onAction("Não foi possível guardar o rascunho.");
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    try {
      await publishNoticia({ title: title.trim(), excerpt: excerpt.trim(), body: body.trim(), image: imageUrl || null });
      setTitle("");
      setExcerpt("");
      setBody("");
      setImageUrl("");
      window.localStorage.removeItem(RASCUNHO_NOTICIA_KEY);
      onAction("A notícia foi publicada em /noticias.");
    } catch (error) {
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  const hoje = new Date().toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="text-[#2c3338]">
      <h1 className="font-serif text-2xl font-bold text-navy-900 mb-4">Adicionar notícia</h1>

      <form onSubmit={onSubmit} className="flex flex-col lg:flex-row gap-5 items-start">
        <div className="flex-1 w-full space-y-5 min-w-0">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Adicionar título"
            className={`${noticiaInputClass} h-[50px] px-3 text-[1.4rem]`}
          />

          <div className="bg-white border border-[#ccd0d4] rounded-[8px] overflow-hidden shadow-sm">
            <div className="p-3 border-b border-[#ccd0d4] bg-white">
              <h2 className="font-semibold text-[14px] text-[#1d2327]">Resumo</h2>
            </div>
            <div className="p-4 bg-white">
              <textarea
                rows={2}
                required
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Duas linhas para a página inicial"
                className={`${noticiaInputClass} p-3 text-[14px]`}
              />
            </div>
          </div>

          <div className="bg-white border border-[#ccd0d4] rounded-[8px] overflow-hidden shadow-sm">
            <div className="p-3 border-b border-[#ccd0d4] bg-white">
              <h2 className="font-semibold text-[14px] text-[#1d2327]">Texto</h2>
            </div>
            <div className="p-4 bg-white">
              <textarea
                rows={12}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Corpo da notícia"
                className={`${noticiaInputClass} p-3 text-[14px]`}
              />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[280px] space-y-5 shrink-0">
          <div className="bg-white border border-[#ccd0d4] rounded-[8px] overflow-hidden shadow-sm">
            <div className="p-2.5 border-b border-[#ccd0d4] bg-white">
              <h2 className="font-semibold text-[14px] text-[#1d2327]">Imagem de destaque</h2>
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
                <button type="button" onClick={() => setIsImageSelectorOpen(true)} className="text-[#2271b1] text-[13px] hover:text-[#135e96] underline underline-offset-2 text-left">
                  Definir imagem de destaque
                </button>
              )}
            </div>
          </div>

          <div className="bg-white border border-[#ccd0d4] rounded-[8px] overflow-hidden shadow-sm">
            <div className="p-2.5 border-b border-[#ccd0d4] bg-white flex items-center justify-between">
              <h2 className="font-semibold text-[14px] text-[#1d2327]">Publicar</h2>
              <ChevronUp className="w-4 h-4 text-[#787c82]" />
            </div>
            <div className="p-3 space-y-2.5 text-[13px] text-[#1d2327]">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#787c82] shrink-0" />
                <span>
                  Estado: <strong>Publicado</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#787c82] shrink-0" />
                <span>
                  Visibilidade: <strong>Público</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#787c82] shrink-0" />
                <span className="border border-[#ccd0d4] rounded-[4px] px-2.5 py-1 text-[#1d2327]">{hoje}</span>
              </div>
            </div>
            <div className="p-3 bg-[#f6f7f7] flex items-center justify-between gap-2 border-t border-[#ccd0d4]">
              <button
                type="button"
                onClick={guardarRascunho}
                className="px-3 py-2 bg-white border border-[#ccd0d4] text-[#50575e] text-[12px] font-semibold rounded-[4px] hover:bg-[#f0f0f1] whitespace-nowrap"
              >
                Guardar rascunho
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 bg-[#2271b1] text-white text-[13px] font-medium rounded-[4px] hover:bg-[#135e96] disabled:opacity-50 whitespace-nowrap"
              >
                {busy ? "A publicar…" : "Publicar"}
              </button>
            </div>
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
  const [items, setItems] = useState<{ id: string; title: string; url: string }[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    listVideosGestao()
      .then(setItems)
      .catch(() => setItems([]));
  };

  useEffect(() => {
    refresh();
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    try {
      await publishVideo(String(fd.get("title") || "").trim(), String(fd.get("url") || "").trim());
      form.reset();
      refresh();
      onAction("O vídeo foi gravado.");
    } catch (error) {
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white border border-navy-100 p-8">
      <h2 className="font-serif text-2xl font-bold text-navy-900">Vídeos da ESJ TV</h2>
      <ul className="mt-6 space-y-3 text-sm">
        {items.length === 0 && (
          <li className="text-navy-900/50">Ainda sem vídeos na base.</li>
        )}
        {items.map((v) => (
          <li key={v.id} className="border border-navy-100 px-4 py-3">
            <span className="font-semibold text-navy-900">{v.title}</span>
            <a href={v.url} className="block text-sky text-xs mt-0.5 break-all" target="_blank" rel="noreferrer">
              {v.url}
            </a>
          </li>
        ))}
      </ul>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Título</span>
          <input name="title" required className="esj-field" placeholder="Título do vídeo" />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Ligação YouTube ou Vimeo</span>
          <input name="url" type="url" required className="esj-field" placeholder="https://" />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="bg-leaf hover:bg-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
        >
          {busy ? "A PUBLICAR…" : "PUBLICAR VÍDEO"}
        </button>
      </form>
    </div>
  );
}

function Candidaturas() {
  const [items, setItems] = useState<
    { protocolo: string; nome: string; email: string | null; curso: string; delegacao: string | null; created_at: string }[]
  >([]);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listInscricoesGestao()
      .then(setItems)
      .catch((err) => {
        if (isMissingTable(err)) setMissing(true);
        else setError(cmsError(err));
      });
  }, []);

  return (
    <div className="bg-white border border-navy-100 p-8">
      <h2 className="font-serif text-2xl font-bold text-navy-900">Pré-inscrições</h2>
      <p className="mt-2 text-sm text-navy-900/65">Candidaturas submetidas em /inscricoes.</p>
      {missing && <SchemaInstall />}
      {error && <p className="mt-4 text-sm text-crimson">{error}</p>}
      <ul className="mt-6 divide-y divide-navy-100">
        {items.length === 0 && !error && !missing && (
          <li className="py-3 text-sm text-navy-900/50">Ainda não há candidaturas.</li>
        )}
        {items.map((c) => (
          <li key={c.protocolo} className="py-4">
            <p className="font-semibold text-navy-900">{c.nome}</p>
            <p className="text-xs text-sky mt-0.5">{c.protocolo}</p>
            <p className="text-sm text-navy-900/65 mt-1">
              {c.curso}
              {c.delegacao ? ` · ${c.delegacao}` : ""}
            </p>
            {c.email && <p className="text-xs text-navy-900/50 mt-1">{c.email}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Subscritores() {
  const [items, setItems] = useState<{ id: string; email: string; created_at: string }[]>([]);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    listNewsletterGestao()
      .then(setItems)
      .catch((err) => {
        if (isMissingTable(err)) setMissing(true);
        else setError(cmsError(err));
      });
  }, []);

  const copiarLista = async () => {
    try {
      await navigator.clipboard.writeText(items.map((i) => i.email).join(", "));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard indisponível */
    }
  };

  return (
    <div className="bg-white border border-navy-100 p-8">
      <h2 className="font-serif text-2xl font-bold text-navy-900">Subscritores da newsletter</h2>
      <p className="mt-2 text-sm text-navy-900/65 leading-relaxed max-w-2xl">
        Esta é a lista de correios inscritos no formulário de newsletter (secção de
        contacto da página inicial). É a esta lista que, no futuro, serão enviadas
        as novas publicações do sítio — o envio automático ainda não está ligado,
        por agora a lista fica disponível aqui para copiar.
      </p>
      {missing && <SchemaInstall />}
      {error && <p className="mt-4 text-sm text-crimson">{error}</p>}
      {!missing && (
        <div className="mt-6 flex items-center gap-4">
          <p className="text-sm font-semibold text-navy-900">
            {items.length} subscritor{items.length === 1 ? "" : "es"}
          </p>
          {items.length > 0 && (
            <button
              type="button"
              onClick={copiarLista}
              className="text-xs font-semibold tracking-wide text-sky hover:text-crimson"
            >
              {copied ? "LISTA COPIADA" : "COPIAR LISTA DE CORREIOS"}
            </button>
          )}
        </div>
      )}
      <ul className="mt-4 divide-y divide-navy-100">
        {items.length === 0 && !error && !missing && (
          <li className="py-3 text-sm text-navy-900/50">Ainda sem subscritores.</li>
        )}
        {items.map((s) => (
          <li key={s.id} className="py-3 flex items-center justify-between gap-4">
            <span className="text-sm text-navy-900">{s.email}</span>
            <span className="text-[11px] text-navy-900/50 shrink-0">
              {new Date(s.created_at).toLocaleDateString("pt-PT")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Anuncios({ onAction }: { onAction: (m: string) => void }) {
  const [items, setItems] = useState<
    { id: string; destinatarios: string; assunto: string; mensagem: string }[]
  >([]);
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState(false);

  const refresh = () => {
    listAnunciosGestao()
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
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    try {
      await publishAnuncio({
        destinatarios: String(fd.get("destinatarios") || "Todos os estudantes"),
        assunto: String(fd.get("assunto") || "").trim(),
        mensagem: String(fd.get("mensagem") || "").trim(),
      });
      form.reset();
      refresh();
      onAction("O anúncio foi gravado na base da ESJ.");
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
        <h2 className="font-serif text-2xl font-bold text-navy-900">
          Anúncio aos estudantes
        </h2>
        <p className="text-sm text-navy-900/65 leading-relaxed">
          Os avisos ficam guardados aqui. O envio automático para o eDondzo ainda
          não está ligado.
        </p>
        {missing && <SchemaInstall />}
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Destinatários</span>
          <select name="destinatarios" className="esj-field">
            <option>Todos os estudantes</option>
            <option>Maputo — Sede</option>
            <option>Manica — Delegação Académica</option>
            <option>Licenciatura em Jornalismo</option>
            <option>Licenciatura em Publicidade e Marketing</option>
            <option>Licenciatura em Relações Públicas</option>
            <option>Licenciatura em Biblioteconomia e Documentação</option>
          </select>
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Assunto</span>
          <input name="assunto" required className="esj-field" placeholder="Assunto do anúncio" />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Mensagem</span>
          <textarea
            name="mensagem"
            required
            className="esj-field h-32 py-3"
            placeholder="Texto do anúncio"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="bg-leaf hover:bg-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
        >
          {busy ? "A GRAVAR…" : "GRAVAR ANÚNCIO"}
        </button>
      </form>
      <aside className="bg-white border border-navy-100 p-6">
        <h3 className="font-serif font-bold text-navy-900">Anúncios gravados</h3>
        <ul className="mt-4 space-y-3 text-sm">
          {items.length === 0 && (
            <li className="text-navy-900/50">Ainda sem anúncios.</li>
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
