"use client";

import { useState } from "react";
import { Video } from "lucide-react";
import { IframeACarregar } from "@/components/Carregando";
import { videoEmbedSrc, videoThumb, type VideoItem } from "@/lib/videos";

export default function VideoPlaylist({ videos }: { videos: VideoItem[] }) {
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
    <div className="grid md:grid-cols-[320px_minmax(0,1fr)] border border-navy-100 bg-navy-900 overflow-hidden">
      <aside className="bg-[#0f1a2e] overflow-y-auto max-h-[16rem] md:max-h-none order-2 md:order-1">
        <ul>
          {videos.map((v, i) => {
            const thumb = videoThumb(v.url);
            const ligado = i === activo;
            return (
              <li key={`${v.id}-${i}`}>
                <button
                  type="button"
                  onClick={() => setActivo(i)}
                  className={`w-full flex gap-3 p-2.5 text-left transition-colors ${
                    ligado ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <span className="relative w-[108px] aspect-video shrink-0 bg-black/40 overflow-hidden">
                    {thumb ? (
                      <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Video className="w-6 h-6 text-white/35" />
                      </span>
                    )}
                  </span>
                  <span className={`text-[13px] leading-snug line-clamp-3 ${ligado ? "text-white font-semibold" : "text-white/75"}`}>
                    {v.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
      <div className="relative aspect-video bg-black order-1 md:order-2">
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
            {actual.title || "Abrir vídeo"}
          </a>
        )}
      </div>
    </div>
  );
}
