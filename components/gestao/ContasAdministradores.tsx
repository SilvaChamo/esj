"use client";

import { type FormEvent, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Pencil,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";

type ContaAdministrador = {
  id: string;
  email: string | null;
  nome: string | null;
  createdAt: string;
  souEu?: boolean;
};

/** Separa o último segmento como apelido (maiúsculas) e o resto como primeiro(s) nome(s). Mesma regra usada em ContasEstudantes. */
function formatarNome(nomeCompleto: string): { apelidoUpper: string; primeiroNome: string } {
  const partes = nomeCompleto.trim().split(/\s+/);
  if (partes.length === 1) return { apelidoUpper: partes[0].toUpperCase(), primeiroNome: "" };
  const apelido = partes[partes.length - 1].toUpperCase();
  const resto = partes.slice(0, -1).join(" ");
  return { apelidoUpper: apelido, primeiroNome: resto };
}

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Não foi possível completar o pedido.");
  return json as T;
}

export default function ContasAdministradores() {
  const [contas, setContas] = useState<ContaAdministrador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroConfig, setErroConfig] = useState(false);

  // Seleção em lote (Checkboxes)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  // Toast flutuante simples que desaparece sozinho
  const [toastMessage, setToastMessage] = useState<{ texto: string; tipo: "sucesso" | "erro" } | null>(null);

  // Modais
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [contaEliminando, setContaEliminando] = useState<ContaAdministrador | null>(null);
  const [confirmarEliminarLote, setConfirmarEliminarLote] = useState(false);

  // Formulário de criação
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [processando, setProcessando] = useState(false);

  const mostrarToast = (texto: string, tipo: "sucesso" | "erro" = "sucesso") => {
    setToastMessage({ texto, tipo });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const carregar = () => {
    setCarregando(true);
    setErroConfig(false);
    pedir<{ administradores: ContaAdministrador[] }>("/api/administradores-contas")
      .then((r) => setContas(r.administradores))
      .catch((err) => {
        setContas([]);
        if (String(err.message).includes("serviço")) setErroConfig(true);
        else mostrarToast(err.message, "erro");
      })
      .finally(() => setCarregando(false));
  };

  useEffect(carregar, []);

  // Checkboxes — a própria conta nunca entra na seleção (não se pode auto-eliminar).
  const seleccionaveis = contas.filter((c) => !c.souEu);
  const todosSelecionados =
    seleccionaveis.length > 0 && seleccionaveis.every((c) => selecionados.has(c.id));

  const toggleSelecionarTodos = () => {
    if (todosSelecionados) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(seleccionaveis.map((c) => c.id)));
    }
  };

  const toggleSelecionar = (id: string) => {
    setSelecionados((prev) => {
      const proximo = new Set(prev);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  };

  const abrirModalCriar = () => {
    setNome("");
    setEmail("");
    setPassword("");
    setModalCriarAberto(true);
  };

  const criar = async (e: FormEvent) => {
    e.preventDefault();
    setProcessando(true);
    try {
      const r = await pedir<{ actualizado?: boolean }>("/api/administradores-contas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, password }),
      });
      setModalCriarAberto(false);
      mostrarToast(
        r.actualizado
          ? "Este correio já tinha conta — foi-lhe atribuído o papel de administrador (a palavra-passe existente não foi alterada)."
          : "Conta de administrador criada."
      );
      carregar();
    } catch (err) {
      mostrarToast(err instanceof Error ? err.message : "Não foi possível criar a conta.", "erro");
    } finally {
      setProcessando(false);
    }
  };

  const submeterEliminarUnico = async () => {
    if (!contaEliminando) return;
    setProcessando(true);
    try {
      await pedir("/api/administradores-contas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [contaEliminando.id] }),
      });
      mostrarToast(`Conta de ${contaEliminando.nome || contaEliminando.email} eliminada.`);
      setContaEliminando(null);
      setSelecionados((prev) => {
        const p = new Set(prev);
        p.delete(contaEliminando.id);
        return p;
      });
      carregar();
    } catch (err) {
      mostrarToast(err instanceof Error ? err.message : "Não foi possível eliminar.", "erro");
    } finally {
      setProcessando(false);
    }
  };

  const submeterEliminarLote = async () => {
    if (selecionados.size === 0) return;
    setProcessando(true);
    try {
      const r = await pedir<{ eliminados?: number }>("/api/administradores-contas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selecionados) }),
      });
      mostrarToast(`Eliminados ${r.eliminados ?? selecionados.size} administrador(es).`);
      setConfirmarEliminarLote(false);
      setSelecionados(new Set());
      carregar();
    } catch (err) {
      mostrarToast(err instanceof Error ? err.message : "Erro ao eliminar selecionados.", "erro");
    } finally {
      setProcessando(false);
    }
  };

  return (
    <>
    <div className="space-y-4">
      {/* Botão oculto para acionamento a partir do cabeçalho do painel */}
      <button id="btn-criar-administrador-modal" type="button" onClick={abrirModalCriar} className="hidden" />

      {erroConfig && (
        <div className="border border-amber-300 bg-amber-50 p-5 text-sm text-navy-900/80 leading-relaxed rounded-lg">
          <p className="font-bold text-navy-900">Falta configurar a chave de serviço do Supabase.</p>
          <p className="mt-2">
            Para gerir contas de administrador é preciso adicionar <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
            às variáveis de ambiente do servidor (não é a mesma chave pública do site). Encontra-se em
            Supabase → Project Settings → API → service_role. Depois de a adicionar (e reiniciar o servidor),
            esta página passa a funcionar.
          </p>
        </div>
      )}

      {/* Barra de Ações em Lote quando há checkboxes selecionadas */}
      {selecionados.size > 0 && (
        <div className="bg-navy-900 text-white p-3 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
          <span>{selecionados.size} administrador(es) selecionado(s)</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmarEliminarLote(true)}
              className="inline-flex items-center gap-1 bg-crimson hover:bg-crimson/90 text-white px-3 py-1.5 rounded transition-colors font-bold"
            >
              <Trash2 size={13} /> Eliminar Selecionados ({selecionados.size})
            </button>
            <button
              type="button"
              onClick={() => setSelecionados(new Set())}
              className="text-white/70 hover:text-white px-2 py-1"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabela de Administradores */}
      <div className="bg-white border border-navy-100 rounded-lg shadow-sm overflow-hidden">
        {carregando ? (
          <div className="p-8 text-center text-sm text-navy-900/60">A carregar lista de administradores…</div>
        ) : contas.length === 0 ? (
          <div className="p-8 text-center text-sm text-navy-900/60">Ainda não há contas de administrador.</div>
        ) : (
          <>
          <div className="md:hidden divide-y divide-navy-100">
            {contas.map((c) => {
              const { apelidoUpper, primeiroNome } = formatarNome(c.nome || c.email || "—");
              const estaSelecionado = selecionados.has(c.id);
              return (
                <div key={c.id} className={`p-4 space-y-2 ${estaSelecionado ? "bg-sky/10" : "bg-white"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={estaSelecionado}
                        disabled={c.souEu}
                        title={c.souEu ? "Não pode eliminar a sua própria conta" : undefined}
                        onChange={() => toggleSelecionar(c.id)}
                        className="mt-1 w-3.5 h-3.5 rounded-[2px] border-navy-300 accent-sky cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-navy-900 uppercase text-sm truncate">
                          {apelidoUpper} {primeiroNome && <span className="font-normal normal-case">{primeiroNome}</span>}
                        </p>
                        <p className="font-mono text-xs text-navy-900/60 truncate">{c.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      title={c.souEu ? "Não pode eliminar a sua própria conta" : "Eliminar Administrador"}
                      disabled={c.souEu}
                      onClick={() => setContaEliminando(c)}
                      className="shrink-0 p-1.5 text-crimson hover:bg-crimson/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {c.souEu ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky/10 text-sky border border-sky/30 rounded text-[11px] font-bold">
                      <ShieldCheck size={11} /> A sua conta
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-leaf/10 text-leaf border border-leaf/30 rounded text-[11px] font-bold">
                      <UserCheck size={11} /> Ativa
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-cream border-b-2 border-navy-100 text-navy-900/70 text-[11px] font-bold uppercase tracking-wider">
                  <th className="p-2 text-center w-7 border-r border-navy-100/60">
                    <input
                      type="checkbox"
                      checked={todosSelecionados}
                      onChange={toggleSelecionarTodos}
                      className="w-3 h-3 rounded-[2px] border-navy-300 accent-sky cursor-pointer"
                    />
                  </th>
                  <th className="p-2 text-center w-10">#</th>
                  <th className="p-2.5 text-left w-32 border-r border-navy-100/60">APELIDO</th>
                  <th className="p-2.5 text-left w-36 pr-[15px] border-r border-navy-100/60">NOME</th>
                  <th className="p-2.5 text-left pl-3">EMAIL DE ACESSO</th>
                  <th className="p-2.5 text-left w-32">ESTADO</th>
                  <th className="p-2.5 text-left w-20">AÇÃO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 text-navy-900">
                {contas.map((c, idx) => {
                  const { apelidoUpper, primeiroNome } = formatarNome(c.nome || c.email || "—");
                  const estaSelecionado = selecionados.has(c.id);

                  return (
                    <tr
                      key={c.id}
                      className={`transition-colors ${
                        estaSelecionado
                          ? "bg-sky/10"
                          : idx % 2 === 1
                          ? "bg-slate-100/70 hover:bg-sky/5"
                          : "bg-white hover:bg-sky/5"
                      }`}
                    >
                      <td className="p-2 text-center border-r border-navy-100/60">
                        <input
                          type="checkbox"
                          checked={estaSelecionado}
                          disabled={c.souEu}
                          title={c.souEu ? "Não pode eliminar a sua própria conta" : undefined}
                          onChange={() => toggleSelecionar(c.id)}
                          className="w-3 h-3 rounded-[2px] border-navy-300 accent-sky cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        />
                      </td>

                      <td className="p-2 text-center font-mono font-bold text-navy-900 text-sm select-none">
                        {idx + 1}
                      </td>

                      <td className="p-2 text-left whitespace-nowrap font-bold text-navy-900 uppercase border-r border-navy-100/60 w-32">
                        {apelidoUpper}
                      </td>

                      <td className="p-2 text-left whitespace-nowrap pr-[15px] text-navy-900/80 w-36 border-r border-navy-100/60">
                        {primeiroNome || "—"}
                      </td>

                      <td className="p-2 text-left font-mono text-xs text-navy-900/70 whitespace-nowrap pl-3">
                        {c.email}
                      </td>

                      <td className="p-2 text-left whitespace-nowrap">
                        {c.souEu ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky/10 text-sky border border-sky/30 rounded text-[11px] font-bold">
                            <ShieldCheck size={11} /> A sua conta
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-leaf/10 text-leaf border border-leaf/30 rounded text-[11px] font-bold">
                            <UserCheck size={11} /> Ativa
                          </span>
                        )}
                      </td>

                      <td className="p-2 text-left whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title={c.souEu ? "Não pode eliminar a sua própria conta" : "Eliminar Administrador"}
                            disabled={c.souEu}
                            onClick={() => setContaEliminando(c)}
                            className="p-1 text-crimson hover:bg-crimson/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
    </div>

    {/* Toast e modais ficam fora do space-y-4 — sendo "fixed", a margem
        que o space-y-4 lhes aplicaria deixava uma faixa por cobrir. */}
    {toastMessage && (
      <div
        className={`fixed bottom-6 right-6 z-[300] max-w-sm p-3.5 rounded-lg shadow-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
          toastMessage.tipo === "sucesso"
            ? "bg-navy-900 text-white border border-leaf/40"
            : "bg-crimson text-white border border-white/20"
        }`}
      >
        {toastMessage.tipo === "sucesso" ? (
          <CheckCircle2 size={16} className="text-leaf shrink-0" />
        ) : (
          <AlertTriangle size={16} className="text-white shrink-0" />
        )}
        <span>{toastMessage.texto}</span>
      </div>
    )}

    {/* MODAL: Criar Nova Conta de Administrador */}
    {modalCriarAberto && (
        <div className="fixed inset-0 z-[180] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-navy-100 w-full max-w-md p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <h3 className="font-serif font-bold text-navy-900 text-base flex items-center gap-2">
                <UserPlus size={18} className="text-sky" /> Criar Conta de Administrador
              </h3>
              <button
                type="button"
                onClick={() => setModalCriarAberto(false)}
                className="text-navy-900/50 hover:text-navy-900"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={criar} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Nome completo *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Maria João Sitoe"
                  className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 focus:outline-none focus:border-sky"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Correio *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@esj.ac.mz"
                  className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs font-mono text-navy-900 focus:outline-none focus:border-sky"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Palavra-passe *</label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs font-mono text-navy-900 focus:outline-none focus:border-sky"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-navy-100">
                <button
                  type="button"
                  onClick={() => setModalCriarAberto(false)}
                  className="px-3 py-2 border border-navy-100 text-xs font-semibold rounded text-navy-900/70 hover:bg-cream"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processando}
                  className="px-4 py-2 bg-sky hover:bg-sky/90 text-white text-xs font-bold rounded shadow-sm disabled:opacity-50"
                >
                  {processando ? "A criar…" : "Criar Conta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Eliminar Único */}
      {contaEliminando && (
        <div className="fixed inset-0 z-[180] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-navy-100 w-full max-w-sm p-6 space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-crimson">
              <AlertTriangle size={24} />
              <h3 className="font-serif font-bold text-base text-navy-900">Eliminar Administrador</h3>
            </div>
            <p className="text-xs text-navy-900/80 leading-relaxed">
              Tem certeza que pretende eliminar a conta de{" "}
              <strong>{contaEliminando.nome || contaEliminando.email}</strong>? Esta ação remove o acesso ao
              painel de imediato.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-navy-100">
              <button
                type="button"
                onClick={() => setContaEliminando(null)}
                className="px-3 py-2 border border-navy-100 text-xs font-semibold rounded text-navy-900/70 hover:bg-cream"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={processando}
                onClick={() => void submeterEliminarUnico()}
                className="px-4 py-2 bg-crimson hover:bg-crimson/90 text-white text-xs font-bold rounded shadow-sm disabled:opacity-50"
              >
                {processando ? "A eliminar…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Eliminar em Lote */}
      {confirmarEliminarLote && (
        <div className="fixed inset-0 z-[180] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-navy-100 w-full max-w-sm p-6 space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-crimson">
              <AlertTriangle size={24} />
              <h3 className="font-serif font-bold text-base text-navy-900">Eliminar em Lote</h3>
            </div>
            <p className="text-xs text-navy-900/80 leading-relaxed">
              Tem certeza que pretende eliminar as <strong>{selecionados.size} contas</strong> selecionadas?
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-navy-100">
              <button
                type="button"
                onClick={() => setConfirmarEliminarLote(false)}
                className="px-3 py-2 border border-navy-100 text-xs font-semibold rounded text-navy-900/70 hover:bg-cream"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={processando}
                onClick={() => void submeterEliminarLote()}
                className="px-4 py-2 bg-crimson hover:bg-crimson/90 text-white text-xs font-bold rounded shadow-sm disabled:opacity-50"
              >
                {processando ? "A eliminar…" : "Eliminar Todos"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
