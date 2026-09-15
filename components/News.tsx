import NewsSeccao from "@/components/NewsSeccao";
import { listNoticiasDestaque } from "@/lib/noticias";
import { listVideos } from "@/lib/videos";

export default async function News() {
  const [items, videos] = await Promise.all([listNoticiasDestaque(), listVideos()]);

  return <NewsSeccao noticias={items} videos={videos} />;
}
