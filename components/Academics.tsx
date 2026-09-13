"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Megaphone,
  Newspaper,
  PenLine,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  CALENDARIO_EVENT,
  DEFAULT_CALENDARIO,
  loadCalendario,
  type Calendario,
} from "@/lib/calendario";
import {
  DEFAULT_EVENTO,
  DEFAULT_PUBLICACAO,
  LIVROS_ANTERIORES,
  loadLivros,
  loadPublicacao,
  type Categoria,
  type LivroThumb,
  type Publicacao,
} from "@/lib/publicacao";

type SectionTab = "ensino" | "calendario" | "cursos";

const SECTION_TABS: { id: SectionTab; label: string }[] = [
  { id: "cursos", label: "Áreas de Formação" },
  { id: "calendario", label: "Calendário Académico" },
  { id: "ensino", label: "Ensino e História" },
];

const CURSOS: { titulo: string; texto: string; icon: LucideIcon }[] = [
  {
    titulo: "Jornalismo",
    texto: "Formação em técnicas e ética do jornalismo, para os media impressos, digitais, rádio e televisão.",
    icon: Newspaper,
  },
  {
    titulo: "Publicidade e Marketing",
    texto: "Estratégia, criação e comunicação de marcas para organizações e mercados.",
    icon: Megaphone,
  },
  {
    titulo: "Relações Públicas",
    texto: "Gestão da comunicação institucional e da relação com os públicos.",
    icon: Users,
  },
  {
    titulo: "Biblioteconomia e Documentação",
    texto: "Organização, gestão e mediação da informação e do conhecimento.",
    icon: BookOpen,
  },
  {
    titulo: "Pós-Graduação",
    texto: "Percursos de especialização e investigação avançada em Ciências da Comunicação.",
    icon: GraduationCap,
  },
];

export default function Academics() {
  const [tab, setTab] = useState<SectionTab>("ensino");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Categoria>("livro");
  const [livroBook, setLivroBook] = useState<Publicacao>(DEFAULT_PUBLICACAO);
  const [eventoBook, setEventoBook] = useState<Publicacao>(DEFAULT_EVENTO);
  const [livros, setLivros] = useState<LivroThumb[]>(LIVROS_ANTERIORES);
  const [viewer, setViewer] = useState<LivroThumb | null>(null);
  const [cal, setCal] = useState<Calendario>(DEFAULT_CALENDARIO);

  useEffect(() => {
    const load = () => {
      loadPublicacao("livro").then(setLivroBook);
      loadPublicacao("evento").then(setEventoBook);
      loadLivros().then(setLivros);
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

  const show = (item: LivroThumb) => {
    setViewer(item);
    setOpen(true);
  };

  const book = active === "livro" ? livroBook : eventoBook;
  const isLivro = active === "livro" && book.tipo === "livro";

  const DATAS: { titulo: string; texto: string; icon: LucideIcon; link?: { href: string; label: string } }[] = [
    { titulo: "Inscrições", texto: cal.inscricoes, icon: ClipboardList },
    { titulo: "Exames de admissão", texto: cal.exames, icon: PenLine },
    {
      titulo: "Publicação de resultados",
      texto: cal.resultados,
      icon: Award,
      link: { href: "/resultados", label: "Ver resultados" },
    },
    { titulo: "Início do ano lectivo", texto: cal.inicioAno, icon: CalendarDays },
  ];

  return (
    <section id="ensino" className="bg-white">
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
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-start">
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

            <div
              className={`relative w-full overflow-hidden bg-cream border border-navy-100 flex flex-col ${
                active === "evento" ? "aspect-[210/297]" : "aspect-square"
              }`}
            >
              <button
                type="button"
                onClick={() => show({ image: book.image, title: book.title })}
                className={`relative min-h-0 ${isLivro ? "flex-1" : "h-full"}`}
                aria-label={`Ver cartaz de ${book.title}`}
              >
                <img
                  src={book.image}
                  alt={book.title}
                  className={
                    isLivro
                      ? "absolute inset-0 w-full h-full object-contain p-2 pb-1"
                      : "absolute inset-0 w-full h-full object-cover"
                  }
                />
              </button>

              {isLivro && (
                <div className="grid grid-cols-3 gap-1 px-1.5 pb-1.5 flex-[0_0_27%]">
                  {livros.map((liv) => (
                    <button
                      key={liv.image}
                      type="button"
                      onClick={() => show(liv)}
                      className="relative h-full overflow-hidden border border-navy-100 bg-white hover:border-crimson transition-colors"
                      aria-label={`Ver ${liv.title}`}
                    >
                      <img
                        src={liv.image}
                        alt={liv.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "calendario" && (
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
            <div className="mt-10 grid sm:grid-cols-2 gap-x-10 gap-y-8">
              {DATAS.map((d) => (
                <div key={d.titulo} className="flex gap-4">
                  <d.icon size={22} className="shrink-0 mt-0.5 text-sky" />
                  <div>
                    <h3 className="font-serif font-bold text-navy-900">{d.titulo}</h3>
                    <p className="mt-1.5 text-sm text-navy-900/70 leading-relaxed">{d.texto}</p>
                    {d.link && (
                      <Link
                        href={d.link.href}
                        className="mt-1.5 inline-block text-sm text-sky hover:underline"
                      >
                        {d.link.label} →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
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
            <p className="text-sky font-bold tracking-widest text-sm mb-3">ÁREAS DE FORMAÇÃO</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-900 leading-tight">
              O que se estuda na ESJ
            </h2>
            <p className="mt-5 max-w-2xl text-navy-900 leading-relaxed">
              Licenciaturas em Maputo e na delegação académica de Manica, com
              percursos de pós-graduação em Ciências da Comunicação.
            </p>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {CURSOS.map((c) => (
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
                href="/inscricoes"
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
          aria-label={viewer.title}
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
              alt={viewer.title}
              className="max-h-[90vh] max-w-[92vw] w-auto h-auto object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </section>
  );
}
