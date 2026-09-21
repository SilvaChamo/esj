"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Pencil,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import { CURSOS_DOCENCIA } from "@/lib/docencia";
import { separarNome } from "@/lib/admissao";

type ItemEstudante = {
  id: string;
  numeroEstudante: string;
  nome: string;
  curso: string;
  regime: "diurno" | "pos-laboral";
  ano: number;
  temConta: boolean;
  userId: string | null;
  email: string;
  matriculaEstado: "activo" | "trancado" | "desistiu";
};

const LABEL_MATRICULA: Record<ItemEstudante["matriculaEstado"], string> = {
  activo: "Activo",
  trancado: "Trancado",
  desistiu: "Desistiu",
};

function corMatricula(estado: ItemEstudante["matriculaEstado"]) {
  if (estado === "trancado") return "text-amber-600 bg-amber-500/10";
  if (estado === "desistiu") return "text-crimson bg-crimson/10";
  return "";
}

/** Mesma regra de separarNome (lib/admissao.ts) em toda a parte — só maiusculiza o apelido para exibição aqui. */
function formatarNomeEstudante(nomeCompleto: string): { apelidoUpper: string; primeiroNome: string } {
  const { apelido, nome } = separarNome(nomeCompleto);
  return { apelidoUpper: apelido.toUpperCase(), primeiroNome: nome };
}

type FiltroInicial = { curso: string; ano: number } | null;

