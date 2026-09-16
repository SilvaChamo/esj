"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { Eye, Pencil, Trash2, Upload, X } from "lucide-react";
import SchemaInstall from "@/components/gestao/SchemaInstall";
import ImageSelector from "@/components/gestao/ImageSelector";
import ProjectoCientificoPainel from "@/components/ProjectoCientificoPainel";
import { cmsError, isMissingTable } from "@/lib/cms";
import {
  CURSOS_BIBLIOTECA,
  TIPOS_PROJECTO,
  type CursoBibliotecaCodigo,
  type ProjectoCientifico,
  type TipoProjecto,
} from "@/lib/producao-cientifica";
import {
  eliminarBibliotecaCientifica,
  guardarBibliotecaCientifica,
  listBibliotecaCientifica,
  type BibliotecaCientificaRow,
} from "@/lib/biblioteca-cientifica-cms";

const TIPOS = TIPOS_PROJECTO.filter((t) => t.id !== "todos") as {
  id: TipoProjecto;
  label: string;
}[];

function tipoAnexo(url: string): "pdf" | "word" | "excel" | "outro" {
  const n = url.split("?")[0].toLowerCase();
  if (/\.pdf$/i.test(n)) return "pdf";
  if (/\.(docx?|odt)$/i.test(n)) return "word";
  if (/\.(xlsx?|csv|ods)$/i.test(n)) return "excel";
  return "outro";
}

function labelTipoAnexo(tipo: ReturnType<typeof tipoAnexo>) {
  if (tipo === "pdf") return "PDF";
  if (tipo === "word") return "Word";
  if (tipo === "excel") return "Excel";
  return "Ficheiro";
}

function IconeAnexo({ tipo }: { tipo: ReturnType<typeof tipoAnexo> }) {
  const src =
    tipo === "pdf"
      ? "/icons/file-pdf.svg"
      : tipo === "word"
        ? "/icons/file-word.svg"
        : tipo === "excel"
          ? "/icons/file-excel.svg"
          : "/icons/file-generic.svg";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={36} height={48} className="h-12 w-9 shrink-0 object-contain" />
  );
}

const vazio = {
  titulo: "",
  curso: "JJ" as CursoBibliotecaCodigo,
  tipo: "monografia" as TipoProjecto,
  ramos: "",
  tutor: "",
  avaliador: "",
  numeroEstudante: "",
  ano: new Date().getFullYear(),
  autores: "",
  resumo: "",
  ficheiro: "",
};

function rowParaProjecto(row: BibliotecaCientificaRow): ProjectoCientifico {
  return {
    slug: row.slug,
    titulo: row.titulo,
    curso: row.curso,
    tipo: row.tipo,
    ramos: row.ramos,
    tutor: row.tutor,
    avaliador: row.avaliador || undefined,
    numeroEstudante: row.numero_estudante || undefined,
    ano: row.ano,
    autores: row.autores ?? [],
    resumo: row.resumo,
    ficheiro: row.ficheiro || undefined,
  };
}

function Campo({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="block text-[11px] font-bold tracking-widest text-navy-900/45 whitespace-nowrap">
        {label}
      </span>
      <div className="mt-1.5 min-w-0">{children}</div>
    </label>
  );
}

