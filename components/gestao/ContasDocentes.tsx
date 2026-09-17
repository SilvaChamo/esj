"use client";

import { useEffect, useState } from "react";
import { Trash2, UserPlus } from "lucide-react";

type ContaDocente = {
  id: string;
  email: string | null;
  nome: string | null;
  createdAt: string;
};

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Não foi possível completar o pedido.");
  return json as T;
}

export default function ContasDocentes() {
  const [contas, setContas] = useState<ContaDocente[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [erroConfig, setErroConfig] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastErro, setToastErro] = useState(false);

  const carregar = () => {
    setLoading(true);
    setErroConfig(false);
    pedir<{ docentes: ContaDocente[] }>("/api/docencia-contas")
      .then((r) => setContas(r.docentes))
      .catch((err) => {
        setContas([]);
        if (String(err.message).includes("serviço")) setErroConfig(true);
        else {
          setToast(err.message);
          setToastErro(true);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(carregar, []);

  const criar = async () => {
    setToast(null);
    setToastErro(false);
    setBusy(true);
    try {
      const r = await pedir<{ actualizado?: boolean }>("/api/docencia-contas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, password }),
      });
      setNome("");
      setEmail("");
      setPassword("");
      setToast(
        r.actualizado
          ? "Este correio já tinha conta — foi actualizada com o papel de docente e a nova palavra-passe."
          : "Conta de docente criada."
      );
      carregar();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Não foi possível criar a conta.");
      setToastErro(true);
    } finally {
      setBusy(false);
    }
  };

  const eliminar = async (conta: ContaDocente) => {
    if (!window.confirm(`Eliminar a conta de ${conta.nome || conta.email}?`)) return;
    try {
      await pedir(`/api/docencia-contas?id=${encodeURIComponent(conta.id)}`, {
        method: "DELETE",
      });
      carregar();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Não foi possível eliminar.");
      setToastErro(true);
    }
  };

  return (
    <div className="space-y-6">
      {erroConfig && (
        <div className="border border-amber-300 bg-amber-50 p-5 text-sm text-navy-900/80 leading-relaxed">
          <p className="font-bold text-navy-900">Falta configurar a chave de serviço do Supabase.</p>
          <p className="mt-2">
            Para criar contas de docente é preciso adicionar <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
            às variáveis de ambiente do servidor (não é a mesma chave pública do site). Encontra-se em
            Supabase → Project Settings → API → service_role. Depois de a adicionar (e reiniciar o servidor),
            esta página passa a funcionar.
          </p>
        </div>
      )}

      <div className="bg-white border border-navy-100 p-6 md:p-8">
        <h2 className="font-serif text-xl font-bold text-navy-900 mb-5">Nova conta de docente</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-navy-900/40 mb-1.5">
              Nome
            </label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome completo"
              className="w-full border border-navy-100 px-3 h-11 text-sm outline-none focus:border-sky"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-navy-900/40 mb-1.5">
              Correio
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="docente@esj.ac.mz"
              className="w-full border border-navy-100 px-3 h-11 text-sm outline-none focus:border-sky"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-navy-900/40 mb-1.5">
              Palavra-passe
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full border border-navy-100 px-3 h-11 text-sm outline-none focus:border-sky"
            />
          </div>
        </div>

        {toast && (
          <p className={`mt-4 text-sm ${toastErro ? "text-crimson" : "text-leaf"}`}>{toast}</p>
        )}

        <div className="mt-6">
          <button
            type="button"
            disabled={busy}
            onClick={() => void criar()}
            className="inline-flex items-center gap-2 h-11 px-5 bg-navy-900 text-white text-sm font-bold hover:bg-crimson disabled:opacity-60 transition-colors"
          >
            <UserPlus size={16} />
            {busy ? "A CRIAR…" : "CRIAR CONTA"}
          </button>
        </div>
      </div>

      <div className="bg-white border border-navy-100">
        <div className="px-6 py-4 border-b border-navy-100">
          <h2 className="font-serif text-lg font-bold text-navy-900">Contas de docente</h2>
        </div>
        {loading ? (
          <p className="px-6 py-8 text-sm text-navy-900/55">A carregar…</p>
        ) : !contas || contas.length === 0 ? (
          <p className="px-6 py-8 text-sm text-navy-900/55 italic">
            Ainda não há contas de docente.
          </p>
        ) : (
          <ul className="divide-y divide-navy-100">
            {contas.map((c) => (
              <li key={c.id} className="flex items-center gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-navy-900">{c.nome || "Sem nome"}</p>
                  <p className="text-[12px] text-navy-900/55">{c.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void eliminar(c)}
                  title="Eliminar conta"
                  aria-label={`Eliminar ${c.email}`}
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
