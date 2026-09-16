"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, FileText, ImageIcon, Upload, X } from "lucide-react";
import { cmsError, listMediaGaleria, uploadMedia, type MediaFile } from "@/lib/cms";

function eImagemNome(nome: string, mime?: string | null) {
  if (mime?.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|gif|avif|bmp)$/i.test(nome.split("?")[0]);
}

// Selector de imagem de destaque — porta da Central de Notícias do projecto
// "basededadosagro": duas vias para escolher a foto, carregar do computador
// ou ir buscar à Galeria (biblioteca de imagens) do próprio sítio.

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
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    setError("");
    if (multiple) {
      setUploadFiles(list);
      setUploadFile(null);
    } else {
      setUploadFile(list[0]);
      setUploadFiles([]);
    }
  };

  const uploadAndSelect = async () => {
    const lista = multiple ? uploadFiles : uploadFile ? [uploadFile] : [];
    if (!lista.length) return;
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
    } finally {
      setUploading(false);
    }
  };

  const toggleGaleria = (url: string) => {
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
    if (!escolhidas.length) return;
    if (multiple && onSelectMany) onSelectMany(escolhidas);
    else if (onSelect) onSelect(escolhidas[0]);
    onClose();
  };

  const temUpload = multiple ? uploadFiles.length > 0 : !!uploadFile;

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-[#ccd0d4] bg-white shrink-0">
        <h2 className="text-[18px] font-semibold text-[#1d2327]">{titulo}</h2>
        <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex border-b border-[#ccd0d4] bg-white shrink-0">
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`px-6 py-3 text-[13px] font-medium transition-all ${
            tab === "upload" ? "border-b-2 border-[#2271b1] text-[#2271b1]" : "text-[#50575e] hover:text-[#2271b1]"
          }`}
        >
          Carregar do computador
        </button>
        <button
          type="button"
          onClick={() => setTab("galeria")}
          className={`px-6 py-3 text-[13px] font-medium transition-all ${
            tab === "galeria" ? "border-b-2 border-[#2271b1] text-[#2271b1]" : "text-[#50575e] hover:text-[#2271b1]"
          }`}
        >
          Galeria do sítio
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col bg-[#f0f0f1]">
        {tab === "upload" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            {!temUpload ? (
              <div className="max-w-md w-full text-center">
                <div className="mb-6 p-12 border-2 border-dashed border-[#ccd0d4] rounded-lg bg-white/50 flex flex-col items-center">
                  <Upload className="w-12 h-12 text-[#ccd0d4] mb-4" />
                  <p className="text-[16px] text-[#3c434a] mb-4">
                    {multiple
                      ? soImagens
                        ? "Escolha uma ou mais fotos do computador"
                        : "Escolha um ou mais ficheiros do computador"
                      : soImagens
                        ? "Escolha uma foto do computador"
                        : "Escolha um ficheiro do computador"}
                  </p>
                  <label className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2271b1] text-white rounded-[4px] text-[13px] font-bold hover:bg-[#135e96] cursor-pointer transition-all shadow-sm">
                    <span>{multiple ? "Seleccionar ficheiros" : "Seleccionar ficheiro"}</span>
                    <input
                      type="file"
                      accept={accept}
                      multiple={multiple}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>
            ) : multiple ? (
              <div className="max-w-3xl w-full bg-white border border-[#ccd0d4] rounded-lg shadow-lg overflow-hidden p-6 space-y-4">
                <p className="text-sm font-semibold text-[#1d2327]">
                  {uploadFiles.length} ficheiro{uploadFiles.length === 1 ? "" : "s"} seleccionado
                  {uploadFiles.length === 1 ? "" : "s"}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[50vh] overflow-y-auto">
                  {uploadFiles.map((file, i) => (
                    <div
                      key={`${file.name}-${i}`}
                      className="aspect-square border border-[#ccd0d4] bg-gray-50 overflow-hidden flex items-center justify-center"
                    >
                      {eImagemNome(file.name, file.type) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={URL.createObjectURL(file)}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      ) : (
                        <FileText className="w-8 h-8 text-[#8c8f94]" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={uploadAndSelect}
                    disabled={uploading}
                    className="px-6 py-2.5 bg-[#2271b1] text-white text-[13px] font-bold rounded hover:bg-[#135e96] transition-all disabled:opacity-50"
                  >
                    {uploading ? "A carregar…" : "Carregar e definir"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadFiles([])}
                    disabled={uploading}
                    className="px-4 py-2 border border-[#ccd0d4] text-[#50575e] text-[13px] font-bold rounded hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl w-full bg-white border border-[#ccd0d4] rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 flex gap-6">
                  <div className="w-48 h-48 shrink-0 border border-[#ccd0d4] rounded bg-gray-50 overflow-hidden shadow-inner flex flex-col items-center justify-center p-3">
                    {uploadFile && eImagemNome(uploadFile.name, uploadFile.type) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={URL.createObjectURL(uploadFile)}
                        className="w-full h-full object-cover"
                        alt="Pré-visualização"
                      />
                    ) : (
                      <>
                        <FileText className="w-10 h-10 text-[#8c8f94] mb-2" />
                        <span className="text-[11px] text-[#50575e] text-center break-all">
                          {uploadFile?.name}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="font-bold text-[#1d2327] mb-1">{uploadFile?.name}</h3>
                      <p className="text-xs text-[#50575e]">
                        {uploadFile ? (uploadFile.size / (1024 * 1024)).toFixed(2) : "0"} MB
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        onClick={uploadAndSelect}
                        disabled={uploading}
                        className="px-6 py-2.5 bg-[#2271b1] text-white text-[13px] font-bold rounded hover:bg-[#135e96] transition-all disabled:opacity-50"
                      >
                        {uploading ? "A carregar…" : "Carregar e definir"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadFile(null)}
                        disabled={uploading}
                        className="px-4 py-2 border border-[#ccd0d4] text-[#50575e] text-[13px] font-bold rounded hover:bg-gray-50 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {error && <p className="mt-4 text-sm text-[#d63638]">{error}</p>}
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
                      onClick={() => toggleGaleria(file.url)}
                      className={`aspect-square relative bg-white border overflow-hidden transition-all ${
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
          {tab === "upload"
            ? soImagens
              ? "A foto é comprimida automaticamente (~50 KB) e fica também na Galeria."
              : "O ficheiro fica disponível no sítio."
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
              disabled={!escolhidas.length}
              onClick={confirmarGaleria}
              className="px-6 py-2 bg-[#2271b1] text-white text-[13px] font-bold rounded-[4px] hover:bg-[#135e96] disabled:opacity-50 transition-all"
            >
              Usar seleccionadas
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-white border border-[#ccd0d4] text-[#50575e] text-[13px] font-bold rounded-[4px] hover:bg-[#f0f0f1] transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
