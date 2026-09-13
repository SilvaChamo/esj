import { createBrowserSupabase } from "@/lib/supabase/browser";

function protocolNumber() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `ESJ-2026-${n}`;
}

export async function submitInscricao(
  form: FormData,
  files: Record<string, File | null>
) {
  const supabase = createBrowserSupabase();
  const protocolo = protocolNumber();
  const documentos: Record<string, string> = {};

  for (const [id, file] of Object.entries(files)) {
    if (!file) continue;
    const ext =
      (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") ||
      "bin";
    const path = `${protocolo}/${id}.${ext}`;
    const { error } = await supabase.storage.from("inscricoes").upload(path, file, {
      upsert: false,
      contentType: file.type || undefined,
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
    delegacao: String(form.get("delegacao") || "").trim(),
    documentos,
    dados,
  });
  if (error) throw error;
  return protocolo;
}
