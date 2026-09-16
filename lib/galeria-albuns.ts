import { createBrowserSupabase } from "@/lib/supabase/browser";
import { comprimirImagemUpload } from "@/lib/comprimir-imagem";

const BUCKET = "media";
const ALBUNS_ROOT = "galeria/albuns";

export type AlbumGaleria = {
  slug: string;
  title: string;
  subtitle: string;
  coverUrl: string | null;
  photoCount: number;
  path: string;
};

export type FotoAlbum = {
  name: string;
  url: string;
  createdAt: string | null;
};

export function slugifyAlbum(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "album";
}

function limparNome(nome: string) {
  return `${Date.now()}-${nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w.-]/g, "_")}`;
}

async function ficheiroDeFonte(fonte: File | string, nomePadrao = "foto.jpg"): Promise<File> {
  if (fonte instanceof File) return fonte;
  const res = await fetch(fonte);
  if (!res.ok) throw new Error("Não foi possível obter a imagem seleccionada.");
  const blob = await res.blob();
  const tipo = blob.type || "image/jpeg";
  const ext = tipo.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const nomeUrl = fonte.split("/").pop()?.split("?")[0] || nomePadrao;
  const nome = /\.(jpe?g|png|gif|webp|avif)$/i.test(nomeUrl) ? nomeUrl : `foto.${ext}`;
  return new File([blob], nome, { type: tipo });
}

function urlPublica(path: string) {
  const supabase = createBrowserSupabase();
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function lerMeta(slug: string): Promise<{ title: string; subtitle: string } | null> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.storage.from(BUCKET).download(`${ALBUNS_ROOT}/${slug}/meta.json`);
  if (error || !data) return null;
  try {
    const json = JSON.parse(await data.text()) as { title?: string; subtitle?: string };
    return { title: json.title || slug, subtitle: json.subtitle || "" };
  } catch {
    return null;
  }
}

async function gravarMeta(slug: string, title: string, subtitle: string) {
  const supabase = createBrowserSupabase();
  const blob = new Blob([JSON.stringify({ title, subtitle }, null, 2)], {
    type: "application/json",
  });
  const path = `${ALBUNS_ROOT}/${slug}/meta.json`;
  await supabase.storage.from(BUCKET).remove([path]);
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: "application/json",
    upsert: true,
  });
  if (error) throw error;
}

function eImagem(name: string) {
  return /\.(jpe?g|png|gif|webp|avif)$/i.test(name);
}

function eCapa(name: string) {
  return /^cover\./i.test(name.split("/").pop() || "");
}

export async function listAlbunsGaleria(): Promise<AlbumGaleria[]> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.storage.from(BUCKET).list(ALBUNS_ROOT, {
    limit: 200,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) throw error;

  const pastas = (data ?? []).filter((e) => e.id === null);
  const albuns: AlbumGaleria[] = [];

  for (const pasta of pastas) {
    const slug = pasta.name;
    const path = `${ALBUNS_ROOT}/${slug}`;
    const { data: ficheiros } = await supabase.storage.from(BUCKET).list(path, {
      limit: 500,
      sortBy: { column: "created_at", order: "desc" },
    });
    const imgs = (ficheiros ?? []).filter((f) => f.id && eImagem(f.name));
    const capa = imgs.find((f) => eCapa(f.name)) || imgs[0];
    const meta = (await lerMeta(slug)) || {
      title: slug.replace(/-/g, " "),
      subtitle: "",
    };
    albuns.push({
      slug,
      title: meta.title,
      subtitle: meta.subtitle,
      coverUrl: capa ? urlPublica(`${path}/${capa.name}`) : null,
      photoCount: imgs.length,
      path,
    });
  }

  return albuns.sort((a, b) => a.title.localeCompare(b.title, "pt"));
}

