import { createBrowserSupabase } from "@/lib/supabase/browser";
import { slugify, uploadMedia, cmsError, isMissingTable } from "@/lib/cms";
import { gestorSessao } from "@/lib/gestao-auth";

export type EventoTipo = "conferencia" | "semana" | "coloquio";
export type EventoEstado = "proximo" | "realizado";

export type ProgramaItem = {
  hora?: string;
  item: string;
  dia?: string;
};

export type EventoDocumento = {
  titulo: string;
  url: string;
};

export type EventoEsj = {
  id: string;
  slug: string;
  tipo: EventoTipo;
  titulo: string;
  resumo: string;
  descricao: string;
  cartaz_url: string;
  data_inicio: string;
  data_fim: string | null;
  hora: string;
  local: string;
  convidado: string;
  oradores: string;
  programa: ProgramaItem[];
  galeria_urls: string[];
  documentos: EventoDocumento[];
  inscricao_url: string;
  estado: EventoEstado;
  publicado: boolean;
  created_by: string | null;
  created_by_id: string | null;
  created_at: string;
};

export const EVENTO_TIPOS: { id: EventoTipo; label: string; href: string; descricao: string }[] = [
  {
    id: "conferencia",
    label: "Conferência Internacional",
    href: "/eventos/conferencia-internacional",
    descricao: "Edições académicas de prestígio, oradores e programa.",
  },
  {
    id: "semana",
    label: "Semana da Comunicação e Informação",
    href: "/eventos/semana-da-comunicacao",
    descricao: "Vários dias de actividades, participação estudantil e galeria.",
  },
  {
    id: "coloquio",
    label: "Colóquios",
    href: "/eventos/coloquios",
    descricao: "Debates frequentes, cartazes A4 e memória dos temas.",
  },
];

export function labelTipoEvento(tipo: EventoTipo): string {
  return EVENTO_TIPOS.find((t) => t.id === tipo)?.label || tipo;
}

export { cmsError as eventoCmsError, isMissingTable as eventoMissingTable };

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function mapRow(row: Record<string, unknown>): EventoEsj {
  return {
    id: String(row.id),
    slug: String(row.slug),
    tipo: row.tipo as EventoTipo,
    titulo: String(row.titulo || ""),
    resumo: String(row.resumo || ""),
    descricao: String(row.descricao || ""),
    cartaz_url: String(row.cartaz_url || ""),
    data_inicio: String(row.data_inicio || ""),
    data_fim: row.data_fim ? String(row.data_fim) : null,
    hora: String(row.hora || ""),
    local: String(row.local || ""),
    convidado: String(row.convidado || ""),
    oradores: String(row.oradores || ""),
    programa: asArray<ProgramaItem>(row.programa),
    galeria_urls: asArray<string>(row.galeria_urls),
    documentos: asArray<EventoDocumento>(row.documentos),
    inscricao_url: String(row.inscricao_url || ""),
    estado: (row.estado as EventoEstado) || "proximo",
    publicado: Boolean(row.publicado),
    created_by: row.created_by ? String(row.created_by) : null,
    created_by_id: row.created_by_id ? String(row.created_by_id) : null,
    created_at: String(row.created_at || ""),
  };
}

const SELECT =
  "id, slug, tipo, titulo, resumo, descricao, cartaz_url, data_inicio, data_fim, hora, local, convidado, oradores, programa, galeria_urls, documentos, inscricao_url, estado, publicado, created_by, created_by_id, created_at";

export async function listEventosPublicos(opts?: {
  tipo?: EventoTipo;
  estado?: EventoEstado;
  limit?: number;
}): Promise<EventoEsj[]> {
  const supabase = createBrowserSupabase();
  let q = supabase
    .from("eventos_esj")
    .select(SELECT)
    .eq("publicado", true)
    .order("data_inicio", { ascending: false });
  if (opts?.tipo) q = q.eq("tipo", opts.tipo);
  if (opts?.estado) q = q.eq("estado", opts.estado);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function listEventosGestao(tipo?: EventoTipo): Promise<EventoEsj[]> {
  const supabase = createBrowserSupabase();
  let q = supabase.from("eventos_esj").select(SELECT).order("data_inicio", { ascending: false });
  if (tipo) q = q.eq("tipo", tipo);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function getEventoBySlug(slug: string): Promise<EventoEsj | null> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("eventos_esj")
    .select(SELECT)
    .eq("slug", slug)
    .eq("publicado", true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Record<string, unknown>) : null;
}

export async function getEventoById(id: string): Promise<EventoEsj | null> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.from("eventos_esj").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Record<string, unknown>) : null;
}

