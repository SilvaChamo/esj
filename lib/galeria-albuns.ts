import { createBrowserSupabase } from "@/lib/supabase/browser";
import { comprimirImagemUpload } from "@/lib/comprimir-imagem";

const BUCKET = "media";
const ALBUNS_ROOT = "galeria/albuns";
const GALERIA_FOLDER = "galeria";

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

type AlbumMeta = {
  title: string;
  subtitle: string;
  cover?: string | null;
  photos?: string[];
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

function urlPublica(path: string) {
  const supabase = createBrowserSupabase();
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function eImagem(name: string) {
  return /\.(jpe?g|png|gif|webp|avif)$/i.test(name);
}

function eCapa(name: string) {
  return /^cover\./i.test(name.split("/").pop() || "");
}

function eMeta(name: string) {
  return name === "meta.json";
}

function normalizarUrl(u: string) {
  return u.split("?")[0];
}

function dedupeUrls(urls: string[]) {
  const vistos = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    const key = normalizarUrl(u);
    if (!u || vistos.has(key)) continue;
    vistos.add(key);
    out.push(u);
  }
  return out;
}

async function ficheiroDeFonte(fonte: File, nomePadrao = "foto.jpg"): Promise<File> {
  if (fonte instanceof File) return fonte;
  void nomePadrao;
  throw new Error("Fonte inválida.");
}

async function lerMeta(slug: string): Promise<AlbumMeta | null> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.storage.from(BUCKET).download(`${ALBUNS_ROOT}/${slug}/meta.json`);
  if (error || !data) return null;
  try {
    const json = JSON.parse(await data.text()) as AlbumMeta;
    return {
      title: json.title || slug,
      subtitle: json.subtitle || "",
      cover: json.cover || null,
      photos: Array.isArray(json.photos) ? json.photos.filter(Boolean) : [],
    };
  } catch {
    return null;
  }
}

async function gravarMeta(slug: string, meta: AlbumMeta) {
  const supabase = createBrowserSupabase();
  const blob = new Blob(
    [
      JSON.stringify(
        {
          title: meta.title,
          subtitle: meta.subtitle,
          cover: meta.cover || null,
          photos: dedupeUrls(meta.photos || []),
        },
        null,
        2
      ),
    ],
    { type: "application/json" }
  );
  const path = `${ALBUNS_ROOT}/${slug}/meta.json`;
  await supabase.storage.from(BUCKET).remove([path]);
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: "application/json",
    upsert: true,
  });
  if (error) throw error;
}

