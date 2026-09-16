"use client";

import { useEffect, useState } from "react";

const SQL_EDITOR =
  "https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new";

export default function SchemaInstall({
  onCopied,
  onVerificar,
  sqlPath = "/esj-schema.sql",
  titulo = "Criar as tabelas do painel",
  descricao = "Edital, publicações, notícias, vídeos, biblioteca científica, candidaturas e anúncios usam a mesma base. Ainda não existem neste projecto Supabase.",
}: {
  onCopied?: () => void;
  onVerificar?: () => void;
  sqlPath?: string;
  titulo?: string;
  descricao?: string;
}) {
  const [status, setStatus] = useState("");
  const [sql, setSql] = useState("");
  const [erroSql, setErroSql] = useState("");
  const [mostrarSql, setMostrarSql] = useState(false);
  const [fechado, setFechado] = useState(false);

  useEffect(() => {
    let cancelado = false;
    void fetch(sqlPath)
      .then(async (res) => {
        if (!res.ok) throw new Error("Não foi possível ler o SQL.");
        const texto = await res.text();
        if (!cancelado) setSql(texto);
      })
      .catch((error) => {
        if (!cancelado) {
          setErroSql(error instanceof Error ? error.message : "Falha ao ler o SQL.");
        }
      });
    return () => {
      cancelado = true;
    };
  }, [sqlPath]);

  const copy = async () => {
    setStatus("A copiar…");
    try {
      const texto =
        sql ||
        (await fetch(sqlPath).then(async (res) => {
          if (!res.ok) throw new Error("Não foi possível ler o SQL.");
          return res.text();
        }));
      await navigator.clipboard.writeText(texto);
      setStatus("SQL copiado. Cole no SQL Editor do Supabase (não neste formulário) e carregue Run.");
      onCopied?.();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha ao copiar.");
    }
  };

  if (fechado) return null;

  return (
    <div className="mb-6 border border-amber-300 bg-amber-50 p-5 text-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-bold text-navy-900">{titulo}</p>
          <p className="mt-2 text-navy-900/70 leading-relaxed">{descricao}</p>
          <p className="mt-2 text-xs text-navy-900/55 leading-relaxed">
            Isto não é o resumo do projecto. O SQL corre só no Supabase → SQL Editor.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFechado(true)}
          className="shrink-0 text-xs font-bold text-navy-900/50 hover:text-navy-900"
        >
          Fechar
        </button>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void copy()}
          disabled={!sql}
          className="bg-navy-800 hover:bg-crimson disabled:opacity-50 text-white font-semibold text-xs tracking-wide px-5 py-3 transition-colors"
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
        {onVerificar ? (
          <button
            type="button"
            onClick={() => {
              setStatus("A verificar a tabela…");
              onVerificar();
            }}
            className="inline-flex items-center justify-center border border-sky text-sky hover:bg-sky hover:text-white font-semibold text-xs tracking-wide px-5 py-3 transition-colors"
          >
            JÁ CORRI O SQL — VERIFICAR
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setMostrarSql((v) => !v)}
          className="inline-flex items-center justify-center border border-navy-200 text-navy-900/70 font-semibold text-xs tracking-wide px-5 py-3"
        >
          {mostrarSql ? "Esconder SQL" : "Ver SQL"}
        </button>
      </div>

      {erroSql ? <p className="mt-3 text-xs text-crimson">{erroSql}</p> : null}

      {mostrarSql && sql ? (
        <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap break-words border border-navy-100 bg-white p-4 font-mono text-[11px] leading-relaxed text-navy-900/80">
          {sql}
        </pre>
      ) : null}

      {status && <p className="mt-3 text-xs text-sky">{status}</p>}
    </div>
  );
}
