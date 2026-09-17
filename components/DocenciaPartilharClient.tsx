"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { eSuperAdmin, nomeDeUser } from "@/lib/gestao-auth";
import {
  CURSOS_DOCENCIA,
  TIPOS_MATERIAL_DOCENCIA,
  adicionarMaterialDocencia,
  cmsError,
  eliminarMaterialDocencia,
  isMissingTable,
  labelTipoMaterial,
  listMateriaisDocencia,
  type CursoDocenciaSlug,
  type MaterialDocencia,
  type TipoMaterialDocencia,
} from "@/lib/docencia";
import SchemaInstall from "@/components/gestao/SchemaInstall";

type Acesso = "a-verificar" | "negado" | "permitido";

export default function DocenciaPartilharClient() {
  const [acesso, setAcesso] = useState<Acesso>("a-verificar");
  const [autor, setAutor] = useState<string | null>(null);
  const [autorId, setAutorId] = useState<string | null>(null);

  const [materiais, setMateriais] = useState<MaterialDocencia[] | null>(null);
  const [needsSchema, setNeedsSchema] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [curso, setCurso] = useState<CursoDocenciaSlug>(CURSOS_DOCENCIA[0].slug);
  const [cadeira, setCadeira] = useState("");
  const [tipo, setTipo] = useState<TipoMaterialDocencia>("pauta");
  const [titulo, setTitulo] = useState("");
  const [ficheiro, setFicheiro] = useState<File | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    void supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      // Mesmo critério de acesso do resto do painel: sessão iniciada chega
      // (sem contas de estudante ainda, "autenticado" já significa pessoal da ESJ).
      if (user) {
        setAcesso("permitido");
        setAutor(eSuperAdmin(user) ? "Administrador" : nomeDeUser(user));
        setAutorId(user.id);
      } else {
        setAcesso("negado");
      }
    });
  }, []);

  const carregar = () => {
    setLoading(true);
    listMateriaisDocencia()
      .then((rows) => {
        setNeedsSchema(rows === null);
        setMateriais(rows ?? []);
      })
      .catch((err) => setToast(cmsError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (acesso === "permitido") carregar();
  }, [acesso]);

  const cadeirasDoCurso = useMemo(
    () =>
      Array.from(
        new Set((materiais ?? []).filter((m) => m.curso === curso).map((m) => m.cadeira))
      ).sort((a, b) => a.localeCompare(b, "pt")),
    [materiais, curso]
  );

  const submeter = async () => {
    setToast(null);
    if (!ficheiro) {
      setToast("Escolha um ficheiro.");
      return;
    }
    setBusy(true);
    try {
      await adicionarMaterialDocencia({
        curso,
        cadeira,
        tipo,
        titulo,
        ficheiro,
        autor,
        autorId,
      });
      setCadeira("");
      setTitulo("");
      setFicheiro(null);
      setToast("Material partilhado.");
      carregar();
    } catch (err) {
      setToast(isMissingTable(err) ? "" : cmsError(err));
      if (isMissingTable(err)) setNeedsSchema(true);
    } finally {
      setBusy(false);
    }
  };

  const eliminar = async (m: MaterialDocencia) => {
    if (!window.confirm(`Eliminar «${m.titulo}»?`)) return;
    try {
      await eliminarMaterialDocencia(m.id);
      carregar();
    } catch (err) {
      setToast(cmsError(err));
    }
  };

  if (acesso === "a-verificar") {
    return <p className="text-sm text-navy-900/55">A verificar acesso…</p>;
  }

  if (acesso === "negado") {
    return (
      <div className="bg-white border border-navy-100 px-6 py-12 text-center text-sm text-navy-900/70">
        Esta área é reservada às contas de docente. Contacte a administração se precisar de acesso.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {needsSchema && (
        <SchemaInstall
          sqlPath="/docencia.sql"
          titulo="Criar a tabela da Docência"
          descricao="A secção Docência guarda os materiais partilhados pelos docentes. A tabela ainda não existe neste projecto Supabase."
          onVerificar={carregar}
        />
      )}

      <div className="bg-white border border-navy-100 p-6 md:p-8">
        <h2 className="font-serif text-xl font-bold text-navy-900 mb-5">Partilhar material</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-navy-900/40 mb-1.5">
              Curso
            </label>
            <select
              value={curso}
              onChange={(e) => setCurso(e.target.value as CursoDocenciaSlug)}
              className="w-full border border-navy-100 px-3 h-11 text-sm outline-none focus:border-sky bg-white"
            >
              {CURSOS_DOCENCIA.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.titulo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-navy-900/40 mb-1.5">
              Cadeira
            </label>
            <input
              value={cadeira}
              onChange={(e) => setCadeira(e.target.value)}
              list="cadeiras-existentes"
              placeholder="Ex.: Teoria da Comunicação"
              className="w-full border border-navy-100 px-3 h-11 text-sm outline-none focus:border-sky"
            />
            <datalist id="cadeiras-existentes">
              {cadeirasDoCurso.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-navy-900/40 mb-1.5">
              Tipo de material
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoMaterialDocencia)}
              className="w-full border border-navy-100 px-3 h-11 text-sm outline-none focus:border-sky bg-white"
            >
              {TIPOS_MATERIAL_DOCENCIA.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-navy-900/40 mb-1.5">
              Título
            </label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Pauta — 1.º semestre 2026"
              className="w-full border border-navy-100 px-3 h-11 text-sm outline-none focus:border-sky"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-navy-900/40 mb-1.5">
              Ficheiro
            </label>
            <input
              type="file"
              onChange={(e) => setFicheiro(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-navy-900/70"
            />
          </div>
        </div>

        {toast && <p className="mt-4 text-sm text-crimson">{toast}</p>}

        <div className="mt-6">
          <button
            type="button"
            disabled={busy}
            onClick={() => void submeter()}
            className="inline-flex items-center gap-2 h-11 px-5 bg-navy-900 text-white text-sm font-bold hover:bg-crimson disabled:opacity-60 transition-colors"
          >
            <Upload size={16} />
            {busy ? "A PARTILHAR…" : "PARTILHAR MATERIAL"}
          </button>
        </div>
      </div>

      <div className="bg-white border border-navy-100">
        <div className="px-6 py-4 border-b border-navy-100">
          <h2 className="font-serif text-lg font-bold text-navy-900">Materiais partilhados</h2>
        </div>
        {loading ? (
          <p className="px-6 py-8 text-sm text-navy-900/55">A carregar…</p>
        ) : !materiais || materiais.length === 0 ? (
          <p className="px-6 py-8 text-sm text-navy-900/55 italic">
            Ainda não partilhaste nenhum material.
          </p>
        ) : (
          <ul className="divide-y divide-navy-100">
            {materiais.map((m) => (
              <li key={m.id} className="flex items-start gap-4 px-6 py-4">
                <FileText size={18} className="shrink-0 mt-0.5 text-sky" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-sky">
                    {labelTipoMaterial(m.tipo)} · {cursoDocenciaTitulo(m.curso)} · {m.cadeira}
                  </p>
                  <p className="font-semibold text-sm text-navy-900">{m.titulo}</p>
                  <p className="mt-0.5 text-[12px] text-navy-900/50">
                    Por: {m.autor || "Docente"} ·{" "}
                    {new Date(m.createdAt).toLocaleDateString("pt-PT")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void eliminar(m)}
                  title="Eliminar material"
                  aria-label={`Eliminar ${m.titulo}`}
                  className="shrink-0 p-2 text-crimson hover:bg-cream transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function cursoDocenciaTitulo(slug: CursoDocenciaSlug) {
  return CURSOS_DOCENCIA.find((c) => c.slug === slug)?.titulo ?? slug;
}
