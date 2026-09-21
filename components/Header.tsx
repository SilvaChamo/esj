"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Phone,
  MapPin,
  Search,
  ChevronDown,
  ChevronRight,
  Facebook,
  Instagram,
  LogIn,
  LogOut,
  Menu,
  X,
  Youtube,
} from "lucide-react";
import { useSlideProgress } from "@/components/SlideProgressContext";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { eDocente, eSuperAdmin } from "@/lib/gestao-auth";

type MenuChild = {
  label: string;
  href?: string;
  description?: string;
  cta?: string;
  children?: MenuChild[];
};
type MenuItem = { label: string; href?: string; children?: MenuChild[]; mega?: boolean };

const menu: MenuItem[] = [
  {
    label: "ENSINO",
    href: "/#ensino",
    mega: true,
    children: [
      {
        label: "Calendário Académico",
        href: "/calendario",
        description: "Datas oficiais de inscrições, exames de admissão e início do ano lectivo.",
        cta: "Ver calendário",
      },
      {
        label: "Admissões",
        href: "/inscricoes",
        description: "Como concorrer à ESJ: prazos, requisitos e estado das inscrições.",
        cta: "Ver admissões",
      },
      {
        label: "Resultados de Admissão",
        href: "/resultados",
        description: "Consulte os resultados publicados dos exames de admissão por curso e regime.",
        cta: "Ver resultados",
      },
      {
        label: "Pautas Finais",
        href: "/pautas",
        description: "Pautas finais das cadeiras publicadas pelo registo académico, por curso e cadeira.",
        cta: "Ver pautas",
      },
      {
        label: "Portal do Estudante",
        href: "/estudantes",
        description: "Aceda aos materiais de estudo, pautas de frequências, calendário e minutas da ESJ.",
        cta: "Entrar no portal",
      },
      {
        label: "Painel do Docente",
        href: "/docencia",
        description: "Área de publicação e gestão de materiais pedagógicos para professores.",
        cta: "Ver painel",
      },
      {
        label: "Estudantes internacionais",
        href: "/estudantes-internacionais",
        description: "Acolhimento, intercâmbio e candidatura para estudantes de outros países.",
        cta: "Saber mais",
      },
    ],
  },
  {
    label: "INVESTIGAÇÃO",
    children: [
      { label: "Linhas de Pesquisa" },
      { label: "Projectos" },
      { label: "Biblioteca", href: "/biblioteca-virtual" },
    ],
  },
  {
    label: "EVENTOS",
    children: [
      { label: "Conferência Internacional" },
      { label: "Semana da Comunicação e Informação" },
      { label: "Cerimónia de Graduação" },
      { label: "Colóquios" },
    ],
  },
  { label: "NOTÍCIAS", href: "/noticias" },
  {
    label: "GOVERNAÇÃO",
    children: [
      { label: "Conselho da ESJ" },
      { label: "Direcção" },
      { label: "Conselho Científico-Pedagógico" },
    ],
  },
  { label: "CONTACTO", href: "/contacto" },
];