export default function ContasEstudantes({ filtroInicial }: { filtroInicial?: FiltroInicial }) {
  const [estudantes, setEstudantes] = useState<ItemEstudante[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Filtros — inicializados a partir de filtroInicial quando se chega aqui a
  // ver os estudantes de uma cadeira específica (ex.: clicando na cadeira na
  // lista de docentes); em navegação normal pela barra lateral vem vazio.
  const [regimeFiltro, setRegimeFiltro] = useState<string>("todos");
  const [cursoFiltro, setCursoFiltro] = useState<string>(filtroInicial?.curso || "todos");
  const [anoFiltro, setAnoFiltro] = useState<string>(filtroInicial?.ano ? String(filtroInicial.ano) : "todos");
  // "Activos" por omissão — trancados/desistentes saem da turma activa sem
  // desaparecerem, continuam visíveis ao mudar este filtro.
  const [matriculaFiltro, setMatriculaFiltro] = useState<string>("activo");
  const [pesquisa, setPesquisa] = useState<string>("");

  // Seleção em lote (Checkboxes)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  // Toast flutuante simples que desaparece sozinho
  const [toastMessage, setToastMessage] = useState<{ texto: string; tipo: "sucesso" | "erro" } | null>(null);

  // Modais
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [estudanteEditando, setEstudanteEditando] = useState<ItemEstudante | null>(null);
  const [estudanteEliminando, setEstudanteEliminando] = useState<ItemEstudante | null>(null);
  const [confirmarEliminarLote, setConfirmarEliminarLote] = useState(false);

  // Formulário
  const [formNum, setFormNum] = useState("");
  const [formApelido, setFormApelido] = useState("");
  const [formPrimeiroNome, setFormPrimeiroNome] = useState("");
  const [formCurso, setFormCurso] = useState("jornalismo");
  const [formRegime, setFormRegime] = useState<"diurno" | "pos-laboral">("diurno");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [processando, setProcessando] = useState(false);

  const mostrarToast = (texto: string, tipo: "sucesso" | "erro" = "sucesso") => {
    setToastMessage({ texto, tipo });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const carregarEstudantes = async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (regimeFiltro !== "todos") params.set("regime", regimeFiltro);
      if (cursoFiltro !== "todos") params.set("curso", cursoFiltro);
      if (anoFiltro !== "todos") params.set("ano", anoFiltro);
      params.set("matricula", matriculaFiltro);
      if (pesquisa.trim()) params.set("q", pesquisa.trim());

      const res = await fetch(`/api/estudantes-contas?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Não foi possível carregar os estudantes.");

      // Ordem alfabética (A → Z) pelo nome — igual em todas as listas do painel.
      const lista = [...(json.estudantes || [])].sort((a, b) =>
        (a.nome || "").localeCompare(b.nome || "", "pt")
      );
      setEstudantes(lista);
    } catch (err) {
      mostrarToast(err instanceof Error ? err.message : "Erro ao carregar estudantes.", "erro");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarEstudantes();
  }, [regimeFiltro, cursoFiltro, anoFiltro, matriculaFiltro]);

  const handlePesquisaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void carregarEstudantes();
  };

  // Checkboxes
  const todosSelecionados = estudantes.length > 0 && estudantes.every((e) => selecionados.has(e.numeroEstudante));

  const toggleSelecionarTodos = () => {
    if (todosSelecionados) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(estudantes.map((e) => e.numeroEstudante)));
    }
  };

  const toggleSelecionar = (num: string) => {
    setSelecionados((prev) => {
      const proximo = new Set(prev);
      if (proximo.has(num)) proximo.delete(num);
      else proximo.add(num);
      return proximo;
    });
  };

  // Abrir Modal Criar
  const abrirCriarModal = () => {
    setFormNum("");
    setFormApelido("");
    setFormPrimeiroNome("");
    setFormCurso("jornalismo");
    setFormRegime("diurno");
    setFormEmail("");
    setFormPassword("");
    setModalCriarAberto(true);
  };

  // Submeter Criar
  const submeterCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formEmail.includes("@")) {
      mostrarToast("Indique o e-mail real do estudante.", "erro");
      return;
    }
    const nomeCompleto = `${formPrimeiroNome.trim()} ${formApelido.trim()}`.trim();
    setProcessando(true);
    try {
      const res = await fetch("/api/estudantes-contas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "criar_unico",
          numeroEstudante: formNum.trim(),
          nome: nomeCompleto,
          curso: formCurso,
          regime: formRegime,
          email: formEmail.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Não foi possível criar a conta.");

      mostrarToast(
        json.passwordTemporaria
          ? `Conta criada para ${nomeCompleto} (${formNum}). Palavra-passe temporária: ${json.passwordTemporaria} — comunique-a com segurança, não voltará a aparecer.`
          : `Conta criada para ${nomeCompleto} (${formNum}).`
      );
      setModalCriarAberto(false);
      void carregarEstudantes();
    } catch (err) {
      mostrarToast(err instanceof Error ? err.message : "Erro ao criar conta.", "erro");
    } finally {
      setProcessando(false);
    }
  };

  // Abrir Modal Editar
  const abrirEditarModal = (std: ItemEstudante) => {
    setEstudanteEditando(std);
    setFormNum(std.numeroEstudante);
    const { apelidoUpper, primeiroNome } = formatarNomeEstudante(std.nome);
    setFormApelido(apelidoUpper);
    setFormPrimeiroNome(primeiroNome);
    setFormCurso(std.curso);
    setFormRegime(std.regime);
    setFormEmail(std.email || `${std.numeroEstudante.toLowerCase()}@gmail.com`);
    setFormPassword("");
  };

  // Submeter Editar
  const submeterEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estudanteEditando) return;
    const nomeCompleto = `${formPrimeiroNome.trim()} ${formApelido.trim()}`.trim();
    setProcessando(true);
    try {
      const res = await fetch("/api/estudantes-contas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numeroEstudante: formNum,
          nome: nomeCompleto,
          curso: formCurso,
          regime: formRegime,
          email: formEmail.trim(),
          password: formPassword.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Não foi possível atualizar o estudante.");

      mostrarToast(
        json.aviso ? `Estudante ${nomeCompleto} atualizado. ${json.aviso}` : `Estudante ${nomeCompleto} atualizado.`,
        json.aviso ? "erro" : "sucesso"
      );
      setEstudanteEditando(null);
      void carregarEstudantes();
    } catch (err) {
      mostrarToast(err instanceof Error ? err.message : "Erro ao atualizar estudante.", "erro");
    } finally {
      setProcessando(false);
    }
  };

  // Eliminar Único
  const submeterEliminarUnico = async () => {
    if (!estudanteEliminando) return;
    setProcessando(true);
    try {
      const res = await fetch("/api/estudantes-contas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numeroEstudante: estudanteEliminando.numeroEstudante }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Não foi possível eliminar.");

      mostrarToast(`Estudante ${estudanteEliminando.nome} eliminado.`);
      setEstudanteEliminando(null);
      setSelecionados((prev) => {
        const p = new Set(prev);
        p.delete(estudanteEliminando.numeroEstudante);
        return p;
      });
      void carregarEstudantes();
    } catch (err) {
      mostrarToast(err instanceof Error ? err.message : "Erro ao eliminar.", "erro");
    } finally {
      setProcessando(false);
    }
  };

  // Eliminar Lote
  const submeterEliminarLote = async () => {
    if (selecionados.size === 0) return;
    setProcessando(true);
    try {
      const res = await fetch("/api/estudantes-contas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numerosEstudantes: Array.from(selecionados) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao eliminar selecionados.");

      mostrarToast(`Eliminados ${json.eliminados || selecionados.size} estudantes.`);
      setConfirmarEliminarLote(false);
      setSelecionados(new Set());
      void carregarEstudantes();
    } catch (err) {
      mostrarToast(err instanceof Error ? err.message : "Erro ao eliminar selecionados.", "erro");
    } finally {
      setProcessando(false);
    }
  };

  return (
    <>
    <div className="space-y-4">
      {/* Botões ocultos para acionamento do cabeçalho */}
      <button id="btn-criar-estudante-modal" type="button" onClick={abrirCriarModal} className="hidden" />

      {/* Barra de Filtros */}
      <div className="bg-white p-4 border border-navy-100 rounded-lg shadow-sm">
        <form onSubmit={handlePesquisaSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {/* Filtro Regime */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-navy-900/70 mb-1">
              Regime
            </label>
            <select
              value={regimeFiltro}
              onChange={(e) => setRegimeFiltro(e.target.value)}
              className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 font-medium focus:outline-none focus:border-sky"
            >
              <option value="todos">Todos os Regimes</option>
              <option value="diurno">Laboral (Diurno)</option>
              <option value="pos-laboral">Pós-Laboral</option>
            </select>
          </div>

          {/* Filtro Curso */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-navy-900/70 mb-1">
              Curso
            </label>
            <select
              value={cursoFiltro}
              onChange={(e) => setCursoFiltro(e.target.value)}
              className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 font-medium focus:outline-none focus:border-sky"
            >
              <option value="todos">Todos os Cursos</option>
              {CURSOS_DOCENCIA.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.titulo}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Ano */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-navy-900/70 mb-1">
              Ano
            </label>
            <select
              value={anoFiltro}
              onChange={(e) => setAnoFiltro(e.target.value)}
              className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 font-medium focus:outline-none focus:border-sky"
            >
              <option value="todos">Todos os Anos</option>
              <option value="1">1º Ano</option>
              <option value="2">2º Ano</option>
              <option value="3">3º Ano</option>
              <option value="4">4º Ano</option>
            </select>
          </div>

          {/* Filtro Matrícula */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-navy-900/70 mb-1">
              Matrícula
            </label>
            <select
              value={matriculaFiltro}
              onChange={(e) => setMatriculaFiltro(e.target.value)}
              className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 font-medium focus:outline-none focus:border-sky"
            >
              <option value="activo">Activos</option>
              <option value="trancado">Trancados</option>
              <option value="desistiu">Desistentes</option>
              <option value="todos">Todos</option>
            </select>
          </div>

          {/* Pesquisa */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-navy-900/70 mb-1">
              Pesquisar por Nome ou Nº de Estudante
            </label>
            <div className="relative">
              <input
                type="text"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                placeholder="Ex: 20210101MP ou Silva..."
                className="w-full p-2 pl-8 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 focus:outline-none focus:border-sky"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-navy-900/40" />
            </div>
          </div>
        </form>
      </div>

      {/* Tabela de Estudantes */}
      <div className="bg-white border border-navy-100 rounded-lg shadow-sm overflow-hidden">
        {/* Barra do título faz sempre parte da estrutura — ao seleccionar, só o
            lado direito troca para as acções em lote, sem inserir um novo
            bloco que empurre o resto da página. */}
        {!carregando && estudantes.length > 0 && (
          <div className="px-4 py-2.5 border-b border-navy-100 bg-cream/40 flex items-center justify-between gap-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-navy-900/70">Contas de estudante</h2>
            {selecionados.size > 0 ? (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-navy-900/70 font-semibold">
                  {selecionados.size} selecionado{selecionados.size === 1 ? "" : "s"}
                </span>
                <button
                  type="button"
                  onClick={() => setConfirmarEliminarLote(true)}
                  className="inline-flex items-center gap-1 text-crimson hover:text-[#b32d2e] font-bold"
                >
                  <Trash2 size={12} /> Eliminar
                </button>
                <button
                  type="button"
                  onClick={() => setSelecionados(new Set())}
                  className="text-navy-900/50 hover:text-navy-900 font-semibold"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <span className="text-xs font-semibold text-navy-900/50">
                {estudantes.length} estudante{estudantes.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
        )}
        {carregando ? (
          <div className="p-8 text-center text-sm text-navy-900/60">A carregar lista de estudantes…</div>
        ) : estudantes.length === 0 ? (
          <div className="p-8 text-center text-sm text-navy-900/60">
            Nenhum estudante encontrado com os filtros selecionados.
          </div>
        ) : (
          <>
          {/* < lg: cartões — 1 coluna em telemóvel, 2 em tablet (md). */}
          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-px bg-navy-100">
            {estudantes.map((std, idx) => {
              const { apelidoUpper, primeiroNome } = formatarNomeEstudante(std.nome);
              const nomeCurso = CURSOS_DOCENCIA.find((c) => c.slug === std.curso)?.titulo || std.curso;
              const labelRegime = std.regime === "diurno" ? "Laboral" : "Pós-Laboral";
              const estaSelecionado = selecionados.has(std.numeroEstudante);
              return (
                <div
                  key={std.numeroEstudante}
                  className={`p-4 space-y-2 ${
                    estaSelecionado ? "bg-sky/10" : idx % 2 === 1 ? "bg-slate-100/70" : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={estaSelecionado}
                        onChange={() => toggleSelecionar(std.numeroEstudante)}
                        className="mt-1 w-3.5 h-3.5 rounded-[2px] border-navy-300 accent-sky cursor-pointer shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-mono font-bold text-sky text-sm">{std.numeroEstudante}</p>
                        <p className="font-bold text-navy-900 uppercase text-sm truncate">
                          {apelidoUpper} {primeiroNome && <span className="font-normal normal-case">{primeiroNome}</span>}
                        </p>
                        <p className="font-mono text-xs text-navy-900/60 truncate">{std.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title="Editar Estudante"
                        onClick={() => abrirEditarModal(std)}
                        className="p-1.5 text-sky hover:bg-sky/10 rounded transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        title="Eliminar Estudante"
                        onClick={() => setEstudanteEliminando(std)}
                        className="p-1.5 text-crimson hover:bg-crimson/10 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-navy-900/5 text-navy-900/70 border border-navy-100">
                      {nomeCurso}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-navy-900/5 text-navy-900/70 border border-navy-100">
                      {std.ano}º ano
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        std.regime === "diurno"
                          ? "bg-sky/10 text-sky border border-sky/20"
                          : "bg-navy-900/10 text-navy-900 border border-navy-900/20"
                      }`}
                    >
                      {labelRegime}
                    </span>
                    {std.temConta ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-leaf/10 text-leaf border border-leaf/30 rounded text-[10px] font-bold uppercase">
                        <UserCheck size={11} /> Ativa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/30 rounded text-[10px] font-bold uppercase">
                        <AlertTriangle size={11} /> Pendente
                      </span>
                    )}
                    {std.matriculaEstado !== "activo" && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-current/30 ${corMatricula(
                          std.matriculaEstado
                        )}`}
                      >
                        {LABEL_MATRICULA[std.matriculaEstado]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-cream border-b-2 border-navy-100 text-navy-900/70 text-[11px] font-bold uppercase tracking-wider">
                  {/* Line after checkbox */}
                  <th className="p-2 text-center w-7 border-r border-navy-100/60">
                    <input
                      type="checkbox"
                      checked={todosSelecionados}
                      onChange={toggleSelecionarTodos}
                      className="w-3 h-3 rounded-[2px] border-navy-300 accent-sky cursor-pointer"
                    />
                  </th>
                  <th className="p-2 text-center w-10">#</th>

                  {/* Coluna de número dentro de duas linhas verticais */}
                  <th className="p-2.5 text-left w-36 border-l border-r border-navy-100/60 px-3">
                    Nº ESTUDANTE
                  </th>

                  {/* Coluna só com APELIDO */}
                  <th className="p-2.5 text-left w-32 border-r border-navy-100/60">APELIDO</th>

                  {/* Coluna NOME com linha vertical no final e 15px de separação interna */}
                  <th className="p-2.5 text-left w-36 pr-[15px] border-r border-navy-100/60">NOME</th>

                  <th className="p-2.5 text-left pl-3">EMAIL DE ACESSO</th>
                  <th className="p-2.5 text-left w-36">CURSO</th>
                  <th className="p-2.5 text-left w-16">ANO</th>
                  <th className="p-2.5 text-left w-28">REGIME</th>
                  <th className="p-2.5 text-left w-24">ESTADO</th>
                  <th className="p-2.5 text-left w-24">MATRÍCULA</th>
                  <th className="p-2.5 text-left w-20">AÇÃO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 text-navy-900">
                {estudantes.map((std, idx) => {
                  const { apelidoUpper, primeiroNome } = formatarNomeEstudante(std.nome);
                  const nomeCurso = CURSOS_DOCENCIA.find((c) => c.slug === std.curso)?.titulo || std.curso;
                  const labelRegime = std.regime === "diurno" ? "Laboral" : "Pós-Laboral";
                  const estaSelecionado = selecionados.has(std.numeroEstudante);

                  return (
                    <tr
                      key={std.numeroEstudante}
                      className={`transition-colors ${
                        estaSelecionado
                          ? "bg-sky/10"
                          : idx % 2 === 1
                          ? "bg-slate-100/70 hover:bg-sky/5"
                          : "bg-white hover:bg-sky/5"
                      }`}
                    >
                      {/* Checkbox reduzida + linha vertical */}
                      <td className="p-2 text-center border-r border-navy-100/60">
                        <input
                          type="checkbox"
                          checked={estaSelecionado}
                          onChange={() => toggleSelecionar(std.numeroEstudante)}
                          className="w-3 h-3 rounded-[2px] border-navy-300 accent-sky cursor-pointer"
                        />
                      </td>

                      {/* # Ordem (tamanho do número aumentado) */}
                      <td className="p-2 text-center font-mono font-bold text-navy-900 text-sm select-none">
                        {idx + 1}
                      </td>

                      {/* Nº Estudante dentro de duas linhas verticais + tamanho aumentado */}
                      <td className="p-2 text-left font-mono font-bold text-sky text-sm whitespace-nowrap border-l border-r border-navy-100/60 px-3">
                        {std.numeroEstudante}
                      </td>

                      {/* Coluna só com o APELIDO em maiúsculas */}
                      <td className="p-2 text-left whitespace-nowrap font-bold text-navy-900 uppercase border-r border-navy-100/60 w-32">
                        {apelidoUpper}
                      </td>

                      {/* Coluna NOME com separação e linha vertical */}
                      <td className="p-2 text-left whitespace-nowrap pr-[15px] text-navy-900/80 w-36 border-r border-navy-100/60">
                        {primeiroNome || "—"}
                      </td>

                      {/* Email com pl-3 a seguir à linha vertical do NOME */}
                      <td className="p-2 text-left font-mono text-xs text-navy-900/70 whitespace-nowrap pl-3">
                        {std.email}
                      </td>

                      {/* Curso */}
                      <td className="p-2 text-left text-navy-900/80 whitespace-nowrap">{nomeCurso}</td>

                      {/* Ano */}
                      <td className="p-2 text-left text-navy-900/80 whitespace-nowrap">{std.ano}º</td>

                      {/* Regime (Single line / whitespace-nowrap) */}
                      <td className="p-2 text-left whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase whitespace-nowrap inline-block ${
                            std.regime === "diurno"
                              ? "bg-sky/10 text-sky border border-sky/20"
                              : "bg-navy-900/10 text-navy-900 border border-navy-900/20"
                          }`}
                        >
                          {labelRegime}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="p-2 text-left whitespace-nowrap">
                        {std.temConta ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-leaf/10 text-leaf border border-leaf/30 rounded text-[11px] font-bold">
                            <UserCheck size={11} /> Ativa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/30 rounded text-[11px] font-bold">
                            <AlertTriangle size={11} /> Pendente
                          </span>
                        )}
                      </td>

                      {/* Matrícula — só chama a atenção quando não é Activo */}
                      <td className="p-2 text-left whitespace-nowrap">
                        {std.matriculaEstado === "activo" ? (
                          <span className="text-navy-900/40">—</span>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold border border-current/30 ${corMatricula(
                              std.matriculaEstado
                            )}`}
                          >
                            {LABEL_MATRICULA[std.matriculaEstado]}
                          </span>
                        )}
                      </td>

                      {/* Ação (Editar e Eliminar) */}
                      <td className="p-2 text-left whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title="Editar Estudante"
                            onClick={() => abrirEditarModal(std)}
                            className="p-1 text-sky hover:bg-sky/10 rounded transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            title="Eliminar Estudante"
                            onClick={() => setEstudanteEliminando(std)}
                            className="p-1 text-crimson hover:bg-crimson/10 rounded transition-colors"
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

    {/* Toast e modais ficam fora do space-y-4 — ver nota em ContasDocentes.tsx */}
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

    {/* MODAL: Criar Nova Conta de Estudante */}
    {modalCriarAberto && (
        <div className="fixed inset-0 z-[180] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-navy-100 w-full max-w-md p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <h3 className="font-serif font-bold text-navy-900 text-base flex items-center gap-2">
                <UserPlus size={18} className="text-sky" /> Criar Conta de Estudante
              </h3>
              <button
                type="button"
                onClick={() => setModalCriarAberto(false)}
                className="text-navy-900/50 hover:text-navy-900"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submeterCriar} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Nº de Estudante *</label>
                <input
                  type="text"
                  required
                  value={formNum}
                  onChange={(e) => setFormNum(e.target.value)}
                  placeholder="Ex: 20210101MP"
                  className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 font-mono font-bold focus:outline-none focus:border-sky"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Apelido *</label>
                  <input
                    type="text"
                    required
                    value={formApelido}
                    onChange={(e) => setFormApelido(e.target.value)}
                    placeholder="Ex: Albino"
                    className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 focus:outline-none focus:border-sky"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Nome (e segundo nome) *</label>
                  <input
                    type="text"
                    required
                    value={formPrimeiroNome}
                    onChange={(e) => setFormPrimeiroNome(e.target.value)}
                    placeholder="Ex: Miguel Rafael"
                    className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 focus:outline-none focus:border-sky"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Curso</label>
                  <select
                    value={formCurso}
                    onChange={(e) => setFormCurso(e.target.value)}
                    className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 focus:outline-none focus:border-sky"
                  >
                    {CURSOS_DOCENCIA.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.titulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Regime</label>
                  <select
                    value={formRegime}
                    onChange={(e) => setFormRegime(e.target.value as "diurno" | "pos-laboral")}
                    className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 focus:outline-none focus:border-sky"
                  >
                    <option value="diurno">Laboral</option>
                    <option value="pos-laboral">Pós-Laboral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">E-mail real do estudante *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="o e-mail que o estudante usa mesmo"
                  className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs font-mono text-navy-900 focus:outline-none focus:border-sky"
                />
                <p className="mt-1 text-[11px] text-navy-900/50">
                  Tem de ser um e-mail real — a palavra-passe é gerada automaticamente e mostrada só
                  uma vez, para lhe comunicar ao estudante.
                </p>
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

      {/* MODAL: Editar Estudante (REGRA 6: permite trocar o e-mail) */}
      {estudanteEditando && (
        <div className="fixed inset-0 z-[180] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-navy-100 w-full max-w-md p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <h3 className="font-serif font-bold text-navy-900 text-base flex items-center gap-2">
                <Pencil size={16} className="text-sky" /> Editar Estudante ({estudanteEditando.numeroEstudante})
              </h3>
              <button
                type="button"
                onClick={() => setEstudanteEditando(null)}
                className="text-navy-900/50 hover:text-navy-900"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submeterEditar} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Apelido *</label>
                  <input
                    type="text"
                    required
                    value={formApelido}
                    onChange={(e) => setFormApelido(e.target.value)}
                    className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 focus:outline-none focus:border-sky"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Nome (e segundo nome) *</label>
                  <input
                    type="text"
                    required
                    value={formPrimeiroNome}
                    onChange={(e) => setFormPrimeiroNome(e.target.value)}
                    className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 focus:outline-none focus:border-sky"
                  />
                </div>
              </div>

              {/* REGRA 6: Trocar e-mail do estudante */}
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">E-mail de Acesso (@gmail.com) *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="estudante@gmail.com"
                  className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs font-mono text-navy-900 focus:outline-none focus:border-sky"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Curso</label>
                  <select
                    value={formCurso}
                    onChange={(e) => setFormCurso(e.target.value)}
                    className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 focus:outline-none focus:border-sky"
                  >
                    {CURSOS_DOCENCIA.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.titulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Regime</label>
                  <select
                    value={formRegime}
                    onChange={(e) => setFormRegime(e.target.value as "diurno" | "pos-laboral")}
                    className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs text-navy-900 focus:outline-none focus:border-sky"
                  >
                    <option value="diurno">Laboral</option>
                    <option value="pos-laboral">Pós-Laboral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Repor Palavra-passe (Opcional)</label>
                <input
                  type="text"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Preencha apenas se quiser alterar a palavra-passe"
                  className="w-full p-2 bg-cream/40 border border-navy-100 rounded text-xs font-mono text-navy-900 focus:outline-none focus:border-sky"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-navy-100">
                <button
                  type="button"
                  onClick={() => setEstudanteEditando(null)}
                  className="px-3 py-2 border border-navy-100 text-xs font-semibold rounded text-navy-900/70 hover:bg-cream"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processando}
                  className="px-4 py-2 bg-sky hover:bg-sky/90 text-white text-xs font-bold rounded shadow-sm disabled:opacity-50"
                >
                  {processando ? "A guardar…" : "Guardar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Eliminar Único */}
      {estudanteEliminando && (
        <div className="fixed inset-0 z-[180] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-navy-100 w-full max-w-sm p-6 space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-crimson">
              <AlertTriangle size={24} />
              <h3 className="font-serif font-bold text-base text-navy-900">Eliminar Estudante</h3>
            </div>
            <p className="text-xs text-navy-900/80 leading-relaxed">
              Tem certeza que pretende eliminar o estudante <strong>{estudanteEliminando.nome}</strong> (
              {estudanteEliminando.numeroEstudante})? Esta ação removerá a inscrição e a conta de acesso.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-navy-100">
              <button
                type="button"
                onClick={() => setEstudanteEliminando(null)}
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
              Tem certeza que pretende eliminar os <strong>{selecionados.size} estudantes</strong> selecionados?
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
