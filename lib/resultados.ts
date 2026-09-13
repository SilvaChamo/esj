import { getSupabase } from "@/lib/supabase";

export const CURSOS_RESULTADOS = [
  "Jornalismo",
  "Publicidade e Marketing",
  "Relações Públicas",
  "Biblioteconomia e Documentação",
] as const;

export type ResultadoCurso = {
  curso: string;
  fileUrl: string;
};

export async function loadResultados(): Promise<ResultadoCurso[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase
      .from("resultados_admissao")
      .select("curso, file_url")
      .order("curso", { ascending: true });
    if (data?.length) {
      return CURSOS_RESULTADOS.map((curso) => {
        const row = data.find((d) => d.curso === curso);
        return { curso, fileUrl: row?.file_url ?? "" };
      });
    }
  }
  return CURSOS_RESULTADOS.map((curso) => ({ curso, fileUrl: "" }));
}
