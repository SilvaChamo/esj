"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  HeartHandshake,
  Megaphone,
  Newspaper,
  PenLine,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { filtroQuery } from "@/lib/admissao";
import {
  CALENDARIO_EVENT,
  DEFAULT_CALENDARIO,
  loadCalendario,
  type Calendario,
} from "@/lib/calendario";
import {
  loadPublicacao,
  readPublicacao,
  type Categoria,
  type Publicacao,
} from "@/lib/publicacao";

type SectionTab = "ensino" | "calendario" | "cursos";

const SECTION_TABS: { id: SectionTab; label: string }[] = [
  { id: "cursos", label: "Áreas de Formação" },
  { id: "calendario", label: "Calendário Académico" },
  { id: "ensino", label: "Ensino e História" },
];

type NivelCurso = "licenciatura" | "pos-graduacao";

const NIVEL_ADMISSAO: Record<NivelCurso, "Licenciatura" | "Pós-Graduação"> = {
  licenciatura: "Licenciatura",
  "pos-graduacao": "Pós-Graduação",
};

const NIVEIS_CURSO: { id: NivelCurso; label: string }[] = [
  { id: "licenciatura", label: "Licenciatura" },
  { id: "pos-graduacao", label: "Pós-Graduação" },
];

const CURSOS: { titulo: string; texto: string; icon: LucideIcon; nivel: NivelCurso }[] = [
  {
    titulo: "Jornalismo",
    texto: "Formação em técnicas e ética do jornalismo, para os media impressos, digitais, rádio e televisão.",
    icon: Newspaper,
    nivel: "licenciatura",
  },
  {
    titulo: "Publicidade e Marketing",
    texto: "Estratégia, criação e comunicação de marcas para organizações e mercados.",
    icon: Megaphone,
    nivel: "licenciatura",
  },
  {
    titulo: "Relações Públicas",
    texto: "Gestão da comunicação institucional e da relação com os públicos.",
    icon: Users,
    nivel: "licenciatura",
  },
  {
    titulo: "Biblioteconomia e Documentação",
    texto: "Organização, gestão e mediação da informação e do conhecimento.",
    icon: BookOpen,
    nivel: "licenciatura",
  },
  {
    titulo: "Pós-Graduação",
    texto: "Percursos de especialização e investigação avançada em Ciências da Comunicação.",
    icon: GraduationCap,
    nivel: "licenciatura",
  },
  {
    titulo: "Serviços Sociais",
    texto: "Apoio à vida académica dos estudantes: alojamento, alimentação, saúde e apoio social.",
    icon: HeartHandshake,
    nivel: "licenciatura",
  },
  {
    titulo: "Pós-Graduação em Jornalismo de Investigação",
    texto: "Apuração avançada, verificação de factos e jornalismo de dados.",
    icon: Newspaper,
    nivel: "pos-graduacao",
  },
  {
    titulo: "Pós-Graduação em Comunicação Estratégica e Marketing",
    texto: "Planeamento de marca, comunicação corporativa e gestão de campanhas.",
    icon: Megaphone,
    nivel: "pos-graduacao",
  },
  {
    titulo: "Pós-Graduação em Gestão da Informação e Documentação",
    texto: "Arquivística, bibliotecas digitais e políticas de informação.",
    icon: BookOpen,
    nivel: "pos-graduacao",
  },
];

