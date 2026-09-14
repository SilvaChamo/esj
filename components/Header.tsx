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
  Menu,
  X,
} from "lucide-react";
import { useSlideProgress } from "@/components/SlideProgressContext";

type MenuChild = { label: string; href?: string };
type MenuItem = { label: string; href?: string; children?: MenuChild[] };

const menu: MenuItem[] = [
  { label: "INÍCIO", href: "/#inicio" },
  {
    label: "ENSINO",
    href: "/#ensino",
    children: [
      { label: "Jornalismo" },
      { label: "Publicidade e Marketing" },
      { label: "Relações Públicas" },
      { label: "Biblioteconomia e Documentação" },
      { label: "Pós-Graduação" },
      { label: "Admissões", href: "/inscricoes" },
    ],
  },
  {
    label: "INVESTIGAÇÃO",
    children: [
      { label: "Linhas de Pesquisa" },
      { label: "Projectos" },
      { label: "Biblioteca" },
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
  { label: "CONTACTO", href: "/#contacto" },
];

export default function Header() {
  const router = useRouter();
  const { progress, enabled, slideIndex } = useSlideProgress();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

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
        <div className="mx-auto max-w-7xl px-4 lg:px-8 flex items-center justify-between h-10">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2">
              <MapPin size={14} />
              <span className="sm:hidden">Av. 24 de Julho</span>
              <span className="hidden sm:inline">Av. 24 de Julho, Maputo</span>
            </span>
            <a href="tel:+25821302721" className="flex items-center gap-2 hover:text-sky-300 transition-colors">
              <Phone size={14} />
              <span className="hidden sm:inline">+258 21 302 721</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`relative h-10 overflow-hidden transition-[width] duration-300 ease-out ${
                searchOpen ? "w-[270px] sm:w-[315px]" : "w-0 sm:w-[210px]"
              }`}
            >
              <div
                className={`absolute inset-0 hidden sm:flex items-center justify-end gap-5 transition-all duration-300 ease-out ${
                  searchOpen
                    ? "opacity-0 -translate-x-3 pointer-events-none"
                    : "opacity-100 translate-x-0"
                }`}
              >
                <a
                  href="https://esj.edondzo.ac.mz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-300 transition-colors whitespace-nowrap"
                >
                  Portal eDondzo
                </a>
                <a
                  href="/noticias"
                  className="hover:text-sky-300 transition-colors whitespace-nowrap"
                >
                  Notícias
                </a>
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
            <button
              aria-label={searchOpen ? "Fechar pesquisa" : "Pesquisar"}
              className="flex items-center hover:text-sky-300 transition-colors"
              onClick={() => {
                if (searchOpen) closeSearch();
                else setSearchOpen(true);
              }}
            >
              {searchOpen ? <X size={14} /> : <Search size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <header data-site-chrome className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 grid grid-cols-[auto_1fr_auto] items-center h-[80px]">
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
                {item.children && openSub === item.label && (
                  <div className="absolute left-0 top-full bg-white shadow-lg border-t-2 border-sky min-w-[260px] py-2 z-50">
                    {item.children.map((child) =>
                      child.href ? (
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

          <div className="flex items-center justify-end gap-4">
            <Link
              href="/inscricoes"
              className="hidden lg:inline-flex bg-leaf hover:bg-crimson text-white font-bold text-xs px-5 py-2.5 tracking-wide transition-colors"
            >
              INSCREVA-SE
            </Link>
            <button
              aria-label="Abrir menu"
              className="lg:hidden text-navy-900"
              onClick={() => setMobileOpen((v) => !v)}
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
          <div className="lg:hidden border-t border-navy-100 bg-white">
            {menu.map((item) => (
              <div key={item.label} className="border-b border-navy-100">
                {item.href ? (
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
                {item.children && (
                  <div className="pb-2">
                    {item.children.map((child) =>
                      child.href ? (
                        <a
                          key={child.label}
                          href={child.href}
                          className="block px-8 py-1.5 text-sm text-navy-900/80"
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
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
              <Link
                href="/inscricoes"
                className="inline-flex bg-leaf hover:bg-crimson text-white font-bold text-xs px-5 py-2.5 tracking-wide transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                INSCREVA-SE
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