export default function BibliotecaCientificaGestao({
  onAction,
  curso,
}: {
  onAction: (m: string) => void;
  curso: CursoBibliotecaCodigo;
}) {
  const cursoInfo = CURSOS_BIBLIOTECA.find((c) => c.codigo === curso);
  const [items, setItems] = useState<BibliotecaCientificaRow[]>([]);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [abrir, setAbrir] = useState(false);
  const [ler, setLer] = useState<BibliotecaCientificaRow | null>(null);
  const [editar, setEditar] = useState<BibliotecaCientificaRow | null>(null);
  const [form, setForm] = useState({ ...vazio, curso });
  const [selector, setSelector] = useState(false);

  const refresh = () => {
    listBibliotecaCientifica(curso)
      .then((rows) => {
        setItems(rows);
        setMissing(false);
      })
      .catch((error) => {
        if (isMissingTable(error)) setMissing(true);
        else setMissing(false);
        setItems([]);
        if (!isMissingTable(error)) onAction(cmsError(error));
      });
  };

  useEffect(() => {
    refresh();
  }, [curso]);

  const abrirNovo = () => {
    setEditar(null);
    setForm({ ...vazio, curso });
    setAbrir(true);
  };

  const abrirEditar = (row: BibliotecaCientificaRow) => {
    setEditar(row);
    setForm({
      titulo: row.titulo,
      curso: row.curso,
      tipo: row.tipo,
      ramos: row.ramos,
      tutor: row.tutor,
      avaliador: row.avaliador ?? "",
      numeroEstudante: row.numero_estudante ?? "",
      ano: row.ano,
      autores: (row.autores ?? []).join(", "),
      resumo: row.resumo,
      ficheiro: row.ficheiro ?? "",
    });
    setAbrir(true);
  };

  const fechar = () => {
    setAbrir(false);
    setEditar(null);
    setForm({ ...vazio, curso });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) {
      onAction("Indique o título do projecto.");
      return;
    }
    setBusy(true);
    try {
      await guardarBibliotecaCientifica(
        {
          titulo: form.titulo,
          curso,
          tipo: form.tipo,
          ramos: form.ramos,
          tutor: form.tutor,
          avaliador: form.avaliador,
          numeroEstudante: form.numeroEstudante,
          ano: Number(form.ano) || new Date().getFullYear(),
          autores: form.autores.split(/[,;]/).map((a) => a.trim()).filter(Boolean),
          resumo: form.resumo,
          ficheiro: form.ficheiro || null,
        },
        editar?.id
      );
      onAction(editar ? "O projecto foi actualizado." : "O projecto foi publicado no acervo.");
      fechar();
      refresh();
    } catch (error) {
      if (isMissingTable(error)) setMissing(true);
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  const eliminar = async (row: BibliotecaCientificaRow) => {
    if (!window.confirm(`Eliminar «${row.titulo}»?`)) return;
    setBusy(true);
    try {
      await eliminarBibliotecaCientifica(row.id);
      onAction("O projecto foi eliminado.");
      refresh();
    } catch (error) {
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button id={`biblioteca-adicionar-${curso}`} type="button" className="hidden" onClick={abrirNovo} />
      {missing && (
        <SchemaInstall
          sqlPath="/biblioteca-cientifica.sql"
          titulo="Falta a tabela no Supabase"
          descricao="Corra o SQL no SQL Editor do Supabase. Depois clique em «Já corri o SQL — verificar». Não cole este texto no campo Resumo do projecto."
          onVerificar={() => {
            refresh();
            onAction("A verificar se a tabela já existe…");
          }}
        />
      )}

      {items.length === 0 ? (
        <p className="text-sm text-navy-900/50 leading-relaxed">
          Ainda sem projectos em {cursoInfo?.titulo ?? curso}. Clique em «Adicionar projecto» para
          publicar o primeiro.
        </p>
      ) : (
        <div className="bg-white border border-navy-100 overflow-hidden">
          <table className="w-full table-fixed text-left text-sm">
            <thead className="bg-cream text-[11px] font-bold tracking-widest text-navy-900/55">
              <tr>
                <th className="px-3 py-2.5 text-left">Título</th>
                <th className="px-3 py-2.5 text-center whitespace-nowrap w-[9rem]">N.º estudante</th>
                <th className="px-3 py-2.5 text-center whitespace-nowrap w-[11rem]">Tipo</th>
                <th className="px-3 py-2.5 text-center whitespace-nowrap w-[4rem]">Ano</th>
                <th className="px-3 py-2.5 text-center whitespace-nowrap w-[10rem]">Avaliador</th>
                <th className="px-3 py-2.5 text-center whitespace-nowrap w-[5.5rem]">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {items.map((row) => (
                <tr key={row.id} className="align-middle">
                  <td className="px-3 py-2.5 font-semibold text-navy-900 text-left">
                    <span className="flex items-start gap-2 min-w-0">
                      <span className="line-clamp-2 break-words" title={row.titulo}>
                        {row.titulo}
                      </span>
                      {!row.ficheiro ? (
                        <span className="text-[11px] font-normal text-crimson whitespace-nowrap shrink-0 pt-0.5">
                          Sem PDF
                        </span>
                      ) : null}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-navy-900/70 whitespace-nowrap text-center">
                    {row.numero_estudante || "—"}
                  </td>
                  <td className="px-3 py-2.5 text-navy-900/70 whitespace-nowrap text-center">
                    {TIPOS.find((t) => t.id === row.tipo)?.label ?? row.tipo}
                  </td>
                  <td className="px-3 py-2.5 text-navy-900/70 whitespace-nowrap text-center">{row.ano}</td>
                  <td className="px-3 py-2.5 text-navy-900/70 whitespace-nowrap text-center truncate" title={row.avaliador || undefined}>
                    {row.avaliador || "—"}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-center">
                    <div className="inline-flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setLer(row)}
                        title="Ler"
                        aria-label="Ler"
                        className="p-1 text-sky hover:text-crimson"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => abrirEditar(row)}
                        title="Editar"
                        aria-label="Editar"
                        className="p-1 text-sky hover:text-crimson"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void eliminar(row)}
                        title="Eliminar"
                        aria-label="Eliminar"
                        className="p-1 text-crimson hover:text-navy-900 disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ler && (
        <div className="fixed inset-0 z-[180] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[85vh] bg-white border border-navy-100 flex flex-col overflow-hidden">
            <ProjectoCientificoPainel
              projecto={rowParaProjecto(ler)}
              onClose={() => setLer(null)}
            />
          </div>
        </div>
      )}

      {abrir && (
        <div className="fixed inset-0 z-[180] bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={(e) => void onSubmit(e)}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-navy-100 p-6 md:p-8"
          >
            <h2 className="font-serif text-xl font-bold text-navy-900 leading-snug break-words">
              {editar ? "Editar projecto" : `Novo projecto · ${cursoInfo?.titulo ?? curso}`}
            </h2>
            <p className="mt-1 text-sm text-navy-900/55 leading-relaxed">
              Preencha os dados académicos. O PDF fica disponível no acervo público do curso.
            </p>

            <div className="mt-6 grid gap-5">
              <Campo label="TÍTULO">
                <input
                  value={form.titulo}
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                  className="esj-field"
                  required
                />
              </Campo>

              <div className="grid sm:grid-cols-2 gap-5">
                <Campo label="TIPO DE PROJECTO">
                  <select
                    value={form.tipo}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, tipo: e.target.value as TipoProjecto }))
                    }
                    className="esj-field"
                  >
                    {TIPOS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </Campo>
                <Campo label="ANO">
                  <input
                    type="number"
                    value={form.ano}
                    onChange={(e) => setForm((f) => ({ ...f, ano: Number(e.target.value) }))}
                    className="esj-field"
                    min={1990}
                    max={2100}
                    required
                  />
                </Campo>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <Campo label="N.º DE ESTUDANTE">
                  <input
                    value={form.numeroEstudante}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        numeroEstudante: e.target.value.replace(/\s+/g, "").toUpperCase(),
                      }))
                    }
                    className="esj-field"
                    placeholder="Ex.: 2018147MP"
                    inputMode="text"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <p className="mt-1.5 text-[11px] text-navy-900/45 leading-relaxed">
                    Formato ESJ: ano + número + MP (ex.: 2018147MP, 202601MP, 2027120MP).
                  </p>
                </Campo>
                <Campo label="AUTOR(ES)">
                  <input
                    value={form.autores}
                    onChange={(e) => setForm((f) => ({ ...f, autores: e.target.value }))}
                    className="esj-field"
                    placeholder="Separados por vírgula"
                  />
                </Campo>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <Campo label="TUTOR">
                  <input
                    value={form.tutor}
                    onChange={(e) => setForm((f) => ({ ...f, tutor: e.target.value }))}
                    className="esj-field"
                  />
                </Campo>
                <Campo label="AVALIADOR">
                  <input
                    value={form.avaliador}
                    onChange={(e) => setForm((f) => ({ ...f, avaliador: e.target.value }))}
                    className="esj-field"
                  />
                </Campo>
              </div>

              <Campo label="RAMOS / ÁREA">
                <input
                  value={form.ramos}
                  onChange={(e) => setForm((f) => ({ ...f, ramos: e.target.value }))}
                  className="esj-field"
                  placeholder="Ex.: Telejornalismo · Ética"
                />
              </Campo>

              <Campo label="RESUMO">
                <textarea
                  value={form.resumo}
                  onChange={(e) => setForm((f) => ({ ...f, resumo: e.target.value }))}
                  className="esj-field-area break-words"
                  rows={5}
                  placeholder="Resumo académico do trabalho (não cole SQL aqui)."
                />
                {/create table|supabase|gen_random_uuid/i.test(form.resumo) ? (
                  <p className="mt-2 text-xs text-crimson leading-relaxed">
                    Este texto parece SQL. Apague e escreva o resumo do projecto. O SQL corre só no
                    Supabase.
                    <button
                      type="button"
                      className="ml-2 font-bold underline"
                      onClick={() => setForm((f) => ({ ...f, resumo: "" }))}
                    >
                      Limpar resumo
                    </button>
                  </p>
                ) : null}
              </Campo>

              <div>
                <span className="block text-[11px] font-bold tracking-widest text-navy-900/45 whitespace-nowrap">
                  FICHEIRO (PDF, WORD OU EXCEL)
                </span>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelector(true)}
                    className="inline-flex items-center gap-2 h-11 px-4 border border-navy-200 text-sm font-bold text-navy-900/70 hover:border-sky hover:text-sky whitespace-nowrap"
                  >
                    <Upload size={15} />
                    {form.ficheiro ? "Substituir ficheiro" : "Escolher ficheiro"}
                  </button>
                  {!form.ficheiro ? (
                    <span className="text-xs text-navy-900/45">Nenhum ficheiro seleccionado</span>
                  ) : null}
                </div>
                {form.ficheiro ? (
                  <div className="mt-3 inline-flex items-center gap-3 border border-navy-100 bg-white px-3 py-2.5">
                    <IconeAnexo tipo={tipoAnexo(form.ficheiro)} />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold tracking-widest text-navy-900/40">ANEXO</p>
                      <p className="text-sm font-semibold text-navy-900">
                        {labelTipoAnexo(tipoAnexo(form.ficheiro))}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, ficheiro: "" }))}
                      className="shrink-0 p-1.5 text-navy-900/45 hover:text-crimson"
                      aria-label="Remover anexo"
                      title="Remover anexo"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-end gap-2 pt-4 border-t border-navy-100">
              <button
                type="button"
                onClick={fechar}
                className="h-11 px-5 border border-navy-200 text-sm font-bold text-navy-900/70 whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={busy}
                className="h-11 px-5 bg-navy-900 text-white text-sm font-bold hover:bg-crimson disabled:opacity-60 whitespace-nowrap"
              >
                {busy ? "A GUARDAR…" : editar ? "Guardar" : "Publicar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {selector && (
        <ImageSelector
          titulo="Documento do projecto"
          initialTab="upload"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          pasta="biblioteca"
          onClose={() => setSelector(false)}
          onSelect={(url) => {
            setForm((f) => ({ ...f, ficheiro: url }));
            setSelector(false);
          }}
        />
      )}
    </div>
  );
}
