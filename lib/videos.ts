import { getSupabase } from "@/lib/supabase";

export type VideoItem = {
  id: string;
  title: string;
  url: string;
  principal?: boolean;
};

export function youtubeId(url: string) {
  const bruto = url.trim();
  const comProtocolo = /^https?:\/\//i.test(bruto) ? bruto : `https://${bruto}`;
  const texto = comProtocolo.replace(/&amp;/g, "&");
  const m = texto.match(
    /(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|live\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i
  );
  return m?.[1] || "";
}

export function youtubeListId(url: string) {
  const bruto = url.trim();
  const comProtocolo = /^https?:\/\//i.test(bruto) ? bruto : `https://${bruto}`;
  try {
    const u = new URL(comProtocolo.replace(/&amp;/g, "&"));
    return u.searchParams.get("list") || "";
  } catch {
    return "";
  }
}

export function vimeoId(url: string) {
  const bruto = url.trim();
  const comProtocolo = /^https?:\/\//i.test(bruto) ? bruto : `https://${bruto}`;
  const m = comProtocolo.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  return m?.[1] || "";
}

export function videoEmbedSrc(url: string) {
  const yt = youtubeId(url);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt}?rel=0`;
  const lista = youtubeListId(url);
  if (lista) return `https://www.youtube-nocookie.com/embed/videoseries?list=${lista}`;
  const vm = vimeoId(url);
  if (vm) return `https://player.vimeo.com/video/${vm}`;
  const bruto = url.trim();
  if (/facebook\.com|fb\.watch/i.test(bruto)) {
    const href = /^https?:\/\//i.test(bruto) ? bruto : `https://${bruto}`;
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(href)}&show_text=false`;
  }
  return "";
}

export function videoThumb(url: string) {
  const yt = youtubeId(url);
  return yt ? `https://img.youtube.com/vi/${yt}/hqdefault.jpg` : "";
}

export async function listVideos(): Promise<VideoItem[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const comPrincipal = await supabase
    .from("videos")
    .select("id, title, url, created_at, principal")
    .order("principal", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(40);
  if (!comPrincipal.error) return comPrincipal.data ?? [];
  const { data, error } = await supabase
    .from("videos")
    .select("id, title, url, created_at")
    .order("created_at", { ascending: false })
    .limit(40);
  if (error) return [];
  return (data ?? []).map((row) => ({
    ...row,
    principal: String(row.created_at || "").startsWith("2099"),
  }));
}
