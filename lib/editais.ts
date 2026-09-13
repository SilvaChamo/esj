import { getSupabase } from "@/lib/supabase";
import { EDITAL_PDF } from "@/lib/inscricao";

export type EditalPublico = {
  title: string;
  file_url: string;
};

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
