import { createBrowserSupabase } from "@/lib/supabase/browser";
import type { Calendario } from "@/lib/calendario";
import { comprimirBlobImagem, comprimirImagemUpload } from "@/lib/comprimir-imagem";
import { htmlParaParagrafos, sanitizarHtmlNoticia } from "@/lib/html-noticia";
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
  const comprimido = await comprimirImagemUpload(file);
  const ext =
    (comprimido.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, comprimido, {
    upsert: false,
    contentType: comprimido.type || undefined,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

export function tituloDeImagem(url: string, tipo: "livro" | "cartaz") {
  try {
    const last = decodeURIComponent(url.split("/").pop() || "")
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[-_]+/g, " ")
      .trim();
    return last || (tipo === "cartaz" ? "Cartaz" : "Livro");
  } catch {
    return tipo === "cartaz" ? "Cartaz" : "Livro";
  }
}

export async function addPublicacaoImagem(image: string, categoria: Categoria) {
  const supabase = createBrowserSupabase();
  const tipo = categoria === "evento" ? "cartaz" : "livro";
  const ins = await supabase.from("publicacoes").insert({
    title: tituloDeImagem(image, tipo),
    subtitle: "",
    authors: "",
    date_label: "",
    venue: "",
    image,
    tipo,
    categoria,
    destaque: false,
  });
  if (ins.error) throw ins.error;
}

export async function listPublicacoesGestao(categoria: Categoria) {
  const supabase = createBrowserSupabase();
  const comDestaque = await supabase
    .from("publicacoes")
    .select("id, title, image, created_at, destaque")
    .eq("categoria", categoria)
    .order("destaque", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);
  if (!comDestaque.error) return comDestaque.data ?? [];
  const { data, error } = await supabase
    .from("publicacoes")
    .select("id, title, image, created_at")
    .eq("categoria", categoria)
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) throw error;
  return data ?? [];
}

export async function setPublicacaoDestaque(id: string, categoria: Categoria) {
  const supabase = createBrowserSupabase();
  const unset = await supabase
    .from("publicacoes")
    .update({ destaque: false })
    .eq("categoria", categoria);
  if (unset.error) throw unset.error;
  const set = await supabase.from("publicacoes").update({ destaque: true }).eq("id", id);
  if (set.error) throw set.error;

  const { data } = await supabase
    .from("publicacoes")
    .select("title, subtitle, authors, date_label, venue, image, tipo")
    .eq("id", id)
    .maybeSingle();
  if (data?.image) {
    const { writePublicacao } = await import("@/lib/publicacao");
    writePublicacao(
      {
        image: data.image,
        title: data.title,
        subtitle: data.subtitle,
        authors: data.authors,
        date: data.date_label,
        venue: data.venue,
        tipo: categoria === "evento" ? "cartaz" : "livro",
      },
      categoria
    );
  }
}

export async function updatePublicacaoImagem(id: string, image: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("publicacoes").update({ image }).eq("id", id);
  if (error) throw error;
}

export async function deletePublicacao(id: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("publicacoes").delete().eq("id", id);
  if (error) throw error;
}

export async function publishPublicacao(
  data: Publicacao,
  file?: File | null,
  categoria: Categoria = "livro"
) {
  const supabase = createBrowserSupabase();
  const image = file ? await uploadMedia(file, "publicacoes") : data.image;
  const row = {
    title: data.title,
    subtitle: data.subtitle,
    authors: data.authors,
    date_label: data.date,
    venue: data.venue,
    image,
    tipo: categoria === "evento" ? "cartaz" : "livro",
    categoria,
    destaque: true,
  };

  const ins = await supabase.from("publicacoes").insert(row);
  if (ins.error) throw ins.error;
  return image;
}

export async function deletePublicacaoAtual(categoria: Categoria) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("publicacoes").delete().eq("categoria", categoria);
  if (error) throw error;
}

export type EstadoNoticia = "rascunho" | "revisao" | "publicado";

