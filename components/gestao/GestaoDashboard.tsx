"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  Award,
  Bell,
  BookOpen,
  Calendar,
  FileText,
  LayoutDashboard,
  Mail,
  Newspaper,
  Users,
  Video,
  LogOut,
} from "lucide-react";
import {
  DEFAULT_CALENDARIO,
  loadCalendario,
  type Calendario,
} from "@/lib/calendario";
import {
  DEFAULT_EVENTO,
  DEFAULT_PUBLICACAO,
  LIVROS_ANTERIORES,
  loadPublicacao,
  type Categoria,
  type Publicacao,
} from "@/lib/publicacao";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import {
  cmsError,
  isMissingTable,
  listAnunciosGestao,
  listInscricoesGestao,
  listNewsletterGestao,
  listNoticiasGestao,
  listVideosGestao,
  loadEditalVigente,
  publishAnuncio,
  publishCalendario,
  publishEdital,
  publishNoticia,
  publishPublicacao,
  publishVideo,
} from "@/lib/cms";
import SchemaInstall from "@/components/gestao/SchemaInstall";
import ResultadosPauta from "@/components/gestao/ResultadosPauta";

const NAV = [
  { id: "painel", label: "Painel", icon: LayoutDashboard },
  { id: "edital", label: "Edital", icon: FileText },
  { id: "publicacoes", label: "Publicações", icon: BookOpen },
  { id: "calendario", label: "Calendário Académico", icon: Calendar },
  { id: "resultados", label: "Resultados", icon: Award },
  { id: "noticias", label: "Notícias", icon: Newspaper },
  { id: "videos", label: "Vídeos", icon: Video },
  { id: "candidaturas", label: "Candidaturas", icon: Users },
  { id: "anuncios", label: "Anúncios", icon: Bell },
  { id: "subscritores", label: "Subscritores", icon: Mail },
] as const;

type Section = (typeof NAV)[number]["id"];

