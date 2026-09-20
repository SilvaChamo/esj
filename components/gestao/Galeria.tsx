"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  LayoutGrid,
  List as ListIcon,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import {
  apagarDefinitivoLixeira,
  cmsError,
  importarFotosSiteParaGaleria,
  isMissingTable,
  listMediaGaleria,
  listMediaLixeira,
  loadMediaDetails,
  moverMediaParaLixeira,
  restaurarMediaLixeira,
  saveMediaDetails,
  uploadMediaGaleria,
  uploadMediaGaleriaBlob,
  type LixeiraItem,
  type MediaDetails,
  type MediaFile,
} from "@/lib/cms";
import SchemaInstall from "@/components/gestao/SchemaInstall";

// Galeria de multimédia do painel — porta directa da galeria do projecto
// "basededadosagro" (por sua vez herdada de "entrecampos"): lista o próprio
// bucket de Storage, edição de imagem (redimensionar/converter) no browser
// via canvas, e metadados (alt/título/legenda/descrição) numa tabela à parte
// indexada pelo nome do ficheiro. Aqui fala directo com o Supabase (bucket
// "media" + tabela media_details), pois o painel da ESJ não tem rotas de
// admin com service role — todas as outras secções também gravam assim.

function formatSize(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function Galeria() {
  const [vista, setVista] = useState<"galeria" | "lixeira">("galeria");
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [lixeira, setLixeira] = useState<LixeiraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [brokenIds, setBrokenIds] = useState<Set<string>>(new Set());
  const [fileTypeFilter, setFileTypeFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState("todas");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editWidth, setEditWidth] = useState(0);
  const [editHeight, setEditHeight] = useState(0);
  const [editFormat, setEditFormat] = useState<"original" | "webp" | "jpeg">("original");
  const [processingImage, setProcessingImage] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);

  const [metadata, setMetadata] = useState<MediaDetails>({
    alt_text: "",
    title: "",
    caption: "",
    description: "",
  });
  const [savingMetadata, setSavingMetadata] = useState(false);

  const [toast, setToast] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [importando, setImportando] = useState(false);
  const notify = (tipo: "ok" | "erro", texto: string) => {
    setToast({ tipo, texto });
    window.setTimeout(() => setToast(null), 3600);
  };

  const loadImages = () => {
    setLoading(true);
    listMediaGaleria()
      .then((data) => {
        setFiles(data);
        setMissing(false);
      })
      .catch((err) => {
        if (isMissingTable(err)) setMissing(true);
        else notify("erro", cmsError(err));
      })
      .finally(() => setLoading(false));
  };

  const loadLixeira = () => {
    setLoading(true);
    listMediaLixeira()
      .then(setLixeira)
      .catch((err) => notify("erro", cmsError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setSelectedIds(new Set());
    setCurrentPage(1);
    if (vista === "galeria") loadImages();
    else loadLixeira();
  }, [vista]);

  useEffect(() => {
    listMediaLixeira()
      .then(setLixeira)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    void supabase
      .from("media_details")
      .select("id")
      .limit(1)
      .then(({ error }) => {
        if (error && isMissingTable(error)) setMissing(true);
      });
  }, []);

  const years = useMemo(() => {
    const unique = Array.from(
      new Set(files.map((f) => new Date(f.createdAt || Date.now()).getFullYear()))
    );
    return unique.sort((a, b) => b - a);
  }, [files]);

  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        fileTypeFilter === "todos" ||
        (fileTypeFilter === "imagens" && /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(f.name));
      const fileYear = new Date(f.createdAt || Date.now()).getFullYear();
      const matchesDate = dateFilter === "todas" || fileYear.toString() === dateFilter;
      return matchesSearch && matchesType && matchesDate;
    });
  }, [files, searchQuery, fileTypeFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredFiles.length / itemsPerPage));
  const paginatedFiles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFiles.slice(start, start + itemsPerPage);
  }, [filteredFiles, currentPage]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const deleteFiles = async (names: string[]) => {
    await moverMediaParaLixeira(names);
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Enviar ${selectedIds.size} foto(s) para a lixeira?`)) return;
    try {
      setLoading(true);
      await deleteFiles(Array.from(selectedIds));
      setSelectedIds(new Set());
      loadImages();
      notify("ok", "Fotos enviadas para a lixeira.");
    } catch (err) {
      notify("erro", cmsError(err));
      setLoading(false);
    }
  };

  const deleteSingle = async (name: string) => {
    if (!window.confirm(`Enviar "${name.split("/").pop()}" para a lixeira?`)) return;
    try {
      await deleteFiles([name]);
      setFiles((prev) => prev.filter((f) => f.name !== name));
      if (selectedFile?.name === name) setSelectedFile(null);
      notify("ok", "Foto enviada para a lixeira.");
    } catch (err) {
      notify("erro", cmsError(err));
    }
  };

  const restaurarSelected = async () => {
    if (selectedIds.size === 0) return;
    try {
      setLoading(true);
      await restaurarMediaLixeira(Array.from(selectedIds));
      setSelectedIds(new Set());
      loadLixeira();
      notify("ok", "Fotos restauradas na galeria.");
    } catch (err) {
      notify("erro", cmsError(err));
      setLoading(false);
    }
  };

  const apagarDefinitivoSelected = async () => {
    if (selectedIds.size === 0) return;
    if (
      !window.confirm(
        `Apagar definitivamente ${selectedIds.size} foto(s)? Esta acção não pode ser desfeita.`
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      await apagarDefinitivoLixeira(Array.from(selectedIds));
      setSelectedIds(new Set());
      loadLixeira();
      notify("ok", "Fotos apagadas definitivamente.");
    } catch (err) {
      notify("erro", cmsError(err));
      setLoading(false);
    }
  };

  const copyUrl = (file: MediaFile) => {
    navigator.clipboard.writeText(file.url);
    notify("ok", "Endereço copiado.");
  };

  const openDetails = async (file: MediaFile) => {
    setSelectedFile(file);
    setIsEditingImage(false);
    try {
      const data = await loadMediaDetails(file.name);
      if (data) {
        setMetadata(data);
      } else {
        setMetadata({ alt_text: "", title: file.name.split("/").pop() || file.name, caption: "", description: "" });
      }
    } catch {
      setMetadata({ alt_text: "", title: file.name, caption: "", description: "" });
    }
  };

  useEffect(() => {
    if (!isEditingImage || !selectedFile) return;
    const timer = window.setTimeout(async () => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = selectedFile.url;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      const canvas = document.createElement("canvas");
      canvas.width = editWidth || img.width;
      canvas.height = editHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const mimeType =
        editFormat === "webp" ? "image/webp" : editFormat === "jpeg" ? "image/jpeg" : selectedFile.mimeType || "image/jpeg";
      canvas.toBlob((blob) => {
        if (blob) setEstimatedSize(blob.size);
      }, mimeType, 0.85);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [editWidth, editHeight, editFormat, isEditingImage, selectedFile]);

  const applyImageEdits = async () => {
    if (!selectedFile) return;
    setProcessingImage(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = selectedFile.url;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      const canvas = document.createElement("canvas");
      const finalWidth = editWidth || img.width;
      const finalHeight = editHeight || img.height;
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
      const mimeType =
        editFormat === "webp" ? "image/webp" : editFormat === "jpeg" ? "image/jpeg" : selectedFile.mimeType || "image/jpeg";
      const extension =
        editFormat === "webp" ? ".webp" : editFormat === "jpeg" ? ".jpg" : `.${selectedFile.name.split(".").pop()}`;
      const blob: Blob = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b as Blob), mimeType, 0.85);
      });
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, "").split("/").pop();
      const newFileName = `${Date.now()}-${baseName}${editFormat !== "original" ? "_edited" : ""}${extension}`;
      await uploadMediaGaleriaBlob(blob, newFileName);
      notify("ok", "Imagem processada e guardada.");
      setIsEditingImage(false);
      loadImages();
    } catch (err) {
      notify("erro", cmsError(err));
    } finally {
      setProcessingImage(false);
    }
  };

  const saveMetadata = async () => {
    if (!selectedFile) return;
    setSavingMetadata(true);
    try {
      await saveMediaDetails(selectedFile.name, metadata);
      notify("ok", "Detalhes gravados.");
    } catch (err) {
      if (isMissingTable(err)) setMissing(true);
      notify("erro", cmsError(err));
    } finally {
      setSavingMetadata(false);
    }
  };

  const handleUpload = async (filesToUpload: FileList | null) => {
    if (!filesToUpload || filesToUpload.length === 0) return;
    setUploading(true);
    let successCount = 0;
    for (const file of Array.from(filesToUpload)) {
      try {
        await uploadMediaGaleria(file);
        successCount += 1;
      } catch {
        /* segue para o próximo ficheiro */
      }
    }
    if (successCount > 0) {
      notify("ok", `${successCount} foto(s) carregada(s).`);
      loadImages();
    }
    setUploading(false);
  };

  const handleImportarSite = async () => {
    if (importando) return;
    setImportando(true);
    try {
      const r = await importarFotosSiteParaGaleria();
      notify(
        "ok",
        `Importação: ${r.ok} nova(s), ${r.skip} já existia(m)${r.erro ? `, ${r.erro} falhou/aram` : ""}.`
      );
      if (r.ok > 0) loadImages();
    } catch (err) {
      notify("erro", cmsError(err));
    } finally {
      setImportando(false);
    }
  };

  return (
    <div className="text-[#2c3338]">
      <input
        id="galeria-upload"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          handleUpload(e.target.files);
          e.target.value = "";
        }}
      />
      <button
        id="galeria-importar-site-btn"
        type="button"
        className="hidden"
        disabled={importando}
        onClick={() => void handleImportarSite()}
      />
      {importando ? (
        <p className="mb-3 text-sm text-[#2271b1] font-semibold">A importar fotos do site…</p>
      ) : null}

      {missing && <SchemaInstall />}

      <div className="mb-3 flex items-center gap-1 border-b border-[#ccd0d4]">
        <button
          type="button"
          onClick={() => setVista("galeria")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            vista === "galeria"
              ? "border-[#2271b1] text-[#2271b1]"
              : "border-transparent text-[#50575e] hover:text-[#1d2327]"
          }`}
        >
          Galeria
        </button>
        <button
          type="button"
          onClick={() => setVista("lixeira")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            vista === "lixeira"
              ? "border-[#2271b1] text-[#2271b1]"
              : "border-transparent text-[#50575e] hover:text-[#1d2327]"
          }`}
        >
          <Trash2 className="w-4 h-4" />
          Lixeira
          {lixeira.length > 0 ? (
            <span className="text-[11px] font-bold text-[#d63638]">({lixeira.length})</span>
          ) : null}
        </button>
      </div>

      <div className="sticky top-0 z-10 flex flex-col md:flex-row items-center justify-between bg-white border border-[#ccd0d4] p-2 gap-2 shadow-sm mb-4">
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto md:flex-1 min-w-0">
          <input
            type="checkbox"
            checked={
              vista === "galeria"
                ? selectedIds.size === paginatedFiles.length && paginatedFiles.length > 0
                : selectedIds.size === lixeira.length && lixeira.length > 0
            }
            onChange={() => {
              if (vista === "galeria") {
                if (selectedIds.size === paginatedFiles.length) setSelectedIds(new Set());
                else setSelectedIds(new Set(paginatedFiles.map((f) => f.name)));
              } else {
                if (selectedIds.size === lixeira.length) setSelectedIds(new Set());
                else setSelectedIds(new Set(lixeira.map((f) => f.id)));
              }
            }}
            className="w-4 h-4 cursor-pointer"
            title="Seleccionar todos"
          />

          {vista === "galeria" && (
            <>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md ${viewMode === "list" ? "bg-[#f0f0f1] text-[#2271b1]" : "text-[#50575e] hover:text-[#2271b1]"}`}
              >
                <ListIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md ${viewMode === "grid" ? "bg-[#f0f0f1] text-[#2271b1]" : "text-[#50575e] hover:text-[#2271b1]"}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>

              <div className="relative flex-1 min-w-[180px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8f94]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Procurar itens multimédia…"
                  className="w-full h-8 pl-9 pr-3 bg-white text-[#2c3338] border border-[#ccd0d4] rounded-md text-sm outline-none focus:border-[#2271b1]"
                />
              </div>

              <select
                className="h-8 text-sm border border-[#ccd0d4] rounded-md bg-white px-2"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="todas">Todas as datas</option>
                {years.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </>
          )}

          {selectedIds.size > 0 && vista === "galeria" && (
            <div className="flex items-center gap-3 ml-2 flex-nowrap">
              <span
                onClick={deleteSelected}
                className="text-sm whitespace-nowrap text-[#d63638] cursor-pointer hover:underline"
              >
                Lixeira ({selectedIds.size})
              </span>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="h-8 px-4 text-sm font-semibold border border-[#ccd0d4] rounded-md bg-white hover:bg-[#f6f7f7] whitespace-nowrap"
              >
                Cancelar
              </button>
            </div>
          )}

          {selectedIds.size > 0 && vista === "lixeira" && (
            <div className="flex items-center gap-3 ml-2 flex-nowrap">
              <span
                onClick={() => void restaurarSelected()}
                className="text-sm whitespace-nowrap text-[#2271b1] cursor-pointer hover:underline inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurar {selectedIds.size}
              </span>
              <span
                onClick={() => void apagarDefinitivoSelected()}
                className="text-sm whitespace-nowrap text-[#d63638] cursor-pointer hover:underline"
              >
                Apagar definitivo
              </span>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="h-8 px-4 text-sm font-semibold border border-[#ccd0d4] rounded-md bg-white hover:bg-[#f6f7f7] whitespace-nowrap"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 flex-nowrap">
          <div className="flex items-center gap-2 text-[13px] text-[#50575e] whitespace-nowrap">
            <span>
              {vista === "galeria"
                ? `${filteredFiles.length} fotos`
                : `${lixeira.length} na lixeira`}
            </span>
            {vista === "galeria" && (
              <div className="flex items-center gap-1 ml-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 border border-[#ccd0d4] bg-white rounded-md disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-medium">
                  {currentPage} <span className="font-normal text-gray-400">de</span> {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 border border-[#ccd0d4] bg-white rounded-md disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {vista === "lixeira" ? (
        loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : lixeira.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#8c8f94] text-center bg-white border border-[#ccd0d4]">
            <Trash2 className="w-10 h-10 mb-2" />
            A lixeira está vazia.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {lixeira.map((item) => (
              <div
                key={item.id}
                className={`aspect-square relative bg-white border overflow-hidden group ${
                  selectedIds.has(item.id) ? "ring-[3px] ring-[#2271b1] ring-inset" : "border-[#ccd0d4]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} className="w-full h-full object-cover" alt="" />
                <button
                  type="button"
                  onClick={() => toggleSelect(item.id)}
                  title="Seleccionar"
                  className={`absolute top-1 right-1 w-5 h-5 rounded-sm border flex items-center justify-center transition-opacity ${
                    selectedIds.has(item.id)
                      ? "bg-[#2271b1] border-[#2271b1] opacity-100"
                      : "bg-white/90 border-[#ccd0d4] opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {selectedIds.has(item.id) && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
                <div className="absolute inset-x-0 bottom-0 bg-navy-900/70 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] text-white truncate">{item.displayName}</p>
                  <div className="flex gap-2 mt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedIds(new Set([item.id]));
                        void restaurarMediaLixeira([item.id])
                          .then(() => {
                            setSelectedIds(new Set());
                            loadLixeira();
                            notify("ok", "Foto restaurada.");
                          })
                          .catch((err) => notify("erro", cmsError(err)));
                      }}
                      className="text-[10px] text-sky-300 hover:underline"
                    >
                      Restaurar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!window.confirm("Apagar definitivamente esta foto?")) return;
                        void apagarDefinitivoLixeira([item.id])
                          .then(() => {
                            setSelectedIds(new Set());
                            loadLixeira();
                            notify("ok", "Foto apagada definitivamente.");
                          })
                          .catch((err) => notify("erro", cmsError(err)));
                      }}
                      className="text-[10px] text-red-300 hover:underline"
                    >
                      Apagar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#8c8f94] text-center bg-white border border-[#ccd0d4]">
          <ImageIcon className="w-10 h-10 mb-2" />
          {files.length === 0 ? "Ainda sem fotos. Carregue a primeira." : "Nenhuma foto encontrada."}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {paginatedFiles.map((file) => (
            <div
              key={file.name}
              onClick={() => openDetails(file)}
              className={`aspect-square relative bg-white border cursor-pointer overflow-hidden group ${
                selectedIds.has(file.name) ? "ring-[3px] ring-[#2271b1] ring-inset" : "border-[#ccd0d4]"
              }`}
            >
              {brokenIds.has(file.name) ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <ImageIcon className="w-6 h-6 text-slate-300" />
                </div>
              ) : (
                <img
                  src={file.url}
                  className="w-full h-full object-cover"
                  alt=""
                  onError={() => setBrokenIds((prev) => new Set(prev).add(file.name))}
                />
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelect(file.name);
                }}
                title="Seleccionar"
                className={`absolute top-1 right-1 w-5 h-5 rounded-sm border flex items-center justify-center transition-opacity ${
                  selectedIds.has(file.name)
                    ? "bg-[#2271b1] border-[#2271b1] opacity-100"
                    : "bg-white/90 border-[#ccd0d4] opacity-0 group-hover:opacity-100"
                }`}
              >
                {selectedIds.has(file.name) && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <>
        {/* < lg: cartões — 1 coluna em telemóvel, 2 em tablet (md). */}
        <div className="lg:hidden bg-[#f0f0f1] border border-[#ccd0d4] grid grid-cols-1 md:grid-cols-2 gap-px">
          {paginatedFiles.map((file) => (
            <div key={file.name} className="bg-white p-3 flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedIds.has(file.name)}
                onChange={() => toggleSelect(file.name)}
                className="shrink-0"
              />
              <div className="w-14 h-14 border border-[#ccd0d4] bg-[#f0f0f1] flex-shrink-0">
                <img src={file.url} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => openDetails(file)}
                  className="text-[#2271b1] font-bold hover:text-[#135e96] text-left truncate block w-full text-[13px]"
                >
                  {file.name.split("/").pop()}
                </button>
                <p className="text-[#50575e] text-xs">
                  {file.mimeType || "-"}
                  {file.createdAt ? ` · ${new Date(file.createdAt).toLocaleDateString("pt-PT")}` : ""}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <button onClick={() => openDetails(file)} className="text-[#2271b1] hover:underline">
                    Editar
                  </button>
                  <span className="text-[#ccd0d4]">|</span>
                  <button onClick={() => deleteSingle(file.name)} className="text-[#d63638] hover:underline">
                    Lixeira
                  </button>
                  <span className="text-[#ccd0d4]">|</span>
                  <button onClick={() => copyUrl(file)} className="text-[#2271b1] hover:underline">
                    Ver
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:block bg-white border border-[#ccd0d4] overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white text-left text-[13px] font-bold border-b border-[#ccd0d4]">
                <th className="p-2 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredFiles.length && filteredFiles.length > 0}
                    onChange={() => {
                      if (selectedIds.size === filteredFiles.length) setSelectedIds(new Set());
                      else setSelectedIds(new Set(filteredFiles.map((f) => f.name)));
                    }}
                  />
                </th>
                <th className="p-3">Ficheiro</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Data</th>
                <th className="p-3 text-right">Acções</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFiles.map((file) => (
                <tr key={file.name} className="border-b border-[#f0f0f1] hover:bg-[#f6f7f7] text-[13px]">
                  <td className="p-2">
                    <input type="checkbox" checked={selectedIds.has(file.name)} onChange={() => toggleSelect(file.name)} />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3 max-w-[400px]">
                      <div className="w-16 h-16 border border-[#ccd0d4] bg-[#f0f0f1] flex-shrink-0">
                        <img src={file.url} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <button
                          onClick={() => openDetails(file)}
                          className="text-[#2271b1] font-bold hover:text-[#135e96] text-left truncate whitespace-nowrap block w-full"
                        >
                          {file.name.split("/").pop()}
                        </button>
                        <span className="text-[#50575e] text-xs font-mono truncate">{file.mimeType}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-[#50575e]">{file.mimeType || "-"}</td>
                  <td className="p-3 text-[#50575e]">
                    {file.createdAt ? new Date(file.createdAt).toLocaleDateString("pt-PT") : "-"}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openDetails(file)} className="text-[#2271b1] hover:underline">
                        Editar
                      </button>
                      <span className="text-[#ccd0d4]">|</span>
                      <button onClick={() => deleteSingle(file.name)} className="text-[#d63638] hover:underline">
                        Lixeira
                      </button>
                      <span className="text-[#ccd0d4]">|</span>
                      <button onClick={() => copyUrl(file)} className="text-[#2271b1] hover:underline">
                        Ver
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {selectedFile && (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col">
          <div className="flex items-center justify-between px-4 h-12 border-b bg-[#f6f7f7]">
            <h2 className="text-lg font-bold">Detalhes da foto</h2>
            <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-[#ccd0d4]">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#f0f0f1]">
            <div className="flex-1 p-4 flex flex-col items-center justify-center overflow-auto">
              {!isEditingImage ? (
                <>
                  <img src={selectedFile.url} className="max-w-full max-h-[70vh] shadow-lg border border-[#ccd0d4] bg-white" alt="" />
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        const img = new Image();
                        img.src = selectedFile.url;
                        img.onload = () => {
                          setEditWidth(img.width);
                          setEditHeight(img.height);
                          setIsEditingImage(true);
                        };
                      }}
                      className="px-4 py-1.5 bg-[#2271b1] text-white text-sm font-semibold rounded-[3px] hover:bg-[#135e96]"
                    >
                      Editar imagem
                    </button>
                    <button
                      onClick={() => window.open(selectedFile.url, "_blank")}
                      className="px-4 py-1.5 border border-[#2271b1] text-[#2271b1] bg-white text-sm font-semibold rounded-[3px] hover:bg-[#f6f7f7]"
                    >
                      Ver ficheiro completo
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full max-w-4xl bg-white border border-[#ccd0d4] shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Ferramentas de edição</h3>
                    <button onClick={() => setIsEditingImage(false)} className="text-sm text-[#2271b1] hover:underline">
                      Voltar aos detalhes
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col items-center justify-center bg-[#f0f0f1] border p-4">
                      <img src={selectedFile.url} className="max-w-full max-h-[40vh] object-contain" alt="Pré-visualização" />
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h4 className="font-bold text-sm border-b pb-1">Redimensionar</h4>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">Largura</label>
                            <input
                              type="number"
                              value={editWidth}
                              onChange={(e) => setEditWidth(parseInt(e.target.value) || 0)}
                              className="w-24 h-8 bg-white text-[#2c3338] border border-[#ccd0d4] text-sm px-2 outline-none focus:border-[#2271b1]"
                            />
                          </div>
                          <span className="mt-4 text-gray-400">×</span>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">Altura</label>
                            <input
                              type="number"
                              value={editHeight}
                              onChange={(e) => setEditHeight(parseInt(e.target.value) || 0)}
                              className="w-24 h-8 bg-white text-[#2c3338] border border-[#ccd0d4] text-sm px-2 outline-none focus:border-[#2271b1]"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditWidth(Math.round(editWidth * 0.5));
                              setEditHeight(Math.round(editHeight * 0.5));
                            }}
                            className="text-[11px] text-[#2271b1] hover:underline"
                          >
                            50%
                          </button>
                          <button
                            onClick={() => {
                              setEditWidth(Math.round(editWidth * 0.75));
                              setEditHeight(Math.round(editHeight * 0.75));
                            }}
                            className="text-[11px] text-[#2271b1] hover:underline"
                          >
                            75%
                          </button>
                        </div>

                        <div className="bg-[#f6f7f7] p-2 border border-[#ccd0d4] rounded-[2px] mt-2">
                          <p className="text-[11px] text-gray-600">
                            Tamanho actual: <strong>{formatSize(selectedFile.size || 0)}</strong>
                          </p>
                          <p className="text-[11px] text-[#2271b1]">
                            Tamanho final estimado:{" "}
                            <strong>{estimatedSize ? formatSize(estimatedSize) : "A calcular…"}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-bold text-sm border-b pb-1">Formato e optimização</h4>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="radio" checked={editFormat === "original"} onChange={() => setEditFormat("original")} />
                            <span>Manter original ({selectedFile.mimeType})</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="radio" checked={editFormat === "webp"} onChange={() => setEditFormat("webp")} />
                            <span className="font-medium text-green-700">Converter para WebP (optimizado para web)</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="radio" checked={editFormat === "jpeg"} onChange={() => setEditFormat("jpeg")} />
                            <span>Converter para JPEG</span>
                          </label>
                        </div>
                      </div>

                      <div className="pt-6 border-t flex gap-3">
                        <button
                          onClick={applyImageEdits}
                          disabled={processingImage}
                          className="px-6 py-2 bg-[#2271b1] text-white text-sm font-semibold rounded-[3px] hover:bg-[#135e96] disabled:opacity-50"
                        >
                          {processingImage ? "A processar…" : "Guardar alterações"}
                        </button>
                        <button
                          onClick={() => setIsEditingImage(false)}
                          className="px-6 py-2 border border-[#ccd0d4] text-sm font-semibold rounded-[3px] hover:bg-[#f6f7f7]"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full md:w-[300px] bg-[#f6f7f7] border-l border-[#ccd0d4] overflow-y-auto p-4 space-y-4">
              <div className="text-[12px] text-[#50575e] space-y-1">
                <p>
                  <strong>Carregado em:</strong>{" "}
                  {selectedFile.createdAt ? new Date(selectedFile.createdAt).toLocaleDateString("pt-PT") : "-"}
                </p>
                <p>
                  <strong>Nome:</strong> {selectedFile.name.split("/").pop()}
                </p>
                <p>
                  <strong>Tipo:</strong> {selectedFile.mimeType}
                </p>
                <p>
                  <strong>Tamanho:</strong> {formatSize(selectedFile.size || 0)}
                </p>
              </div>

              <hr className="border-[#ccd0d4]" />

              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#50575e]">Texto alternativo</label>
                  <textarea
                    value={metadata.alt_text}
                    onChange={(e) => setMetadata({ ...metadata, alt_text: e.target.value })}
                    className="w-full text-xs bg-white text-[#2c3338] border border-[#ccd0d4] p-1.5 focus:border-[#2271b1] outline-none h-14 rounded-[3px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#50575e]">Título</label>
                  <input
                    type="text"
                    value={metadata.title}
                    onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                    className="w-full text-xs bg-white text-[#2c3338] border border-[#ccd0d4] p-1.5 focus:border-[#2271b1] outline-none rounded-[3px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#50575e]">Legenda</label>
                  <textarea
                    value={metadata.caption}
                    onChange={(e) => setMetadata({ ...metadata, caption: e.target.value })}
                    className="w-full text-xs bg-white text-[#2c3338] border border-[#ccd0d4] p-1.5 focus:border-[#2271b1] outline-none h-14 rounded-[3px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#50575e]">Descrição</label>
                  <textarea
                    value={metadata.description}
                    onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                    className="w-full text-xs bg-white text-[#2c3338] border border-[#ccd0d4] p-1.5 focus:border-[#2271b1] outline-none h-20 rounded-[3px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#50575e]">Endereço do ficheiro</label>
                  <input
                    type="text"
                    readOnly
                    value={selectedFile.url}
                    className="w-full text-[11px] border border-[#ccd0d4] p-1.5 bg-[#f0f0f1] rounded-[3px]"
                  />
                  <button onClick={() => copyUrl(selectedFile)} className="text-[11px] text-[#2271b1] hover:underline text-left mt-1">
                    Copiar endereço
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#ccd0d4] flex justify-between items-center">
                <button onClick={() => deleteSingle(selectedFile.name)} className="text-[12px] text-[#d63638] hover:underline">
                  Enviar para a lixeira
                </button>
                <button
                  onClick={saveMetadata}
                  disabled={savingMetadata}
                  className="px-4 py-1.5 bg-[#2271b1] text-white text-sm font-semibold rounded-[3px] hover:bg-[#135e96] disabled:opacity-50"
                >
                  {savingMetadata ? "A gravar…" : "Gravar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[200] px-4 py-3 text-sm font-semibold text-white shadow-lg rounded-[3px] ${
            toast.tipo === "ok" ? "bg-navy-800" : "bg-crimson"
          }`}
        >
          {toast.texto}
        </div>
      )}
    </div>
  );
}
