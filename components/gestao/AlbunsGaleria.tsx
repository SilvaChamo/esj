"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Upload } from "lucide-react";
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
import ImageSelector from "@/components/gestao/ImageSelector";

type Modo = "lista" | "novo" | "editar";
type SelectorAlvo = "capa" | "fotos" | null;

type FotoPendente = {
  key: string;
  preview: string;
};

export default function AlbunsGaleria() {
  const [albuns, setAlbuns] = useState<AlbumGaleria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modo, setModo] = useState<Modo>("lista");
  const [editar, setEditar] = useState<AlbumGaleria | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [cover, setCover] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverMudou, setCoverMudou] = useState(false);
  const [photos, setPhotos] = useState<FotoPendente[]>([]);
  const [fotosExistentes, setFotosExistentes] = useState<FotoAlbum[]>([]);
  const [apagar, setApagar] = useState<string[]>([]);
  const [loadingFotos, setLoadingFotos] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selector, setSelector] = useState<SelectorAlvo>(null);

  const carregar = () => {
    setLoading(true);
    listAlbunsGaleria()
      .then(setAlbuns)
      .catch((err) => setToast(cmsError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(carregar, []);

  useEffect(() => {
    const btn = document.getElementById("albuns-adicionar");
    if (!btn) return;
    btn.style.display = modo === "lista" ? "" : "none";
    return () => {
      btn.style.display = "";
    };
  }, [modo]);

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setCover(null);
    setCoverPreview(null);
    setCoverMudou(false);
    setPhotos([]);
    setFotosExistentes([]);
    setApagar([]);
    setEditar(null);
    setToast(null);
    setSelector(null);
    setModo("lista");
  };

  const abrirNovo = () => {
    setTitle("");
    setSubtitle("");
    setCover(null);
    setCoverPreview(null);
    setCoverMudou(false);
    setPhotos([]);
    setFotosExistentes([]);
    setApagar([]);
    setEditar(null);
    setToast(null);
    setSelector(null);
    setModo("novo");
  };

  const abrirEditar = async (album: AlbumGaleria) => {
    setEditar(album);
    setTitle(album.title);
    setSubtitle(album.subtitle);
    setCover(null);
    setCoverPreview(album.coverUrl);
    setCoverMudou(false);
    setPhotos([]);
    setApagar([]);
    setToast(null);
    setSelector(null);
    setModo("editar");
    setLoadingFotos(true);
    try {
      setFotosExistentes(await listFotosAlbum(album.slug));
    } catch {
      setFotosExistentes([]);
    } finally {
      setLoadingFotos(false);
    }
  };

  const onSelectImagem = (url: string) => {
    setCover(url);
    setCoverPreview(url);
    setCoverMudou(true);
    setSelector(null);
  };

  const onSelectFotos = (urls: string[]) => {
    setPhotos((prev) => [
      ...prev,
      ...urls.map((url) => ({
        key: `${url}-${Date.now()}-${Math.random()}`,
        preview: url,
      })),
    ]);
    setSelector(null);
  };

  const guardar = async () => {
    setBusy(true);
    setToast(null);
    try {
      if (!title.trim()) throw new Error("Indique o título do álbum.");
      const novas = photos.map((p) => p.preview);
      if (modo === "novo") {
        if (!cover) throw new Error("Escolha uma imagem de capa.");
        await criarAlbumGaleria({
          title: title.trim(),
          subtitle: subtitle.trim(),
          cover,
          photos: novas,
        });
      } else if (editar) {
        await actualizarAlbumGaleria(editar.slug, {
          title: title.trim(),
          subtitle: subtitle.trim(),
          cover: coverMudou ? cover : null,
          photos: novas,
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

  const fotosVisiveis = fotosExistentes.filter((f) => !apagar.includes(f.name));

  if (modo === "novo" || modo === "editar") {
    return (
      <div className="bg-white border border-navy-100 p-6 md:p-8 space-y-5">
        <button id="albuns-novo" type="button" className="hidden" onClick={abrirNovo} />

        <div className="flex items-stretch gap-4 flex-col sm:flex-row">
          <button
            type="button"
            onClick={() => setSelector("capa")}
            className="relative w-full sm:w-44 md:w-52 shrink-0 min-h-[8.5rem] sm:min-h-0 border border-navy-100 bg-cream overflow-hidden group"
          >
            {coverPreview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverPreview}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute inset-0 z-[1] flex items-center justify-center bg-navy-900/70 text-white text-[12px] font-bold tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                  Substituir capa
                </span>
              </>
            ) : (
              <span className="absolute inset-0 flex flex-col items-center justify-center text-navy-900/40 px-2">
                <Upload size={22} />
                <span className="text-[10px] font-bold mt-1.5 block">Capa</span>
              </span>
            )}
          </button>
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <h2 className="font-serif text-xl font-bold text-navy-900">
              {modo === "novo" ? "Novo álbum" : "Editar álbum"}
            </h2>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-navy-100 px-3 h-11 text-sm outline-none focus:border-sky"
              placeholder="Título do álbum"
            />
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full border border-navy-100 px-3 h-11 text-sm outline-none focus:border-sky"
              placeholder="Descrição do álbum"
            />
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 mb-3">
            Fotos do álbum
          </p>
          {loadingFotos && fotosVisiveis.length === 0 && photos.length === 0 ? (
            <p className="text-xs text-navy-900/45 py-6 text-center">A carregar fotos…</p>
          ) : fotosVisiveis.length === 0 && photos.length === 0 ? (
            <p className="text-xs text-navy-900/45 italic mb-3">
              Ainda sem fotos. Use «Subir fotos» para escolher na galeria ou no computador.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {fotosVisiveis.map((f) => (
                <div
                  key={f.name}
                  className="relative group aspect-square border border-navy-100 bg-cream overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setApagar((prev) => [...prev, f.name])}
                    title="Eliminar foto"
                    aria-label="Eliminar foto"
                    className="absolute top-1.5 right-1.5 p-1.5 bg-white/95 text-crimson opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {photos.map((p) => (
                <div
                  key={p.key}
                  className="relative group aspect-square border border-sky/30 bg-cream overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.preview} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-sky text-white text-[9px] font-bold">
                    Nova
                  </span>
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((x) => x.key !== p.key))}
                    title="Eliminar foto"
                    aria-label="Eliminar foto"
                    className="absolute top-1.5 right-1.5 p-1.5 bg-white/95 text-crimson opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {toast && <p className="text-sm text-crimson">{toast}</p>}

        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-navy-100">
          <button
            type="button"
            onClick={() => setSelector("fotos")}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 border border-navy-200 text-sm font-bold text-navy-900/70 hover:border-sky hover:text-sky"
          >
            <Upload size={16} />
            Subir fotos
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="h-10 px-4 border border-navy-200 text-sm font-bold text-navy-900/70 hover:border-navy-400"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void guardar()}
            className="h-10 px-4 bg-navy-900 text-white text-sm font-bold hover:bg-crimson disabled:opacity-60"
          >
            {busy ? "A GUARDAR…" : modo === "novo" ? "Criar álbum" : "Guardar alterações"}
          </button>
        </div>

        {selector === "capa" && (
          <ImageSelector
            titulo="Capa do álbum"
            initialTab="upload"
            pasta="galeria"
            onClose={() => setSelector(null)}
            onSelect={onSelectImagem}
          />
        )}
        {selector === "fotos" && (
          <ImageSelector
            titulo="Fotos do álbum"
            initialTab="upload"
            pasta="galeria"
            multiple
            onClose={() => setSelector(null)}
            onSelectMany={onSelectFotos}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button id="albuns-novo" type="button" className="hidden" onClick={abrirNovo} />

      {toast && (
        <p className="text-sm text-navy-900 bg-cream border border-navy-100 px-4 py-2">{toast}</p>
      )}

      {loading ? (
        <p className="text-sm text-navy-900/50">A carregar os álbuns…</p>
      ) : albuns.length === 0 ? (
        <div className="bg-white border border-navy-100 px-6 py-12 text-center text-sm text-navy-900/55">
          Ainda sem álbuns. Clique em «Adicionar álbum» na barra para criar o primeiro.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {albuns.map((album) => (
            <article
              key={album.slug}
              className="group bg-white border border-navy-100 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[16/10] bg-cream overflow-hidden">
                {album.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={album.coverUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : null}
                <div className="absolute inset-0 bg-navy-900/45 group-hover:bg-navy-900/55 transition-colors flex flex-col justify-end p-3">
                  <h3 className="font-serif font-bold text-white text-sm leading-snug line-clamp-2">
                    {album.title}
                  </h3>
                  {album.subtitle ? (
                    <p className="mt-1 text-[11px] text-white/80 line-clamp-2">{album.subtitle}</p>
                  ) : null}
                  <p className="mt-2 text-[10px] font-bold tracking-wide text-white/70 uppercase">
                    {album.photoCount} foto{album.photoCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-t border-navy-100">
                <button
                  type="button"
                  onClick={() => void abrirEditar(album)}
                  className="text-[12px] text-sky hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <Pencil size={12} /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => void eliminar(album)}
                  title="Eliminar álbum"
                  aria-label={`Eliminar ${album.title}`}
                  className="p-1.5 text-crimson hover:bg-crimson/10 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
