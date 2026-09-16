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
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-6 md:py-8">
        <VideosPaginaClient videos={items} />
      </section>
    </main>
  );
}
