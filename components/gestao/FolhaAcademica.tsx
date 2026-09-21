"use client";

import { FormEvent, useEffect, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import ImageSelector from "@/components/gestao/ImageSelector";
import SchemaInstall from "@/components/gestao/SchemaInstall";
import {
  addFolha,
  cmsError,
  deleteFolha,
  isMissingTable,
  listFolhasGestao,
  updateFolha,
} from "@/lib/cms";

type Edicao = { id: string; title: string; file_url: string; updated_at?: string };

export default function FolhaAcademica({ onAction }: { onAction: (m: string) => void }) {
  const [items, setItems] = useState<Edicao[]>([]);
  const [busy, setBusy] = useState(false);
  const [abrir, setAbrir] = useState(false);
  const [editar, setEditar] = useState<Edicao | null>(null);
  const [titulo, setTitulo] = useState("");
  const [ficheiroUrl, setFicheiroUrl] = useState("");
  const [selectorAberto, setSelectorAberto] = useState(false);
  const [missing, setMissing] = useState(false);
  const [emailOk, setEmailOk] = useState<boolean | null>(null);

  const refresh = () => {
    listFolhasGestao()
      .then((rows) => {
        setItems(rows);
        setMissing(false);
      })
      .catch((err) => {
        if (isMissingTable(err)) setMissing(true);
        else setItems([]);
      });
  };

  useEffect(() => {
    refresh();
    fetch("/api/folha")
      .then((res) => res.json())
      .then((data) => setEmailOk(Boolean(data.configurado)))
      .catch(() => setEmailOk(false));
  }, []);

  const abrirNovo = () => {
    setEditar(null);
    setTitulo("");
    setFicheiroUrl("");
    setAbrir(true);
  };

  const abrirEditar = (item: Edicao) => {
    setEditar(item);
    setTitulo(item.title);
    setFicheiroUrl(item.file_url);
    setAbrir(true);
  };

  const fechar = () => {
    setAbrir(false);
    setEditar(null);
    setFicheiroUrl("");
    setSelectorAberto(false);
  };

  const enviarAosSubscritores = async (title: string, file_url: string) => {
    const res = await fetch("/api/folha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: title, ficheiro: file_url }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "A edição foi gravada, mas o correio não saiu.");
    return data as { enviados: number; falhados: number; total: number };
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = titulo.trim();
    if (!title) {
      onAction("Indique o título da edição.");
      return;
    }
    if (!editar && !ficheiroUrl) {
      onAction("Escolha o PDF da edição.");
      return;
    }
    setBusy(true);
    try {
      const url = ficheiroUrl || editar?.file_url || "";
      const ficheiroMudou = Boolean(editar && ficheiroUrl && ficheiroUrl !== editar.file_url);
      const eNova = !editar;
      if (editar) {
        await updateFolha(editar.id, title, ficheiroMudou ? ficheiroUrl : undefined);
      } else {
        await addFolha(title, ficheiroUrl);
      }
      fechar();
      refresh();
      if ((eNova || ficheiroMudou) && emailOk) {
        const data = await enviarAosSubscritores(title, url);
        onAction(
          data.falhados
            ? `Edição gravada. Enviada a ${data.enviados} de ${data.total} subscritores.`
            : `Edição gravada e enviada a ${data.enviados} subscritor(es).`
        );
      } else {
        onAction(editar ? "A edição foi actualizada." : "A edição foi gravada.");
      }
    } catch (error) {
      if (isMissingTable(error)) setMissing(true);
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  const eliminar = async (item: Edicao) => {
    if (!window.confirm(`Eliminar «${item.title}»?`)) return;
    setBusy(true);
    try {
      await deleteFolha(item.id);
      refresh();
      onAction("A edição foi eliminada.");
    } catch (error) {
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="font-serif text-2xl font-bold text-navy-900">Folha académica</h2>
        <button
          type="button"
          onClick={abrirNovo}
          className="bg-leaf hover:bg-crimson text-white font-semibold text-xs tracking-wide px-5 py-3 transition-colors"
        >
          NOVA EDIÇÃO
        </button>
      </div>
      {missing && <SchemaInstall />}
      {emailOk === false && (
        <div className="mb-6 border border-navy-100 bg-cream p-4 text-sm text-navy-900/80 leading-relaxed">
          Para enviar as edições por correio, defina no servidor{" "}
          <span className="font-semibold">BREVO_API_KEY</span> e{" "}
          <span className="font-semibold">EMAIL_FROM</span>. As edições podem ser
          gravadas na mesma.
        </div>
      )}
      {items.length === 0 && !missing ? (
        <p className="text-sm text-navy-900/50">Ainda sem edições.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-navy-100 p-5">
              <FileText size={22} className="text-sky mb-3" />
              <p className="font-serif font-bold text-navy-900">{item.title}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={item.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[12px] text-sky hover:underline"
                >
                  PDF
                </a>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => abrirEditar(item)}
                  className="text-[12px] text-navy-900/70 hover:underline disabled:opacity-50"
                >
                  Editar
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void eliminar(item)}
                  className="text-[12px] text-crimson hover:underline disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {abrir && (
        <div className="fixed inset-0 z-[180] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white border border-navy-100 p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="font-serif text-xl font-bold text-navy-900">
                {editar ? "Editar edição" : "Nova edição"}
              </h2>
              <button type="button" onClick={fechar} className="text-navy-900/50 hover:text-navy-900">
                <X size={18} />
              </button>
            </div>
            <form className="space-y-5" onSubmit={onSubmit}>
              <label className="block">
                <span className="block text-sm font-bold text-navy-900 mb-1.5">Título</span>
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  className="esj-field"
                />
              </label>
              <div>
                <span className="block text-sm font-bold text-navy-900 mb-1.5">PDF</span>
                {ficheiroUrl ? (
                  <div className="space-y-2">
                    <p className="text-sm text-navy-900/70 break-all">
                      {decodeURIComponent(ficheiroUrl.split("/").pop()?.split("?")[0] || "PDF escolhido")}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectorAberto(true)}
                      className="text-[#2271b1] text-[13px] hover:underline underline-offset-2"
                    >
                      {editar ? "Substituir PDF" : "Trocar PDF"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectorAberto(true)}
                    className="w-full min-h-[120px] p-6 border-2 border-dashed border-[#ccd0d4] bg-white/50 flex flex-col items-center justify-center gap-2"
                  >
                    <Upload className="w-10 h-10 text-[#ccd0d4]" />
                    <span className="text-[14px] text-[#3c434a]">Escolher PDF</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-navy-900/55 leading-relaxed">
                Ao gravar uma edição nova ou um PDF novo, o correio sai para todos os
                subscritores.
              </p>
              <button
                type="submit"
                disabled={busy}
                className="bg-leaf hover:bg-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
              >
                {busy ? "A GRAVAR…" : editar ? "GUARDAR" : "PUBLICAR EDIÇÃO"}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectorAberto && (
        <ImageSelector
          titulo="PDF da Folha académica"
          accept=".pdf,application/pdf"
          pasta="folha"
          onClose={() => setSelectorAberto(false)}
          onSelect={(url) => {
            setFicheiroUrl(url);
            setSelectorAberto(false);
          }}
        />
      )}
    </div>
  );
}
