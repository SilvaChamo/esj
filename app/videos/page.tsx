import BannerInterior from "@/components/BannerInterior";
import VideosPaginaClient from "@/components/VideosPaginaClient";
import { listVideos } from "@/lib/videos";

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
        title={
          <>
            Vídeos da <span className="text-sky">ESJ</span>
          </>
        }
        description="Telejornal académico, entrevistas e reportagens da Escola Superior de Jornalismo."
      />

      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-8 md:py-12">
        <VideosPaginaClient videos={items} />
      </section>
    </main>
  );
}
