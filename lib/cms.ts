import { createBrowserSupabase } from "@/lib/supabase/browser";
import type { Calendario } from "@/lib/calendario";
import type { Categoria, Publicacao } from "@/lib/publicacao";

export function slugify(text: string) {
  const slug = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "noticia";
}

export function dateLabel(d = new Date()) {
  return d.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}

export function cmsError(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: string }).message);
  }
  if (error instanceof Error) return error.message;
  return "Não foi possível gravar. Confirme se o SQL do projecto já correu.";
}

export function isMissingTable(error: unknown) {
  const msg = cmsError(error);
  return /Could not find the table|PGRST205|schema cache/i.test(msg);
}

export async function uploadMedia(file: File, folder: string) {
  const supabase = createBrowserSupabase();
  const ext =
    (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

export async function publishPublicacao(
  data: Publicacao,
  file?: File | null,
  categoria: Categoria = "livro"
) {
  const supabase = createBrowserSupabase();
  const image = file ? await uploadMedia(file, "publicacoes") : data.image;
  const unset = await supabase
    .from("publicacoes")
    .update({ destaque: false })
    .eq("destaque", true)
    .eq("categoria", categoria);
  if (unset.error) throw unset.error;
  const { error } = await supabase.from("publicacoes").insert({
    title: data.title,
    subtitle: data.subtitle,
    authors: data.authors,
    date_label: data.date,
    venue: data.venue,
    image,
    tipo: data.tipo,
    categoria,
    destaque: true,
  });
  if (error) throw error;
}

export async function publishNoticia(input: {
  title: string;
  excerpt: string;
  body: string;
  image?: File | null;
}) {
  const supabase = createBrowserSupabase();
  const image = input.image
    ? await uploadMedia(input.image, "noticias")
    : "/studentes.jpg";
  const base = slugify(input.title);
  let slug = base;
  for (let i = 2; i < 20; i += 1) {
    const { data } = await supabase.from("noticias").select("slug").eq("slug", slug).maybeSingle();
    if (!data) break;
    slug = `${base}-${i}`;
  }
  const paragraphs = input.body
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const { error } = await supabase.from("noticias").insert({
    slug,
    title: input.title,
    excerpt: input.excerpt,
    body: paragraphs.length ? paragraphs : [input.excerpt],
    image,
    date_label: dateLabel(),
    published_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function listNoticiasGestao() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("noticias")
    .select("slug, title, date_label")
    .order("published_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

export async function publishVideo(title: string, url: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("videos").insert({ title, url });
  if (error) throw error;
}

export async function listVideosGestao() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("videos")
    .select("id, title, url, created_at")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

export async function publishEdital(file: File, title: string) {
  const supabase = createBrowserSupabase();
  const file_url = await uploadMedia(file, "editais");
  const unset = await supabase.from("editais").update({ vigente: false }).eq("vigente", true);
  if (unset.error) throw unset.error;
  const { error } = await supabase.from("editais").insert({
    title: title.trim() || file.name,
    file_url,
    vigente: true,
  });
  if (error) throw error;
}

export async function loadEditalVigente() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("editais")
    .select("title, file_url, created_at")
    .eq("vigente", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listInscricoesGestao() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("inscricoes")
    .select("protocolo, nome, email, curso, delegacao, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function publishAnuncio(input: {
  destinatarios: string;
  assunto: string;
  mensagem: string;
}) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("anuncios").insert({
    destinatarios: input.destinatarios,
    assunto: input.assunto,
    mensagem: input.mensagem,
  });
  if (error) throw error;
}

export async function listAnunciosGestao() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("anuncios")
    .select("id, destinatarios, assunto, mensagem, created_at")
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data ?? [];
}

export async function publishCalendario(data: Calendario) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("calendario_academico").upsert({
    id: 1,
    inscricoes: data.inscricoes,
    exames: data.exames,
    resultados: data.resultados,
    inicio_ano: data.inicioAno,
  });
  if (error) throw error;
}

export async function listPautaGestao(input: {
  anoLectivo: string;
  nivel: string;
  curso: string;
  regime: string;
}) {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("pauta_admissao")
    .select(
      "id, ano_lectivo, nivel, curso, regime, apelido, nome, nota_portugues, nota_historia, publicado, updated_at"
    )
    .eq("ano_lectivo", input.anoLectivo)
    .eq("nivel", input.nivel)
    .eq("curso", input.curso)
    .eq("regime", input.regime)
    .order("apelido", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function savePautaLinha(input: {
  id?: string;
  anoLectivo: string;
  nivel: string;
  curso: string;
  regime: string;
  apelido: string;
  nome: string;
  notaPortugues: number;
  notaHistoria: number;
  publicado: boolean;
}) {
  const supabase = createBrowserSupabase();
  const row = {
    ano_lectivo: input.anoLectivo,
    nivel: input.nivel,
    curso: input.curso,
    regime: input.regime,
    apelido: input.apelido.trim(),
    nome: input.nome.trim(),
    nota_portugues: input.notaPortugues,
    nota_historia: input.notaHistoria,
    publicado: input.publicado,
    updated_at: new Date().toISOString(),
  };
  if (input.id) {
    const { error } = await supabase.from("pauta_admissao").update(row).eq("id", input.id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("pauta_admissao").insert(row);
  if (error) throw error;
}

export async function deletePautaLinha(id: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("pauta_admissao").delete().eq("id", id);
  if (error) throw error;
}

export async function listNewsletterGestao() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("newsletter")
    .select("id, email, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return data ?? [];
}
