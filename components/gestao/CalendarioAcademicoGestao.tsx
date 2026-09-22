"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import {
  CALENDARIO_2026_DEFAULT,
  readCalendarioDetalhado,
  writeCalendarioDetalhado,
  labelCategoriaCalendario,
  MESES,
  DIAS_SEMANA,
  parseISO,
  chaveDia,
  construirDias,
  diaEstaNoIntervalo,
  diasPartilhamEvento,
  formatarDataPt,
  type CalendarioAcademicoAnual,
  type CategoriaEventoCalendario,
  type EventoCalendarioDetalhado,
} from "@/lib/calendario-detalhado";

const CATEGORIAS: { value: CategoriaEventoCalendario; label: string }[] = [
  { value: "exame", label: "Exames & Avaliações" },
  { value: "feriado", label: "Feriado Nacional" },
  { value: "festival", label: "Festival / Cerimónia" },
  { value: "ferias", label: "Férias Académicas" },
  { value: "inscricao", label: "Inscrições & Matrículas" },
  { value: "academico", label: "Actividade Académica" },
];

const CATEGORIA_OUTRA = "__outra__";

export default function CalendarioAcademicoGestao({ onAction }: { onAction: (m: string) => void }) {
  const [dados, setDados] = useState<CalendarioAcademicoAnual>(CALENDARIO_2026_DEFAULT);
  useEffect(() => {
    setDados(readCalendarioDetalhado());
  }, []);

  const ano = Number(dados.anoLectivo) || new Date().getFullYear();
  const hojeKey = chaveDia(new Date());
  const hoje = new Date();

  const [mesSelecionado, setMesSelecionado] = useState(() =>
    hoje.getFullYear() === ano ? hoje.getMonth() : 0,
  );
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);

  // Modal de criação/edição de uma data comemorativa
  const [diaModal, setDiaModal] = useState<string | null>(null);
  const [eventoEditId, setEventoEditId] = useState<string | null>(null);
  const [formTitulo, setFormTitulo] = useState("");
  const [formCategoria, setFormCategoria] = useState<string>("academico");
  const [formCategoriaOutra, setFormCategoriaOutra] = useState("");
  const [formDataFim, setFormDataFim] = useState("");
  const [formDataRepresentativa, setFormDataRepresentativa] = useState("");
  const [formDescricao, setFormDescricao] = useState("");

  const eventosPorDia = useMemo(() => {
    const mapa = new Map<string, EventoCalendarioDetalhado[]>();
    for (const ev of dados.eventos) {
      const inicio = parseISO(ev.dataInicio);
      const fim = ev.dataFim ? parseISO(ev.dataFim) : inicio;
      const diaAtual = new Date(inicio);
      while (diaAtual <= fim) {
        const key = chaveDia(diaAtual);
        const lista = mapa.get(key) ?? [];
        lista.push(ev);
        mapa.set(key, lista);
        diaAtual.setDate(diaAtual.getDate() + 1);
      }
    }
    return mapa;
  }, [dados]);

  const mesesComDias = useMemo(
    () => MESES.map((nome, mesIndex) => ({ nome, mesIndex, dias: construirDias(ano, mesIndex) })),
    [ano],
  );

  const diasDoMesSelecionado = useMemo(
    () => construirDias(ano, mesSelecionado),
    [ano, mesSelecionado],
  );

  const eventosDoMesSelecionado = useMemo(() => {
    const inicioGrade = diasDoMesSelecionado[0];
    const fimGrade = diasDoMesSelecionado[diasDoMesSelecionado.length - 1];
    return dados.eventos
      .filter((ev) => {
        const inicio = parseISO(ev.dataInicio);
        const fim = ev.dataFim ? parseISO(ev.dataFim) : inicio;
        return fim >= inicioGrade && inicio <= fimGrade;
      })
      .sort((a, b) => a.dataInicio.localeCompare(b.dataInicio));
  }, [dados, diasDoMesSelecionado]);

  function selecionarMes(mesIndex: number) {
    setMesSelecionado(mesIndex);
    setDiaSelecionado(null);
  }

  function iniciarNovo(key: string) {
    setEventoEditId(null);
    setFormTitulo("");
    setFormCategoria("academico");
    setFormCategoriaOutra("");
    setFormDataFim("");
    setFormDataRepresentativa(formatarDataPt(key));
    setFormDescricao("");
  }

  function iniciarEdicao(ev: EventoCalendarioDetalhado) {
    setDiaModal(ev.dataInicio);
    setEventoEditId(ev.id);
    setFormTitulo(ev.titulo);
    const conhecida = CATEGORIAS.some((c) => c.value === ev.categoria);
    setFormCategoria(conhecida ? ev.categoria : CATEGORIA_OUTRA);
    setFormCategoriaOutra(conhecida ? "" : ev.categoria);
    setFormDataFim(ev.dataFim ?? "");
    setFormDataRepresentativa(ev.dataRepresentativa);
    setFormDescricao(ev.descricao);
  }

  function abrirDia(key: string) {
    setDiaSelecionado(key);
    setDiaModal(key);
    iniciarNovo(key);
  }

  function fecharModal() {
    setDiaModal(null);
    setEventoEditId(null);
  }

  function guardarEvento(e: FormEvent) {
    e.preventDefault();
    const categoria = formCategoria === CATEGORIA_OUTRA ? formCategoriaOutra.trim() : formCategoria;
    if (!formTitulo.trim() || !diaModal) {
      onAction("Indique o título da data comemorativa.");
      return;
    }
    if (!categoria) {
      onAction("Escreva o nome da categoria.");
      return;
    }
    const eventoBase: EventoCalendarioDetalhado = {
      id: eventoEditId ?? `ev-${Date.now()}`,
      titulo: formTitulo.trim(),
      categoria,
      dataInicio: diaModal,
      dataFim: formDataFim || undefined,
      dataRepresentativa: formDataRepresentativa.trim() || formatarDataPt(diaModal),
      descricao: formDescricao.trim(),
      destaque: true,
    };
    const eventos = eventoEditId
      ? dados.eventos.map((ev) => (ev.id === eventoEditId ? eventoBase : ev))
      : [...dados.eventos, eventoBase];
    const atualizado: CalendarioAcademicoAnual = { ...dados, eventos };
    setDados(atualizado);
    writeCalendarioDetalhado(atualizado);
    onAction(eventoEditId ? "Data comemorativa actualizada." : "Data comemorativa adicionada ao calendário.");
    iniciarNovo(diaModal);
  }

  function eliminarEvento(id: string) {
    if (!window.confirm("Eliminar esta data comemorativa do calendário?")) return;
    const atualizado: CalendarioAcademicoAnual = {
      ...dados,
      eventos: dados.eventos.filter((ev) => ev.id !== id),
    };
    setDados(atualizado);
    writeCalendarioDetalhado(atualizado);
    onAction("Data comemorativa eliminada.");
    if (eventoEditId === id && diaModal) iniciarNovo(diaModal);
  }

  const eventosDoDiaModal = diaModal ? eventosPorDia.get(diaModal) ?? [] : [];

  return (
    <div className="lg:grid lg:grid-cols-[3fr_1fr] lg:gap-5 lg:items-start -mt-4 sm:-mt-5 pt-10">
      <div className="bg-white border border-navy-100 p-6">
        <div className="flex items-center justify-between -mx-6 -mt-6 mb-6 px-6 h-16 bg-navy-50 border-b border-navy-100">
          <h2 className="font-serif text-base font-bold text-navy-900">
            Calendário Académico {ano}
          </h2>
          <button
            type="button"
            onClick={() => selecionarMes(hoje.getFullYear() === ano ? hoje.getMonth() : 0)}
            className="text-xs font-semibold text-navy-900/60 hover:text-crimson hover:border-crimson/40 border border-navy-200 rounded px-3 py-1.5 transition-colors bg-white shrink-0"
          >
            Hoje
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8">
          {mesesComDias.map(({ nome, mesIndex, dias }) => {
            const selecionado = mesSelecionado === mesIndex;
            return (
              <div
                key={nome}
                role="button"
                tabIndex={0}
                onClick={() => selecionarMes(mesIndex)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selecionarMes(mesIndex);
                  }
                }}
                className="cursor-pointer select-none"
              >
                <p
                  className={`font-serif font-bold text-sm leading-none mb-2 transition-colors ${
                    selecionado ? "text-crimson underline underline-offset-2" : "text-crimson/90"
                  }`}
                >
                  {nome}
                </p>
                <div className="grid grid-cols-7 gap-y-2">
                  {DIAS_SEMANA.map((d, i) => (
                    <span key={i} className="text-left text-[9px] text-navy-900/40 pb-1">
                      {d}
                    </span>
                  ))}
                  {dias.map((dia, i) => {
                    const key = chaveDia(dia);
                    const noMes = dia.getMonth() === mesIndex;
                    const fimDeSemana = dia.getDay() === 0 || dia.getDay() === 6;
                    const temEvento = eventosPorDia.has(key);
                    const ehHoje = key === hojeKey;
                    const diaAnterior = dias[i - 1];
                    const diaSeguinte = dias[i + 1];
                    const ligaEsquerda =
                      temEvento &&
                      dia.getDay() !== 0 &&
                      !!diaAnterior &&
                      diasPartilhamEvento(eventosPorDia, key, chaveDia(diaAnterior));
                    const ligaDireita =
                      temEvento &&
                      dia.getDay() !== 6 &&
                      !!diaSeguinte &&
                      diasPartilhamEvento(eventosPorDia, key, chaveDia(diaSeguinte));
                    return (
                      <div key={key} className="flex flex-col items-start gap-0.5">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] leading-none ${
                            ehHoje
                              ? "bg-crimson text-white font-bold"
                              : !noMes
                                ? "text-navy-900/20"
                                : fimDeSemana && !temEvento
                                  ? "text-navy-900/45"
                                  : "text-navy-900 font-semibold"
                          }`}
                        >
                          {dia.getDate()}
                        </span>
                        <div className="relative h-1 w-full">
                          {ligaEsquerda && (
                            <span
                              className="absolute left-1 top-1/2 h-px w-1.5 -translate-y-1/2 bg-crimson/35"
                              aria-hidden
                            />
                          )}
                          {ligaDireita && (
                            <span
                              className="absolute left-2.5 right-1 top-1/2 h-px -translate-y-1/2 bg-crimson/35"
                              aria-hidden
                            />
                          )}
                          <span
                            className={`absolute left-2.5 top-1/2 z-10 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full ${temEvento ? "bg-crimson/60" : "bg-transparent"}`}
                            aria-hidden
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <aside className="mt-10 lg:mt-0 lg:sticky lg:top-24 bg-white border border-navy-100 p-6">
        <p className="flex items-center -mx-6 -mt-6 mb-4 px-6 h-16 bg-navy-50 border-b border-navy-100 font-serif font-bold text-navy-900 text-base">
          {MESES[mesSelecionado]} {ano}
        </p>
        <div className="rounded-xl border border-navy-100 p-3">
          <div className="grid grid-cols-7 text-center">
            {DIAS_SEMANA.map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-navy-900/40 uppercase tracking-wide pb-1.5">
                {d}
              </span>
            ))}
            {diasDoMesSelecionado.map((dia, i) => {
              const key = chaveDia(dia);
              const noMes = dia.getMonth() === mesSelecionado;
              const eventosNoDia = eventosPorDia.get(key);
              const temEvento = !!eventosNoDia?.length;
              const ehHoje = key === hojeKey;
              const ehSelecionado = key === diaSelecionado;
              const diaAnterior = diasDoMesSelecionado[i - 1];
              const diaSeguinte = diasDoMesSelecionado[i + 1];
              const ligaEsquerda =
                temEvento &&
                dia.getDay() !== 0 &&
                !!diaAnterior &&
                diasPartilhamEvento(eventosPorDia, key, chaveDia(diaAnterior));
              const ligaDireita =
                temEvento &&
                dia.getDay() !== 6 &&
                !!diaSeguinte &&
                diasPartilhamEvento(eventosPorDia, key, chaveDia(diaSeguinte));

              return (
                <div key={key} className="flex flex-col items-center gap-1 py-1">
                  <button
                    type="button"
                    onClick={() => abrirDia(key)}
                    aria-label={
                      temEvento
                        ? `${dia.getDate()} de ${MESES[mesSelecionado]}: ${eventosNoDia!
                            .map((ev) => ev.titulo)
                            .join(", ")}`
                        : `Adicionar data comemorativa a ${dia.getDate()} de ${MESES[mesSelecionado]}`
                    }
                    className="flex p-0 bg-transparent border-0"
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                        ehHoje
                          ? "bg-crimson text-white font-bold"
                          : ehSelecionado
                            ? "ring-1 ring-crimson font-bold text-navy-900"
                            : noMes
                              ? "text-navy-900"
                              : "text-navy-900/25"
                      }`}
                    >
                      {dia.getDate()}
                    </span>
                  </button>
                  <div className="relative flex h-1.5 w-full items-center justify-center">
                    {ligaEsquerda && (
                      <span
                        className="absolute left-[15%] top-1/2 h-px w-[35%] -translate-y-1/2 bg-crimson/35"
                        aria-hidden
                      />
                    )}
                    {ligaDireita && (
                      <span
                        className="absolute left-1/2 top-1/2 h-px w-[35%] -translate-y-1/2 bg-crimson/35"
                        aria-hidden
                      />
                    )}
                    <span
                      className={`relative z-10 h-1.5 w-1.5 rounded-full ${temEvento ? "bg-crimson/60" : "bg-transparent"}`}
                      aria-hidden
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-navy-100">
          {eventosDoMesSelecionado.length === 0 ? (
            <p className="text-xs text-navy-900/50">Sem datas assinaladas neste mês.</p>
          ) : (
            <ul className="space-y-4">
              {eventosDoMesSelecionado.map((ev) => {
                const cat = labelCategoriaCalendario(ev.categoria);
                const destacado = diaSelecionado ? diaEstaNoIntervalo(ev, diaSelecionado) : false;
                return (
                  <li
                    key={ev.id}
                    className={`flex gap-3 p-2 -m-2 rounded transition-colors ${
                      destacado ? "bg-crimson/5 ring-1 ring-crimson/30" : ""
                    }`}
                  >
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-crimson shrink-0" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-bold border rounded ${cat.bg} ${cat.color}`}
                        >
                          {cat.label}
                        </span>
                        <span className="text-[11px] font-bold text-navy-900/60">{ev.dataRepresentativa}</span>
                      </div>
                      <h4 className="font-serif font-bold text-navy-900 text-sm">{ev.titulo}</h4>
                      {ev.descricao && (
                        <p className="text-xs text-navy-900/60 mt-0.5 leading-relaxed">{ev.descricao}</p>
                      )}
                      <div className="mt-1.5 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => iniciarEdicao(ev)}
                          className="text-[11px] text-sky hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarEvento(ev.id)}
                          className="text-[11px] text-crimson hover:underline"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {diaModal && (
        <div className="fixed inset-0 z-[180] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white border border-navy-100 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-1">
              <h2 className="font-serif text-xl font-bold text-navy-900">
                {eventoEditId ? "Editar data comemorativa" : "Nova data comemorativa"}
              </h2>
              <button type="button" onClick={fecharModal} className="text-navy-900/50 hover:text-navy-900">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-navy-900/55 mb-6">{formatarDataPt(diaModal)}</p>

            {eventosDoDiaModal.length > 0 && (
              <div className="mb-6 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wide text-navy-900/50">
                  Já assinalado neste dia
                </p>
                {eventosDoDiaModal.map((ev) => (
                  <div
                    key={ev.id}
                    className={`flex items-center justify-between gap-3 p-2.5 border rounded ${
                      eventoEditId === ev.id ? "border-sky bg-sky/5" : "border-navy-100"
                    }`}
                  >
                    <span className="text-sm text-navy-900 truncate">{ev.titulo}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => iniciarEdicao(ev)}
                        title="Editar"
                        className="p-1.5 text-navy-900/50 hover:text-sky transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarEvento(ev.id)}
                        title="Eliminar"
                        className="p-1.5 text-navy-900/50 hover:text-crimson transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={guardarEvento} className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-navy-900/50">
                {eventoEditId ? "A editar data existente" : "Adicionar nova data"}
              </p>
              <label className="block">
                <span className="block text-sm font-bold text-navy-900 mb-1.5">Título *</span>
                <input
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  placeholder="Ex: Exames de Admissão, Dia da Independência…"
                  required
                  className="esj-field"
                />
              </label>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-sm font-bold text-navy-900 mb-1.5">Categoria *</span>
                  <select
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value)}
                    className="esj-field"
                  >
                    {CATEGORIAS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                    <option value={CATEGORIA_OUTRA}>Outra categoria…</option>
                  </select>
                  {formCategoria === CATEGORIA_OUTRA && (
                    <input
                      value={formCategoriaOutra}
                      onChange={(e) => setFormCategoriaOutra(e.target.value)}
                      placeholder="Nome da categoria"
                      required
                      className="esj-field mt-2"
                    />
                  )}
                </label>
                <label className="block">
                  <span className="block text-sm font-bold text-navy-900 mb-1.5">Termina em (opcional)</span>
                  <input
                    type="date"
                    value={formDataFim}
                    min={diaModal}
                    onChange={(e) => setFormDataFim(e.target.value)}
                    className="esj-field"
                  />
                </label>
              </div>

              <label className="block">
                <span className="block text-sm font-bold text-navy-900 mb-1.5">Data representativa *</span>
                <input
                  value={formDataRepresentativa}
                  onChange={(e) => setFormDataRepresentativa(e.target.value)}
                  placeholder="Ex: 9 a 13 de Fevereiro de 2026"
                  required
                  className="esj-field"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-bold text-navy-900 mb-1.5">Descrição</span>
                <textarea
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  className="box-border w-full max-w-full min-w-0 min-h-[6.5rem] h-auto border border-navy-100 bg-white px-3 py-3 text-sm font-medium text-navy-900 leading-relaxed outline-none transition-colors focus:border-sky resize-y"
                />
              </label>

              <div className="flex items-center gap-4 pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-leaf hover:bg-crimson text-white text-xs font-bold px-5 py-2.5 transition-colors"
                >
                  {eventoEditId ? <Pencil size={14} /> : <Plus size={14} />}
                  {eventoEditId ? "Guardar alterações" : "Adicionar ao calendário"}
                </button>
                {eventoEditId && (
                  <button
                    type="button"
                    onClick={() => iniciarNovo(diaModal)}
                    className="text-xs font-semibold text-navy-900/60 hover:text-navy-900"
                  >
                    Cancelar edição
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
