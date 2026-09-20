"use client";

import { FormEvent, useEffect, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { CURSOS_DOCENCIA } from "@/lib/docencia";
import {
  cmsError,
  deleteSituacaoEstudante,
  isMissingTable,
  listSituacaoGestao,
  saveSituacaoEstudante,
  type SituacaoEstudanteLinha,
} from "@/lib/cms";
import { gestorSessao } from "@/lib/gestao-auth";
import SchemaInstall from "@/components/gestao/SchemaInstall";

const REGIMES = [
  { valor: "diurno", label: "Diurno" },
  { valor: "pos-laboral", label: "Pós-laboral" },
];

export default function SituacaoEstudantes({ onAction }: { onAction: (m: string) => void }) {
  const [pesquisa, setPesquisa] = useState("");
  const [items, setItems] = useState<SituacaoEstudanteLinha[]>([]);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [autor, setAutor] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [numeroEstudante, setNumeroEstudante] = useState("");
  const [nome, setNome] = useState("");
  const [curso, setCurso] = useState("");
  const [regime, setRegime] = useState("");
  const [regularizado, setRegularizado] = useState(true);
  const [observacao, setObservacao] = useState("");

  useEffect(() => {
    gestorSessao().then((s) => setAutor(s?.autor || s?.email || null));
  }, []);

  const refresh = () => {
    listSituacaoGestao(pesquisa)
      .then((rows) => {
        setItems(rows);
        setMissing(false);
      })
      .catch((err) => {
        if (isMissingTable(err)) setMissing(true);
        else onAction(cmsError(err));
      });
  };

  useEffect(() => {
    const t = setTimeout(refresh, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pesquisa]);

  const limpar = () => {
    setEditId(null);
    setNumeroEstudante("");
    setNome("");
    setCurso("");
    setRegime("");
    setRegularizado(true);
    setObservacao("");
  };

  const editar = (row: SituacaoEstudanteLinha) => {
    setEditId(row.id);
    setNumeroEstudante(row.numero_estudante);
    setNome(row.nome);
    setCurso(row.curso || "");
    setRegime(row.regime || "");
    setRegularizado(row.regularizado);
    setObservacao(row.observacao || "");
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!numeroEstudante.trim() || !nome.trim()) return;
    setBusy(true);
    try {
      await saveSituacaoEstudante({
        numeroEstudante,
        nome,
        curso: curso || undefined,
        regime: regime || undefined,
        regularizado,
        observacao,
        updatedBy: autor || undefined,
      });
      limpar();
      refresh();
      onAction("Situação do estudante gravada.");
    } catch (error) {
      if (isMissingTable(error)) setMissing(true);
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  const remover = async (id: string) => {
    try {
      await deleteSituacaoEstudante(id);
      if (editId === id) limpar();
      refresh();
      onAction("Registo removido.");
    } catch (error) {
      onAction(cmsError(error));
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-white border border-navy-100 p-6 md:p-8">
        <h2 className="font-serif text-2xl font-bold text-navy-900">Situação dos estudantes</h2>
        <p className="mt-2 text-sm text-navy-900/65 leading-relaxed">
          Marca manualmente se um estudante está regularizado (sem dívida de mensalidade/matrícula
          nem de notas), depois de o estudante apresentar o recibo de pagamento. Não há cálculo
          automático de dívida — isto é só a confirmação da secretaria, visível no painel do
          próprio estudante.
        </p>
        {missing && <SchemaInstall />}
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-white border border-navy-100 p-6 md:p-8 grid md:grid-cols-2 lg:grid-cols-6 gap-4 items-end"
      >
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">N.º de Estudante</span>
          <input
            value={numeroEstudante}
            onChange={(e) => setNumeroEstudante(e.target.value)}
            required
            className="esj-field"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Nome</span>
          <input value={nome} onChange={(e) => setNome(e.target.value)} required className="esj-field" />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Curso</span>
          <select value={curso} onChange={(e) => setCurso(e.target.value)} className="esj-field">
            <option value="">—</option>
            {CURSOS_DOCENCIA.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.titulo}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Regime</span>
          <select value={regime} onChange={(e) => setRegime(e.target.value)} className="esj-field">
            <option value="">—</option>
            {REGIMES.map((r) => (
              <option key={r.valor} value={r.valor}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 h-11">
          <input
            type="checkbox"
            checked={regularizado}
            onChange={(e) => setRegularizado(e.target.checked)}
            className="accent-leaf"
          />
          <span className="text-sm font-semibold text-navy-900">Regularizado</span>
        </label>
        <button
          type="submit"
          disabled={busy}
          className="bg-leaf hover:bg-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide px-5 py-3.5 transition-colors"
        >
          {busy ? "A GRAVAR…" : editId ? "ACTUALIZAR" : "GRAVAR"}
        </button>
        <label className="block lg:col-span-6">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">
            Observação (ex.: n.º do recibo, data)
          </span>
          <input
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Recibo n.º 123 apresentado em 19/09/2026"
            className="esj-field"
          />
        </label>
        {editId && (
          <button
            type="button"
            onClick={limpar}
            className="lg:col-span-6 justify-self-start text-xs font-semibold text-navy-900/60 hover:text-crimson"
          >
            Cancelar edição
          </button>
        )}
      </form>

      <div className="bg-white border border-navy-100 p-4 flex items-center gap-2">
        <Search size={16} className="text-navy-900/40" />
        <input
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          placeholder="Pesquisar por número de estudante ou nome…"
          className="flex-1 border-none outline-none text-sm text-navy-900 placeholder:text-navy-900/40"
        />
      </div>

      {items.length === 0 ? (
        <div className="gestao-list-card px-5 py-8 text-center text-navy-900/50 text-xs">
          Ainda sem estudantes registados.
        </div>
      ) : (
        <>
        {/* < lg: cartões — 1 coluna em telemóvel, 2 em tablet (md). */}
        <div className="lg:hidden gestao-list-card grid grid-cols-1 md:grid-cols-2 gap-px bg-navy-100">
          {items.map((row) => {
            const cursoLabel = CURSOS_DOCENCIA.find((c) => c.slug === row.curso)?.titulo || row.curso;
            const regimeLabel = REGIMES.find((r) => r.valor === row.regime)?.label || row.regime;
            return (
              <div key={row.id} onClick={() => editar(row)} className="bg-white p-3 text-xs space-y-1.5 cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono font-semibold text-sky">{row.numero_estudante}</p>
                    <p className="text-navy-900 font-semibold">{row.nome}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void remover(row.id);
                    }}
                    title="Remover"
                    className="shrink-0 gestao-list-action text-crimson hover:border-crimson/30 hover:text-crimson"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <p className="text-navy-900/70">{[cursoLabel, regimeLabel].filter(Boolean).join(" · ") || "—"}</p>
                <p className={`font-semibold ${row.regularizado ? "text-leaf" : "text-crimson"}`}>
                  {row.regularizado ? "Regularizado" : "Não regularizado"}
                </p>
                {row.observacao && <p className="text-navy-900/60">{row.observacao}</p>}
              </div>
            );
          })}
        </div>

        <div className="hidden lg:block gestao-list-card overflow-x-auto">
          <table className="w-full min-w-[760px] text-xs">
            <thead>
              <tr className="gestao-list-header text-left">
                <th className="px-3 py-2">N.º Estudante</th>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Curso / Regime</th>
                <th className="px-3 py-2 text-center">Situação</th>
                <th className="px-3 py-2">Observação</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => {
                const cursoLabel = CURSOS_DOCENCIA.find((c) => c.slug === row.curso)?.titulo || row.curso;
                const regimeLabel = REGIMES.find((r) => r.valor === row.regime)?.label || row.regime;
                return (
                  <tr
                    key={row.id}
                    onClick={() => editar(row)}
                    className="gestao-list-row cursor-pointer"
                  >
                    <td className="px-3 py-2 font-mono font-semibold text-sky">{row.numero_estudante}</td>
                    <td className="px-3 py-2 text-navy-900">{row.nome}</td>
                    <td className="px-3 py-2 text-navy-900/70">
                      {[cursoLabel, regimeLabel].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap font-semibold">
                      <span className={row.regularizado ? "text-leaf" : "text-crimson"}>
                        {row.regularizado ? "Regularizado" : "Não regularizado"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-navy-900/60">{row.observacao || "—"}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void remover(row.id);
                        }}
                        title="Remover"
                        className="gestao-list-action text-crimson hover:border-crimson/30 hover:text-crimson"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}