export async function guardarNoticia(input: {
  slug?: string;
  title: string;
  excerpt: string;
  body: string;
  image?: string | null;
  estado: EstadoNoticia;
}) {
  const supabase = createBrowserSupabase();
  const image = input.image || "/studentes.jpg";
  const html = sanitizarHtmlNoticia(input.body);
  const paragraphs = htmlParaParagrafos(html);
  const body = paragraphs.length ? paragraphs : [input.excerpt || input.title];
  const row = {
    title: input.title,
    excerpt: input.excerpt,
    body,
    image,
    date_label: dateLabel(),
    estado: input.estado,
    published_at: new Date().toISOString(),
  };

  if (input.slug) {
    const upd = await supabase.from("noticias").update(row).eq("slug", input.slug);
    if (!upd.error) return input.slug;
    if (input.estado !== "publicado") throw upd.error;
    const semEstado = { ...row } as Record<string, unknown>;
    delete semEstado.estado;
    if (input.estado === "publicado") semEstado.published_at = new Date().toISOString();
    const retry = await supabase.from("noticias").update(semEstado).eq("slug", input.slug);
    if (retry.error) throw retry.error;
    return input.slug;
  }

  const base = slugify(input.title);
  let slug = base;
  for (let i = 2; i < 20; i += 1) {
    const { data } = await supabase.from("noticias").select("slug").eq("slug", slug).maybeSingle();
    if (!data) break;
    slug = `${base}-${i}`;
  }
  const ins = await supabase.from("noticias").insert({ ...row, slug });
  if (!ins.error) return slug;
  if (input.estado !== "publicado") throw ins.error;
  const fallback = {
    slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    image: row.image,
    date_label: row.date_label,
    published_at: row.published_at || new Date().toISOString(),
  };
  const { error } = await supabase.from("noticias").insert(fallback);
  if (error) throw error;
  return slug;
}

export async function publishNoticia(input: {
  title: string;
  excerpt: string;
  body: string;
  image?: string | null;
}) {
  return guardarNoticia({ ...input, estado: "publicado" });
}

export async function listNoticiasGestao() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("noticias")
    .select("slug, title, date_label, excerpt, image, body, estado")
    .order("created_at", { ascending: false })
    .limit(30);
  if (!error) return data ?? [];
  const simples = await supabase
    .from("noticias")
    .select("slug, title, date_label, excerpt, image, body")
    .order("published_at", { ascending: false })
    .limit(30);
  if (simples.error) throw simples.error;
  return (simples.data ?? []).map((row) => ({ ...row, estado: "publicado" as const }));
}

export async function publishVideo(title: string, url: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("videos").insert({ title, url });
  if (error) throw error;
}

export async function updateVideo(id: string, title: string, url: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("videos").update({ title, url }).eq("id", id);
  if (error) throw error;
}

export async function deleteVideo(id: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) throw error;
}

export async function setVideoPrincipal(id: string) {
  const supabase = createBrowserSupabase();
  const unset = await supabase.from("videos").update({ principal: false }).neq("id", id);
  if (!unset.error) {
    const set = await supabase.from("videos").update({ principal: true }).eq("id", id);
    if (set.error) throw set.error;
    return;
  }
  if (!isMissingTable(unset.error)) throw unset.error;

  const agora = new Date().toISOString();
  const lista = await supabase.from("videos").select("id, created_at");
  if (lista.error) throw lista.error;
  for (const v of lista.data ?? []) {
    if (v.id === id) continue;
    if (String(v.created_at || "").startsWith("2099")) {
      const reset = await supabase.from("videos").update({ created_at: agora }).eq("id", v.id);
      if (reset.error) throw reset.error;
    }
  }
  const pin = await supabase.from("videos").update({ created_at: "2099-12-31T00:00:00.000Z" }).eq("id", id);
  if (pin.error) throw pin.error;
}

function videoFixado(row: { created_at?: string | null; principal?: boolean | null }) {
  if (row.principal) return true;
  return String(row.created_at || "").startsWith("2099");
}

export async function listVideosGestao() {
  const supabase = createBrowserSupabase();
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
  if (error) throw error;
  return (data ?? []).map((row) => ({ ...row, principal: videoFixado(row) }));
}

