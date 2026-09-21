"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import ImageSelector from "@/components/gestao/ImageSelector";
import SchemaInstall from "@/components/gestao/SchemaInstall";
import {
  actualizarEvento,
  apagarEvento,
  criarEvento,
  eventoCmsError,
  eventoMissingTable,
  formatDataEvento,
  labelTipoEvento,
  listEventosGestao,
  type EventoDocumento,
  type EventoEsj,
  type EventoEstado,
  type EventoInput,
  type EventoTipo,
  type ProgramaItem,
} from "@/lib/eventos-esj";

type Modo = "lista" | "form";

const emptyForm = (tipo: EventoTipo): EventoInput => ({
  tipo,
  titulo: "",
  resumo: "",
  descricao: "",
  cartaz_url: "",
  data_inicio: "",
  data_fim: null,
  hora: "",
  local: "",
  convidado: "",
  oradores: "",
  programa: [],
  galeria_urls: [],
  documentos: [],
  inscricao_url: "",
  estado: "proximo",
  publicado: true,
});

export default function EventosEsjGestao({
  tipo,
  onAction,
}: {
  tipo: EventoTipo;
  onAction: (m: string) => void;
}) {
  const [lista, setLista] = useState<EventoEsj[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [modo, setModo] = useState<Modo>("lista");
  const [editarId, setEditarId] = useState<string | null>(null);
  const [form, setForm] = useState<EventoInput>(() => emptyForm(tipo));
  const [programaTexto, setProgramaTexto] = useState("");
  const [docsTexto, setDocsTexto] = useState("");
  const [busy, setBusy] = useState(false);
  const [selector, setSelector] = useState<"cartaz" | "galeria" | "doc" | null>(null);

  const carregar = () => {
    setLoading(true);
    listEventosGestao(tipo)
      .then((rows) => {
        setLista(rows);
        setMissing(false);
      })
      .catch((err) => {
        if (eventoMissingTable(err)) setMissing(true);
        setLista([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setModo("lista");
    setEditarId(null);
    setForm(emptyForm(tipo));
    carregar();
  }, [tipo]);

  const abrirNovo = () => {
    setEditarId(null);
    setForm(emptyForm(tipo));
    setProgramaTexto("");
    setDocsTexto("");
    setModo("form");
  };

  const abrirEditar = (e: EventoEsj) => {
    setEditarId(e.id);
    setForm({
      tipo: e.tipo,
      titulo: e.titulo,
      resumo: e.resumo,
      descricao: e.descricao,
      cartaz_url: e.cartaz_url,
      data_inicio: e.data_inicio,
      data_fim: e.data_fim,
      hora: e.hora,
      local: e.local,
      convidado: e.convidado,
      oradores: e.oradores,
      programa: e.programa,
      galeria_urls: e.galeria_urls,
      documentos: e.documentos,
      inscricao_url: e.inscricao_url,
      estado: e.estado,
      publicado: e.publicado,
      slug: e.slug,
    });
    setProgramaTexto(
      e.programa.map((p) => [p.dia, p.hora, p.item].filter(Boolean).join(" | ")).join("\n")
    );
    setDocsTexto(e.documentos.map((d) => `${d.titulo} | ${d.url}`).join("\n"));
    setModo("form");
  };

  const parsePrograma = (texto: string): ProgramaItem[] =>
    texto
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((linha) => {
        const partes = linha.split("|").map((p) => p.trim());
        if (partes.length >= 3) return { dia: partes[0], hora: partes[1], item: partes.slice(2).join(" | ") };
        if (partes.length === 2) return { hora: partes[0], item: partes[1] };
        return { item: partes[0] };
      });

  const parseDocs = (texto: string): EventoDocumento[] =>
    texto
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((linha) => {
        const [titulo, url] = linha.split("|").map((p) => p.trim());
        return { titulo: titulo || "Documento", url: url || titulo };
      })
      .filter((d) => d.url);

  const guardar = async () => {
    setBusy(true);
    try {
      const payload: EventoInput = {
        ...form,
        tipo,
        programa: parsePrograma(programaTexto),
        documentos: parseDocs(docsTexto),
      };
      if (editarId) {
        await actualizarEvento(editarId, payload);
        onAction("Evento actualizado.");
      } else {
        await criarEvento(payload);
        onAction("Evento criado.");
      }
      setModo("lista");
      carregar();
    } catch (err) {
      if (eventoMissingTable(err)) setMissing(true);
      onAction(eventoCmsError(err));
    } finally {
      setBusy(false);
    }
  };

  const eliminar = async (e: EventoEsj) => {
    if (!window.confirm(`Eliminar «${e.titulo}»?`)) return;
    try {
      await apagarEvento(e.id);
      onAction("Evento eliminado.");
      carregar();
    } catch (err) {
      onAction(eventoCmsError(err));
    }
  };

  if (modo === "form") {
    return (
      <div className="space-y-6">
        <button
          type="button"
          id="eventos-esj-adicionar"
          className="hidden"
          onClick={abrirNovo}
        />
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="font-serif text-xl font-bold text-navy-900">
            {editarId ? "Editar evento" : `Novo — ${labelTipoEvento(tipo)}`}
          </h2>
          <button
            type="button"
            onClick={() => setModo("lista")}
            className="text-sm text-sky font-semibold hover:underline"
          >
            ← Voltar à lista
          </button>
        </div>

        <div className="bg-white border border-navy-100 p-6 space-y-4 max-w-3xl">
          <label className="block">
            <span className="text-xs font-bold text-navy-900/70">Título</span>
            <input
              className="mt-1 w-full border border-navy-100 px-3 py-2 text-sm"
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-navy-900/70">Resumo (card)</span>
            <textarea
              className="mt-1 w-full border border-navy-100 px-3 py-2 text-sm min-h-[72px]"
              value={form.resumo}
              onChange={(e) => setForm((f) => ({ ...f, resumo: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-navy-900/70">Descrição</span>
            <textarea
              className="mt-1 w-full border border-navy-100 px-3 py-2 text-sm min-h-[120px]"
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
            />
          </label>

          <div>
            <span className="text-xs font-bold text-navy-900/70">Cartaz A4 (obrigatório)</span>
            <div className="mt-2 flex items-start gap-4">
              {form.cartaz_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.cartaz_url} alt="" className="h-40 w-auto border border-navy-100 object-contain bg-cream" />
              ) : (
                <div className="h-40 w-28 border border-dashed border-navy-200 bg-cream" />
              )}
              <button
                type="button"
                onClick={() => setSelector("cartaz")}
                className="text-sm font-semibold text-sky hover:underline"
              >
                {form.cartaz_url ? "Trocar cartaz" : "Carregar cartaz"}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-navy-900/50">
              Use o mesmo ficheiro A4 publicado no Facebook — sem redesenhar.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold text-navy-900/70">Data início</span>
              <input
                type="date"
                className="mt-1 w-full border border-navy-100 px-3 py-2 text-sm"
                value={form.data_inicio}
                onChange={(e) => setForm((f) => ({ ...f, data_inicio: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-navy-900/70">Data fim (opcional)</span>
              <input
                type="date"
                className="mt-1 w-full border border-navy-100 px-3 py-2 text-sm"
                value={form.data_fim || ""}
                onChange={(e) => setForm((f) => ({ ...f, data_fim: e.target.value || null }))}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-navy-900/70">Hora</span>
              <input
                className="mt-1 w-full border border-navy-100 px-3 py-2 text-sm"
                placeholder="14h00"
                value={form.hora}
                onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-navy-900/70">Local</span>
              <input
                className="mt-1 w-full border border-navy-100 px-3 py-2 text-sm"
                value={form.local}
                onChange={(e) => setForm((f) => ({ ...f, local: e.target.value }))}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-bold text-navy-900/70">Convidado</span>
            <input
              className="mt-1 w-full border border-navy-100 px-3 py-2 text-sm"
              value={form.convidado}
              onChange={(e) => setForm((f) => ({ ...f, convidado: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-navy-900/70">Oradores</span>
            <textarea
              className="mt-1 w-full border border-navy-100 px-3 py-2 text-sm min-h-[72px]"
              value={form.oradores}
              onChange={(e) => setForm((f) => ({ ...f, oradores: e.target.value }))}
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold text-navy-900/70">
              Programa (uma linha: hora | item — ou dia | hora | item)
            </span>
            <textarea
              className="mt-1 w-full border border-navy-100 px-3 py-2 text-sm min-h-[100px] font-mono"
              value={programaTexto}
              onChange={(e) => setProgramaTexto(e.target.value)}
              placeholder={"14h00 | Abertura\n14h30 | Conferência"}
            />
          </label>

          <div>
            <span className="text-xs font-bold text-navy-900/70">Fotos da galeria do evento</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {(form.galeria_urls || []).map((url) => (
                <button
                  key={url}
                  type="button"
                  title="Remover"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      galeria_urls: (f.galeria_urls || []).filter((u) => u !== url),
                    }))
                  }
                  className="relative h-16 w-16 border border-navy-100 overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelector("galeria")}
                className="h-16 px-3 border border-dashed border-navy-200 text-xs font-semibold text-sky"
              >
                + Fotos
              </button>
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-bold text-navy-900/70">
              Documentos (uma linha: título | url)
            </span>
            <textarea
              className="mt-1 w-full border border-navy-100 px-3 py-2 text-sm min-h-[72px] font-mono"
              value={docsTexto}
              onChange={(e) => setDocsTexto(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setSelector("doc")}
              className="mt-2 text-xs font-semibold text-sky hover:underline"
            >
              Anexar ficheiro da biblioteca/documentos
            </button>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-navy-900/70">URL de inscrição (opcional)</span>
            <input
              className="mt-1 w-full border border-navy-100 px-3 py-2 text-sm"
              value={form.inscricao_url}
              onChange={(e) => setForm((f) => ({ ...f, inscricao_url: e.target.value }))}
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold text-navy-900/70">Estado</span>
              <select
                className="mt-1 w-full border border-navy-100 px-3 py-2 text-sm"
                value={form.estado}
                onChange={(e) =>
                  setForm((f) => ({ ...f, estado: e.target.value as EventoEstado }))
                }
              >
                <option value="proximo">Próximo</option>
                <option value="realizado">Realizado</option>
              </select>
            </label>
            <label className="flex items-end gap-2 pb-2">
              <input
                type="checkbox"
                checked={form.publicado !== false}
                onChange={(e) => setForm((f) => ({ ...f, publicado: e.target.checked }))}
              />
              <span className="text-sm text-navy-900">Publicado no site</span>
            </label>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => void guardar()}
            className="bg-leaf hover:bg-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
          >
            {busy ? "A GUARDAR…" : "Guardar evento"}
          </button>
        </div>

        {selector && (
          <ImageSelector
            titulo={
              selector === "cartaz"
                ? "Cartaz A4 do evento"
                : selector === "galeria"
                  ? "Fotos do evento"
                  : "Documento do evento"
            }
            initialTab="upload"
            pasta={selector === "doc" ? "documentos" : "eventos"}
            accept={selector === "doc" ? undefined : "image/*"}
            multiple={selector === "galeria"}
            onClose={() => setSelector(null)}
            onSelect={(url) => {
              if (selector === "cartaz") setForm((f) => ({ ...f, cartaz_url: url }));
              if (selector === "doc") {
                setDocsTexto((t) => `${t ? `${t}\n` : ""}Documento | ${url}`);
              }
              setSelector(null);
            }}
            onSelectMany={(urls) => {
              if (selector === "galeria") {
                setForm((f) => ({
                  ...f,
                  galeria_urls: [...new Set([...(f.galeria_urls || []), ...urls])],
                }));
              }
              setSelector(null);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button type="button" id="eventos-esj-adicionar" className="hidden" onClick={abrirNovo} />
      {missing && <SchemaInstall sqlPath="/eventos-esj.sql" />}

      {loading ? (
        <p className="text-sm text-navy-900/50">A carregar…</p>
      ) : lista.length === 0 ? (
        <div className="bg-white border border-navy-100 px-6 py-12 text-center text-sm text-navy-900/55">
          Ainda sem eventos deste tipo. Clique em «Adicionar evento» e carregue o cartaz A4.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {lista.map((e) => (
            <article key={e.id} className="bg-white border border-navy-100 overflow-hidden flex flex-col">
              <div className="relative aspect-[3/4] bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.cartaz_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                {!e.publicado && (
                  <span className="absolute top-2 left-2 bg-navy-900/80 text-white text-[10px] font-bold px-2 py-1">
                    RASCUNHO
                  </span>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <p className="text-[10px] font-bold text-sky uppercase tracking-wide">{e.estado}</p>
                <h3 className="mt-1 font-serif font-bold text-navy-900 text-sm leading-snug line-clamp-2">
                  {e.titulo}
                </h3>
                <p className="mt-1 text-[11px] text-navy-900/55">{formatDataEvento(e.data_inicio)}</p>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-navy-100 pt-2">
                  <button
                    type="button"
                    onClick={() => abrirEditar(e)}
                    className="text-[12px] text-sky hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <Pencil size={12} /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => void eliminar(e)}
                    className="p-1.5 text-crimson hover:bg-crimson/10"
                    aria-label={`Eliminar ${e.titulo}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
