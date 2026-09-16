"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, FileText, ImageIcon, Upload, X } from "lucide-react";
import { cmsError, listMediaGaleria, uploadMedia, type MediaFile } from "@/lib/cms";

function eImagemNome(nome: string, mime?: string | null) {
  if (mime?.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|gif|avif|bmp)$/i.test(nome.split("?")[0]);
}

interface ImageSelectorProps {
  onSelect?: (url: string) => void;
  onSelectMany?: (urls: string[]) => void;
  onClose: () => void;
  initialTab?: "upload" | "galeria";
  titulo?: string;
  accept?: string;
  pasta?: string;
  multiple?: boolean;
}

export default function ImageSelector({
  onSelect,
  onSelectMany,
  onClose,
  initialTab = "upload",
  titulo = "Imagem de destaque",
  accept = "image/*",
  pasta = "galeria",
  multiple = false,
}: ImageSelectorProps) {
  const [tab, setTab] = useState<"upload" | "galeria">(initialTab);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [escolhidas, setEscolhidas] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const soImagens = accept === "image/*";
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loadingGaleria, setLoadingGaleria] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (tab !== "galeria" || files.length > 0) return;
    setLoadingGaleria(true);
    listMediaGaleria()
      .then(setFiles)
      .catch((err) => setError(cmsError(err)))
      .finally(() => setLoadingGaleria(false));
  }, [tab, files.length]);

  // Enquanto carrega: não fechar com Escape
  useEffect(() => {
    if (!uploading) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") e.preventDefault();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [uploading]);

  const tentarFechar = () => {
    if (uploading) return;
    onClose();
  };

  const carregarFicheiros = async (lista: File[]) => {
    if (!lista.length || uploading) return;
    setUploading(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const file of lista) {
        urls.push(await uploadMedia(file, pasta));
      }
      if (multiple && onSelectMany) onSelectMany(urls);
      else if (onSelect) onSelect(urls[0]);
      onClose();
    } catch (err) {
      setError(cmsError(err));
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lista = Array.from(e.target.files || []);
    e.target.value = "";
    if (!lista.length) return;
    void carregarFicheiros(lista);
  };

  const toggleGaleria = (url: string) => {
    if (uploading) return;
    if (!multiple) {
      onSelect?.(url);
      onClose();
      return;
    }
    setEscolhidas((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const confirmarGaleria = () => {
    if (uploading || !escolhidas.length) return;
    if (multiple && onSelectMany) onSelectMany(escolhidas);
    else if (onSelect) onSelect(escolhidas[0]);
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-[#ccd0d4] bg-white shrink-0">
        <h2 className="text-[18px] font-semibold text-[#1d2327]">{titulo}</h2>
        <button
          type="button"
          onClick={tentarFechar}
          disabled={uploading}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Fechar"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex border-b border-[#ccd0d4] bg-white shrink-0">
        <button
          type="button"
          disabled={uploading}
          onClick={() => setTab("upload")}
          className={`px-6 py-3 text-[13px] font-medium transition-all disabled:opacity-50 ${
            tab === "upload" ? "border-b-2 border-[#2271b1] text-[#2271b1]" : "text-[#50575e] hover:text-[#2271b1]"
          }`}
        >
          Carregar do computador
        </button>
        <button
          type="button"
          disabled={uploading}
          onClick={() => setTab("galeria")}
          className={`px-6 py-3 text-[13px] font-medium transition-all disabled:opacity-50 ${
            tab === "galeria" ? "border-b-2 border-[#2271b1] text-[#2271b1]" : "text-[#50575e] hover:text-[#2271b1]"
          }`}
        >
          Galeria do sítio
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col bg-[#f0f0f1]">
        {tab === "upload" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
              <div className="mb-6 p-12 border-2 border-dashed border-[#ccd0d4] rounded-lg bg-white/50 flex flex-col items-center">
                <Upload className={`w-12 h-12 text-[#ccd0d4] mb-4 ${uploading ? "animate-pulse" : ""}`} />
                <p className="text-[16px] text-[#3c434a] mb-4">
                  {uploading
                    ? soImagens
                      ? "A comprimir e carregar…"
                      : "A comprimir (máx. 1 MB) e anexar…"
                    : multiple
                      ? soImagens
                        ? "Escolha uma ou mais fotos do computador"
                        : "Escolha um ou mais ficheiros do computador"
                      : soImagens
                        ? "Escolha uma foto do computador"
                        : "Escolha um ficheiro do computador"}
                </p>
                <label
                  className={`inline-flex items-center gap-2 px-6 py-2.5 bg-[#2271b1] text-white rounded-[4px] text-[13px] font-bold hover:bg-[#135e96] cursor-pointer transition-all shadow-sm ${
                    uploading ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <span>
                    {uploading
                      ? "Aguarde…"
                      : multiple
                        ? "Seleccionar ficheiros"
                        : "Seleccionar ficheiro"}
                  </span>
                  <input
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    className="hidden"
                    disabled={uploading}
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
            {error ? <p className="mt-4 text-sm text-[#d63638] max-w-md text-center">{error}</p> : null}
          </div>
        ) : (
          <div className="flex-1 p-4">
            {loadingGaleria ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 animate-pulse" />
                ))}
              </div>
            ) : files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#8c8f94] text-center">
                <ImageIcon className="w-10 h-10 mb-2" />
                {soImagens ? "Ainda sem fotos na galeria do sítio." : "Ainda sem ficheiros na galeria do sítio."}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {files.map((file) => {
                  const activo = escolhidas.includes(file.url);
                  return (
                    <button
                      type="button"
                      key={file.name}
                      disabled={uploading}
                      onClick={() => toggleGaleria(file.url)}
                      className={`aspect-square relative bg-white border overflow-hidden transition-all disabled:opacity-50 ${
                        activo
                          ? "border-[#2271b1] ring-[3px] ring-[#2271b1] ring-inset"
                          : "border-[#ccd0d4] hover:ring-[3px] hover:ring-[#2271b1] hover:ring-inset"
                      }`}
                      title={file.name.split("/").pop()}
                    >
                      {eImagemNome(file.name, file.mimeType) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={file.url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 bg-[#f6f7f7]">
                          <FileText className="w-7 h-7 text-[#8c8f94]" />
                          <span className="text-[10px] text-[#50575e] text-center break-all line-clamp-3">
                            {file.name.split("/").pop()}
                          </span>
                        </span>
                      )}
                      {multiple && activo && (
                        <span className="absolute top-1.5 right-1.5 w-6 h-6 bg-[#2271b1] text-white flex items-center justify-center">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[#ccd0d4] bg-[#f6f7f7] flex justify-between items-center gap-3 shrink-0">
        <div className="text-xs text-[#50575e]">
          {uploading
            ? "Aguarde o anexo concluir. A janela fecha automaticamente."
            : tab === "upload"
              ? soImagens
                ? "A foto é comprimida automaticamente (~50 KB) e fica também na Galeria."
                : "O documento é comprimido automaticamente (máx. 1 MB) e anexado de imediato."
              : multiple
                ? escolhidas.length
                  ? `${escolhidas.length} foto${escolhidas.length === 1 ? "" : "s"} seleccionada${escolhidas.length === 1 ? "" : "s"}.`
                  : "Seleccione uma ou mais fotos já usadas no sítio."
                : soImagens
                  ? "Escolha uma foto já usada no sítio."
                  : "Escolha um ficheiro já usado no sítio."}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {tab === "galeria" && multiple && (
            <button
              type="button"
              disabled={!escolhidas.length || uploading}
              onClick={confirmarGaleria}
              className="px-6 py-2 bg-[#2271b1] text-white text-[13px] font-bold rounded-[4px] hover:bg-[#135e96] disabled:opacity-50 transition-all"
            >
              Usar seleccionadas
            </button>
          )}
          <button
            type="button"
            onClick={tentarFechar}
            disabled={uploading}
            className="px-6 py-2 bg-white border border-[#ccd0d4] text-[#50575e] text-[13px] font-bold rounded-[4px] hover:bg-[#f0f0f1] transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