export default function Header() {
  const router = useRouter();
  const { progress, enabled, slideIndex } = useSlideProgress();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [openMobileItem, setOpenMobileItem] = useState<string | null>(null);
  const [openMobileNested, setOpenMobileNested] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [souDocente, setSouDocente] = useState(false);
  const [souAdmin, setSouAdmin] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const supabase = createBrowserSupabase();
      void supabase.auth.getUser().then(({ data }) => {
        setLoggedIn(!!data.user);
        setSouAdmin(eSuperAdmin(data.user));
        setSouDocente(eDocente(data.user));
      });
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setLoggedIn(!!session?.user);
        setSouAdmin(eSuperAdmin(session?.user));
        setSouDocente(eDocente(session?.user));
      });
      return () => sub.subscription.unsubscribe();
    } catch {
      /* env em falta */
    }
  }, []);

  const sair = async () => {
    try {
      const supabase = createBrowserSupabase();
      await supabase.auth.signOut();
    } catch {
      /* env em falta */
    }
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    if (!searchOpen) return;
    searchRef.current?.focus();
  }, [searchOpen]);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  const runSearch = () => {
    const q = query.trim();
    if (!q) return;
    router.push(`/busca?q=${encodeURIComponent(q)}`);
    closeSearch();
  };

  return (
    <>
      {/* Top utility bar */}
      <div className="bg-navy-800 text-white text-[11px] font-medium">
        <div className="mx-auto max-w-7xl px-4 flex items-center justify-between h-10">
          <div className={`items-center gap-5 shrink-0 ${searchOpen ? "hidden sm:flex" : "flex"}`}>
            <span className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              <MapPin size={14} />
              <span className="sm:hidden">Av. 24 de Julho</span>
              <span className="hidden sm:inline">Av. 24 de Julho, Maputo</span>
            </span>
            <a href="tel:+25821302721" className="flex items-center gap-2 shrink-0 whitespace-nowrap hover:text-sky-300 transition-colors">
              <Phone size={14} />
              <span className="text-white">+258 21 302 721</span>
            </a>
          </div>
          <div className={`items-center gap-3 ${searchOpen ? "flex w-full sm:w-auto" : "flex"}`}>
            <div
              className={`relative h-10 overflow-hidden transition-[width] duration-300 ease-out ${
                searchOpen ? "flex-1 sm:flex-none sm:w-[315px]" : loggedIn ? "w-0 sm:w-[280px]" : "w-0"
              }`}
            >
              <div
                className={`absolute inset-0 hidden sm:flex items-center justify-end gap-5 transition-all duration-300 ease-out ${
                  searchOpen
                    ? "opacity-0 -translate-x-3 pointer-events-none"
                    : "opacity-100 translate-x-0"
                }`}
              >
                {loggedIn && (
                  <Link
                    href={souAdmin ? "/gestao" : souDocente ? "/docencia/partilhar" : "/estudantes"}
                    className="hover:text-sky-300 transition-colors whitespace-nowrap"
                  >
                    {souAdmin ? "Voltar ao PAINEL" : souDocente ? "Voltar à DOCÊNCIA" : "Voltar ao PORTAL"}
                  </Link>
                )}
              </div>
              <form
                className={`absolute inset-0 flex items-center transition-all duration-300 ease-out ${
                  searchOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-3 pointer-events-none"
                }`}
                onSubmit={(e) => {
                  e.preventDefault();
                  runSearch();
                }}
              >
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") closeSearch();
                  }}
                  placeholder="Pesquisar..."
                  className="w-full h-7 bg-transparent border-b border-white/45 text-[11px] text-white placeholder:text-white/50 outline-none"
                />
              </form>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                aria-label={searchOpen ? "Fechar pesquisa" : "Pesquisar"}
                className="flex items-center justify-center w-6 h-6 rounded-full border border-white/60 hover:border-sky-300 hover:text-sky-300 transition-colors"
                onClick={() => {
                  if (searchOpen) closeSearch();
                  else setSearchOpen(true);
                }}
              >
                {searchOpen ? <X size={12} /> : <Search size={12} />}
              </button>
              <a
                href="https://www.youtube.com/@EscolaSuperiordeJornalismo"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube da ESJ"
                className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full bg-[#FF0000] hover:bg-[#CC0000] text-white transition-colors"
              >
                <Youtube size={12} strokeWidth={1.75} />
              </a>
              <a
                href="https://www.facebook.com/ESJ.mz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook da ESJ"
                className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full bg-[#1877F2] hover:bg-[#166FE5] text-white transition-colors"
              >
                <Facebook size={12} strokeWidth={1.75} />
              </a>
              <span
                aria-label="Instagram da ESJ (brevemente)"
                title="Brevemente"
                className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-white/40 cursor-default"
              >
                <Instagram size={12} strokeWidth={1.75} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <header data-site-chrome className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="relative mx-auto max-w-7xl px-4 grid grid-cols-[auto_1fr_auto] items-center h-[80px]">
          <Link href="/" className="flex items-center">
            <Image
              src="/esj-logo-mark.png"
              alt="ESJ"
              width={72}
              height={72}
              className="h-16 w-16 object-contain rounded-sm"
            />
          </Link>

          <nav className="hidden lg:flex items-center justify-center gap-5">
            {menu.map((item) => (
              <div
                key={item.label}
                className="relative group py-8"
                onMouseEnter={() => setOpenSub(item.label)}
                onMouseLeave={() => setOpenSub(null)}
              >
                {item.href ? (
                  <a
                    href={item.href}
                    className="flex items-center gap-1 text-[11px] font-semibold text-navy-900 hover:text-crimson transition-colors tracking-wide"
                  >
                    {item.label}
                    {item.children && <ChevronDown size={14} />}
                  </a>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-navy-900 tracking-wide">
                    {item.label}
                    {item.children && <ChevronDown size={14} />}
                  </span>
                )}
                {!item.mega && item.children && openSub === item.label && (
                  <div className="absolute left-0 top-full bg-white shadow-lg border-t-2 border-sky min-w-[280px] py-2 z-50">
                    {item.children.map((child) =>
                      child.children?.length ? (
                        <div key={child.label} className="relative group/sub">
                          <span className="flex items-center justify-between gap-3 px-5 py-2.5 text-[13px] text-navy-900 hover:bg-cream hover:text-crimson cursor-default">
                            {child.label}
                            <ChevronRight size={14} className="shrink-0 opacity-60" />
                          </span>
                          <div className="invisible opacity-0 group-hover/sub:visible group-hover/sub:opacity-100 absolute left-full top-0 ml-0 bg-white shadow-lg border border-navy-100 min-w-[260px] py-2 z-50">
                            {child.children.map((neto) =>
                              neto.href ? (
                                <a
                                  key={neto.label}
                                  href={neto.href}
                                  className="block px-5 py-2.5 text-[13px] text-navy-900 hover:bg-cream hover:text-crimson transition-colors"
                                >
                                  {neto.label}
                                </a>
                              ) : (
                                <span
                                  key={neto.label}
                                  className="block px-5 py-2.5 text-[13px] text-navy-900/50 cursor-default"
                                >
                                  {neto.label}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      ) : child.href ? (
                        <a
                          key={child.label}
                          href={child.href}
                          className="block px-5 py-2.5 text-[13px] text-navy-900 hover:bg-cream hover:text-crimson transition-colors"
                        >
                          {child.label}
                        </a>
                      ) : (
                        <span
                          key={child.label}
                          className="block px-5 py-2.5 text-[13px] text-navy-900/50 cursor-default"
                        >
                          {child.label}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {(() => {
            const megaItem = menu.find((m) => m.mega && m.label === openSub);
            if (!megaItem?.children) return null;
            return (
              <>
                <div
                  aria-hidden
                  onClick={() => setOpenSub(null)}
                  className="fixed inset-x-0 top-[124px] bottom-0 bg-navy-900/40 z-40"
                />
                <div
                  onMouseEnter={() => setOpenSub(megaItem.label)}
                  onMouseLeave={() => setOpenSub(null)}
                  className="absolute left-0 right-0 top-full bg-white shadow-lg border-t-2 border-sky z-50"
                >
                  <div className="mx-auto max-w-7xl px-4 py-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {megaItem.children.map((child) => (
                        <a
                          key={child.label}
                          href={child.href}
                          className="group/card block border border-navy-100 p-4 hover:border-sky hover:bg-cream transition-colors"
                        >
                          <h3 className="text-sm font-bold text-navy-900 group-hover/card:text-crimson transition-colors">
                            {child.label}
                          </h3>
                          {child.description && (
                            <p className="mt-1.5 text-[12px] text-navy-900/60 leading-relaxed">
                              {child.description}
                            </p>
                          )}
                          {child.cta && (
                            <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-sky group-hover/card:text-crimson transition-colors">
                              {child.cta}
                              <ChevronRight size={12} />
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}

          <div className="flex items-center justify-end gap-4">
            {loggedIn ? (
              <button
                type="button"
                onClick={() => void sair()}
                className="hidden lg:inline-flex items-center gap-2 bg-leaf hover:bg-crimson text-white font-bold text-xs px-5 py-2.5 tracking-wide transition-colors"
              >
                <LogOut size={14} />
                SAIR
              </button>
            ) : (
              <Link
                href="/entrar"
                className="hidden lg:inline-flex items-center gap-2 bg-leaf hover:bg-crimson text-white font-bold text-xs px-5 py-2.5 tracking-wide transition-colors"
              >
                <LogIn size={14} />
                ENTRAR
              </Link>
            )}
            <button
              aria-label="Abrir menu"
              className="lg:hidden text-navy-900"
              onClick={() => {
                setMobileOpen((v) => !v);
                setOpenMobileItem(null);
                setOpenMobileNested(null);
              }}
            >
              {mobileOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        <div className="relative h-[4px] w-full bg-crimson">
          {enabled && (
            <div
              className={`absolute inset-y-0 left-0 ${slideIndex % 2 === 0 ? "bg-leaf" : "bg-sky"}`}
              style={{ width: `${Math.min(progress, 1) * 100}%` }}
            />
          )}
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-navy-100 bg-white max-h-[calc(100vh-124px)] overflow-y-auto">
            {menu.map((item) => (
              <div key={item.label} className="border-b border-navy-100">
                {item.children ? (
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMobileItem((v) => (v === item.label ? null : item.label))
                    }
                    className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-navy-900"
                  >
                    {item.label}
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        openMobileItem === item.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                ) : item.href ? (
                  <a
                    href={item.href}
                    className="block px-5 py-3 text-sm font-semibold text-navy-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="block px-5 py-3 text-sm font-semibold text-navy-900">
                    {item.label}
                  </span>
                )}
                {item.children && openMobileItem === item.label && (
                  <div className="pb-2">
                    {item.children.map((child) =>
                      child.children?.length ? (
                        <div key={child.label}>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMobileNested((v) =>
                                v === child.label ? null : child.label
                              )
                            }
                            className="w-full flex items-center justify-between px-8 py-2 text-sm text-navy-900/80"
                          >
                            {child.label}
                            <ChevronDown
                              size={14}
                              className={`transition-transform ${
                                openMobileNested === child.label ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {openMobileNested === child.label &&
                            child.children.map((neto) =>
                              neto.href ? (
                                <a
                                  key={neto.label}
                                  href={neto.href}
                                  className="block px-12 py-1.5 text-sm text-navy-900/70"
                                  onClick={() => setMobileOpen(false)}
                                >
                                  {neto.label}
                                </a>
                              ) : (
                                <span
                                  key={neto.label}
                                  className="block px-12 py-1.5 text-sm text-navy-900/40 cursor-default"
                                >
                                  {neto.label}
                                </span>
                              )
                            )}
                        </div>
                      ) : child.href ? (
                        <a
                          key={child.label}
                          href={child.href}
                          className="block px-8 py-2 text-sm text-navy-900/80"
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                          {child.description && (
                            <span className="mt-0.5 block text-[12px] font-normal text-navy-900/50 leading-relaxed">
                              {child.description}
                            </span>
                          )}
                        </a>
                      ) : (
                        <span
                          key={child.label}
                          className="block px-8 py-1.5 text-sm text-navy-900/40 cursor-default"
                        >
                          {child.label}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
            <div className="px-5 py-4">
              {loggedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    void sair();
                  }}
                  className="inline-flex items-center gap-2 bg-leaf hover:bg-crimson text-white font-bold text-xs px-5 py-2.5 tracking-wide transition-colors"
                >
                  <LogOut size={14} />
                  SAIR
                </button>
              ) : (
                <Link
                  href="/entrar"
                  className="inline-flex items-center gap-2 bg-leaf hover:bg-crimson text-white font-bold text-xs px-5 py-2.5 tracking-wide transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <LogIn size={14} />
                  ENTRAR
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
