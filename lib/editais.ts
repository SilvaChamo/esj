import { getSupabase } from "@/lib/supabase";
import { EDITAL_PDF } from "@/lib/inscricao";

export type EditalPublico = {
  title: string;
  file_url: string;
};

export function tipoFicheiroEdital(url: string): "pdf" | "imagem" | "ficheiro" {
  const u = url.toLowerCase().split("?")[0];
  if (u.endsWith(".pdf")) return "pdf";
  if (/\.(jpe?g|png|webp|gif|avif|bmp)$/i.test(u)) return "imagem";
  return "ficheiro";
}

export function nomeDescargaEdital(url: string, title: string) {
  const ext = url.split("?")[0].split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "pdf";
  const base = title.replace(/[^\wÀ-ÿ\s-]+/g, "").trim() || "edital";
  return `${base}.${ext}`;
}

export function rotuloDescargaEdital(url: string) {
  const tipo = tipoFicheiroEdital(url);
  if (tipo === "pdf") return "DESCARREGAR PDF";
  if (tipo === "imagem") return "DESCARREGAR IMAGEM";
  return "DESCARREGAR";
}

export async function loadEdital(): Promise<EditalPublico> {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase
      .from("editais")
      .select("title, file_url")
      .eq("vigente", true)
      .maybeSingle();
    if (data?.file_url) return data;
  }
  return { title: "Edital de Admissão 2026", file_url: EDITAL_PDF };
}