export async function listEditaisGestao() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("editais")
    .select("id, title, file_url, vigente, created_at")
    .order("vigente", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

export async function addEdital(title: string, file_url: string) {
  const supabase = createBrowserSupabase();
  const existentes = await supabase.from("editais").select("id").limit(1);
  if (existentes.error) throw existentes.error;
  const { error } = await supabase.from("editais").insert({
    title: title.trim() || "Edital",
    file_url,
    vigente: !existentes.data?.length,
  });
  if (error) throw error;
}

export async function updateEdital(id: string, title: string, file_url?: string) {
  const supabase = createBrowserSupabase();
  const row: { title: string; file_url?: string } = { title: title.trim() };
  if (file_url) row.file_url = file_url;
  const { error } = await supabase.from("editais").update(row).eq("id", id);
  if (error) throw error;
}

export async function deleteEdital(id: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("editais").delete().eq("id", id);
  if (error) throw error;
}

export async function setEditalVigente(id: string) {
  const supabase = createBrowserSupabase();
  const unset = await supabase.from("editais").update({ vigente: false }).neq("id", id);
  if (unset.error) throw unset.error;
  const set = await supabase.from("editais").update({ vigente: true }).eq("id", id);
  if (set.error) throw set.error;
}

export async function publishEdital(file: File, title: string) {
  const file_url = await uploadMedia(file, "editais");
  await addEdital(title, file_url);
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
    .select("protocolo, nome, email, telefone, curso, delegacao, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function listTelefonesInscricoes() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.from("inscricoes").select("telefone, curso, delegacao");
  if (error) throw error;
  return data ?? [];
}

export async function statsAnoLectivo(): Promise<{
  total: number;
  porCurso: { curso: string; total: number }[];
}> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.from("inscricoes").select("curso");
  if (error) throw error;
  const rows = data ?? [];
  const counts = new Map<string, number>();
  for (const row of rows) {
    const curso = row.curso || "Sem curso indicado";
    counts.set(curso, (counts.get(curso) || 0) + 1);
  }
  const porCurso = Array.from(counts.entries())
    .map(([curso, total]) => ({ curso, total }))
    .sort((a, b) => b.total - a.total);
  return { total: rows.length, porCurso };
}

export async function publishAnuncio(input: {
  destinatarios: string;
  assunto: string;
  mensagem: string;
  canal?: string;
  enviados?: number;
  falhados?: number;
}) {
  const supabase = createBrowserSupabase();
  const row = {
    destinatarios: input.destinatarios,
    assunto: input.assunto,
    mensagem: input.mensagem,
    canal: input.canal || "sms",
    enviados: input.enviados ?? 0,
    falhados: input.falhados ?? 0,
  };
  const first = await supabase.from("anuncios").insert(row);
  if (!first.error) return;
  const { error } = await supabase.from("anuncios").insert({
    destinatarios: input.destinatarios,
    assunto: input.assunto,
    mensagem: input.mensagem,
  });
  if (error) throw error;
}

export async function listAnunciosGestao(canal?: string) {
  const supabase = createBrowserSupabase();
  let q = supabase
    .from("anuncios")
    .select("id, destinatarios, assunto, mensagem, created_at, canal")
    .order("created_at", { ascending: false })
    .limit(30);
  if (canal) q = q.eq("canal", canal);
  const { data, error } = await q;
  if (!error) return data ?? [];
  const simples = await supabase
    .from("anuncios")
    .select("id, destinatarios, assunto, mensagem, created_at")
    .order("created_at", { ascending: false })
    .limit(30);
  if (simples.error) throw simples.error;
  return simples.data ?? [];
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

const GALERIA_BUCKET = "media";
const GALERIA_FOLDER = "galeria";

export type MediaFile = {
  name: string;
  url: string;
  size: number | null;
  mimeType: string | null;
  createdAt: string | null;
};

// O bucket "media" é partilhado por todo o sítio (notícias, publicações,
// edital, galeria). A galeria mostra tudo o que já lá está, não só o que
// foi carregado a partir dela — por isso percorre as subpastas todas em
// vez de assumir que está tudo em "galeria/".
async function listarPastaRecursiva(
  supabase: ReturnType<typeof createBrowserSupabase>,
  prefix: string
): Promise<MediaFile[]> {
  const { data, error } = await supabase.storage.from(GALERIA_BUCKET).list(prefix, {
    limit: 1000,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw error;

  const resultados: MediaFile[] = [];
  for (const entry of data ?? []) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id === null) {
      const filhos = await listarPastaRecursiva(supabase, path);
      resultados.push(...filhos);
    } else {
      const { data: pub } = supabase.storage.from(GALERIA_BUCKET).getPublicUrl(path);
      resultados.push({
        name: path,
        url: pub.publicUrl,
        size: entry.metadata?.size ?? null,
        mimeType: entry.metadata?.mimetype ?? null,
        createdAt: entry.created_at ?? null,
      });
    }
  }
  return resultados;
}

export async function listMediaGaleria(): Promise<MediaFile[]> {
  const supabase = createBrowserSupabase();
  const ficheiros = await listarPastaRecursiva(supabase, "");
  return ficheiros.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

function limparNomeFicheiro(nome: string) {
  return `${Date.now()}-${nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w.-]/g, "_")}`;
}

export async function uploadMediaGaleria(file: File) {
  const supabase = createBrowserSupabase();
  const comprimido = await comprimirImagemUpload(file);
  const path = `${GALERIA_FOLDER}/${limparNomeFicheiro(comprimido.name)}`;
  const { error } = await supabase.storage.from(GALERIA_BUCKET).upload(path, comprimido, {
    contentType: comprimido.type || undefined,
    upsert: false,
  });
  if (error) throw error;
}

export async function uploadMediaGaleriaBlob(blob: Blob, filename: string) {
  const supabase = createBrowserSupabase();
  const comprimido = await comprimirBlobImagem(blob, filename);
  const path = `${GALERIA_FOLDER}/${limparNomeFicheiro(comprimido.name)}`;
  const { error } = await supabase.storage.from(GALERIA_BUCKET).upload(path, comprimido, {
    contentType: comprimido.type || undefined,
    upsert: false,
  });
  if (error) throw error;
}

export async function deleteMediaGaleria(names: string[]) {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.storage.from(GALERIA_BUCKET).remove(names);
  if (error) throw error;
  if (!data || data.length < names.length) {
    throw new Error(
      "O Storage não removeu o(s) ficheiro(s) — falta a política de eliminação no Supabase. Corra o SQL do painel outra vez."
    );
  }
  await supabase.from("media_details").delete().in("file_name", names);
}

const DOCUMENTOS_FOLDER = "documentos";

export async function listMediaDocumentos(): Promise<MediaFile[]> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.storage.from(GALERIA_BUCKET).list(DOCUMENTOS_FOLDER, {
    limit: 1000,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw error;
  return (data ?? [])
    .filter((f) => f.id)
    .map((f) => {
      const name = `${DOCUMENTOS_FOLDER}/${f.name}`;
      const { data: pub } = supabase.storage.from(GALERIA_BUCKET).getPublicUrl(name);
      return {
        name,
        url: pub.publicUrl,
        size: f.metadata?.size ?? null,
        mimeType: f.metadata?.mimetype ?? null,
        createdAt: f.created_at ?? null,
      };
    });
}

export async function uploadMediaDocumento(file: File) {
  const supabase = createBrowserSupabase();
  const comprimido = await comprimirImagemUpload(file);
  const path = `${DOCUMENTOS_FOLDER}/${limparNomeFicheiro(comprimido.name)}`;
  const { error } = await supabase.storage.from(GALERIA_BUCKET).upload(path, comprimido, {
    contentType: comprimido.type || undefined,
    upsert: false,
  });
  if (error) throw error;
}

export async function deleteMediaDocumentos(names: string[]) {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.storage.from(GALERIA_BUCKET).remove(names);
  if (error) throw error;
  if (!data || data.length < names.length) {
    throw new Error(
      "O Storage não removeu o(s) ficheiro(s) — falta a política de eliminação no Supabase. Corra o SQL do painel outra vez."
    );
  }
}

export type MediaDetails = {
  alt_text: string;
  title: string;
  caption: string;
  description: string;
};

export async function loadMediaDetails(fileName: string): Promise<MediaDetails | null> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("media_details")
    .select("alt_text, title, caption, description")
    .eq("file_name", fileName)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveMediaDetails(fileName: string, details: MediaDetails) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase
    .from("media_details")
    .upsert(
      { file_name: fileName, ...details, updated_at: new Date().toISOString() },
      { onConflict: "file_name" }
    );
  if (error) throw error;
}

export async function listNewsletterGestao() {
  const supabase = createBrowserSupabase();
  const comTel = await supabase
    .from("newsletter")
    .select("id, email, telefone, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (!comTel.error) return comTel.data ?? [];
  const { data, error } = await supabase
    .from("newsletter")
    .select("id, email, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  const contactos = await supabase
    .from("contactos")
    .select("email, mensagem, created_at")
    .eq("nome", "Newsletter")
    .order("created_at", { ascending: true });
  const porEmail = new Map<string, string>();
  for (const row of contactos.data ?? []) {
    if (row.email && row.mensagem) porEmail.set(row.email, row.mensagem);
  }
  return (data ?? []).map((row) => ({ ...row, telefone: porEmail.get(row.email) || "" }));
}

export async function deleteNewsletter(ids: string[]) {
  if (ids.length === 0) return;
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("newsletter").delete().in("id", ids);
  if (error) throw error;
}

export async function listFolhasGestao() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("folha_academica")
    .select("id, title, file_url, updated_at")
    .order("updated_at", { ascending: false })
    .limit(40);
  if (error) throw error;
  return data ?? [];
}

export async function addFolha(title: string, file_url: string) {
  const supabase = createBrowserSupabase();
  const agora = new Date().toISOString();
  const { error } = await supabase.from("folha_academica").insert({
    title: title.trim(),
    file_url,
    updated_at: agora,
  });
  if (error) throw error;
}

export async function updateFolha(id: string, title: string, file_url?: string) {
  const supabase = createBrowserSupabase();
  const row: { title: string; file_url?: string; updated_at: string } = {
    title: title.trim(),
    updated_at: new Date().toISOString(),
  };
  if (file_url) row.file_url = file_url;
  const { error } = await supabase.from("folha_academica").update(row).eq("id", id);
  if (error) throw error;
}

export async function deleteFolha(id: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("folha_academica").delete().eq("id", id);
  if (error) throw error;
}
