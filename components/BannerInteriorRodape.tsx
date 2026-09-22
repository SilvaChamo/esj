"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import VoltarBanner from "@/components/VoltarBanner";

export default function BannerInteriorRodape({
  children,
  actions,
  busca = true,
  compact,
  imagem,
  voltar = true,
  secao,
}: {
  children: ReactNode;
  actions?: ReactNode;
  busca?: boolean;
  compact?: boolean;
  imagem?: string;
  voltar?: boolean;
  /** Limita a pesquisa deste banner à secção do site onde se encontra (ex: "Notícias"). */
  secao?: string;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aberto) inputRef.current?.focus();
  }, [aberto]);

  const fechar = () => {
    setAberto(false);
    setQuery("");
  };

  const pesquisar = () => {
    const q = query.trim();
    if (!q) return;
    const secaoParam = secao ? `&secao=${encodeURIComponent(secao)}` : "";
    router.push(`/busca?q=${encodeURIComponent(q)}${secaoParam}`);
    fechar();
  };

  return (
    <>
      <section
        className={`relative overflow-hidden text-white ${
          imagem
            ? "bg-navy-900"
            : "bg-gradient-to-br from-navy-900 from-0% via-navy-900 via-60% to-sky-700"
        }`}
      >
        {imagem ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagem}
              alt=""
              aria-hidden="true"
              className="pointer-events-none select-none absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/95 via-navy-900/70 to-navy-900/40" />
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/Bg1.webp"
            alt=""
            aria-hidden="true"
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, width: "100%", opacity: 0.1, pointerEvents: "none" }}
            className="pointer-events-none select-none absolute inset-x-0 bottom-0 w-full opacity-10"
          />
        )}
        <div
          className={`relative z-[1] mx-auto max-w-7xl px-4 py-4 md:py-6${
            actions ? " flex flex-col md:flex-row md:items-end justify-between gap-5" : ""
          }`}
        >
          <div
            className={`min-w-0 flex-1 ${
              compact && !imagem
                ? ""
                : `flex flex-col min-h-[212px] ${actions ? "justify-end" : "justify-center"}`
            }`}
          >
            {children}
            {(voltar || busca) && (
            <div className={`mt-4 flex items-center gap-4 ${busca ? "justify-between" : ""}`}>
              {voltar ? <VoltarBanner className="mt-0" /> : <span />}
              {busca ? (
                <button
                  type="button"
                  aria-label={aberto ? "Fechar pesquisa" : "Abrir pesquisa"}
                  aria-expanded={aberto}
                  onClick={() => (aberto ? fechar() : setAberto(true))}
                  className="group relative flex h-10 w-10 shrink-0 items-center justify-center text-white hover:text-crimson transition-colors"
                >
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 border transition-transform duration-500 ease-out will-change-transform group-hover:border-crimson ${
                      aberto
                        ? "-rotate-90 border-crimson"
                        : "rotate-0 border-white/40"
                    }`}
                  />
                  <Search size={18} className="relative z-[1]" />
                </button>
              ) : null}
            </div>
            )}
          </div>
          {actions ? <div className="flex flex-wrap gap-3 shrink-0">{actions}</div> : null}
        </div>
      </section>

      {busca ? (
        <div
          className={`overflow-hidden border-b border-navy-100 bg-white transition-[max-height,opacity] duration-300 ease-out ${
            aberto ? "max-h-28 opacity-100" : "max-h-0 opacity-0 border-b-0"
          }`}
        >
          <form
            className="mx-auto max-w-7xl px-4 py-4"
            onSubmit={(e) => {
              e.preventDefault();
              pesquisar();
            }}
          >
            <label className="sr-only" htmlFor="esj-banner-busca">
              Pesquisar no site
            </label>
            <div className="flex items-center gap-3 border border-navy-100 bg-cream px-4 h-12">
              <Search size={18} className="shrink-0 text-navy-900/40" />
              <input
                id="esj-banner-busca"
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") fechar();
                }}
                placeholder="Pesquisar no acervo, notícias, cursos…"
                className="min-w-0 flex-1 bg-transparent text-sm text-navy-900 outline-none placeholder:text-navy-900/40"
              />
              <button
                type="submit"
                className="shrink-0 text-xs font-bold tracking-wide text-navy-900 hover:text-sky transition-colors"
              >
                BUSCAR
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
