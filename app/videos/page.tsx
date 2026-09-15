import BannerInterior from "@/components/BannerInterior";
import { IframeACarregar } from "@/components/Carregando";
import { listVideos, videoEmbedSrc } from "@/lib/videos";

export const metadata = {
  title: "Vídeos | ESJ",
  description:
    "Vídeos da Escola Superior de Jornalismo: telejornal académico, entrevistas e vida da escola.",
};

export const dynamic = "force-dynamic";

export default async function VideosPage() {
  const items = await listVideos();

  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="MULTIMÉDIA"
        title="Vídeos"
        description="Telejornal, entrevistas e reportagens da Escola Superior de Jornalismo."
      />

      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
        {items.length === 0 ? (
          <p className="text-sm text-navy-900/50">Ainda sem vídeos.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((v) => {
              const src = videoEmbedSrc(v.url);
              return (
                <div key={v.id} className="bg-white border border-navy-100">
                  <div className="relative aspect-video bg-black">
                    {src ? (
                      <IframeACarregar
                        src={src}
                        title={v.title}
                        referrerPolicy="origin"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                        texto="A carregar o vídeo…"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-white text-sm p-4 text-center">
                        {v.title}
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-[13px] font-semibold text-navy-900 leading-snug line-clamp-2">
                      {v.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
