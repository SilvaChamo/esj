"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Calendar, Check } from "lucide-react";
import {
  CALENDARIO_2026_DEFAULT,
  readCalendarioDetalhado,
  writeCalendarioDetalhado,
  labelCategoriaCalendario,
  type CalendarioAcademicoAnual,
  type CategoriaEventoCalendario,
  type EventoCalendarioDetalhado,
} from "@/lib/calendario-detalhado";

export default function CalendarioEditor() {
  const [data, setData] = useState<CalendarioAcademicoAnual>(() => readCalendarioDetalhado());
  const [toast, setToast] = useState<string | null>(null);

  // Novo evento form
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState<CategoriaEventoCalendario>("academico");
  const [dataInicio, setDataInicio] = useState("");
  const [dataRepresentativa, setDataRepresentativa] = useState("");
  const [descricao, setDescricao] = useState("");

  const guardar = (atualizado: CalendarioAcademicoAnual) => {
    setData(atualizado);
    writeCalendarioDetalhado(atualizado);
    setToast("Calendário académico guardado com sucesso.");
    setTimeout(() => setToast(null), 3000);
  };

  const adicionarEvento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !dataRepresentativa.trim()) {
      setToast("Preencha o título e a data representativa.");
      return;
    }
    const novo: EventoCalendarioDetalhado = {
      id: `ev-${Date.now()}`,
      titulo: titulo.trim(),
      categoria,
      dataInicio: dataInicio || "2026-01-01",
      dataRepresentativa: dataRepresentativa.trim(),
      descricao: descricao.trim(),
      destaque: true,
    };
    const atualizado: CalendarioAcademicoAnual = {
      ...data,
      eventos: [...data.eventos, novo],
    };
    guardar(atualizado);
    setTitulo("");
    setDataRepresentativa("");
    setDescricao("");
  };

  const removerEvento = (id: string) => {
    if (!window.confirm("Eliminar este evento do calendário?")) return;
    const atualizado = {
      ...data,
      eventos: data.eventos.filter((ev) => ev.id !== id),
    };
    guardar(atualizado);
  };

  const restaurarPadrao = () => {
    if (window.confirm("Restaurar o calendário para a versão oficial predefinida de 2026?")) {
      guardar(CALENDARIO_2026_DEFAULT);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border border-navy-100 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-navy-900">
            Gestão do Calendário Académico {data.anoLectivo}
          </h2>
          <p className="text-xs text-navy-900/60 mt-1">
            Defina os feriados, festivais, exames e períodos de férias do ano lectivo.
          </p>
        </div>

        <button
          type="button"
          onClick={restaurarPadrao}
          className="border border-navy-100 hover:border-sky text-navy-900 text-xs font-semibold px-4 py-2 rounded transition-colors"
        >
          Restaurar Padrão 2026
        </button>
      </div>

      {toast && (
        <div className="p-4 bg-leaf/10 border border-leaf/30 rounded text-xs font-semibold text-leaf flex items-center gap-2">
          <Check size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Formulário para Adicionar Evento */}
      <div className="bg-white border border-navy-100 rounded-lg p-6 shadow-sm">
        <h3 className="font-serif font-bold text-base text-navy-900 mb-4">
          Adicionar Evento / Período no Calendário
        </h3>

        <form onSubmit={adicionarEvento} className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-navy-900 mb-1">Título do Evento *</label>
              <input
                type="text"
                required
                placeholder="Ex: Exames da Época Normal, Dia da Independência…"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full p-2.5 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:border-sky focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Categoria *</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaEventoCalendario)}
                className="w-full p-2.5 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:border-sky focus:outline-none"
              >
                <option value="exame">Exames & Avaliações</option>
                <option value="feriado">Feriado Nacional</option>
                <option value="festival">Festival / Cerimónia</option>
                <option value="ferias">Férias Académicas</option>
                <option value="inscricao">Inscrições & Matrículas</option>
                <option value="academico">Actividade Académica</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Data Representativa *</label>
              <input
                type="text"
                required
                placeholder="Ex: 6 a 17 de Julho de 2026, 25 de Junho…"
                value={dataRepresentativa}
                onChange={(e) => setDataRepresentativa(e.target.value)}
                className="w-full p-2.5 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:border-sky focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Descrição Breve</label>
              <input
                type="text"
                placeholder="Ex: Avaliação final das disciplinas do 1º Semestre."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full p-2.5 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:border-sky focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-leaf hover:bg-crimson text-white text-xs font-bold px-5 py-2.5 rounded transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Adicionar ao Calendário</span>
          </button>
        </form>
      </div>

      {/* Lista de Eventos */}
      <div className="bg-white border border-navy-100 rounded-lg p-6 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-navy-900">
          Eventos e Períodos Cadastrados ({data.eventos.length})
        </h3>

        <div className="divide-y divide-navy-100 border-t border-navy-100">
          {data.eventos.map((ev) => {
            const catInfo = labelCategoriaCalendario(ev.categoria);
            return (
              <div key={ev.id} className="py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-[10px] font-bold border rounded ${catInfo.bg} ${catInfo.color}`}>
                      {catInfo.label}
                    </span>
                    <span className="text-xs font-bold text-navy-900/60">{ev.dataRepresentativa}</span>
                  </div>
                  <h4 className="font-serif font-bold text-navy-900 text-base">{ev.titulo}</h4>
                  {ev.descricao && <p className="text-xs text-navy-900/60 mt-0.5">{ev.descricao}</p>}
                </div>

                <button
                  type="button"
                  onClick={() => removerEvento(ev.id)}
                  className="p-2 text-navy-900/40 hover:text-crimson transition-colors"
                  title="Eliminar evento"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
