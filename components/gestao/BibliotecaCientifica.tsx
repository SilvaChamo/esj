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
  curso: "" as CursoBibliotecaCodigo | "",
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
  const [form, setForm] = useState({ ...vazio });
  const [selector, setSelector] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const refresh = () => {
    listBibliotecaCientifica(curso)
      .then((rows) => {
        setItems(rows);
        setSelectedIds(new Set());
        setMissing(false);
      })
      .catch((error) => {
        if (isMissingTable(error)) setMissing(true);
        else setMissing(false);
        setItems([]);
        setSelectedIds(new Set());
        if (!isMissingTable(error)) onAction(cmsError(error));
      });
  };

  useEffect(() => {
    refresh();
  }, [curso]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(items.map((r) => r.id)));
  };

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
    setForm({ ...vazio });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) {
      onAction("Indique o título do projecto.");
      return;
    }
    if (!form.curso) {
      onAction("Seleccione o curso.");
      return;
    }
    setBusy(true);
    try {
      await guardarBibliotecaCientifica(
        {
          titulo: form.titulo,
          curso: form.curso,
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
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(row.id);
        return next;
      });
      onAction("O projecto foi eliminado.");
      refresh();
    } catch (error) {
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  const eliminarSelected = async () => {
    if (selectedIds.size === 0) return;
    if (
      !window.confirm(
        `Eliminar permanentemente ${selectedIds.size} projecto(s) seleccionado(s)?`
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      for (const id of Array.from(selectedIds)) {
        await eliminarBibliotecaCientifica(id);
      }
      if (ler && selectedIds.has(ler.id)) setLer(null);
      setSelectedIds(new Set());
      onAction("Os projectos seleccionados foram eliminados.");
      refresh();
    } catch (error) {
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  const baixarSelected = async () => {
    const escolhidos = items.filter((r) => selectedIds.has(r.id) && r.ficheiro);
    if (escolhidos.length === 0) {
      onAction("Os seleccionados não têm ficheiro para baixar.");
      return;
    }
    for (const row of escolhidos) {
      const url = row.ficheiro!;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        const nome =
          url.split("?")[0].split("/").pop() ||
          `${row.titulo.slice(0, 40).replace(/[^\w\-]+/g, "_")}.pdf`;
        a.download = nome;
        a.click();
        URL.revokeObjectURL(a.href);
      } catch {
        window.open(url, "_blank");
      }
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
        <div className="bg-white border border-navy-100">
          <table className="w-full table-fixed text-left text-sm">
            <thead className="bg-cream text-[11px] font-bold tracking-widest text-navy-900/55">
              <tr>
                <th className="px-2 py-2.5 w-10 text-center align-middle">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === items.length && items.length > 0}
                    onChange={toggleSelectAll}
                    className="h-3.5 w-3.5 cursor-pointer accent-sky"
                    title="Seleccionar todos"
                  />
                </th>
                <th className="px-3 py-2.5 text-left">
                  <span className="inline-flex items-center gap-3 flex-wrap">
                    <span>Título</span>
                    {selectedIds.size > 0 && (
                      <span className="inline-flex items-center gap-3 font-semibold tracking-normal normal-case text-[12px]">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={() => !busy && void baixarSelected()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              if (!busy) void baixarSelected();
                            }
                          }}
                          className={`cursor-pointer hover:underline ${busy ? "opacity-50 pointer-events-none" : "text-sky"}`}
                        >
                          Baixar
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={() => !busy && void eliminarSelected()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              if (!busy) void eliminarSelected();
                            }
                          }}
                          className={`cursor-pointer hover:underline ${busy ? "opacity-50 pointer-events-none" : "text-crimson"}`}
                        >
                          Eliminar
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedIds(new Set())}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedIds(new Set());
                            }
                          }}
                          className="cursor-pointer text-navy-900/55 hover:underline"
                        >
                          Cancelar
                        </span>
                      </span>
                    )}
                  </span>
                </th>
                <th className="px-3 py-2.5 text-center whitespace-nowrap w-[9rem]">N.º estudante</th>
                <th className="px-3 py-2.5 text-center whitespace-nowrap w-[11rem]">Tipo</th>
                <th className="px-3 py-2.5 text-center whitespace-nowrap w-[4rem]">Ano</th>
                <th className="px-3 py-2.5 text-center whitespace-nowrap w-[10rem]">Avaliador</th>
                <th className="px-3 py-2.5 text-center whitespace-nowrap w-[7.5rem]">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
                {items.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`align-top ${
                      selectedIds.has(row.id) ? "bg-sky/5" : idx % 2 === 1 ? "bg-slate-100/70" : ""
                    }`}
                  >
                    <td className="px-2 pt-3 pb-2.5 text-center align-top">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        className="mt-0.5 h-3.5 w-3.5 cursor-pointer accent-sky"
                      />
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-navy-900 text-left align-top">
                      <span className="flex items-start gap-2 min-w-0">
                        <span className="line-clamp-2 break-words leading-snug" title={row.titulo}>
                          {row.titulo}
                        </span>
                        {!row.ficheiro ? (
                          <span className="text-[11px] font-normal text-crimson whitespace-nowrap shrink-0 pt-0.5">
                            Sem PDF
                          </span>
                        ) : null}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-navy-900/70 whitespace-nowrap text-center align-top">
                      {row.numero_estudante || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-navy-900/70 whitespace-nowrap text-center align-top">
                      {TIPOS.find((t) => t.id === row.tipo)?.label ?? row.tipo}
                    </td>
                    <td className="px-3 py-2.5 text-navy-900/70 whitespace-nowrap text-center align-top">{row.ano}</td>
                    <td
                      className="px-3 py-2.5 text-navy-900/70 whitespace-nowrap text-center truncate align-top"
                      title={row.avaliador || undefined}
                    >
                      {row.avaliador || "—"}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-center align-top">
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
              {editar ? "Editar projecto" : "Novo projecto"}
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
                <Campo label="CURSO">
                  <select
                    value={form.curso}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        curso: e.target.value as CursoBibliotecaCodigo | "",
                      }))
                    }
                    className="esj-field"
                    required
                  >
                    <option value="">Seleccione o curso…</option>
                    {CURSOS_BIBLIOTECA.map((c) => (
                      <option key={c.codigo} value={c.codigo}>
                        {c.titulo}
                      </option>
                    ))}
                  </select>
                </Campo>
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
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
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
              </div>

              <Campo label="AUTOR(ES)">
                <input
                  value={form.autores}
                  onChange={(e) => setForm((f) => ({ ...f, autores: e.target.value }))}
                  className="esj-field"
                  placeholder="Separados por vírgula"
                />
              </Campo>

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