export default function GestaoDashboard() {
  const [section, setSection] = useState<Section>("painel");
  const [note, setNote] = useState("");
  const [needsSchema, setNeedsSchema] = useState(false);

  useEffect(() => {
    try {
      const supabase = createBrowserSupabase();
      void supabase
        .from("noticias")
        .select("slug")
        .limit(1)
        .then(({ error }) => {
          if (error && isMissingTable(error)) setNeedsSchema(true);
        });
    } catch {
      /* env em falta */
    }
  }, []);

  const showNote = (msg: string) => {
    setNote(msg);
    window.setTimeout(() => setNote(""), 4200);
  };

  const sair = async () => {
    try {
      const supabase = createBrowserSupabase();
      await supabase.auth.signOut();
    } catch {
      /* env em falta */
    }
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-cream flex">
      <aside className="w-[240px] shrink-0 bg-navy-900 text-white flex flex-col">
        <div className="px-5 py-6 border-b border-white/10">
          <Image
            src="/esj-logo-mark.png"
            alt="ESJ"
            width={52}
            height={52}
            className="h-12 w-12 object-contain rounded-sm"
          />
          <p className="mt-4 font-serif font-bold leading-tight">Área de gestão</p>
          <p className="mt-1 text-[11px] text-white/50">Secretaria académica</p>
        </div>
        <nav className="flex-1 py-4">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm text-left transition-colors ${
                section === id
                  ? "bg-white/10 text-white font-bold border-l-2 border-leaf"
                  : "text-white/70 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-5 border-t border-white/10 space-y-3">
          <button
            type="button"
            onClick={sair}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-sky-300"
          >
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-navy-100 px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-widest text-sky">
              SECRETARIA ACADÉMICA
            </p>
            <h1 className="font-serif text-xl font-bold text-navy-900">
              {NAV.find((n) => n.id === section)?.label}
            </h1>
          </div>
          <p className="text-xs text-navy-900/50 max-w-sm text-right leading-relaxed">
            Notícias, publicações, edital e candidaturas gravam na base da ESJ.
          </p>
        </header>

        <main className="flex-1 px-8 py-8">
          {note && (
            <p className="mb-5 bg-navy-800 text-white text-sm px-4 py-3">{note}</p>
          )}
          {needsSchema && <SchemaInstall />}
          {section === "painel" && <Painel onGo={setSection} />}
          {section === "edital" && <Edital onAction={showNote} />}
          {section === "publicacoes" && <Publicacoes onAction={showNote} />}
          {section === "calendario" && <CalendarioAcademico onAction={showNote} />}
          {section === "resultados" && <ResultadosPauta onAction={showNote} />}
          {section === "noticias" && <Noticias onAction={showNote} />}
          {section === "videos" && <Videos onAction={showNote} />}
          {section === "candidaturas" && <Candidaturas />}
          {section === "anuncios" && <Anuncios onAction={showNote} />}
          {section === "subscritores" && <Subscritores />}
        </main>
      </div>
    </div>
  );
}

function Painel({ onGo }: { onGo: (s: Section) => void }) {
  const cards = [
    {
      id: "edital" as Section,
      title: "Edital",
      text: "Substituir o PDF de admissão publicado no sítio.",
      meta: "Visível em /edital",
    },
    {
      id: "publicacoes" as Section,
      title: "Publicações",
      text: "Trocar os cartazes de lançamento de livro e de eventos na secção de ensino.",
      meta: "Visível em /#ensino",
    },
    {
      id: "calendario" as Section,
      title: "Calendário Académico",
      text: "Editar as datas de inscrições, exames, resultados e início do ano lectivo.",
      meta: "Visível em /#ensino",
    },
    {
      id: "resultados" as Section,
      title: "Resultados",
      text: "Lançar notas de Português e História e publicar a pauta por curso e regime.",
      meta: "Visível em /resultados",
    },
    {
      id: "noticias" as Section,
      title: "Notícias",
      text: "Publicar comunicados, eventos e vida académica.",
      meta: "Visível em /noticias",
    },
    {
      id: "videos" as Section,
      title: "Vídeos",
      text: "Guardar reportagens e peças da ESJ TV.",
      meta: "Ligações YouTube ou Vimeo",
    },
    {
      id: "candidaturas" as Section,
      title: "Candidaturas",
      text: "Pré-inscrições submetidas no sítio.",
      meta: "Formulário em /inscricoes",
    },
    {
      id: "anuncios" as Section,
      title: "Anúncios",
      text: "Guardar avisos da secretaria (o envio ao eDondzo fica para mais tarde).",
      meta: "Tabela anuncios",
    },
    {
      id: "subscritores" as Section,
      title: "Subscritores",
      text: "Lista de correios inscritos na newsletter do sítio.",
      meta: "Formulário em /#contacto",
    },
  ];

  return (
    <div>
      <p className="text-navy-900/70 max-w-3xl leading-relaxed">
        Este painel gere o sítio da ESJ: edital, notícias, publicações,
        candidaturas e anúncios. Tudo grava na mesma base Supabase.
      </p>
      <div className="mt-8 grid md:grid-cols-2 gap-5">
        {cards.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onGo(c.id)}
            className="text-left bg-white border border-navy-100 p-6 hover:border-sky transition-colors"
          >
            <h2 className="font-serif text-lg font-bold text-navy-900">{c.title}</h2>
            <p className="mt-2 text-sm text-navy-900/70 leading-relaxed">{c.text}</p>
            <p className="mt-4 text-[11px] font-semibold tracking-wide text-sky">{c.meta}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Edital({ onAction }: { onAction: (m: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [current, setCurrent] = useState<{ title: string; file_url: string } | null>(null);

  useEffect(() => {
    loadEditalVigente()
      .then(setCurrent)
      .catch(() => setCurrent(null));
  }, []);

  const publish = async () => {
    if (!file) {
      onAction("Escolha o PDF do novo edital.");
      return;
    }
    setBusy(true);
    try {
      await publishEdital(file, "Edital de Admissão 2026");
      const next = await loadEditalVigente();
      setCurrent(next);
      setFile(null);
      onAction("O edital foi publicado e já aparece em /edital.");
    } catch (error) {
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white border border-navy-100 p-8">
      <h2 className="font-serif text-2xl font-bold text-navy-900">Edital em vigor</h2>
      <p className="mt-2 text-sm text-navy-900/65 leading-relaxed">
        O documento publicado no sítio é o que os candidatos lêem em{" "}
        <Link href="/edital" className="text-sky hover:underline">
          /edital
        </Link>
        .
      </p>
      <div className="mt-6 border border-dashed border-navy-100 px-4 py-5 text-sm">
        <p className="font-bold text-navy-900">Ficheiro actual</p>
        <p className="mt-1 text-navy-900/65">
          {current ? current.title : "Ainda o PDF local (Edital 2020.pdf), até publicar um novo."}
        </p>
      </div>
      <label className="mt-5 block">
        <span className="block text-sm font-bold text-navy-900 mb-1.5">
          Novo PDF do edital
        </span>
        <input
          type="file"
          accept=".pdf"
          className="esj-field-file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <button
        type="button"
        disabled={busy}
        onClick={publish}
        className="mt-6 bg-leaf hover:bg-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
      >
        {busy ? "A PUBLICAR…" : "PUBLICAR EDITAL"}
      </button>
    </div>
  );
}

function Publicacoes({ onAction }: { onAction: (m: string) => void }) {
  const [categoria, setCategoria] = useState<Categoria>("livro");
  const [data, setData] = useState<Publicacao>(DEFAULT_PUBLICACAO);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setFile(null);
    loadPublicacao(categoria).then(setData);
  }, [categoria]);

  const onFile = (next: File | null) => {
    if (!next) return;
    setFile(next);
    const reader = new FileReader();
    reader.onload = () => {
      setData((prev) => ({ ...prev, image: String(reader.result) }));
    };
    reader.readAsDataURL(next);
  };

  const publish = async () => {
    setBusy(true);
    try {
      await publishPublicacao(data, file, categoria);
      setMissing(false);
      onAction(
        categoria === "livro"
          ? "O cartaz do lançamento do livro foi publicado."
          : "O cartaz de eventos foi publicado."
      );
    } catch (error) {
      if (isMissingTable(error)) setMissing(true);
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
      <div>
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setCategoria("livro")}
            className={`flex-1 px-3 py-2.5 text-xs font-bold tracking-wide transition-colors ${
              categoria === "livro"
                ? "bg-navy-800 text-white"
                : "bg-white text-navy-800 border border-navy-100 hover:border-sky"
            }`}
          >
            LANÇAMENTO DO LIVRO
          </button>
          <button
            type="button"
            onClick={() => setCategoria("evento")}
            className={`flex-1 px-3 py-2.5 text-xs font-bold tracking-wide transition-colors ${
              categoria === "evento"
                ? "bg-navy-800 text-white"
                : "bg-white text-navy-800 border border-navy-100 hover:border-sky"
            }`}
          >
            EVENTOS
          </button>
        </div>
        <p className="text-sm font-bold text-navy-900 mb-3">Pré-visualização do cartaz</p>
        <div
          className={`relative w-full bg-cream border border-navy-100 overflow-hidden flex flex-col ${
            categoria === "evento" ? "aspect-[210/297]" : "aspect-square"
          }`}
        >
          <div className={`relative min-h-0 ${data.tipo === "livro" ? "flex-1" : "h-full"}`}>
            <img
              src={data.image}
              alt=""
              className={
                data.tipo === "livro"
                  ? "absolute inset-0 w-full h-full object-contain p-2 pb-1"
                  : "absolute inset-0 w-full h-full object-cover"
              }
            />
          </div>
          {data.tipo === "livro" && (
            <div className="grid grid-cols-3 gap-1 px-1.5 pb-1.5 flex-[0_0_27%]">
              {LIVROS_ANTERIORES.map((liv) => (
                <div key={liv.image} className="relative h-full overflow-hidden border border-navy-100 bg-white">
                  <img src={liv.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="bg-white border border-navy-100 p-8 space-y-4">
        <h2 className="font-serif text-2xl font-bold text-navy-900">
          {categoria === "livro" ? "Lançamento do livro" : "Cartaz de eventos"} na página de ensino
        </h2>
        <p className="text-sm text-navy-900/65 leading-relaxed -mt-2">
          Aparece em /#ensino ao clicar no botão &ldquo;
          {categoria === "livro" ? "Lançamento do livro" : "Eventos"}&rdquo;.
        </p>
        {missing && <SchemaInstall />}
        <fieldset className="space-y-2">
          <legend className="text-sm font-bold text-navy-900 mb-1.5">Tipo de anúncio</legend>
          <label className="flex items-start gap-2 text-sm text-navy-900/80">
            <input
              type="radio"
              name="tipo-publicacao"
              checked={data.tipo === "livro"}
              onChange={() => setData({ ...data, tipo: "livro" })}
              className="mt-1"
            />
            <span>Lançamento de livro — a imagem ajusta-se ao A4 e os três livros preenchem o espaço que sobra.</span>
          </label>
          <label className="flex items-start gap-2 text-sm text-navy-900/80">
            <input
              type="radio"
              name="tipo-publicacao"
              checked={data.tipo === "cartaz"}
              onChange={() => setData({ ...data, tipo: "cartaz" })}
              className="mt-1"
            />
            <span>Anúncio que preenche o A4 — nada abaixo do cartaz.</span>
          </label>
        </fieldset>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Cartaz (JPG ou PNG)</span>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            className="esj-field-file"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Título</span>
          <input
            className="esj-field"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Autores (um por linha)</span>
          <textarea
            className="esj-field min-h-[88px]"
            value={data.authors}
            onChange={(e) => setData({ ...data, authors: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Data</span>
          <input
            className="esj-field"
            value={data.date}
            onChange={(e) => setData({ ...data, date: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Local</span>
          <input
            className="esj-field"
            value={data.venue}
            onChange={(e) => setData({ ...data, venue: e.target.value })}
          />
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={publish}
          className="bg-leaf hover:bg-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
        >
          {busy ? "A PUBLICAR…" : "PUBLICAR CARTAZ"}
        </button>
      </div>
    </div>
  );
}

function CalendarioAcademico({ onAction }: { onAction: (m: string) => void }) {
  const [data, setData] = useState<Calendario>(DEFAULT_CALENDARIO);
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    loadCalendario().then(setData);
  }, []);

  const publish = async () => {
    setBusy(true);
    try {
      await publishCalendario(data);
      setMissing(false);
      onAction("O calendário académico foi actualizado em /#ensino.");
    } catch (error) {
      if (isMissingTable(error)) setMissing(true);
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  const fields: { key: keyof Calendario; label: string }[] = [
    { key: "inscricoes", label: "Inscrições" },
    { key: "exames", label: "Exames de admissão" },
    { key: "resultados", label: "Publicação de resultados" },
    { key: "inicioAno", label: "Início do ano lectivo" },
  ];

  return (
    <div className="w-full bg-white border border-navy-100 p-8 space-y-4">
      <h2 className="font-serif text-2xl font-bold text-navy-900">Calendário Académico</h2>
      <p className="text-sm text-navy-900/65 leading-relaxed">
        Estes textos aparecem na secção Ensino e História, separador &ldquo;Calendário
        Académico&rdquo;, em /#ensino.
      </p>
      {missing && <SchemaInstall />}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="block text-sm font-bold text-navy-900 mb-1.5">{f.label}</span>
            <textarea
              className="esj-field min-h-[76px] py-2.5"
              value={data[f.key]}
              onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={publish}
        className="bg-leaf hover:bg-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
      >
        {busy ? "A GRAVAR…" : "GUARDAR CALENDÁRIO"}
      </button>
    </div>
  );
}

function Noticias({ onAction }: { onAction: (m: string) => void }) {
  const [items, setItems] = useState<{ slug: string; title: string; date_label: string }[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    listNoticiasGestao()
      .then(setItems)
      .catch(() => setItems([]));
  };

  useEffect(() => {
    refresh();
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    try {
      await publishNoticia({
        title: String(fd.get("title") || "").trim(),
        excerpt: String(fd.get("excerpt") || "").trim(),
        body: String(fd.get("body") || "").trim(),
        image: (fd.get("image") as File | null)?.size ? (fd.get("image") as File) : null,
      });
      form.reset();
      refresh();
      onAction("A notícia foi publicada em /noticias.");
    } catch (error) {
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
      <form className="bg-white border border-navy-100 p-8 space-y-4" onSubmit={onSubmit}>
        <h2 className="font-serif text-2xl font-bold text-navy-900">Nova notícia</h2>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Título</span>
          <input name="title" required className="esj-field" placeholder="Título do comunicado" />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Resumo</span>
          <input name="excerpt" required className="esj-field" placeholder="Duas linhas para a página inicial" />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Texto</span>
          <textarea name="body" required className="esj-field h-32 py-3" placeholder="Corpo da notícia" />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Imagem (opcional)</span>
          <input name="image" type="file" accept=".jpg,.jpeg,.png" className="esj-field-file" />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="bg-leaf hover:bg-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
        >
          {busy ? "A PUBLICAR…" : "PUBLICAR NOTÍCIA"}
        </button>
      </form>
      <aside className="bg-white border border-navy-100 p-6">
        <h3 className="font-serif font-bold text-navy-900">Publicadas</h3>
        <ul className="mt-4 space-y-3">
          {items.length === 0 && (
            <li className="text-sm text-navy-900/50">Ainda sem notícias na base.</li>
          )}
          {items.map((n) => (
            <li key={n.slug} className="text-sm">
              <Link href={`/noticias/${n.slug}`} className="block font-semibold text-navy-900 hover:text-crimson">
                {n.title}
              </Link>
              <span className="text-[11px] text-navy-900/50">{n.date_label}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function Videos({ onAction }: { onAction: (m: string) => void }) {
  const [items, setItems] = useState<{ id: string; title: string; url: string }[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    listVideosGestao()
      .then(setItems)
      .catch(() => setItems([]));
  };

  useEffect(() => {
    refresh();
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    try {
      await publishVideo(String(fd.get("title") || "").trim(), String(fd.get("url") || "").trim());
      form.reset();
      refresh();
      onAction("O vídeo foi gravado.");
    } catch (error) {
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white border border-navy-100 p-8">
      <h2 className="font-serif text-2xl font-bold text-navy-900">Vídeos da ESJ TV</h2>
      <ul className="mt-6 space-y-3 text-sm">
        {items.length === 0 && (
          <li className="text-navy-900/50">Ainda sem vídeos na base.</li>
        )}
        {items.map((v) => (
          <li key={v.id} className="border border-navy-100 px-4 py-3">
            <span className="font-semibold text-navy-900">{v.title}</span>
            <a href={v.url} className="block text-sky text-xs mt-0.5 break-all" target="_blank" rel="noreferrer">
              {v.url}
            </a>
          </li>
        ))}
      </ul>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Título</span>
          <input name="title" required className="esj-field" placeholder="Título do vídeo" />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Ligação YouTube ou Vimeo</span>
          <input name="url" type="url" required className="esj-field" placeholder="https://" />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="bg-leaf hover:bg-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
        >
          {busy ? "A PUBLICAR…" : "PUBLICAR VÍDEO"}
        </button>
      </form>
    </div>
  );
}

function Candidaturas() {
  const [items, setItems] = useState<
    { protocolo: string; nome: string; email: string | null; curso: string; delegacao: string | null; created_at: string }[]
  >([]);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listInscricoesGestao()
      .then(setItems)
      .catch((err) => {
        if (isMissingTable(err)) setMissing(true);
        else setError(cmsError(err));
      });
  }, []);

  return (
    <div className="bg-white border border-navy-100 p-8">
      <h2 className="font-serif text-2xl font-bold text-navy-900">Pré-inscrições</h2>
      <p className="mt-2 text-sm text-navy-900/65">Candidaturas submetidas em /inscricoes.</p>
      {missing && <SchemaInstall />}
      {error && <p className="mt-4 text-sm text-crimson">{error}</p>}
      <ul className="mt-6 divide-y divide-navy-100">
        {items.length === 0 && !error && !missing && (
          <li className="py-3 text-sm text-navy-900/50">Ainda não há candidaturas.</li>
        )}
        {items.map((c) => (
          <li key={c.protocolo} className="py-4">
            <p className="font-semibold text-navy-900">{c.nome}</p>
            <p className="text-xs text-sky mt-0.5">{c.protocolo}</p>
            <p className="text-sm text-navy-900/65 mt-1">
              {c.curso}
              {c.delegacao ? ` · ${c.delegacao}` : ""}
            </p>
            {c.email && <p className="text-xs text-navy-900/50 mt-1">{c.email}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Subscritores() {
  const [items, setItems] = useState<{ id: string; email: string; created_at: string }[]>([]);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    listNewsletterGestao()
      .then(setItems)
      .catch((err) => {
        if (isMissingTable(err)) setMissing(true);
        else setError(cmsError(err));
      });
  }, []);

  const copiarLista = async () => {
    try {
      await navigator.clipboard.writeText(items.map((i) => i.email).join(", "));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard indisponível */
    }
  };

  return (
    <div className="bg-white border border-navy-100 p-8">
      <h2 className="font-serif text-2xl font-bold text-navy-900">Subscritores da newsletter</h2>
      <p className="mt-2 text-sm text-navy-900/65 leading-relaxed max-w-2xl">
        Esta é a lista de correios inscritos no formulário de newsletter (secção de
        contacto da página inicial). É a esta lista que, no futuro, serão enviadas
        as novas publicações do sítio — o envio automático ainda não está ligado,
        por agora a lista fica disponível aqui para copiar.
      </p>
      {missing && <SchemaInstall />}
      {error && <p className="mt-4 text-sm text-crimson">{error}</p>}
      {!missing && (
        <div className="mt-6 flex items-center gap-4">
          <p className="text-sm font-semibold text-navy-900">
            {items.length} subscritor{items.length === 1 ? "" : "es"}
          </p>
          {items.length > 0 && (
            <button
              type="button"
              onClick={copiarLista}
              className="text-xs font-semibold tracking-wide text-sky hover:text-crimson"
            >
              {copied ? "LISTA COPIADA" : "COPIAR LISTA DE CORREIOS"}
            </button>
          )}
        </div>
      )}
      <ul className="mt-4 divide-y divide-navy-100">
        {items.length === 0 && !error && !missing && (
          <li className="py-3 text-sm text-navy-900/50">Ainda sem subscritores.</li>
        )}
        {items.map((s) => (
          <li key={s.id} className="py-3 flex items-center justify-between gap-4">
            <span className="text-sm text-navy-900">{s.email}</span>
            <span className="text-[11px] text-navy-900/50 shrink-0">
              {new Date(s.created_at).toLocaleDateString("pt-PT")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Anuncios({ onAction }: { onAction: (m: string) => void }) {
  const [items, setItems] = useState<
    { id: string; destinatarios: string; assunto: string; mensagem: string }[]
  >([]);
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState(false);

  const refresh = () => {
    listAnunciosGestao()
      .then((rows) => {
        setItems(rows);
        setMissing(false);
      })
      .catch((err) => {
        if (isMissingTable(err)) setMissing(true);
        else setItems([]);
      });
  };

  useEffect(() => {
    refresh();
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    try {
      await publishAnuncio({
        destinatarios: String(fd.get("destinatarios") || "Todos os estudantes"),
        assunto: String(fd.get("assunto") || "").trim(),
        mensagem: String(fd.get("mensagem") || "").trim(),
      });
      form.reset();
      refresh();
      onAction("O anúncio foi gravado na base da ESJ.");
    } catch (error) {
      if (isMissingTable(error)) setMissing(true);
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
      <form className="bg-white border border-navy-100 p-8 space-y-4" onSubmit={onSubmit}>
        <h2 className="font-serif text-2xl font-bold text-navy-900">
          Anúncio aos estudantes
        </h2>
        <p className="text-sm text-navy-900/65 leading-relaxed">
          Os avisos ficam guardados aqui. O envio automático para o eDondzo ainda
          não está ligado.
        </p>
        {missing && <SchemaInstall />}
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Destinatários</span>
          <select name="destinatarios" className="esj-field">
            <option>Todos os estudantes</option>
            <option>Maputo — Sede</option>
            <option>Manica — Delegação Académica</option>
            <option>Licenciatura em Jornalismo</option>
            <option>Licenciatura em Publicidade e Marketing</option>
            <option>Licenciatura em Relações Públicas</option>
            <option>Licenciatura em Biblioteconomia e Documentação</option>
          </select>
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Assunto</span>
          <input name="assunto" required className="esj-field" placeholder="Assunto do anúncio" />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Mensagem</span>
          <textarea
            name="mensagem"
            required
            className="esj-field h-32 py-3"
            placeholder="Texto do anúncio"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="bg-leaf hover:bg-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
        >
          {busy ? "A GRAVAR…" : "GRAVAR ANÚNCIO"}
        </button>
      </form>
      <aside className="bg-white border border-navy-100 p-6">
        <h3 className="font-serif font-bold text-navy-900">Anúncios gravados</h3>
        <ul className="mt-4 space-y-3 text-sm">
          {items.length === 0 && (
            <li className="text-navy-900/50">Ainda sem anúncios.</li>
          )}
          {items.map((a) => (
            <li key={a.id}>
              <span className="block font-semibold text-navy-900">{a.assunto}</span>
              <span className="text-navy-900/55 text-xs">{a.destinatarios}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