export type EventoInput = {
  tipo: EventoTipo;
  titulo: string;
  resumo?: string;
  descricao?: string;
  cartaz_url: string;
  data_inicio: string;
  data_fim?: string | null;
  hora?: string;
  local?: string;
  convidado?: string;
  oradores?: string;
  programa?: ProgramaItem[];
  galeria_urls?: string[];
  documentos?: EventoDocumento[];
  inscricao_url?: string;
  estado?: EventoEstado;
  publicado?: boolean;
  slug?: string;
};

async function slugUnico(base: string, exceptoId?: string) {
  const supabase = createBrowserSupabase();
  let slug = slugify(base) || "evento";
  for (let i = 0; i < 20; i++) {
    const candidato = i === 0 ? slug : `${slug}-${i + 1}`;
    let q = supabase.from("eventos_esj").select("id").eq("slug", candidato).maybeSingle();
    const { data } = await q;
    if (!data || (exceptoId && data.id === exceptoId)) return candidato;
  }
  return `${slug}-${Date.now().toString(36)}`;
}

export async function uploadCartazEvento(file: File) {
  return uploadMedia(file, "eventos");
}

export async function criarEvento(input: EventoInput): Promise<EventoEsj> {
  const titulo = input.titulo.trim();
  if (!titulo) throw new Error("Indique o título do evento.");
  if (!input.cartaz_url?.trim()) throw new Error("Carregue o cartaz A4 do evento.");
  if (!input.data_inicio) throw new Error("Indique a data do evento.");

  const gestor = await gestorSessao();
  const slug = await slugUnico(input.slug || titulo);
  const supabase = createBrowserSupabase();
  const row = {
    slug,
    tipo: input.tipo,
    titulo,
    resumo: (input.resumo || "").trim(),
    descricao: (input.descricao || "").trim(),
    cartaz_url: input.cartaz_url.trim(),
    data_inicio: input.data_inicio,
    data_fim: input.data_fim || null,
    hora: (input.hora || "").trim(),
    local: (input.local || "").trim(),
    convidado: (input.convidado || "").trim(),
    oradores: (input.oradores || "").trim(),
    programa: input.programa || [],
    galeria_urls: input.galeria_urls || [],
    documentos: input.documentos || [],
    inscricao_url: (input.inscricao_url || "").trim(),
    estado: input.estado || "proximo",
    publicado: input.publicado !== false,
    created_by: gestor?.autor || null,
    created_by_id: gestor?.id || null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from("eventos_esj").insert(row).select(SELECT).single();
  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}

export async function actualizarEvento(id: string, input: EventoInput): Promise<EventoEsj> {
  const titulo = input.titulo.trim();
  if (!titulo) throw new Error("Indique o título do evento.");
  if (!input.cartaz_url?.trim()) throw new Error("Carregue o cartaz A4 do evento.");
  if (!input.data_inicio) throw new Error("Indique a data do evento.");

  const slug = input.slug?.trim()
    ? await slugUnico(input.slug, id)
    : await slugUnico(titulo, id);

  const supabase = createBrowserSupabase();
  const row = {
    slug,
    tipo: input.tipo,
    titulo,
    resumo: (input.resumo || "").trim(),
    descricao: (input.descricao || "").trim(),
    cartaz_url: input.cartaz_url.trim(),
    data_inicio: input.data_inicio,
    data_fim: input.data_fim || null,
    hora: (input.hora || "").trim(),
    local: (input.local || "").trim(),
    convidado: (input.convidado || "").trim(),
    oradores: (input.oradores || "").trim(),
    programa: input.programa || [],
    galeria_urls: input.galeria_urls || [],
    documentos: input.documentos || [],
    inscricao_url: (input.inscricao_url || "").trim(),
    estado: input.estado || "proximo",
    publicado: input.publicado !== false,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("eventos_esj")
    .update(row)
    .eq("id", id)
    .select(SELECT)
    .single();
  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}

export async function apagarEvento(id: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("eventos_esj").delete().eq("id", id);
  if (error) throw error;
}

export function formatDataEvento(iso: string) {
  if (!iso) return "";
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}

export function partesDataEvento(iso: string) {
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return { dia: "—", mes: "", ano: "" };
  return {
    dia: String(d.getDate()).padStart(2, "0"),
    mes: d.toLocaleDateString("pt-PT", { month: "short" }).replace(".", "").toUpperCase(),
    ano: String(d.getFullYear()),
  };
}

export function anoEvento(e: EventoEsj) {
  const y = Number((e.data_inicio || "").slice(0, 4));
  return Number.isFinite(y) ? y : new Date(e.created_at).getFullYear();
}

export function agruparPorAno(lista: EventoEsj[]) {
  const map = new Map<number, EventoEsj[]>();
  for (const e of lista) {
    const y = anoEvento(e);
    const arr = map.get(y) || [];
    arr.push(e);
    map.set(y, arr);
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0]);
}
