"use client";

import { Fragment, type FormEvent, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ChevronUp, Pencil, Plus, Search, Trash2, UserPlus, X } from "lucide-react";
import {
  montarCatalogo,
  nomeCadeira,
  anoCadeira,
  listarCadeirasExtras,
  listarCadeirasOverrides,
  type GrupoCadeiras,
  type CadeiraExtra,
  type CadeiraOverride,
} from "@/lib/docencia-cadeiras";
import { CURSOS_DOCENCIA } from "@/lib/docencia";

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

/**
 * Seletor de cadeiras reutilizável: busca + filtro de curso + checkboxes de
 * todas as cadeiras da ESJ + forma manual de acrescentar uma cadeira que
 * ainda não exista no catálogo. Usado tanto ao criar um docente (popup)
 * como a editar as cadeiras de um docente já existente ("Gerir").
 */
function SeletorCadeiras({
  catalogo,
  selecionadas,
  onAlternar,
  busca,
  setBusca,
  cursoFiltro,
  setCursoFiltro,
  onCadeiraAdicionada,
  extrasTabelaFalta,
}: {
  catalogo: GrupoCadeiras[];
  selecionadas: Set<string>;
  onAlternar: (curso: string, codigo: string) => void;
  busca: string;
  setBusca: (v: string) => void;
  cursoFiltro: string;
  setCursoFiltro: (v: string) => void;
  onCadeiraAdicionada: (extra: CadeiraExtra) => void;
  extrasTabelaFalta: boolean;
}) {
  // Formulário para acrescentar uma cadeira nova — usa sempre o curso já
  // escolhido no filtro (nunca um segundo selector de curso repetido).
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novoCodigo, setNovoCodigo] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novoAno, setNovoAno] = useState("1");
  const [novoSemestre, setNovoSemestre] = useState("1");
  const [adicionando, setAdicionando] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastErro, setToastErro] = useState(false);

  const chave = (curso: string, codigo: string) => `${curso}::${codigo}`;

  const adicionarCadeiraNova = async () => {
    const codigo = novoCodigo.trim();
    const nome = novoNome.trim();
    if (cursoFiltro === "todos") {
      setToast("Selecione um curso no filtro antes de acrescentar uma cadeira.");
      setToastErro(true);
      return;
    }
    if (!codigo || !nome) {
      setToast("Indique o código e o nome da nova cadeira.");
      setToastErro(true);
      return;
    }
    setAdicionando(true);
    setToast(null);
    try {
      // Passa sempre pela rota /api/cadeiras-adicionais (super-admin + chave
      // de serviço) — nunca escreve directamente na tabela pelo cliente, ver
      // comentário em supabase/cadeiras-adicionais.sql.
      const r = await pedir<{ cadeira: CadeiraExtra }>(
        "/api/cadeiras-adicionais",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            curso: cursoFiltro,
            codigo,
            nome,
            ano: Number(novoAno),
            semestre: Number(novoSemestre),
          }),
        }
      );
      onCadeiraAdicionada(r.cadeira);
      // A cadeira acabada de criar já fica selecionada — poupa um segundo clique.
      onAlternar(cursoFiltro, r.cadeira.codigo);
      setToast(`Cadeira "${nome}" acrescentada e selecionada.`);
      setToastErro(false);
      setNovoCodigo("");
      setNovoNome("");
      setNovoAno("1");
      setNovoSemestre("1");
      setMostrarForm(false);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Não foi possível acrescentar a cadeira.");
      setToastErro(true);
    } finally {
      setAdicionando(false);
    }
  };

  const q = busca.trim().toLowerCase();

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="relative w-full sm:max-w-sm">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-navy-900/40" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar cadeira por nome ou código…"
            className="w-full border border-navy-100 pl-8 pr-3 h-10 text-xs outline-none focus:border-sky bg-white"
          />
        </div>
        <select
          value={cursoFiltro}
          onChange={(e) => {
            setCursoFiltro(e.target.value);
            setMostrarForm(false);
          }}
          className="border border-navy-100 px-3 h-10 text-xs outline-none focus:border-sky bg-white sm:w-56"
        >
          <option value="todos">Todos os cursos</option>
          {CURSOS_DOCENCIA.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.titulo}
            </option>
          ))}
        </select>
        {cursoFiltro !== "todos" && (
          <button
            type="button"
            onClick={() => setMostrarForm((v) => !v)}
            className="shrink-0 inline-flex items-center justify-center gap-1.5 h-10 px-3 bg-sky/10 text-sky text-xs font-bold hover:bg-sky/20 transition-colors"
          >
            <Plus size={14} /> Nova cadeira
          </button>
        )}
      </div>
      {cursoFiltro === "todos" && (
        <p className="text-[11px] text-navy-900/45">
          Selecione um curso no filtro acima para poder acrescentar-lhe uma cadeira nova.
        </p>
      )}

      {mostrarForm && cursoFiltro !== "todos" && (
        <div className="bg-white border border-navy-100 p-3 space-y-2">
          {extrasTabelaFalta && (
            <p className="text-[11px] text-amber-600">
              A tabela cadeiras_adicionais ainda não existe no Supabase — corra supabase/cadeiras-adicionais.sql
              antes de acrescentar.
            </p>
          )}
          {/* Responsivo: telemóvel = 1 coluna, tablet = 2 colunas, computador = tudo na mesma linha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 lg:items-end">
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-bold text-navy-900/45 mb-1">Nome da cadeira</label>
              <input
                type="text"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Nome da cadeira"
                className="w-full border border-navy-100 px-2 h-9 text-xs outline-none focus:border-sky"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-navy-900/45 mb-1">Código</label>
              <input
                type="text"
                value={novoCodigo}
                onChange={(e) => setNovoCodigo(e.target.value)}
                placeholder="Código"
                className="w-full border border-navy-100 px-2 h-9 text-xs outline-none focus:border-sky"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-navy-900/45 mb-1">Ano</label>
              <select
                value={novoAno}
                onChange={(e) => setNovoAno(e.target.value)}
                className="w-full border border-navy-100 px-2 h-9 text-xs outline-none focus:border-sky"
              >
                {[1, 2, 3, 4].map((a) => (
                  <option key={a} value={a}>
                    {a}º ano
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-navy-900/45 mb-1">Semestre</label>
              <select
                value={novoSemestre}
                onChange={(e) => setNovoSemestre(e.target.value)}
                className="w-full border border-navy-100 px-2 h-9 text-xs outline-none focus:border-sky"
              >
                {[1, 2].map((s) => (
                  <option key={s} value={s}>
                    {s}º semestre
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              disabled={adicionando}
              onClick={() => void adicionarCadeiraNova()}
              className="inline-flex items-center gap-1.5 h-9 px-3 bg-sky text-white text-xs font-bold hover:bg-sky/90 disabled:opacity-60 transition-colors"
            >
              {adicionando ? "A acrescentar…" : "Guardar cadeira"}
            </button>
            <button
              type="button"
              onClick={() => setMostrarForm(false)}
              className="text-xs font-semibold text-navy-900/50 hover:text-navy-900"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="max-h-72 overflow-y-auto space-y-4 bg-white border border-navy-100 p-4">
        {catalogo
          .filter((grupo) => cursoFiltro === "todos" || grupo.curso === cursoFiltro)
          .map((grupo) => {
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
                        onChange={() => onAlternar(grupo.curso, cad.codigo)}
                      />
                      <span className="font-mono text-[10px] text-navy-900/50">{cad.codigo}</span>
                      <span className="truncate">{cad.nome}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
      </div>

      {selecionadas.size > 0 && (
        <p className="text-[11px] font-semibold text-navy-900/60">
          {selecionadas.size} cadeira{selecionadas.size === 1 ? "" : "s"} selecionada
          {selecionadas.size === 1 ? "" : "s"}.
        </p>
      )}

      {toast && <p className={`text-xs ${toastErro ? "text-crimson" : "text-leaf"}`}>{toast}</p>}
    </div>
  );
}

function CadeirasDocente({
  docente,
  catalogo,
  onCadeiraAdicionada,
  extrasTabelaFalta,
  onFechar,
  onGuardado,
}: {
  docente: ContaDocente;
  catalogo: GrupoCadeiras[];
  onCadeiraAdicionada: (extra: CadeiraExtra) => void;
  extrasTabelaFalta: boolean;
  onFechar: () => void;
  onGuardado: () => void;
}) {
  const [carregando, setCarregando] = useState(true);
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [busca, setBusca] = useState("");
  const [cursoFiltro, setCursoFiltro] = useState<string>("todos");
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
      const cadeiras = catalogo.flatMap((grupo) =>
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
      onGuardado();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Não foi possível guardar.");
      setToastErro(true);
    } finally {
      setGuardando(false);
    }
  };

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

      {carregando ? (
        <p className="text-xs text-navy-900/55">A carregar…</p>
      ) : (
        <SeletorCadeiras
          catalogo={catalogo}
          selecionadas={selecionadas}
          onAlternar={alternar}
          busca={busca}
          setBusca={setBusca}
          cursoFiltro={cursoFiltro}
          setCursoFiltro={setCursoFiltro}
          onCadeiraAdicionada={onCadeiraAdicionada}
          extrasTabelaFalta={extrasTabelaFalta}
        />
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

export default function ContasDocentes({
  onVerEstudantesCadeira,
}: {
  onVerEstudantesCadeira?: (curso: string, ano: number) => void;
}) {
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

  // Popup "Criar conta de docente" — inclui já a escolha das cadeiras.
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [cadeirasSelCriar, setCadeirasSelCriar] = useState<Set<string>>(new Set());
  const [buscaCriar, setBuscaCriar] = useState("");
  const [cursoFiltroCriar, setCursoFiltroCriar] = useState("todos");
  const [cadeirasPorConta, setCadeirasPorConta] = useState<Record<string, CadeiraAtribuidaRow[]>>({});
  // Contas cuja lista de cadeiras (quando > 3) está aberta na coluna da tabela.
  const [cadeirasAbertas, setCadeirasAbertas] = useState<Set<string>>(new Set());
  // Cadeiras acrescentadas pela secretaria (tabela cadeiras_adicionais) e
  // correcções ao catálogo estático (tabela cadeiras_overrides) — ambas
  // reflectidas aqui para que o que se atribui a um docente bata certo com
  // o que a página "Cadeiras" mostra (nomes editados, cadeiras escondidas).
  const [extras, setExtras] = useState<CadeiraExtra[]>([]);
  const [extrasTabelaFalta, setExtrasTabelaFalta] = useState(false);
  const [overrides, setOverrides] = useState<CadeiraOverride[]>([]);
  const catalogo = useMemo(() => montarCatalogo(extras, overrides), [extras, overrides]);

  const alternarCadeirasAbertas = (contaId: string) => {
    setCadeirasAbertas((prev) => {
      const novo = new Set(prev);
      if (novo.has(contaId)) novo.delete(contaId);
      else novo.add(contaId);
      return novo;
    });
  };

  useEffect(() => {
    listarCadeirasExtras().then(({ extras, tabelaFalta }) => {
      setExtras(extras);
      setExtrasTabelaFalta(tabelaFalta);
    });
    listarCadeirasOverrides().then(({ overrides }) => setOverrides(overrides));
  }, []);

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

  // Carrega a lista de cadeiras de cada docente, para mostrar na coluna "Cadeira" da tabela
  useEffect(() => {
    if (!contas || contas.length === 0) return;
    let cancelado = false;
    Promise.all(
      contas.map((c) =>
        pedir<{ cadeiras: CadeiraAtribuidaRow[] }>(
          `/api/docencia-cadeiras?docenteId=${encodeURIComponent(c.id)}`
        )
          .then((r) => [c.id, r.cadeiras] as const)
          .catch(() => [c.id, []] as const)
      )
    ).then((resultados) => {
      if (cancelado) return;
      setCadeirasPorConta(Object.fromEntries(resultados));
    });
    return () => {
      cancelado = true;
    };
  }, [contas]);

  const recarregarCadeirasDeConta = (docenteId: string) => {
    pedir<{ cadeiras: CadeiraAtribuidaRow[] }>(
      `/api/docencia-cadeiras?docenteId=${encodeURIComponent(docenteId)}`
    )
      .then((r) => setCadeirasPorConta((p) => ({ ...p, [docenteId]: r.cadeiras })))
      .catch(() => {});
  };

  const abrirModalCriar = () => {
    setNome("");
    setEmail("");
    setPassword("");
    setCadeirasSelCriar(new Set());
    setBuscaCriar("");
    setCursoFiltroCriar("todos");
    setToast(null);
    setModalCriarAberto(true);
  };

  const alternarCadeiraCriar = (curso: string, codigo: string) => {
    const k = `${curso}::${codigo}`;
    setCadeirasSelCriar((prev) => {
      const novo = new Set(prev);
      if (novo.has(k)) novo.delete(k);
      else novo.add(k);
      return novo;
    });
  };

  const criar = async (e: FormEvent) => {
    e.preventDefault();
    setToast(null);
    setToastErro(false);
    setBusy(true);
    try {
      const r = await pedir<{ actualizado?: boolean; id?: string }>("/api/docencia-contas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, password }),
      });

      // Já com as cadeiras escolhidas no popup — evita um segundo passo
      // (abrir "Gerir") só para atribuir o que já se sabia à partida.
      if (r.id && cadeirasSelCriar.size > 0) {
        const cadeiras = catalogo.flatMap((grupo) =>
          grupo.cadeiras
            .filter((cad) => cadeirasSelCriar.has(`${grupo.curso}::${cad.codigo}`))
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
          body: JSON.stringify({ docenteId: r.id, docenteEmail: email, cadeiras }),
        });
      }

      setModalCriarAberto(false);
      setToast(
        r.actualizado
          ? "Este correio já tinha conta — foi-lhe atribuído o papel de docente (a palavra-passe existente não foi alterada)."
          : `Conta de docente criada${cadeirasSelCriar.size > 0 ? ` com ${cadeirasSelCriar.size} cadeira${cadeirasSelCriar.size === 1 ? "" : "s"}` : ""}.`
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
    <>
    <div className="space-y-6">
      {/* Botão oculto para acionamento a partir do cabeçalho do painel */}
      <button id="btn-criar-docente-modal" type="button" onClick={abrirModalCriar} className="hidden" />

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

      {toast && !modalCriarAberto && (
        <p className={`text-sm font-semibold ${toastErro ? "text-crimson" : "text-leaf"}`}>{toast}</p>
      )}

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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-cream/70 border-b border-navy-100 text-[11px] font-bold uppercase tracking-wider text-navy-900/70">
                  <th className="px-6 py-3">Nome do Docente</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3 min-w-[420px]">Cadeira(s)</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {contas.map((c) => {
                  const cadeiras = cadeirasPorConta[c.id];
                  return (
                    <Fragment key={c.id}>
                      <tr className="hover:bg-cream/40 transition-colors">
                        <td className="px-6 py-4 font-semibold text-navy-900 align-top">
                          {c.nome || "Sem nome"}
                        </td>
                        <td className="px-6 py-4 text-navy-900/70 align-top">{c.email}</td>
                        <td className="px-6 py-4 align-top">
                          {cadeiras === undefined ? (
                            <span className="text-xs text-navy-900/40">A carregar…</span>
                          ) : cadeiras.length === 0 ? (
                            <span className="text-xs text-navy-900/40 italic">Nenhuma atribuída</span>
                          ) : (
                            (() => {
                              const aberta = cadeirasAbertas.has(c.id);
                              const primeiras = cadeiras.slice(0, 3);
                              const renderTag = (cad: CadeiraAtribuidaRow) => {
                                const ano = anoCadeira(catalogo, cad.curso, cad.cadeira_codigo);
                                return (
                                  <button
                                    key={`${cad.curso}::${cad.cadeira_codigo}`}
                                    type="button"
                                    title={`${cad.cadeira_codigo} — ver estudantes desta cadeira`}
                                    onClick={() => ano !== null && onVerEstudantesCadeira?.(cad.curso, ano)}
                                    disabled={ano === null || !onVerEstudantesCadeira}
                                    className="shrink-0 whitespace-nowrap inline-block px-2 py-0.5 bg-leaf/10 text-leaf text-[11px] font-semibold rounded border border-leaf/30 hover:bg-leaf/20 hover:underline disabled:hover:no-underline disabled:cursor-default transition-colors"
                                  >
                                    {nomeCadeira(catalogo, cad.curso, cad.cadeira_codigo)}
                                  </button>
                                );
                              };
                              return (
                                <div>
                                  <div className="flex flex-nowrap items-center gap-1.5">
                                    {primeiras.map(renderTag)}
                                    {cadeiras.length > 3 && (
                                      <button
                                        type="button"
                                        onClick={() => alternarCadeirasAbertas(c.id)}
                                        title={aberta ? "Fechar lista" : "Ver todas as cadeiras"}
                                        className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] font-bold text-navy-900/60 hover:text-navy-900 transition-colors"
                                      >
                                        {aberta ? (
                                          <ChevronUp size={12} />
                                        ) : (
                                          <>
                                            +{cadeiras.length - 3} <ChevronDown size={12} />
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                  {aberta && cadeiras.length > 3 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-navy-100/60">
                                      {cadeiras.map(renderTag)}
                                    </div>
                                  )}
                                </div>
                              );
                            })()
                          )}
                        </td>
                        <td className="px-6 py-4 text-right align-top">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setExpandido((v) => (v === c.id ? null : c.id))}
                              className="shrink-0 inline-flex items-center gap-1.5 border border-navy-100 hover:border-sky text-navy-900 text-xs font-bold px-3 py-2 transition-colors"
                            >
                              <Pencil size={14} />
                              Gerir
                              {expandido === c.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => void eliminar(c)}
                              title="Eliminar conta"
                              aria-label={`Eliminar ${c.email}`}
                              className="shrink-0 p-2 text-crimson hover:bg-cream transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandido === c.id && (
                        <tr>
                          <td colSpan={4} className="p-0">
                            <CadeirasDocente
                              docente={c}
                              catalogo={catalogo}
                              extrasTabelaFalta={extrasTabelaFalta}
                              onCadeiraAdicionada={(extra) => setExtras((prev) => [...prev, extra])}
                              onFechar={() => setExpandido(null)}
                              onGuardado={() => recarregarCadeirasDeConta(c.id)}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>

    {/* MODAL: Criar Nova Conta de Docente — fora do space-y-6 para o
        "fixed inset-0" não herdar margin-top do container e deixar uma
        faixa no topo sem o fundo transparente. */}
    {modalCriarAberto && (
        <div className="fixed inset-0 z-[180] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-navy-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <h3 className="font-serif font-bold text-navy-900 text-base flex items-center gap-2">
                <UserPlus size={18} className="text-sky" /> Criar Conta de Docente
              </h3>
              <button
                type="button"
                onClick={() => setModalCriarAberto(false)}
                className="text-navy-900/50 hover:text-navy-900"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={criar} className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Nome</label>
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome completo"
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
                    placeholder="docente@esj.ac.mz"
                    className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 focus:outline-none focus:border-sky"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Palavra-passe *</label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 focus:outline-none focus:border-sky"
                  />
                </div>
              </div>

              <div className="border-t border-navy-100 pt-3">
                <p className="text-xs font-bold text-navy-900 mb-2">Cadeiras a atribuir (opcional)</p>
                <SeletorCadeiras
                  catalogo={catalogo}
                  selecionadas={cadeirasSelCriar}
                  onAlternar={alternarCadeiraCriar}
                  busca={buscaCriar}
                  setBusca={setBuscaCriar}
                  cursoFiltro={cursoFiltroCriar}
                  setCursoFiltro={setCursoFiltroCriar}
                  onCadeiraAdicionada={(extra) => setExtras((prev) => [...prev, extra])}
                  extrasTabelaFalta={extrasTabelaFalta}
                />
              </div>

              {toast && (
                <p className={`text-xs font-semibold ${toastErro ? "text-crimson" : "text-leaf"}`}>{toast}</p>
              )}

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
                  disabled={busy}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-crimson text-white text-xs font-bold rounded shadow-sm disabled:opacity-60 transition-colors"
                >
                  <UserPlus size={14} />
                  {busy ? "A criar…" : "Criar Conta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
