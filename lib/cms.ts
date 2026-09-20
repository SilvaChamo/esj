import { createBrowserSupabase } from "@/lib/supabase/browser";
import type { Calendario } from "@/lib/calendario";
import { comprimirBlobImagem, comprimirImagemUpload } from "@/lib/comprimir-imagem";
import {
  comprimirDocumentoUpload,
  limiteDocumentoBytes,
} from "@/lib/comprimir-documento";
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
  const eImg = (file.type || "").startsWith("image/") && file.type !== "image/svg+xml" && file.type !== "image/gif";
  const comprimido = eImg
    ? await comprimirImagemUpload(file)
    : await comprimirDocumentoUpload(file);
  if (!eImg && comprimido.size > limiteDocumentoBytes(file)) {
    const mb = (n: number) => `${(n / (1024 * 1024)).toFixed(2)} MB`;
    throw new Error(
      `O documento excede ${mb(limiteDocumentoBytes(file))} (${mb(comprimido.size)}).`
    );
  }
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
    .select("protocolo, nome, email, telefone, curso, turno, nivel, delegacao, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data ?? [];
}

/**
 * Resultados da pauta de admissão já ligados a uma candidatura (coluna
 * candidatura_protocolo — ver supabase/candidatura-pauta-numeracao.sql).
 * Falha graciosamente (devolve []) se a migração ainda não tiver corrido, o
 * mesmo padrão usado para outras tabelas/colunas opcionais no painel.
 */
export async function listPautaLigadaACandidaturas() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("pauta_admissao")
    .select("id, candidatura_protocolo, nota_portugues, nota_historia, publicado")
    .not("candidatura_protocolo", "is", null);
  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return data ?? [];
}

