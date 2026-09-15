"use client";

import Link from "next/link";
import { useState } from "react";
import VideoPlaylist from "@/components/VideoPlaylist";
import { FotoACarregar, ImgACarregar } from "@/components/Carregando";
import EntradaHome from "@/components/EntradaHome";
import type { Noticia } from "@/lib/noticias";
import type { VideoItem } from "@/lib/videos";
import {
  loadPublicacao,
  readPublicacao,
  type Categoria,
  type Publicacao,
} from "@/lib/publicacao";
import { useEffect } from "react";
import { X } from "lucide-react";

type Tab = "noticias" | "videos" | "ensino";

export default function NewsSeccao({
  noticias,
  videos,
}: {
  noticias: Noticia[];
  videos: VideoItem[];
}) {
  const [tab, setTab] = useState<Tab>("noticias");

  // Ensino e História state
  const [active, setActive] = useState<Categoria>("livro");
  const [livroBook, setLivroBook] = useState<Publicacao>(() => readPublicacao("livro"));
  const [eventoBook, setEventoBook] = useState<Publicacao>(() => readPublicacao("evento"));
  const [open, setOpen] = useState(false);
  const [viewer, setViewer] = useState<Publicacao | null>(null);

  useEffect(() => {
    const load = () => {
      loadPublicacao("livro").then(setLivroBook);
      loadPublicacao("evento").then(setEventoBook);
    };
    load();
    window.addEventListener("esj-publicacao", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("esj-publicacao", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const show = (item: Publicacao) => {
    setViewer(item);
    setOpen(true);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "noticias", label: "Notícias" },
    { id: "videos", label: "Vídeos" },
    { id: "ensino", label: "Ensino e História" },
  ];

  return (
    <section id="noticias" className="bg-cream scroll-mt-24">
      <div className="border-t border-navy-100">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 flex justify-end">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`relative -mt-px px-6 py-2.5 text-sm font-bold tracking-wide transition-colors ${
                tab === t.id
                  ? "z-10 bg-white text-navy-900 border-l border-r border-b border-navy-100"
                  : "bg-cream text-navy-900/60 hover:text-navy-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16 md:py-20">
        {/* ── NOTÍCIAS ── */}
        {tab === "noticias" && (
          <>
            <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-900 leading-tight">
                Publicações
              </h2>
              <Link
                href="/noticias"
                className="esj-btn-move inline-flex items-center border border-sky bg-transparent text-sm font-semibold text-sky px-4 py-2 hover:text-crimson hover:border-crimson"
              >
                Ver todas as notícias →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {noticias.map((item, i) => (
                <EntradaHome key={item.slug} atraso={i * 0.05}>
                  <Link
                    href={`/noticias/${item.slug}`}
                    className="group bg-white border border-navy-100 hover:border-crimson transition-colors flex flex-col h-full"
                  >
                    <div className="relative overflow-hidden h-44">
                      <FotoACarregar
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="eager"
                        texto="A carregar a imagem da notícia…"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <p className="text-[11px] font-bold tracking-widest text-sky">{item.date}</p>
                      <h3 className="mt-2 font-serif font-bold text-navy-900 leading-snug group-hover:text-crimson transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-[11px] text-navy-900/65 leading-relaxed min-h-[4.5rem]">
                        {item.excerpt}
                      </p>
                    </div>
                  </Link>
                </EntradaHome>
              ))}
            </div>
          </>
        )}

        {/* ── VÍDEOS ── */}
        {tab === "videos" && (
          <>
            <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-900 leading-tight">
                Vídeo
              </h2>
              <Link
                href="/videos"
                className="esj-btn-move inline-flex items-center border border-sky bg-transparent text-sm font-semibold text-sky px-4 py-2 hover:text-crimson hover:border-crimson"
              >
                Ver mais vídeos →
              </Link>
            </div>
            <VideoPlaylist videos={videos} />
          </>
        )}

        {/* ── ENSINO E HISTÓRIA ── */}
        {tab === "ensino" && (
          <EntradaHome>
            <div className="grid lg:grid-cols-[1fr_1.08fr] gap-12 lg:gap-16 items-start">
              <div>
                <p className="text-sky font-bold tracking-widest text-sm mb-3">ENSINO E HISTÓRIA</p>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-900 leading-tight">
                  Formamos, comunicamos e
                  <br />
                  Investigamos
                </h2>
                <p className="mt-3 font-serif italic text-lg text-navy-800">
                  O palco da ESJ não se apaga
                </p>
                <p className="mt-5 text-navy-900 leading-relaxed">
                  A Escola Superior de Jornalismo forma profissionais críticos, investiga a
                  comunicação contemporânea e devolve conhecimento à sociedade. O ensino
                  liga a sala de aula à redação, à pesquisa e à vida pública.
                </p>
                <p className="mt-4 text-sm text-navy-900/70 leading-relaxed">
                  Conferências, a Semana da Comunicação, colóquios e a cerimónia de graduação
                  trazem a cidade para o campus — e levam a escola para o país. A agenda do
                  ano lectivo é palco aberto: venha, ouça e participe!
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setActive("livro")}
                    className={`px-6 py-3.5 text-xs font-bold tracking-wide transition-colors ${
                      active === "livro"
                        ? "bg-navy-800 text-white"
                        : "bg-white text-navy-800 border border-navy-100 hover:border-sky"
                    }`}
                  >
                    LANÇAMENTO DO LIVRO
                  </button>
                  <button
                    type="button"
                    onClick={() => setActive("evento")}
                    className={`px-6 py-3.5 text-xs font-bold tracking-wide transition-colors ${
                      active === "evento"
                        ? "bg-navy-800 text-white"
                        : "bg-white text-navy-800 border border-navy-100 hover:border-sky"
                    }`}
                  >
                    EVENTOS
                  </button>
                </div>
              </div>

              <div>
                <div className={active === "livro" ? "relative" : "hidden"}>
                  <div className="relative w-full overflow-hidden bg-cream border border-navy-100 aspect-square">
                    <button
                      type="button"
                      onClick={() => show(livroBook)}
                      className="absolute inset-0"
                      aria-label="Ver lançamento do livro"
                    >
                      <ImgACarregar
                        key={`livro-${livroBook.image}`}
                        src={livroBook.image}
                        alt=""
                        className="absolute inset-0 w-full h-full object-contain p-2"
                        texto="A carregar a imagem do livro…"
                      />
                    </button>
                  </div>
                </div>
                <div className={active === "evento" ? "relative w-full lg:w-[calc(100%+50px)]" : "hidden"}>
                  <div className="relative w-full overflow-hidden bg-cream border border-navy-100 aspect-[210/297]">
                    <button
                      type="button"
                      onClick={() => show(eventoBook)}
                      className="absolute inset-0"
                      aria-label="Ver cartaz de eventos"
                    >
                      <ImgACarregar
                        key={`evento-${eventoBook.image}`}
                        src={eventoBook.image}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        texto="A carregar o cartaz…"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </EntradaHome>
        )}
      </div>

      {/* ── LIGHTBOX ── */}
      {open && viewer && (
        <div
          className="fixed inset-0 z-[80] bg-navy-900/85 flex items-center justify-center p-4 md:p-10"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Imagem"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar"
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X size={28} />
          </button>
          <div
            className="relative min-h-[200px] min-w-[200px] max-h-[90vh] max-w-[92vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <ImgACarregar
              src={viewer.image}
              alt=""
              className="max-h-[90vh] max-w-[92vw] w-auto h-auto object-contain shadow-2xl"
              texto="A carregar a imagem…"
            />
          </div>
        </div>
      )}
    </section>
  );
}
