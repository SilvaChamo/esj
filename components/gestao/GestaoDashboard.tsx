"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  BookOpen,
  FileText,
  LayoutDashboard,
  Newspaper,
  Video,
  LogOut,
} from "lucide-react";
import {
  DEFAULT_PUBLICACAO,
  LIVROS_ANTERIORES,
  readPublicacao,
  writePublicacao,
  type Publicacao,
} from "@/lib/publicacao";

const NAV = [
  { id: "painel", label: "Painel", icon: LayoutDashboard },
  { id: "edital", label: "Edital", icon: FileText },
  { id: "publicacoes", label: "Publicações", icon: BookOpen },
  { id: "noticias", label: "Notícias", icon: Newspaper },
  { id: "videos", label: "Vídeos", icon: Video },
  { id: "anuncios", label: "Anúncios", icon: Bell },
] as const;

type Section = (typeof NAV)[number]["id"];

const EDONDZO = [
  { curso: "Jornalismo", maputo: 186, manica: 42 },
  { curso: "Publicidade e Marketing", maputo: 121, manica: 28 },
  { curso: "Relações Públicas", maputo: 97, manica: 19 },
  { curso: "Biblioteconomia e Documentação", maputo: 64, manica: 11 },
];

export default function GestaoDashboard() {
  const [section, setSection] = useState<Section>("painel");
  const [note, setNote] = useState("");

  const showNote = (msg: string) => {
    setNote(msg);
    window.setTimeout(() => setNote(""), 3200);
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
          <p className="mt-1 text-[11px] text-white/50">Proposta — ESJ</p>
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
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-white/70 hover:text-sky-300"
          >
            <LogOut size={15} />
            Sair para o sítio
          </Link>
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
            Esboço. Ainda sem ligação ao eDondzo nem à base de dados.
          </p>
        </header>

        <main className="flex-1 px-8 py-8">
          {note && (
            <p className="mb-5 bg-navy-800 text-white text-sm px-4 py-3">{note}</p>
          )}
          {section === "painel" && <Painel onGo={setSection} />}
          {section === "edital" && <Edital onAction={showNote} />}
          {section === "publicacoes" && <Publicacoes onAction={showNote} />}
          {section === "noticias" && <Noticias onAction={showNote} />}
          {section === "videos" && <Videos onAction={showNote} />}
          {section === "anuncios" && <Anuncios onAction={showNote} />}
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
      meta: "Edital 2020.pdf · visível em /edital",
    },
    {
      id: "publicacoes" as Section,
      title: "Publicações",
      text: "Trocar o cartaz A4 do lançamento na secção de ensino.",
      meta: "Formato A4 · visível em /#ensino",
    },
    {
      id: "noticias" as Section,
      title: "Notícias",
      text: "Publicar comunicados, eventos e vida académica.",
      meta: "3 rascunhos de exemplo",
    },
    {
      id: "videos" as Section,
      title: "Vídeos",
      text: "Colocar reportagens e peças da ESJ TV na página.",
      meta: "2 ligações de exemplo",
    },
    {
      id: "anuncios" as Section,
      title: "Anúncios eDondzo",
      text: "Enviar avisos aos estudantes, por curso ou delegação.",
      meta: `${EDONDZO.reduce((n, c) => n + c.maputo + c.manica, 0)} estudantes (amostra)`,
    },
  ];

  return (
    <div>
      <p className="text-navy-900/70 max-w-3xl leading-relaxed">
        Este painel destina-se à gestão do sítio da ESJ: trocar o edital, publicar
        notícias e vídeos, e mandar anúncios aos estudantes com os dados do portal{" "}
        <a
          href="https://esj.edondzo.ac.mz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky font-semibold hover:text-crimson"
        >
          eDondzo
        </a>
        .
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
  return (
    <div className="max-w-2xl bg-white border border-navy-100 p-8">
      <h2 className="font-serif text-2xl font-bold text-navy-900">Edital em vigor</h2>
      <p className="mt-2 text-sm text-navy-900/65 leading-relaxed">
        O documento publicado no sítio é o que os candidatos lêem em{" "}
        <Link href="/edital" className="text-sky hover:underline">
          /edital
        </Link>
        . Para o ano lectivo seguinte, carrega o novo PDF e publica-o.
      </p>
      <div className="mt-6 border border-dashed border-navy-100 px-4 py-5 text-sm">
        <p className="font-bold text-navy-900">Ficheiro actual</p>
        <p className="mt-1 text-navy-900/65">Edital 2020.pdf — visível como Edital 2026</p>
      </div>
      <label className="mt-5 block">
        <span className="block text-sm font-bold text-navy-900 mb-1.5">
          Novo PDF do edital
        </span>
        <input type="file" accept=".pdf" className="esj-field-file" />
      </label>
      <button
        type="button"
        onClick={() => onAction("O edital não foi alterado — este ecrã é só um esboço.")}
        className="mt-6 bg-leaf hover:bg-crimson text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
      >
        PUBLICAR EDITAL
      </button>
    </div>
  );
}