/** Contas de estudante já criadas a partir de uma candidatura (mesma migração acima). */
export async function listTurmaLigadaACandidaturas() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("turma_estudantes")
    .select("numero_estudante, candidatura_protocolo")
    .not("candidatura_protocolo", "is", null);
  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
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
  candidaturaProtocolo?: string;
}) {
  const supabase = createBrowserSupabase();
  const row: Record<string, unknown> = {
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
  if (input.candidaturaProtocolo) row.candidatura_protocolo = input.candidaturaProtocolo;
  if (input.id) {
    const { error } = await supabase.from("pauta_admissao").update(row).eq("id", input.id);
    if (error) throw error;
    return;
  }
  const { error, data } = await supabase.from("pauta_admissao").insert(row).select("id").maybeSingle();
  // Se a coluna candidatura_protocolo ainda não existir (migração por
  // correr), tenta gravar sem ela em vez de falhar o lançamento da nota.
  if (error && input.candidaturaProtocolo && isMissingTable(error)) {
    delete row.candidatura_protocolo;
    const retry = await supabase.from("pauta_admissao").insert(row);
    if (retry.error) throw retry.error;
    return;
  }
  if (error) throw error;
  return data?.id as string | undefined;
}

export async function deletePautaLinha(id: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("pauta_admissao").delete().eq("id", id);
  if (error) throw error;
}

export type SituacaoEstudanteLinha = {
  id: string;
  numero_estudante: string;
  nome: string;
  curso: string | null;
  regime: string | null;
  regularizado: boolean;
  observacao: string | null;
  updated_at: string;
  updated_by: string | null;
};

export async function listSituacaoGestao(pesquisa: string) {
  const supabase = createBrowserSupabase();
  let query = supabase
    .from("situacao_estudante")
    .select(
      "id, numero_estudante, nome, curso, regime, regularizado, observacao, updated_at, updated_by"
    )
    .order("updated_at", { ascending: false });
  const termo = pesquisa.trim();
  if (termo) {
    query = query.or(`numero_estudante.ilike.%${termo}%,nome.ilike.%${termo}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as SituacaoEstudanteLinha[];
}

export async function saveSituacaoEstudante(input: {
  numeroEstudante: string;
  nome: string;
  curso?: string;
  regime?: string;
  regularizado: boolean;
  observacao?: string;
  updatedBy?: string;
}) {
  const res = await fetch("/api/situacao-estudante", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || "Não foi possível gravar a situação do estudante.");
}

export async function deleteSituacaoEstudante(id: string) {
  const res = await fetch(`/api/situacao-estudante?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || "Não foi possível remover o registo.");
}

/** Usado pelo painel do estudante para saber a sua própria situação real. */
export async function getSituacaoEstudante(numeroEstudante: string) {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("situacao_estudante")
    .select("regularizado, observacao, updated_at")
    .eq("numero_estudante", numeroEstudante.trim())
    .maybeSingle();
  if (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
  return data;
}

const GALERIA_BUCKET = "media";
const GALERIA_FOLDER = "galeria";
const LIXEIRA_FOLDER = "galeria/lixeira";
const ALBUNS_PREFIX = "galeria/albuns";
const DOCUMENTOS_FOLDER = "documentos";
const BIBLIOTECA_FOLDER = "biblioteca";

export type MediaFile = {
  name: string;
  url: string;
  size: number | null;
  mimeType: string | null;
  createdAt: string | null;
};

export type LixeiraItem = {
  id: string;
  trashFile: string;
  trashMeta: string;
  originalPath: string;
  displayName: string;
  url: string;
  deletedAt: string;
  size: number | null;
};

function eImagemMedia(nome: string, mime?: string | null) {
  if (mime?.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|gif|avif|bmp)$/i.test(nome.split("?")[0]);
}

function eDocumentoMedia(nome: string, mime?: string | null) {
  if (eImagemMedia(nome, mime)) return false;
  const n = nome.toLowerCase();
  if (/\.(pdf|docx?|xlsx?|pptx?|odt|ods|csv|zip)$/i.test(n)) return true;
  if (mime && /pdf|officedocument|msword|ms-excel|spreadsheet|zip/i.test(mime)) return true;
  return !mime || !mime.startsWith("image/");
}

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

/** Só imagens da pasta galeria — exclui álbuns e lixeira. */
export async function listMediaGaleria(): Promise<MediaFile[]> {
  const supabase = createBrowserSupabase();
  const ficheiros = await listarPastaRecursiva(supabase, GALERIA_FOLDER);
  return ficheiros
    .filter((f) => eImagemMedia(f.name, f.mimeType))
    .filter((f) => !f.name.startsWith(`${LIXEIRA_FOLDER}/`))
    .filter((f) => !f.name.startsWith(`${ALBUNS_PREFIX}/`))
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

/** Lista ficheiros de uma pasta concreta do bucket media (ex.: biblioteca, documentos, editais). */
export async function listMediaPasta(pasta: string): Promise<MediaFile[]> {
  const supabase = createBrowserSupabase();
  const prefix = pasta.replace(/^\/+|\/+$/g, "") || GALERIA_FOLDER;
  const ficheiros = await listarPastaRecursiva(supabase, prefix);
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

/** Fotos estáticas do sítio (pasta public) — exclui logótipos e ícones. */
export const FOTOS_SITE_PUBLICAS = [
  "/Graduacao-ESJ.jpg",
  "/Graduacao-ESJ-II.webp",
  "/Graduacao-ESJ-III.jpg",
  "/ESJ-background.jpg",
  "/Biblioteca.jpeg",
  "/Biblioteca.webp",
  "/Confefencias.jpg",
  "/Cnderencias.jpg",
  "/Curso-Publicidade-e-Marketing-ESJ.jpg",
  "/Estudio.jpg",
  "/Sala de conferencias.jpg",
  "/JornalistaII.jpg",
  "/esj-2026.jpg",
  "/esj-2026.webp",
  "/esj-20262.jpg",
  "/esj-20262.webp",
  "/studentes.jpg",
  "/televisao.jpeg",
  "/Twelevisão.jpeg",
  "/woman-records-conversation-audience.jpg",
  "/group-five-african-college-students-spending-time-together-campus-university-yard-black-afro-friends-sitting-grass-studying-with-laptops.jpg",
  "/group-five-african-college-students-spending-time-together-campus-university-yard-black-afro-friends-sitting-grass-studying-with-laptops.jpeg",
  "/grupo-do-campo.jpg",
  "/groupo do campo.jpg",
  "/fundo.jpg",
  "/Banner-website-ESJ-Final4-3-1.jpg",
  "/Livro.jpg",
  "/Livro 2.jpg",
  "/Livro 3.jpg",
  "/livro-experiencias.jpg",
  "/livro-infovula.jpg",
  "/livro-noivas.jpg",
  "/480829697740103441.jpeg",
];

/** Importa fotos da pasta public do sítio para a galeria (sem duplicar pelo nome). */
export async function importarFotosSiteParaGaleria() {
  const existentes = await listMediaGaleria();
  const nomes = new Set(
    existentes.map((f) => (f.name.split("/").pop() || "").toLowerCase())
  );

  let ok = 0;
  let skip = 0;
  let erro = 0;

  for (const caminho of FOTOS_SITE_PUBLICAS) {
    const base = decodeURIComponent(caminho.split("/").pop() || "").toLowerCase();
    if (!base) {
      erro += 1;
      continue;
    }
    if (nomes.has(base)) {
      skip += 1;
      continue;
    }
    try {
      const res = await fetch(encodeURI(caminho));
      if (!res.ok) {
        erro += 1;
        continue;
      }
      const blob = await res.blob();
      if (!blob.type.startsWith("image/") && !/\.(jpe?g|png|webp|gif)$/i.test(base)) {
        erro += 1;
        continue;
      }
      await uploadMediaGaleriaBlob(blob, base);
      nomes.add(base);
      ok += 1;
    } catch {
      erro += 1;
    }
  }

  return { ok, skip, erro };
}

/** Move fotos para a lixeira (recuperáveis). */
export async function moverMediaParaLixeira(names: string[]) {
  const supabase = createBrowserSupabase();
  const unicos = [...new Set(names.filter(Boolean))];
  if (!unicos.length) return;

  for (const originalPath of unicos) {
    if (originalPath.startsWith(`${LIXEIRA_FOLDER}/`)) continue;
    if (originalPath.endsWith(".json")) continue;

    const id = crypto.randomUUID();
    const base = originalPath.split("/").pop() || "foto.jpg";
    const ext = (base.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const trashFile = `${LIXEIRA_FOLDER}/${id}.${ext}`;
    const trashMeta = `${LIXEIRA_FOLDER}/${id}.json`;

    const { error: moveErr } = await supabase.storage.from(GALERIA_BUCKET).move(originalPath, trashFile);
    if (moveErr) {
      // Fallback: copiar + remover (alguns buckets não permitem move entre pastas)
      const { data: blob, error: dlErr } = await supabase.storage.from(GALERIA_BUCKET).download(originalPath);
      if (dlErr || !blob) throw moveErr;
      const { error: upErr } = await supabase.storage.from(GALERIA_BUCKET).upload(trashFile, blob, {
        upsert: false,
        contentType: blob.type || undefined,
      });
      if (upErr) throw upErr;
      const { error: rmErr } = await supabase.storage.from(GALERIA_BUCKET).remove([originalPath]);
      if (rmErr) throw rmErr;
    }

    const meta = {
      id,
      originalPath,
      displayName: base,
      deletedAt: new Date().toISOString(),
    };
    const { error: metaErr } = await supabase.storage.from(GALERIA_BUCKET).upload(
      trashMeta,
      new Blob([JSON.stringify(meta, null, 2)], { type: "application/json" }),
      { contentType: "application/json", upsert: true }
    );
    if (metaErr) throw metaErr;
  }
}

export async function listMediaLixeira(): Promise<LixeiraItem[]> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.storage.from(GALERIA_BUCKET).list(LIXEIRA_FOLDER, {
    limit: 1000,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw error;

  const metas = (data ?? []).filter((f) => f.id && f.name.endsWith(".json"));
  const items: LixeiraItem[] = [];

  for (const m of metas) {
    const trashMeta = `${LIXEIRA_FOLDER}/${m.name}`;
    const { data: blob, error: dlErr } = await supabase.storage.from(GALERIA_BUCKET).download(trashMeta);
    if (dlErr || !blob) continue;
    try {
      const json = JSON.parse(await blob.text()) as {
        id?: string;
        originalPath?: string;
        displayName?: string;
        deletedAt?: string;
      };
      const id = json.id || m.name.replace(/\.json$/i, "");
      const candidatos = (data ?? []).filter(
        (f) => f.id && f.name.startsWith(`${id}.`) && !f.name.endsWith(".json")
      );
      const ficheiro = candidatos[0];
      if (!ficheiro) continue;
      const trashFile = `${LIXEIRA_FOLDER}/${ficheiro.name}`;
      const { data: pub } = supabase.storage.from(GALERIA_BUCKET).getPublicUrl(trashFile);
      items.push({
        id,
        trashFile,
        trashMeta,
        originalPath: json.originalPath || "",
        displayName: json.displayName || ficheiro.name,
        url: pub.publicUrl,
        deletedAt: json.deletedAt || ficheiro.created_at || "",
        size: ficheiro.metadata?.size ?? null,
      });
    } catch {
      /* meta inválida */
    }
  }

  return items.sort((a, b) => (b.deletedAt || "").localeCompare(a.deletedAt || ""));
}

export async function restaurarMediaLixeira(ids: string[]) {
  const supabase = createBrowserSupabase();
  const lixeira = await listMediaLixeira();
  const alvo = lixeira.filter((i) => ids.includes(i.id));

  for (const item of alvo) {
    let destino = item.originalPath;
    if (!destino || destino.startsWith(`${LIXEIRA_FOLDER}/`)) {
      destino = `${GALERIA_FOLDER}/${limparNomeFicheiro(item.displayName)}`;
    } else {
      const pasta = destino.split("/").slice(0, -1).join("/");
      const nome = destino.split("/").pop() || item.displayName;
      const { data: vizinhos } = await supabase.storage.from(GALERIA_BUCKET).list(pasta || GALERIA_FOLDER, {
        limit: 1000,
      });
      if ((vizinhos ?? []).some((f) => f.name === nome)) {
        destino = `${GALERIA_FOLDER}/${limparNomeFicheiro(item.displayName)}`;
      }
    }

    const { error: moveErr } = await supabase.storage.from(GALERIA_BUCKET).move(item.trashFile, destino);
    if (moveErr) {
      const { data: blob, error: dlErr } = await supabase.storage.from(GALERIA_BUCKET).download(item.trashFile);
      if (dlErr || !blob) throw moveErr;
      const { error: upErr } = await supabase.storage.from(GALERIA_BUCKET).upload(destino, blob, {
        upsert: false,
        contentType: blob.type || undefined,
      });
      if (upErr) throw upErr;
      await supabase.storage.from(GALERIA_BUCKET).remove([item.trashFile]);
    }
    await supabase.storage.from(GALERIA_BUCKET).remove([item.trashMeta]);
  }
}

export async function apagarDefinitivoLixeira(ids: string[]) {
  const supabase = createBrowserSupabase();
  const lixeira = await listMediaLixeira();
  const alvo = lixeira.filter((i) => ids.includes(i.id));
  const paths = alvo.flatMap((i) => [i.trashFile, i.trashMeta]);
  if (!paths.length) return;
  const { data, error } = await supabase.storage.from(GALERIA_BUCKET).remove(paths);
  if (error) throw error;
  if (!data || data.length < paths.length) {
    throw new Error(
      "O Storage não removeu o(s) ficheiro(s) — falta a política de eliminação no Supabase."
    );
  }
  const originais = alvo.map((i) => i.originalPath).filter(Boolean);
  if (originais.length) {
    await supabase.from("media_details").delete().in("file_name", originais);
  }
}

/** @deprecated Preferir moverMediaParaLixeira — mantido para apagar definitivo da lixeira. */
export async function deleteMediaGaleria(names: string[]) {
  await moverMediaParaLixeira(names);
}

export async function listMediaDocumentos(): Promise<MediaFile[]> {
  const supabase = createBrowserSupabase();
  const ficheiros = await listarPastaRecursiva(supabase, DOCUMENTOS_FOLDER);
  return ficheiros
    .filter((f) => eDocumentoMedia(f.name, f.mimeType))
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

export async function listMediaBiblioteca(): Promise<MediaFile[]> {
  const supabase = createBrowserSupabase();
  const ficheiros = await listarPastaRecursiva(supabase, BIBLIOTECA_FOLDER);
  return ficheiros
    .filter((f) => eDocumentoMedia(f.name, f.mimeType))
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

export async function uploadMediaDocumento(file: File) {
  const supabase = createBrowserSupabase();
  const eImg = (file.type || "").startsWith("image/") && file.type !== "image/svg+xml" && file.type !== "image/gif";
  const comprimido = eImg
    ? await comprimirImagemUpload(file)
    : await comprimirDocumentoUpload(file);
  if (!eImg && comprimido.size > limiteDocumentoBytes(file)) {
    const mb = (n: number) => `${(n / (1024 * 1024)).toFixed(2)} MB`;
    throw new Error(
      `O documento excede ${mb(limiteDocumentoBytes(file))} (${mb(comprimido.size)}).`
    );
  }
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