/** Carrega ficheiro novo para a galeria (só uploads do computador). */
async function carregarFotoNova(file: File): Promise<string> {
  const supabase = createBrowserSupabase();
  const comprimido = await comprimirImagemUpload(file);
  const path = `${GALERIA_FOLDER}/${limparNome(comprimido.name)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, comprimido, {
    contentType: comprimido.type || undefined,
    upsert: false,
  });
  if (error) throw error;
  return urlPublica(path);
}

async function resolverFonte(fonte: File | string): Promise<string> {
  if (typeof fonte === "string") return fonte;
  return carregarFotoNova(await ficheiroDeFonte(fonte));
}

async function listarFicheirosLocais(slug: string) {
  const supabase = createBrowserSupabase();
  const path = `${ALBUNS_ROOT}/${slug}`;
  const { data, error } = await supabase.storage.from(BUCKET).list(path, {
    limit: 500,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw error;
  return (data ?? []).filter((f) => f.id && eImagem(f.name));
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
    const meta =
      (await lerMeta(slug)) ||
      ({
        title: slug.replace(/-/g, " "),
        subtitle: "",
        cover: null,
        photos: [],
      } satisfies AlbumMeta);

    const refs = dedupeUrls(meta.photos || []);
    const locais = await listarFicheirosLocais(slug);
    const locaisUrls = locais.map((f) => urlPublica(`${path}/${f.name}`));
    const todas = dedupeUrls([...refs, ...locaisUrls]);
    const capaLocal = locais.find((f) => eCapa(f.name));
    const coverUrl =
      meta.cover ||
      (capaLocal ? urlPublica(`${path}/${capaLocal.name}`) : null) ||
      todas[0] ||
      null;

    albuns.push({
      slug,
      title: meta.title,
      subtitle: meta.subtitle,
      coverUrl,
      photoCount: todas.length || (coverUrl ? 1 : 0),
      path,
    });
  }

  return albuns.sort((a, b) => a.title.localeCompare(b.title, "pt"));
}

export async function listFotosAlbum(slug: string): Promise<FotoAlbum[]> {
  const path = `${ALBUNS_ROOT}/${slug}`;
  const meta = await lerMeta(slug);
  const refs = dedupeUrls(meta?.photos || []);
  const locais = await listarFicheirosLocais(slug);

  const porUrl = new Map<string, FotoAlbum>();

  for (const url of refs) {
    const key = normalizarUrl(url);
    porUrl.set(key, { name: url, url, createdAt: null });
  }

  for (const f of locais) {
    const url = urlPublica(`${path}/${f.name}`);
    const key = normalizarUrl(url);
    if (porUrl.has(key)) continue;
    porUrl.set(key, {
      name: `${path}/${f.name}`,
      url,
      createdAt: f.created_at ?? null,
    });
  }

  return Array.from(porUrl.values());
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

  const coverUrl = await resolverFonte(opts.cover);
  const photos: string[] = [];
  for (const foto of opts.photos || []) {
    photos.push(await resolverFonte(foto));
  }

  await gravarMeta(slug, {
    title,
    subtitle: opts.subtitle.trim(),
    cover: coverUrl,
    photos: dedupeUrls(photos),
  });

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

  const atual = (await lerMeta(slug)) || {
    title: slug,
    subtitle: "",
    cover: null as string | null,
    photos: [] as string[],
  };

  let cover = atual.cover || null;
  if (opts.cover) {
    cover = await resolverFonte(opts.cover);
  }

  let photos = dedupeUrls(atual.photos || []);

  if (opts.apagar?.length) {
    const apagarSet = new Set(opts.apagar.map(normalizarUrl));
    photos = photos.filter((u) => !apagarSet.has(normalizarUrl(u)));

    const soDeste = opts.apagar.filter((n) => n.startsWith(`${ALBUNS_ROOT}/${slug}/`));
    if (soDeste.length) {
      const { moverMediaParaLixeira } = await import("@/lib/cms");
      await moverMediaParaLixeira(soDeste);
    }
  }

  for (const foto of opts.photos || []) {
    photos.push(await resolverFonte(foto));
  }
  photos = dedupeUrls(photos);

  await gravarMeta(slug, {
    title,
    subtitle: opts.subtitle.trim(),
    cover,
    photos,
  });

  return getAlbumGaleria(slug);
}

export async function apagarAlbumGaleria(slug: string) {
  const supabase = createBrowserSupabase();
  const path = `${ALBUNS_ROOT}/${slug}`;
  const meta = await lerMeta(slug);
  const { data, error } = await supabase.storage.from(BUCKET).list(path, { limit: 1000 });
  if (error) throw error;

  // Só ficheiros dentro da pasta do álbum vão para a lixeira / remoção.
  // Referências a fotos da galeria (fora desta pasta) mantêm-se intactas.
  const imagensLocais = (data ?? [])
    .filter((f) => f.id && eImagem(f.name))
    .map((f) => `${path}/${f.name}`);

  if (imagensLocais.length) {
    const { moverMediaParaLixeira } = await import("@/lib/cms");
    await moverMediaParaLixeira(imagensLocais);
  }

  const metaPath = `${path}/meta.json`;
  await supabase.storage.from(BUCKET).remove([metaPath]);

  // Remover outros .json residuais da pasta do álbum
  const outros = (data ?? [])
    .filter((f) => f.id && f.name.endsWith(".json") && f.name !== "meta.json")
    .map((f) => `${path}/${f.name}`);
  if (outros.length) await supabase.storage.from(BUCKET).remove(outros);

  void meta;
}
