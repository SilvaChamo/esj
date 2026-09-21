import { comprimirImagemUpload } from "@/lib/comprimir-imagem";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { ANO_LECTIVO } from "@/lib/admissao";

/**
 * Número de candidatura sequencial (ESJ-CA{ano}{sequência}), gerado no
 * servidor via a função proximo_protocolo (supabase/protocolo-candidatura-sequencial.sql)
 * — nunca no browser, para não haver duas candidaturas simultâneas a
 * ficarem com o mesmo número.
 */
async function protocolNumber(supabase: ReturnType<typeof createBrowserSupabase>) {
  const { data, error } = await supabase.rpc("proximo_protocolo", { ano: ANO_LECTIVO });
  if (error || !data) throw error || new Error("Não foi possível gerar o número de candidatura.");
  return data as string;
}

export async function submitInscricao(
  form: FormData,
  files: Record<string, File | null>
) {
  const supabase = createBrowserSupabase();
  const protocolo = await protocolNumber(supabase);
  const documentos: Record<string, string> = {};

  for (const [id, file] of Object.entries(files)) {
    if (!file) continue;
    const comprimido = await comprimirImagemUpload(file);
    const ext =
      (comprimido.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") ||
      "bin";
    const path = `${protocolo}/${id}.${ext}`;
    const { error } = await supabase.storage.from("inscricoes").upload(path, comprimido, {
      upsert: false,
      contentType: comprimido.type || undefined,
    });
    if (error) throw error;
    documentos[id] = path;
  }

  const dados = Object.fromEntries(
    [...form.entries()].filter(([, value]) => typeof value === "string")
  );

  const { error } = await supabase.from("inscricoes").insert({
    protocolo,
    nome: String(form.get("nome") || "").trim(),
    email: String(form.get("email") || "").trim(),
    telefone: String(form.get("telefone") || "").trim(),
    curso: String(form.get("curso1") || form.get("curso") || "").trim(),
    turno: String(form.get("turno") || "").trim(),
    nivel: String(form.get("nivel") || "Licenciatura").trim(),
    delegacao: String(form.get("delegacao") || "").trim(),
    ano_lectivo: ANO_LECTIVO,
    documentos,
    dados,
  });
  if (error) throw error;
  return protocolo;
}
