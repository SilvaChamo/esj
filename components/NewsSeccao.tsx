"use client";

import Link from "next/link";
import { useState } from "react";
import VideoPlaylist from "@/components/VideoPlaylist";
import GaleriaHomeTab from "@/components/GaleriaHomeTab";
import { FotoACarregar } from "@/components/Carregando";
import EntradaHome from "@/components/EntradaHome";
import type { Noticia } from "@/lib/noticias";
import type { VideoItem } from "@/lib/videos";

type Tab = "noticias" | "videos" | "galeria";

export default function NewsSeccao({
  noticias,
  videos,
}: {
  noticias: Noticia[];
  videos: VideoItem[];
}) {
  const [tab, setTab] = useState<Tab>("noticias");

  const tabs: { id: Tab; label: string }[] = [
    { id: "noticias", label: "Notícias" },
    { id: "videos", label: "Vídeos" },
    { id: "galeria", label: "Galeria" },
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
        {tab === "noticias" && (
          <>
            <EntradaHome>
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
            </EntradaHome>
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

        {tab === "videos" && (
          <>
            <EntradaHome>
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
            </EntradaHome>
            <EntradaHome atraso={0.08}>
              <VideoPlaylist videos={videos} />
            </EntradaHome>
          </>
        )}

        {tab === "galeria" && <GaleriaHomeTab />}
      </div>
    </section>
  );
}