export async function listFotosAlbum(slug: string): Promise<FotoAlbum[]> {
  const supabase = createBrowserSupabase();
  const path = `${ALBUNS_ROOT}/${slug}`;
  const { data, error } = await supabase.storage.from(BUCKET).list(path, {
    limit: 500,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw error;
  return (data ?? [])
    .filter((f) => f.id && eImagem(f.name))
    .map((f) => ({
      name: `${path}/${f.name}`,
      url: urlPublica(`${path}/${f.name}`),
      createdAt: f.created_at ?? null,
    }));
}

export async function getAlbumGaleria(slug: string): Promise<AlbumGaleria | null> {
  const todos = await listAlbunsGaleria();
  return todos.find((a) => a.slug === slug) || null;
}

export async function criarAlbumGaleria(opts: {
  title: string;
  subtitle: string;
  cover: File | string;
  photos?: (File | string)[];
}) {
  const title = opts.title.trim();
  if (!title) throw new Error("Indique o título do álbum.");
  if (!opts.cover) throw new Error("Escolha uma imagem de capa.");

  let slug = slugifyAlbum(title);
  const supabase = createBrowserSupabase();
  const { data: existentes } = await supabase.storage.from(BUCKET).list(ALBUNS_ROOT, { limit: 200 });
  const nomes = new Set((existentes ?? []).map((e) => e.name));
  if (nomes.has(slug)) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  await gravarMeta(slug, title, opts.subtitle.trim());

  const capaOrig = await ficheiroDeFonte(opts.cover, "cover.jpg");
  const capa = await comprimirImagemUpload(capaOrig);
  const ext = capa.name.split(".").pop() || "jpg";
  const capaPath = `${ALBUNS_ROOT}/${slug}/cover.${ext}`;
  const { error: errCapa } = await supabase.storage.from(BUCKET).upload(capaPath, capa, {
    contentType: capa.type || undefined,
    upsert: true,
  });
  if (errCapa) throw errCapa;

  for (const foto of opts.photos || []) {
    const origem = await ficheiroDeFonte(foto);
    const comprimido = await comprimirImagemUpload(origem);
    const path = `${ALBUNS_ROOT}/${slug}/${limparNome(comprimido.name)}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, comprimido, {
      contentType: comprimido.type || undefined,
      upsert: false,
    });
    if (error) throw error;
  }

  return getAlbumGaleria(slug);
}

export async function actualizarAlbumGaleria(
  slug: string,
  opts: {
    title: string;
    subtitle: string;
    cover?: File | string | null;
    photos?: (File | string)[];
    apagar?: string[];
  }
) {
  const title = opts.title.trim();
  if (!title) throw new Error("Indique o título do álbum.");
  await gravarMeta(slug, title, opts.subtitle.trim());

  const supabase = createBrowserSupabase();

  if (opts.apagar?.length) {
    const soDeste = opts.apagar.filter((n) => n.startsWith(`${ALBUNS_ROOT}/${slug}/`));
    if (soDeste.length) {
      const { error } = await supabase.storage.from(BUCKET).remove(soDeste);
      if (error) throw error;
    }
  }

  if (opts.cover) {
    const capaOrig = await ficheiroDeFonte(opts.cover, "cover.jpg");
    const capa = await comprimirImagemUpload(capaOrig);
    const ext = capa.name.split(".").pop() || "jpg";
    const { data: ficheiros } = await supabase.storage.from(BUCKET).list(`${ALBUNS_ROOT}/${slug}`, {
      limit: 100,
    });
    const capasAntigas = (ficheiros ?? [])
      .filter((f) => f.id && eCapa(f.name))
      .map((f) => `${ALBUNS_ROOT}/${slug}/${f.name}`);
    if (capasAntigas.length) await supabase.storage.from(BUCKET).remove(capasAntigas);
    const { error } = await supabase.storage.from(BUCKET).upload(
      `${ALBUNS_ROOT}/${slug}/cover.${ext}`,
      capa,
      { contentType: capa.type || undefined, upsert: true }
    );
    if (error) throw error;
  }

  for (const foto of opts.photos || []) {
    const origem = await ficheiroDeFonte(foto);
    const comprimido = await comprimirImagemUpload(origem);
    const path = `${ALBUNS_ROOT}/${slug}/${limparNome(comprimido.name)}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, comprimido, {
      contentType: comprimido.type || undefined,
      upsert: false,
    });
    if (error) throw error;
  }

  return getAlbumGaleria(slug);
}

export async function apagarAlbumGaleria(slug: string) {
  const supabase = createBrowserSupabase();
  const path = `${ALBUNS_ROOT}/${slug}`;
  const { data, error } = await supabase.storage.from(BUCKET).list(path, { limit: 1000 });
  if (error) throw error;
  const names = (data ?? []).filter((f) => f.id).map((f) => `${path}/${f.name}`);
  if (names.length) {
    const { error: rem } = await supabase.storage.from(BUCKET).remove(names);
    if (rem) throw rem;
  }
}
