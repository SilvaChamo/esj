"use client";

import { useState } from "react";
import { Video } from "lucide-react";
import { IframeACarregar } from "@/components/Carregando";
import { videoEmbedSrc, videoThumb, type VideoItem } from "@/lib/videos";

/** Layout da página pública /videos: player + playlist à direita. */
export default function VideosPaginaClient({ videos }: { videos: VideoItem[] }) {
  const [activo, setActivo] = useState(() => {
    const i = videos.findIndex((v) => v.principal);
    return i >= 0 ? i : 0;
  });
  const actual = videos[activo] ?? videos[0];
  const embed = actual ? videoEmbedSrc(actual.url) : "";

  if (videos.length === 0) {
    return <p className="text-sm text-navy-900/50">Ainda sem vídeos.</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
      <div className="relative aspect-video w-full min-w-0 bg-black overflow-hidden border border-navy-100 shadow-sm lg:col-span-2">
        {embed ? (
          <IframeACarregar
            key={`${actual.id}-${activo}`}
            src={embed}
            title={actual.title}
            referrerPolicy="origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            texto="A carregar o vídeo…"
          />
        ) : (
          <a
            href={actual.url}
            target="_blank"
            rel="noreferrer"
            className="absolute inset-0 flex items-center justify-center text-white/80 text-sm underline p-6 text-center"
          >
            Abrir vídeo
          </a>
        )}
      </div>

      <aside className="bg-white border border-navy-100 flex flex-col min-h-0 overflow-hidden max-h-[20rem] lg:max-h-none lg:h-full">
        <div className="shrink-0 px-3 py-2.5 border-b border-navy-100 bg-cream flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-widest text-navy-900/45">PLAYLIST</p>
            <p className="text-sm font-semibold text-navy-900 truncate">
              Vídeos · {videos.length}
            </p>
          </div>
          <p className="text-[12px] font-semibold text-navy-900/55 whitespace-nowrap tabular-nums">
            {activo + 1} / {videos.length}
          </p>
        </div>
        <ul className="flex-1 min-h-0 overflow-y-auto">
          {videos.map((v, i) => {
            const thumb = videoThumb(v.url);
            const ligado = i === activo;
            return (
              <li key={`${v.id}-${i}`} className="border-b border-navy-50 last:border-0">
                <button
                  type="button"
                  onClick={() => setActivo(i)}
                  className={`w-full flex items-start gap-2.5 p-2 text-left transition-colors ${
                    ligado ? "bg-sky/10" : "hover:bg-cream"
                  }`}
                >
                  <span className="relative w-[140px] aspect-video shrink-0 bg-navy-900/10 overflow-hidden">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Video className="w-5 h-5 text-navy-900/25" />
                      </span>
                    )}
                  </span>
                  <span
                    className={`flex-1 min-w-0 text-[12px] leading-snug line-clamp-3 pt-0.5 ${
                      ligado ? "text-navy-900 font-semibold" : "text-navy-900/70"
                    }`}
                  >
                    {v.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