export default function Academics() {
  const [tab, setTab] = useState<SectionTab>("cursos");
  const [nivelCurso, setNivelCurso] = useState<NivelCurso>("licenciatura");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Categoria>("livro");
  const [livroBook, setLivroBook] = useState<Publicacao>(() => readPublicacao("livro"));
  const [eventoBook, setEventoBook] = useState<Publicacao>(() => readPublicacao("evento"));
  const [viewer, setViewer] = useState<Publicacao | null>(null);
  const [cal, setCal] = useState<Calendario>(DEFAULT_CALENDARIO);

  useEffect(() => {
    const load = () => {
      loadPublicacao("livro").then(setLivroBook);
      loadPublicacao("evento").then(setEventoBook);
      loadCalendario().then(setCal);
    };
    load();
    window.addEventListener("esj-publicacao", load);
    window.addEventListener(CALENDARIO_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("esj-publicacao", load);
      window.removeEventListener(CALENDARIO_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const show = (item: Publicacao) => {
    setViewer(item);
    setOpen(true);
  };

  const DATAS: {
    titulo: string;
    texto: string;
    icon: LucideIcon;
    numero: number;
    link?: { href: string; label: string };
  }[] = [
    {
      titulo: "Inscrições",
      texto: cal.inscricoes,
      icon: ClipboardList,
      numero: 1,
      link: { href: "/inscricao", label: "Inscrever-se" },
    },
    { titulo: "Exames de admissão", texto: cal.exames, icon: PenLine, numero: 2 },
    {
      titulo: "Publicação de resultados",
      texto: cal.resultados,
      icon: Award,
      numero: 3,
      link: { href: "/resultados", label: "Ver resultados" },
    },
    { titulo: "Início do ano lectivo", texto: cal.inicioAno, icon: CalendarDays, numero: 4 },
  ];

  return (
    <section id="ensino" className="relative bg-white">
      {tab === "cursos" && (
        <div className="hidden lg:flex absolute left-0 top-1/2 z-20 -translate-y-1/2 flex-col">
          {NIVEIS_CURSO.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setNivelCurso(n.id)}
              className={`px-2.5 py-4 text-xs font-bold tracking-wide transition-colors [writing-mode:vertical-rl] rotate-180 ${
                nivelCurso === n.id
                  ? "bg-navy-800 text-white"
                  : "bg-white text-navy-800 border border-navy-100 hover:border-sky"
              }`}
            >
              {n.label.toUpperCase()}
            </button>
          ))}
        </div>
      )}
      <div className="bg-cream border-b border-navy-100">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 flex flex-wrap">
          {SECTION_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`relative px-6 py-2.5 text-sm font-bold tracking-wide transition-colors ${
                tab === t.id
                  ? "z-10 -mb-px bg-white text-crimson border-t border-l border-r border-navy-100"
                  : "bg-cream text-navy-900/45 hover:text-navy-900/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="py-16 md:py-20">
        {tab === "ensino" && (
          <div className="grid lg:grid-cols-[1fr_1.08fr] gap-12 lg:gap-16 items-start">
            <div>
              <p className="text-sky font-bold tracking-widest text-sm mb-3">ENSINO E HISTÓRIA</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-900 leading-tight">
                Formamos, comunicamos e
                <br />
                Investigamos
              </h2>
              <p className="mt-3 font-serif italic text-lg text-navy-800">
                O palco da ESJ não se apaga
              </p>
              <p className="mt-5 text-navy-900 leading-relaxed">
                A Escola Superior de Jornalismo forma profissionais críticos, investiga a
                comunicação contemporânea e devolve conhecimento à sociedade. O ensino
                liga a sala de aula à redação, à pesquisa e à vida pública.
              </p>
              <p className="mt-4 text-sm text-navy-900/70 leading-relaxed">
                Conferências, a Semana da Comunicação, colóquios e a cerimónia de graduação
                trazem a cidade para o campus — e levam a escola para o país. A agenda do
                ano lectivo é palco aberto: venha, ouça e participe!
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setActive("livro")}
                  className={`px-6 py-3.5 text-xs font-bold tracking-wide transition-colors ${
                    active === "livro"
                      ? "bg-navy-800 text-white"
                      : "bg-white text-navy-800 border border-navy-100 hover:border-sky"
                  }`}
                >
                  LANÇAMENTO DO LIVRO
                </button>
                <button
                  type="button"
                  onClick={() => setActive("evento")}
                  className={`px-6 py-3.5 text-xs font-bold tracking-wide transition-colors ${
                    active === "evento"
                      ? "bg-navy-800 text-white"
                      : "bg-white text-navy-800 border border-navy-100 hover:border-sky"
                  }`}
                >
                  EVENTOS
                </button>
              </div>
            </div>

            <div>
              <div className={active === "livro" ? "relative" : "hidden"}>
                <div className="relative w-full overflow-hidden bg-cream border border-navy-100 aspect-square">
                  <button
                    type="button"
                    onClick={() => show(livroBook)}
                    className="absolute inset-0"
                    aria-label="Ver lançamento do livro"
                  >
                    <img
                      key={`livro-${livroBook.image}`}
                      src={livroBook.image}
                      alt=""
                      className="absolute inset-0 w-full h-full object-contain p-2"
                    />
                  </button>
                </div>
              </div>
              <div className={active === "evento" ? "relative w-full lg:w-[calc(100%+50px)]" : "hidden"}>
                <div className="relative w-full overflow-hidden bg-cream border border-navy-100 aspect-[210/297]">
                  <button
                    type="button"
                    onClick={() => show(eventoBook)}
                    className="absolute inset-0"
                    aria-label="Ver cartaz de eventos"
                  >
                    <img
                      key={`evento-${eventoBook.image}`}
                      src={eventoBook.image}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "calendario" && (
          <div>
            <div>
              <p className="text-sky font-bold tracking-widest text-sm mb-3">CALENDÁRIO ACADÉMICO</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-900 leading-tight">
                Datas do ano lectivo
              </h2>
              <p className="mt-5 max-w-2xl text-navy-900 leading-relaxed">
                Início do ano lectivo, inscrições, exames de admissão e publicação de
                resultados — as datas oficiais e definitivas são as do{" "}
                <Link href="/edital" className="text-sky hover:underline">
                  edital de admissão
                </Link>
                .
              </p>
            </div>

            <div className="mt-14 relative">
              <div
                aria-hidden
                className="absolute left-4 sm:left-1/2 top-2 bottom-2 w-px bg-sky-300 sm:-translate-x-1/2"
              />
              <div className="space-y-10">
                {DATAS.map((d, i) => {
                  const isRight = i % 2 === 1;
                  return (
                    <div
                      key={d.titulo}
                      className="relative pl-12 sm:pl-0 sm:grid sm:grid-cols-2 sm:gap-x-10"
                    >
                      <span className="absolute left-4 sm:left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white border-2 border-sky-300">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 text-white text-sm font-bold">
                          {d.numero}
                        </span>
                      </span>
                      <div
                        className={`relative overflow-hidden bg-cream p-6 flex gap-4 ${
                          isRight ? "sm:col-start-2" : "sm:col-start-1"
                        }`}
                      >
                        <span
                          aria-hidden
                          className="pointer-events-none select-none absolute -right-2 -top-6 font-serif font-bold text-navy-900/[0.06] text-[7rem] leading-none"
                        >
                          {d.numero}
                        </span>
                        <d.icon size={22} className="relative shrink-0 mt-0.5 text-sky" />
                        <div className="relative min-w-0">
                          <h3 className="font-serif font-bold text-navy-900">{d.titulo}</h3>
                          <p className="mt-1.5 text-sm text-navy-900/70 leading-relaxed">{d.texto}</p>
                          {d.link && (
                            <Link
                              href={d.link.href}
                              className="mt-3 inline-block text-sm text-sky hover:underline"
                            >
                              {d.link.label} →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-16 flex flex-wrap gap-3 justify-center">
              <Link
                href="/edital"
                className="inline-flex items-center bg-navy-800 hover:bg-crimson text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
              >
                VER EDITAL DE ADMISSÃO
              </Link>
              <Link
                href="/inscricoes"
                className="inline-flex items-center bg-white border border-navy-100 hover:border-sky text-navy-800 font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
              >
                ESTADO DAS INSCRIÇÕES
              </Link>
            </div>
          </div>
        )}

        {tab === "cursos" && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <p className="text-sky font-bold tracking-widest text-sm mb-3">ÁREAS DE FORMAÇÃO</p>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-900 leading-tight">
                  O que se estuda na ESJ
                </h2>
                <p className="mt-5 max-w-2xl text-navy-900 leading-relaxed">
                  Licenciaturas em Maputo e na delegação académica de Manica, com
                  percursos de pós-graduação em Ciências da Comunicação.
                </p>
              </div>
              <div className="flex gap-2 shrink-0 lg:hidden">
                {NIVEIS_CURSO.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setNivelCurso(n.id)}
                    className={`px-4 py-2.5 text-xs font-bold tracking-wide transition-colors ${
                      nivelCurso === n.id
                        ? "bg-navy-800 text-white"
                        : "bg-white text-navy-800 border border-navy-100 hover:border-sky"
                    }`}
                  >
                    {n.label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {CURSOS.filter((c) => c.nivel === nivelCurso).map((c) => (
                <div key={c.titulo} className="bg-cream border border-navy-100 p-6 flex gap-4">
                  <c.icon size={22} className="shrink-0 mt-0.5 text-sky" />
                  <div>
                    <h3 className="font-serif font-bold text-navy-900">{c.titulo}</h3>
                    <p className="mt-2 text-sm text-navy-900/70 leading-relaxed">{c.texto}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Link
                href={`/inscricao?${filtroQuery({ nivel: NIVEL_ADMISSAO[nivelCurso], regime: "Diurno" })}`}
                className="inline-flex items-center bg-navy-800 hover:bg-crimson text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
              >
                CANDIDATAR-SE
              </Link>
            </div>
          </div>
        )}
        </div>
      </div>

      {open && viewer && (
        <div
          className="fixed inset-0 z-[80] bg-navy-900/85 flex items-center justify-center p-4 md:p-10"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Imagem"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar"
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X size={28} />
          </button>
          <div className="relative max-h-[90vh] max-w-[92vw]" onClick={(e) => e.stopPropagation()}>
            <img
              src={viewer.image}
              alt=""
              className="max-h-[90vh] max-w-[92vw] w-auto h-auto object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </section>
  );
}
