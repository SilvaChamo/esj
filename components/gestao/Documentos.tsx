"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import {
  cmsError,
  deleteMediaDocumentos,
  listMediaDocumentos,
  uploadMediaDocumento,
  type MediaFile,
} from "@/lib/cms";

function formatSize(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function Documentos() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  const notify = (tipo: "ok" | "erro", texto: string) => {
    setToast({ tipo, texto });
    window.setTimeout(() => setToast(null), 3600);
  };

  const load = () => {
    setLoading(true);
    listMediaDocumentos()
      .then(setFiles)
      .catch((err) => notify("erro", cmsError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleUpload = async (filesToUpload: FileList | null) => {
    if (!filesToUpload || filesToUpload.length === 0) return;
    setUploading(true);
    let ok = 0;
    for (const file of Array.from(filesToUpload)) {
      try {
        await uploadMediaDocumento(file);
        ok += 1;
      } catch {
        /* segue para o próximo ficheiro */
      }
    }
    if (ok > 0) {
      notify("ok", `${ok} documento(s) carregado(s).`);
      load();
    }
    setUploading(false);
  };

  const remove = async (name: string) => {
    if (!window.confirm(`Eliminar "${name.split("/").pop()}"?`)) return;
    try {
      await deleteMediaDocumentos([name]);
      setFiles((prev) => prev.filter((f) => f.name !== name));
      notify("ok", "Documento eliminado.");
    } catch (err) {
      notify("erro", cmsError(err));
    }
  };

  return (
    <div className="text-[#2c3338]">
      <div className="flex items-start justify-between gap-4 flex-wrap bg-white border border-navy-100 px-6 py-5">
        <div>
          <h2 className="font-serif text-2xl font-bold text-navy-900">Documentos</h2>
          <p className="mt-1 text-sm text-navy-900/65 leading-relaxed">
            PDFs e outros ficheiros que alimentam o sítio, fora das imagens.
          </p>
        </div>
        <label className="shrink-0 px-4 py-2.5 bg-white border border-[#2271b1] text-[#2271b1] text-sm font-semibold rounded-[3px] hover:bg-[#f6f7f7] cursor-pointer transition-colors">
          {uploading ? "A carregar…" : "Adicionar ficheiros"}
          <input
            type="file"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              handleUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center py-20 text-[#8c8f94] text-center bg-white border border-[#ccd0d4]">
          <FileText className="w-10 h-10 mb-2" />
          Ainda sem documentos. Carregue o primeiro.
        </div>
      ) : (
        <div className="mt-4 bg-white border border-[#ccd0d4] overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white text-left text-[13px] font-bold border-b border-[#ccd0d4]">
                <th className="p-3">Ficheiro</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Tamanho</th>
                <th className="p-3">Data</th>
                <th className="p-3 text-right">Acções</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.name} className="border-b border-[#f0f0f1] hover:bg-[#f6f7f7] text-[13px]">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#787c82] shrink-0" />
                      <span className="font-semibold text-[#1d2327]">{file.name.split("/").pop()}</span>
                    </div>
                  </td>
                  <td className="p-3 text-[#50575e]">{file.mimeType || "-"}</td>
                  <td className="p-3 text-[#50575e]">{formatSize(file.size || 0)}</td>
                  <td className="p-3 text-[#50575e]">
                    {file.createdAt ? new Date(file.createdAt).toLocaleDateString("pt-PT") : "-"}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a href={file.url} target="_blank" rel="noreferrer" className="text-[#2271b1] hover:underline">
                        Ver
                      </a>
                      <span className="text-[#ccd0d4]">|</span>
                      <button onClick={() => remove(file.name)} className="text-[#d63638] hover:underline">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
