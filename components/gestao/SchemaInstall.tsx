"use client";

import { useState } from "react";

const SQL_EDITOR =
  "https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new";

export default function SchemaInstall({ onCopied }: { onCopied?: () => void }) {
  const [status, setStatus] = useState("");

  const copy = async () => {
    setStatus("A copiar…");
    try {
      const res = await fetch("/api/esj-schema");
      if (!res.ok) throw new Error("Não foi possível ler o SQL.");
      const sql = await res.text();
      await navigator.clipboard.writeText(sql);
      setStatus("SQL copiado. Cole no SQL Editor e carregue Run.");
      onCopied?.();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha ao copiar.");
    }
  };

  return (
    <div className="mt-5 border border-navy-100 bg-cream p-5 text-sm">
      <p className="font-bold text-navy-900">Criar as tabelas do painel</p>
      <p className="mt-2 text-navy-900/70 leading-relaxed">
        Edital, publicações, notícias, vídeos, candidaturas e anúncios usam a
        mesma base. Ainda não existem neste projecto Supabase.
      </p>
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => void copy()}
          className="bg-navy-800 hover:bg-crimson text-white font-semibold text-xs tracking-wide px-5 py-3 transition-colors"
        >
          COPIAR SQL
        </button>
        <a
          href={SQL_EDITOR}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center border border-navy-800 text-navy-800 hover:bg-navy-800 hover:text-white font-semibold text-xs tracking-wide px-5 py-3 transition-colors"
        >
          ABRIR SQL EDITOR
        </a>
      </div>
      {status && <p className="mt-3 text-xs text-sky">{status}</p>}
    </div>
  );
}
