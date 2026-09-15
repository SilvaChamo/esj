"use client";

import { useEffect, useState } from "react";
import { FolderPlus, Pencil, Trash2, X } from "lucide-react";
import {
  actualizarAlbumGaleria,
  apagarAlbumGaleria,
  criarAlbumGaleria,
  listAlbunsGaleria,
  listFotosAlbum,
  type AlbumGaleria,
  type FotoAlbum,
} from "@/lib/galeria-albuns";
import { cmsError } from "@/lib/cms";

type Modo = "lista" | "novo" | "editar";

export default function AlbunsGaleria() {
  const [albuns, setAlbuns] = useState<AlbumGaleria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modo, setModo] = useState<Modo>("lista");
  const [editar, setEditar] = useState<AlbumGaleria | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [fotosExistentes, setFotosExistentes] = useState<FotoAlbum[]>([]);
  const [apagar, setApagar] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const carregar = () => {
    setLoading(true);
    listAlbunsGaleria()
      .then(setAlbuns)
      .catch((err) => setToast(cmsError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(carregar, []);

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setCover(null);
    setCoverPreview(null);
    setPhotos([]);
    setFotosExistentes([]);
    setApagar([]);
    setEditar(null);
    setModo("lista");
  };

  const abrirNovo = () => {
    resetForm();
    setModo("novo");
  };

  const abrirEditar = async (album: AlbumGaleria) => {
    setEditar(album);
    setTitle(album.title);
    setSubtitle(album.subtitle);
    setCover(null);
    setCoverPreview(album.coverUrl);
    setPhotos([]);
    setApagar([]);
    setModo("editar");
    try {
      setFotosExistentes(await listFotosAlbum(album.slug));
    } catch {
      setFotosExistentes([]);
    }
  };

  const guardar = async () => {
    setBusy(true);
    setToast(null);
    try {
      if (modo === "novo") {
        if (!cover) throw new Error("Escolha uma imagem de capa.");
        await criarAlbumGaleria({ title, subtitle, cover, photos });
      } else if (editar) {
        await actualizarAlbumGaleria(editar.slug, {
          title,
          subtitle,
          cover,
          photos,
          apagar,
        });
      }
      resetForm();
      carregar();
      setToast("Álbum guardado.");
    } catch (err) {
      setToast(cmsError(err));
    } finally {
      setBusy(false);
    }
  };

  const eliminar = async (album: AlbumGaleria) => {
    if (!window.confirm(`Eliminar o álbum «${album.title}» e todas as fotos?`)) return;
    try {
      await apagarAlbumGaleria(album.slug);
      carregar();
    } catch (err) {
      setToast(cmsError(err));
    }
  };

  if (modo === "novo" || modo === "editar") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-bold tracking-widest text-sky">GALERIA</p>
            <h2 className="font-serif text-2xl font-bold text-navy-900">
              {modo === "novo" ? "Novo álbum" : "Editar álbum"}
            </h2>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="text-sm text-navy-900/60 hover:text-navy-900"
          >
            Cancelar
          </button>
        </div>

        <div className="bg-white border border-navy-100 p-6 space-y-5 max-w-2xl">
          <div>
            <p className="text-sm font-bold text-navy-900 mb-2">Capa</p>
            <label className="flex flex-col items-center justify-center w-40 h-40 border border-dashed border-navy-200 bg-cream cursor-pointer overflow-hidden">
              {coverPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-navy-900/50 px-3 text-center">Escolher capa</span>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setCover(f);
                  setCoverPreview(f ? URL.createObjectURL(f) : editar?.coverUrl || null);
                }}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-bold text-navy-900">Título</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full border border-navy-100 px-3 h-11 text-sm outline-none focus:border-sky"
              placeholder="Título do álbum"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-navy-900">Descrição</span>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="mt-1.5 w-full border border-navy-100 px-3 h-11 text-sm outline-none focus:border-sky"
              placeholder="Descrição do álbum"
            />
          </label>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-navy-900">Fotos</span>
              <label className="text-xs font-semibold text-sky cursor-pointer hover:underline">
                Carregar fotos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const list = Array.from(e.target.files || []);
                    if (list.length) setPhotos((prev) => [...prev, ...list]);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {fotosExistentes
                .filter((f) => !apagar.includes(f.name))
                .map((f) => (
                  <div key={f.name} className="relative aspect-square border border-navy-100 bg-cream">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setApagar((prev) => [...prev, f.name])}
                      className="absolute top-1 right-1 bg-white/90 p-1"
                      aria-label="Remover"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              {photos.map((f, i) => (
                <div key={`${f.name}-${i}`} className="relative aspect-square border border-navy-100 bg-cream">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(f)}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-white/90 p-1"
                    aria-label="Remover"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {toast && <p className="text-sm text-crimson">{toast}</p>}

          <button
            type="button"
            disabled={busy}
            onClick={() => void guardar()}
            className="h-11 px-6 bg-navy-900 text-white text-[11px] font-bold tracking-wide hover:bg-crimson disabled:opacity-60"
          >
            {busy ? "A GUARDAR…" : modo === "novo" ? "CRIAR ÁLBUM" : "GUARDAR"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-bold tracking-widest text-sky">GALERIA</p>
          <h2 className="font-serif text-2xl font-bold text-navy-900">Álbuns</h2>
          <p className="mt-1 text-sm text-navy-900/60">
            Organize as fotos em pastas (álbuns) para a galeria do sítio.
          </p>
        </div>
        <button
          type="button"
          id="albuns-novo"
          onClick={abrirNovo}
          className="inline-flex items-center gap-2 h-11 px-5 bg-navy-900 text-white text-[11px] font-bold tracking-wide hover:bg-crimson"
        >
          <FolderPlus size={16} />
          ADICIONAR ÁLBUM
        </button>
      </div>

      {toast && !loading && (
        <p className="text-sm text-navy-900 bg-cream border border-navy-100 px-4 py-2">{toast}</p>
      )}

      {loading ? (
        <p className="text-sm text-navy-900/50">A carregar os álbuns…</p>
      ) : albuns.length === 0 ? (
        <div className="bg-white border border-navy-100 px-6 py-12 text-center text-sm text-navy-900/55">
          Ainda sem álbuns. Crie o primeiro para organizar as imagens.
        </div>
      ) : (
        <ul className="space-y-3">
          {albuns.map((album) => (
            <li
              key={album.slug}
              className="bg-white border border-navy-100 flex flex-col sm:flex-row gap-4 p-3"
            >
              <div className="relative w-full sm:w-28 h-28 shrink-0 bg-cream border border-navy-100 overflow-hidden">
                {album.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={album.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0 py-1">
                <h3 className="font-serif font-bold text-navy-900">{album.title}</h3>
                <p className="mt-1 text-sm text-navy-900/60 line-clamp-2">
                  {album.subtitle || `${album.photoCount} foto${album.photoCount === 1 ? "" : "s"}`}
                </p>
                <p className="mt-2 text-xs text-navy-900/40">{album.photoCount} fotos</p>
              </div>
              <div className="flex sm:flex-col gap-2 shrink-0">
                <a
                  href={`/galeria/${album.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 text-xs font-semibold border border-navy-100 hover:bg-cream text-center"
                >
                  Ver
                </a>
                <button
                  type="button"
                  onClick={() => void abrirEditar(album)}
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold border border-navy-100 hover:bg-cream"
                >
                  <Pencil size={12} /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => void eliminar(album)}
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold border border-navy-100 text-crimson hover:bg-cream"
                >
                  <Trash2 size={12} /> Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
