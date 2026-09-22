"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CALENDARIO_2026_DEFAULT,
  readCalendarioDetalhado,
  labelCategoriaCalendario,
  type CalendarioAcademicoAnual,
  type EventoCalendarioDetalhado,
} from "@/lib/calendario-detalhado";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

function parseISO(iso: string) {
  return new Date(`${iso}T12:00:00`);
}

function chaveDia(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function construirDias(ano: number, mes: number) {
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  return Array.from({ length: 42 }, (_, i) => new Date(ano, mes, 1 - primeiroDiaSemana + i));
}

function diaEstaNoIntervalo(ev: EventoCalendarioDetalhado, diaKey: string) {
  const dia = parseISO(diaKey);
  const inicio = parseISO(ev.dataInicio);
  const fim = ev.dataFim ? parseISO(ev.dataFim) : inicio;
  return dia >= inicio && dia <= fim;
}

export default function CalendarioAnual() {
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
    const inicioMes = new Date(ano, mesSelecionado, 1);
    const fimMes = new Date(ano, mesSelecionado + 1, 0);
    return dados.eventos
      .filter((ev) => {
        const inicio = parseISO(ev.dataInicio);
        const fim = ev.dataFim ? parseISO(ev.dataFim) : inicio;
        return fim >= inicioMes && inicio <= fimMes;
      })
      .sort((a, b) => a.dataInicio.localeCompare(b.dataInicio));
  }, [dados, ano, mesSelecionado]);

  function selecionarMes(mesIndex: number) {
    setMesSelecionado(mesIndex);
    setDiaSelecionado(null);
  }

  function selecionarDia(key: string) {
    setDiaSelecionado(key);
  }

  return (
    <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
      <div className="lg:col-span-2 bg-white border border-navy-100 p-6">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-900">{ano}</h2>
          <button
            type="button"
            onClick={() => selecionarMes(hoje.getFullYear() === ano ? hoje.getMonth() : 0)}
            className="text-xs font-semibold text-navy-900/60 hover:text-crimson hover:border-crimson/40 border border-navy-200 rounded px-3 py-1.5 transition-colors"
          >
            Hoje
          </button>
        </div>

        {/* Ano completo, estilo calendário anual */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8">
          {mesesComDias.map(({ nome, mesIndex, dias }) => {
            const selecionado = mesSelecionado === mesIndex;
            return (
              <div key={nome}>
                <button
                  type="button"
                  onClick={() => selecionarMes(mesIndex)}
                  className={`block text-left font-serif font-bold text-sm mb-2 transition-colors ${
                    selecionado ? "text-crimson underline underline-offset-2" : "text-crimson/90 hover:text-crimson"
                  }`}
                >
                  {nome}
                </button>
                <div className="grid grid-cols-7 gap-y-1">
                  {DIAS_SEMANA.map((d, i) => (
                    <span key={i} className="text-center text-[9px] text-navy-900/40 pb-1">
                      {d}
                    </span>
                  ))}
                  {dias.map((dia) => {
                    const key = chaveDia(dia);
                    const noMes = dia.getMonth() === mesIndex;
                    const fimDeSemana = dia.getDay() === 0 || dia.getDay() === 6;
                    const temEvento = eventosPorDia.has(key);
                    const ehHoje = key === hojeKey;
                    return (
                      <div key={key} className="flex flex-col items-center gap-0.5">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] leading-none ${
                            ehHoje
                              ? "bg-crimson text-white font-bold"
                              : !noMes
                                ? "text-navy-900/20"
                                : fimDeSemana
                                  ? "text-navy-900/45"
                                  : "text-navy-900 font-semibold"
                          }`}
                        >
                          {dia.getDate()}
                        </span>
                        <span
                          className={`h-1 w-1 rounded-full ${temEvento ? "bg-crimson" : "bg-transparent"}`}
                          aria-hidden
                        />
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
        {/* Calendário mensal do mês clicado */}
        <p className="font-serif font-bold text-navy-900 text-base">
          {MESES[mesSelecionado]} {ano}
        </p>
        <div className="mt-3 grid grid-cols-7 text-center">
          {DIAS_SEMANA.map((d, i) => (
            <span key={i} className="text-[10px] font-bold text-navy-900/40 uppercase tracking-wide pb-1.5">
              {d}
            </span>
          ))}
          {diasDoMesSelecionado.map((dia) => {
            const key = chaveDia(dia);
            const noMes = dia.getMonth() === mesSelecionado;
            const eventosNoDia = eventosPorDia.get(key);
            const temEvento = !!eventosNoDia?.length;
            const ehHoje = key === hojeKey;
            const ehSelecionado = key === diaSelecionado;

            const numero = (
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
            );

            return (
              <div key={key} className="flex flex-col items-center gap-1 py-1">
                {temEvento ? (
                  <button
                    type="button"
                    onClick={() => selecionarDia(key)}
                    aria-label={`${dia.getDate()} de ${MESES[mesSelecionado]}: ${eventosNoDia!
                      .map((ev) => ev.titulo)
                      .join(", ")}`}
                    className="flex p-0 bg-transparent border-0"
                  >
                    {numero}
                  </button>
                ) : (
                  numero
                )}
                <span
                  className={`h-1.5 w-1.5 rounded-full ${temEvento ? "bg-crimson" : "bg-transparent"}`}
                  aria-hidden
                />
              </div>
            );
          })}
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
                  <div className="min-w-0">
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
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        </div>
      </aside>
    </div>
  );
}
