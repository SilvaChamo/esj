"use client";

import { useEffect, useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, Trash2, UserPlus } from "lucide-react";
import { todasAsCadeirasPorCurso } from "@/lib/docencia-cadeiras";

type ContaDocente = {
  id: string;
  email: string | null;
  nome: string | null;
  createdAt: string;
};

type CadeiraAtribuidaRow = {
  curso: string;
  cadeira_codigo: string;
};

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Não foi possível completar o pedido.");
  return json as T;
}

const CURSOS_CADEIRAS = todasAsCadeirasPorCurso();

function CadeirasDocente({
  docente,
  onFechar,
}: {
  docente: ContaDocente;
  onFechar: () => void;
}) {
  const [carregando, setCarregando] = useState(true);
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [busca, setBusca] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastErro, setToastErro] = useState(false);

  const chave = (curso: string, codigo: string) => `${curso}::${codigo}`;

  useEffect(() => {
    setCarregando(true);
    pedir<{ cadeiras: CadeiraAtribuidaRow[] }>(
      `/api/docencia-cadeiras?docenteId=${encodeURIComponent(docente.id)}`
    )
      .then((r) => {
        setSelecionadas(new Set(r.cadeiras.map((c) => chave(c.curso, c.cadeira_codigo))));
      })
      .catch((err) => {
        setToast(err instanceof Error ? err.message : "Não foi possível carregar as cadeiras.");
        setToastErro(true);
      })
      .finally(() => setCarregando(false));
  }, [docente.id]);

  const alternar = (curso: string, codigo: string) => {
    setSelecionadas((prev) => {
      const novo = new Set(prev);
      const k = chave(curso, codigo);
      if (novo.has(k)) novo.delete(k);
      else novo.add(k);
      return novo;
    });
  };

  const guardar = async () => {
    setGuardando(true);
    setToast(null);
    try {
      const cadeiras = CURSOS_CADEIRAS.flatMap((grupo) =>
        grupo.cadeiras
          .filter((cad) => selecionadas.has(chave(grupo.curso, cad.codigo)))
          .map((cad) => ({
            curso: grupo.curso,
            codigo: cad.codigo,
            nome: cad.nome,
            ano: cad.ano,
            semestre: cad.semestre,
          }))
      );
      await pedir("/api/docencia-cadeiras", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docenteId: docente.id, docenteEmail: docente.email, cadeiras }),
      });
      setToast(`Cadeiras atualizadas (${cadeiras.length} atribuída${cadeiras.length === 1 ? "" : "s"}).`);
      setToastErro(false);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Não foi possível guardar.");
      setToastErro(true);
    } finally {
      setGuardando(false);
    }
  };

  const q = busca.trim().toLowerCase();

  return (
    <div className="border-t border-navy-100 bg-cream/40 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-navy-900">
            Cadeiras leccionadas por {docente.nome || docente.email}
          </p>
          <p className="text-xs text-navy-900/55 mt-0.5">
            Marque as cadeiras que este docente lecciona. Só verá e poderá lançar notas nestas.
          </p>
        </div>
        <button
          type="button"
          onClick={onFechar}
          className="shrink-0 text-xs font-bold text-navy-900/50 hover:text-navy-900"
        >
          Fechar
        </button>
      </div>

      <input
        type="text"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Filtrar por nome ou código da cadeira…"
        className="w-full max-w-sm border border-navy-100 px-3 h-10 text-xs outline-none focus:border-sky bg-white"
      />

      {carregando ? (
        <p className="text-xs text-navy-900/55">A carregar…</p>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-4 bg-white border border-navy-100 p-4">
          {CURSOS_CADEIRAS.map((grupo) => {
            const cadeiras = grupo.cadeiras.filter(
              (c) => !q || c.nome.toLowerCase().includes(q) || c.codigo.toLowerCase().includes(q)
            );
            if (cadeiras.length === 0) return null;
            return (
              <div key={grupo.curso}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-sky mb-2">
                  {grupo.cursoNome}
                </p>
                <div className="grid sm:grid-cols-2 gap-1.5">
                  {cadeiras.map((cad) => (
                    <label
                      key={cad.id}
                      className="flex items-center gap-2 text-xs text-navy-900 px-2 py-1.5 hover:bg-cream/60 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selecionadas.has(chave(grupo.curso, cad.codigo))}
                        onChange={() => alternar(grupo.curso, cad.codigo)}
                      />
                      <span className="font-mono text-[10px] text-navy-900/50">{cad.codigo}</span>
                      <span className="truncate">{cad.nome}</span>
                      <span className="text-navy-900/40 shrink-0">
                        ({cad.ano}º/{cad.semestre}º)
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <p className={`text-xs ${toastErro ? "text-crimson" : "text-leaf"}`}>{toast}</p>
      )}

      <button
        type="button"
        disabled={guardando || carregando}
        onClick={() => void guardar()}
        className="inline-flex items-center gap-2 h-10 px-5 bg-navy-900 text-white text-xs font-bold hover:bg-crimson disabled:opacity-60 transition-colors"
      >
        {guardando ? "A GUARDAR…" : "GUARDAR CADEIRAS"}
      </button>
    </div>
  );
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
  const [expandido, setExpandido] = useState<string | null>(null);

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
          ? "Este correio já tinha conta — foi-lhe atribuído o papel de docente (a palavra-passe existente não foi alterada)."
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

      <div className="gestao-list-card">
        <div className="gestao-list-header flex items-center justify-between">
          <h2>Contas de docente</h2>
          <span>{contas?.length ?? 0} conta{contas?.length === 1 ? "" : "s"}</span>
        </div>
        {loading ? (
          <p className="px-6 py-8 text-sm text-navy-900/55">A carregar…</p>
        ) : !contas || contas.length === 0 ? (
          <p className="px-6 py-8 text-sm text-navy-900/55 italic">
            Ainda não há contas de docente.
          </p>
        ) : (
          <ul>
            {contas.map((c) => (
              <li key={c.id} className="gestao-list-row">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-xs text-navy-900">{c.nome || "Sem nome"}</p>
                    <p className="mt-0.5 truncate text-[11px] text-navy-900/55">{c.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandido((v) => (v === c.id ? null : c.id))}
                    className="shrink-0 inline-flex items-center gap-1.5 border border-[#d7e1ec] bg-white px-2.5 py-1.5 text-[11px] font-bold text-navy-900 transition-colors hover:border-sky"
                  >
                    <BookOpen size={14} />
                    Cadeiras
                    {expandido === c.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => void eliminar(c)}
                    title="Eliminar conta"
                    aria-label={`Eliminar ${c.email}`}
                    className="gestao-list-action shrink-0 text-crimson hover:border-crimson/30 hover:text-crimson"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {expandido === c.id && (
                  <CadeirasDocente docente={c} onFechar={() => setExpandido(null)} />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