function Publicacoes({ onAction }: { onAction: (m: string) => void }) {
  const [data, setData] = useState<Publicacao>(DEFAULT_PUBLICACAO);

  useEffect(() => {
    setData(readPublicacao());
  }, []);

  const onFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setData((prev) => ({ ...prev, image: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  const publish = () => {
    writePublicacao(data);
    onAction("O cartaz A4 da secção de ensino foi actualizado.");
  };

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
      <div>
        <p className="text-sm font-bold text-navy-900 mb-3">Pré-visualização A4</p>
        <div className="relative w-full aspect-[210/297] bg-cream border border-navy-100 overflow-hidden flex flex-col">
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
        <p className="mt-2 text-xs text-navy-900/50">
          {data.tipo === "livro"
            ? "Os três livros preenchem o espaço vazio dentro do A4."
            : "Anúncio a preencher o A4. Nada aparece por baixo."}
        </p>
      </div>
      <div className="bg-white border border-navy-100 p-8 space-y-4">
        <h2 className="font-serif text-2xl font-bold text-navy-900">Lançamento na página de ensino</h2>
        <p className="text-sm text-navy-900/65 leading-relaxed">
          Substitui o cartaz publicado à direita de «Formamos, comunicamos e Investigamos». O espaço
          no sítio tem o tamanho A4.
        </p>
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
            <span>Lançamento de livro — a imagem ajusta-se ao A4 e os três livros preenchem o espaço que sobra, dentro da moldura.</span>
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
          onClick={publish}
          className="bg-leaf hover:bg-crimson text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
        >
          PUBLICAR CARTAZ
        </button>
      </div>
    </div>
  );
}

function Noticias({ onAction }: { onAction: (m: string) => void }) {
  const items = [
    { title: "Calendário de exames de admissão", estado: "Rascunho" },
    { title: "Semana da Comunicação e Informação", estado: "Rascunho" },
    { title: "Cerimónia de graduação na sede", estado: "Rascunho" },
  ];

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
      <form
        className="bg-white border border-navy-100 p-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onAction("A notícia não foi publicada — este ecrã é só um esboço.");
        }}
      >
        <h2 className="font-serif text-2xl font-bold text-navy-900">Nova notícia</h2>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Título</span>
          <input className="esj-field" placeholder="Título do comunicado" />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Resumo</span>
          <input className="esj-field" placeholder="Duas linhas para a página inicial" />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Texto</span>
          <textarea className="esj-field h-32 py-3" placeholder="Corpo da notícia" />
        </label>
        <button
          type="submit"
          className="bg-leaf hover:bg-crimson text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
        >
          PUBLICAR NOTÍCIA
        </button>
      </form>
      <aside className="bg-white border border-navy-100 p-6">
        <h3 className="font-serif font-bold text-navy-900">Na fila</h3>
        <ul className="mt-4 space-y-3">
          {items.map((n) => (
            <li key={n.title} className="text-sm">
              <span className="block font-semibold text-navy-900">{n.title}</span>
              <span className="text-[11px] text-navy-900/50">{n.estado}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function Videos({ onAction }: { onAction: (m: string) => void }) {
  return (
    <div className="max-w-2xl bg-white border border-navy-100 p-8">
      <h2 className="font-serif text-2xl font-bold text-navy-900">Vídeos da ESJ TV</h2>
      <p className="mt-2 text-sm text-navy-900/65 leading-relaxed">
        Publica peças de televisão, rádio e reportagem para a galeria e a página
        inicial.
      </p>
      <ul className="mt-6 space-y-3 text-sm">
        <li className="border border-navy-100 px-4 py-3">
          <span className="font-semibold text-navy-900">Abertura do ano lectivo</span>
          <span className="block text-navy-900/50 text-xs mt-0.5">YouTube · rascunho</span>
        </li>
        <li className="border border-navy-100 px-4 py-3">
          <span className="font-semibold text-navy-900">Estúdio de televisão em prática</span>
          <span className="block text-navy-900/50 text-xs mt-0.5">YouTube · rascunho</span>
        </li>
      </ul>
      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onAction("O vídeo não foi publicado — este ecrã é só um esboço.");
        }}
      >
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Título</span>
          <input className="esj-field" placeholder="Título do vídeo" />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">
            Ligação YouTube ou Vimeo
          </span>
          <input className="esj-field" placeholder="https://" />
        </label>
        <button
          type="submit"
          className="bg-leaf hover:bg-crimson text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
        >
          PUBLICAR VÍDEO
        </button>
      </form>
    </div>
  );
}

function Anuncios({ onAction }: { onAction: (m: string) => void }) {
  const total = EDONDZO.reduce((n, c) => n + c.maputo + c.manica, 0);

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
      <form
        className="bg-white border border-navy-100 p-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onAction("O anúncio não saiu para o eDondzo — este ecrã é só um esboço.");
        }}
      >
        <h2 className="font-serif text-2xl font-bold text-navy-900">
          Anúncio aos estudantes
        </h2>
        <p className="text-sm text-navy-900/65 leading-relaxed">
          Os destinatários virão da plataforma eDondzo (
          <span className="text-navy-900">esj.edondzo.ac.mz</span>
          ), por curso, turno e delegação.
        </p>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Destinatários</span>
          <select className="esj-field">
            <option>Todos os estudantes ({total})</option>
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
          <input className="esj-field" placeholder="Assunto do anúncio" />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Mensagem</span>
          <textarea
            className="esj-field h-32 py-3"
            placeholder="Texto a enviar aos estudantes"
          />
        </label>
        <button
          type="submit"
          className="bg-leaf hover:bg-crimson text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
        >
          ENVIAR PELO EDONDZO
        </button>
      </form>
      <aside className="bg-white border border-navy-100 p-6">
        <h3 className="font-serif font-bold text-navy-900">Amostra eDondzo</h3>
        <p className="mt-1 text-xs text-navy-900/50">Números fictícios para o esboço</p>
        <ul className="mt-4 space-y-3 text-sm">
          {EDONDZO.map((c) => (
            <li key={c.curso}>
              <span className="block font-semibold text-navy-900">{c.curso}</span>
              <span className="text-navy-900/55 text-xs">
                Maputo {c.maputo} · Manica {c.manica}
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
