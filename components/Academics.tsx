"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  Globe,
  GraduationCap,
  HeartHandshake,
  Megaphone,
  Newspaper,
  PenLine,
  Plane,
  Scale,
  Users,
  type LucideIcon,
} from "lucide-react";
import { filtroQuery } from "@/lib/admissao";
import {
  CALENDARIO_EVENT,
  DEFAULT_CALENDARIO,
  loadCalendario,
  type Calendario,
} from "@/lib/calendario";
import EntradaHome from "@/components/EntradaHome";

type SectionTab = "calendario" | "cursos" | "internacional" | "minutas";

const SECTION_TABS: { id: SectionTab; label: string }[] = [
  { id: "cursos", label: "Áreas de Formação" },
  { id: "calendario", label: "Calendário Académico" },
  { id: "internacional", label: "Estudantes Internacionais" },
  { id: "minutas", label: "Minutas" },
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
  const [cal, setCal] = useState<Calendario>(DEFAULT_CALENDARIO);

  useEffect(() => {
    const load = () => {
      loadCalendario().then(setCal);
    };
    load();
    window.addEventListener(CALENDARIO_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(CALENDARIO_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  useEffect(() => {
    const aplicarHash = () => {
      const hash = window.location.hash;
      if (hash === "#ensino-pos-graduacao") {
        setTab("cursos");
        setNivelCurso("pos-graduacao");
      } else if (hash === "#ensino-licenciatura" || hash === "#ensino") {
        setTab("cursos");
        setNivelCurso("licenciatura");
      } else {
        return;
      }
      requestAnimationFrame(() => {
        document.getElementById("ensino")?.scrollIntoView({ behavior: "smooth" });
      });
    };

    const onNivel = (e: Event) => {
      const nivel = (e as CustomEvent<NivelCurso>).detail;
      if (nivel !== "licenciatura" && nivel !== "pos-graduacao") return;
      setTab("cursos");
      setNivelCurso(nivel);
      requestAnimationFrame(() => {
        document.getElementById("ensino")?.scrollIntoView({ behavior: "smooth" });
      });
    };

    aplicarHash();
    window.addEventListener("hashchange", aplicarHash);
    window.addEventListener("esj:ensino-nivel", onNivel);
    return () => {
      window.removeEventListener("hashchange", aplicarHash);
      window.removeEventListener("esj:ensino-nivel", onNivel);
    };
  }, []);

  const DATAS: {
    titulo: string;
    texto: string;
    icon: LucideIcon;
    numero: number;
    link?: { href: string; label: string };
    dataCalendario: string;
  }[] = [
    {
      titulo: "Inscrições",
      texto: cal.inscricoes,
      icon: ClipboardList,
      numero: 1,
      link: { href: "/inscricao", label: "Inscrever-se" },
      dataCalendario: "2026-01-05",
    },
    {
      titulo: "Exames de admissão",
      texto: cal.exames,
      icon: PenLine,
      numero: 2,
      dataCalendario: "2026-02-09",
    },
    {
      titulo: "Publicação de resultados",
      texto: cal.resultados,
      icon: Award,
      numero: 3,
      link: { href: "/resultados", label: "Ver resultados" },
      dataCalendario: "2026-02-09",
    },
    {
      titulo: "Início do ano lectivo",
      texto: cal.inicioAno,
      icon: CalendarDays,
      numero: 4,
      dataCalendario: "2026-03-02",
    },
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
        <div className="mx-auto max-w-7xl px-4 flex flex-wrap">
          {SECTION_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`relative px-4 py-2.5 text-sm font-bold tracking-wide transition-colors ${
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

      <div className="mx-auto max-w-7xl px-4">
        <div className={tab === "calendario" ? "pt-16 md:pt-20" : "py-16 md:py-20"}>
        {tab === "internacional" && (
          <EntradaHome>
            <div>
              <p className="flex items-center gap-3 text-leaf font-bold tracking-widest text-sm mb-3">
                <span className="h-px w-[40px] shrink-0 bg-leaf" aria-hidden />
                ESTUDANTES INTERNACIONAIS
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-900 leading-tight mb-3">
                Estuda na <span className="text-sky">ESJ</span>
              </h2>
              <p className="mt-2 max-w-2xl text-navy-900/70 leading-relaxed">
                A ESJ acolhe estudantes de todo o mundo. Descobre os programas de intercâmbio
                e as oportunidades de mobilidade académica disponíveis.
              </p>

              <div className="mt-10 grid sm:grid-cols-2 gap-5">
                {/* Card 1 — Estudar Internacionalmente */}
                <div className="bg-cream border border-navy-100 p-8 flex flex-col gap-5">
                  <span className="inline-flex items-center justify-center w-12 h-12 bg-sky/10 text-sky">
                    <Globe size={24} />
                  </span>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-navy-900">Estudar na ESJ</h3>
                    <p className="mt-3 text-sm text-navy-900/70 leading-relaxed">
                      Estudantes de países lusófonos e de todo o mundo podem candidatar-se às
                      licenciaturas e pós-graduações da ESJ. A escola oferece um ambiente
                      multicultural com apoio à integração académica e social.
                    </p>
                    <ul className="mt-4 space-y-2">
                      {[
                        "Licenciaturas em regime diurno e pós-laboral",
                        "Apoio na obtenção de visto de estudante",
                        "Alojamento e serviços sociais disponíveis",
                        "Reconhecimento de graus académicos estrangeiros",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-navy-900/75">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card 2 — Intercâmbio / Mobilidade */}
                <div className="bg-cream border border-navy-100 p-8 flex flex-col gap-5">
                  <span className="inline-flex items-center justify-center w-12 h-12 bg-crimson/10 text-crimson">
                    <Plane size={24} />
                  </span>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-navy-900">Programas de Intercâmbio</h3>
                    <p className="mt-3 text-sm text-navy-900/70 leading-relaxed">
                      A ESJ mantém protocolos de cooperação com universidades e escolas de
                      comunicação parceiras. Os programas de mobilidade permitem estudar um
                      semestre ou um ano numa instituição estrangeira.
                    </p>
                    <ul className="mt-4 space-y-2">
                      {[
                        "Mobilidade em universidades parceiras na África e Europa",
                        "Bolsas e financiamento disponíveis",
                        "Reconhecimento de créditos ECTS",
                        "Apoio da equipa de Relações Internacionais da ESJ",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-navy-900/75">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-crimson shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <Link
                  href="/estudantes-internacionais"
                  className="esj-btn-move inline-flex items-center gap-2 bg-navy-800 text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
                >
                  <Globe size={15} />
                  CANDIDATURA INTERNACIONAL
                </Link>
              </div>
            </div>
          </EntradaHome>
        )}

        {tab === "calendario" && (
          <div>
            <EntradaHome>
              <div>
                <p className="flex items-center gap-3 text-leaf font-bold tracking-widest text-sm mb-3">
                  <span className="h-px w-[40px] shrink-0 bg-leaf" aria-hidden />
                  CALENDÁRIO ACADÉMICO
                </p>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-900 leading-tight">
                  Datas do ano <span className="text-sky">lectivo</span>
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
            </EntradaHome>

            <div className="mt-14 relative">
              <div
                aria-hidden
                className="absolute left-4 sm:left-1/2 top-2 bottom-2 w-px bg-sky-300 sm:-translate-x-1/2"
              />
              <div className="space-y-10">
                {DATAS.map((d, i) => {
                  const isRight = i % 2 === 1;
                  return (
                    <EntradaHome key={d.titulo} atraso={i * 0.12}>
                      <div className="relative pl-12 sm:pl-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:items-center">
                        <span className="absolute left-4 sm:left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white border-2 border-sky-300">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 text-white text-sm font-bold">
                            {d.numero}
                          </span>
                        </span>
                        <div
                          className={`relative overflow-hidden bg-cream p-6 flex gap-4 sm:row-start-1 ${
                            isRight ? "sm:col-start-2" : "sm:col-start-1"
                          }`}
                        >
                          {/* Semi-círculo + linha vermelha só nos cards da esquerda (à direita do card, virado ao centro) */}
                          {!isRight && (
                            <span
                              aria-hidden
                              className="hidden sm:block absolute top-1/2 -right-3 z-[5] -translate-y-1/2"
                            >
                              <span className="flex items-center">
                                <span className="h-px w-4 bg-crimson" />
                                <span className="h-6 w-3 rounded-r-full border-2 border-l-0 border-crimson bg-white" />
                              </span>
                            </span>
                          )}
                          <span
                            aria-hidden
                            className="pointer-events-none select-none absolute -right-2 -top-6 font-serif font-bold text-navy-900/[0.06] text-[7rem] leading-none"
                          >
                            {d.numero}
                          </span>
                          <d.icon size={22} className="relative shrink-0 mt-0.5 text-sky" />
                          <div className="relative min-w-0">
                            <h3 className="font-serif text-lg font-bold text-navy-900">{d.titulo}</h3>
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
                        <div
                          className={`mt-4 sm:mt-0 flex sm:row-start-1 ${
                            isRight ? "sm:col-start-1 sm:justify-end" : "sm:col-start-2 sm:justify-start"
                          }`}
                        >
                          <div className="w-full sm:w-auto border-t border-navy-100/80 bg-navy-50/60 px-4 py-3 sm:border sm:border-navy-100/70">
                            <Link
                              href={`/calendario?dia=${d.dataCalendario}`}
                              className="esj-btn-move inline-flex items-center gap-2 bg-navy-800 text-white font-semibold text-xs tracking-wide px-5 py-3"
                            >
                              <CalendarDays size={14} />
                              Ver no calendário
                            </Link>
                          </div>
                        </div>
                      </div>
                    </EntradaHome>
                  );
                })}
              </div>
            </div>

            <EntradaHome atraso={0.48}>
              <div className="mt-16 w-screen relative left-1/2 -translate-x-1/2 border-t border-navy-100/80 bg-navy-50/60">
                <div className="mx-auto max-w-7xl px-4 py-5 sm:py-6 flex flex-wrap gap-3 justify-center">
                  <Link
                    href="/edital"
                    className="esj-btn-move inline-flex items-center bg-navy-800 text-white font-semibold text-xs tracking-wide px-6 py-3.5"
                  >
                    VER EDITAL DE ADMISSÃO
                  </Link>
                  <Link
                    href="/inscricoes"
                    className="esj-btn-move inline-flex items-center bg-white border border-navy-100 hover:border-sky text-navy-800 font-semibold text-xs tracking-wide px-6 py-3.5"
                  >
                    ESTADO DAS INSCRIÇÕES
                  </Link>
                </div>
              </div>
            </EntradaHome>
          </div>
        )}

        {tab === "cursos" && (
          <div>
            <EntradaHome>
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <p className="flex items-center gap-3 text-leaf font-bold tracking-widest text-sm mb-3">
                  <span className="h-px w-[40px] shrink-0 bg-leaf" aria-hidden />
                  ÁREAS DE FORMAÇÃO
                </p>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-900 leading-tight">
                  O que se estuda na <span className="text-sky">ESJ</span>
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
            </EntradaHome>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
              {CURSOS.filter((c) => c.nivel === nivelCurso).map((c, i) => (
                <EntradaHome key={c.titulo} atraso={Math.floor(i / 3) * 0.12}>
                  <div className="bg-cream border border-navy-100 p-6 flex gap-4 h-full">
                    <c.icon size={22} className="shrink-0 mt-0.5 text-sky" />
                    <div>
                      <h3 className="font-serif font-bold text-navy-900">{c.titulo}</h3>
                      <p className="mt-2 text-sm text-navy-900/70 leading-relaxed">{c.texto}</p>
                    </div>
                  </div>
                </EntradaHome>
              ))}
            </div>
            <EntradaHome atraso={0.18}>
            <div className="mt-10">
              <Link
                href={`/inscricao?${filtroQuery({ nivel: NIVEL_ADMISSAO[nivelCurso], regime: "Diurno" })}`}
                className="esj-btn-move inline-flex items-center bg-navy-800 text-white font-semibold text-xs tracking-wide px-6 py-3.5"
              >
                CANDIDATAR-SE
              </Link>
            </div>
            </EntradaHome>
          </div>
        )}

        {tab === "minutas" && (
          <EntradaHome>
            <div>
              <p className="flex items-center gap-3 text-leaf font-bold tracking-widest text-sm mb-3">
                <span className="h-px w-[40px] shrink-0 bg-leaf" aria-hidden />
                DOCUMENTAÇÃO INSTITUCIONAL
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-900 leading-tight mb-3">
                Minutas e <span className="text-sky">Legislação</span>
              </h2>
              <p className="mt-2 max-w-2xl text-navy-900/70 leading-relaxed">
                Acede aos documentos oficiais da ESJ — minutas das reuniões dos órgãos
                colegiais e legislação aplicável ao ensino superior em Moçambique.
              </p>

              <div className="mt-10 grid sm:grid-cols-2 gap-5">
                {/* Card Minutas */}
                <div className="bg-cream border border-navy-100 p-8 flex flex-col gap-5 h-full">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center justify-center w-12 h-12 bg-sky/10 text-sky shrink-0">
                      <FileText size={24} />
                    </span>
                    <h3 className="font-serif text-xl font-bold text-navy-900">Minutas</h3>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-navy-900/70 leading-relaxed">
                      Consulta as minutas das reuniões do Conselho Científico, Conselho
                      Pedagógico e demais órgãos colegiais da Escola Superior de Jornalismo.
                      Documentos disponíveis para todos os membros da comunidade académica.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/minutas"
                      className="esj-btn-move inline-flex items-center gap-2 bg-navy-800 text-white font-semibold text-xs tracking-wide px-5 py-3 transition-colors"
                    >
                      <FileText size={14} />
                      VER MINUTAS
                    </Link>
                  </div>
                </div>

                {/* Card Legislação */}
                <div className="bg-cream border border-navy-100 p-8 flex flex-col gap-5 h-full">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center justify-center w-12 h-12 bg-crimson/10 text-crimson shrink-0">
                      <Scale size={24} />
                    </span>
                    <h3 className="font-serif text-xl font-bold text-navy-900">Legislação</h3>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-navy-900/70 leading-relaxed">
                      Enquadramento legal que rege o funcionamento da ESJ e do ensino
                      superior em Moçambique — diplomas, decretos, regulamentos e estatutos
                      em vigor.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/regulamentos"
                      className="esj-btn-move inline-flex items-center gap-2 bg-crimson text-white font-semibold text-xs tracking-wide px-5 py-3 transition-colors"
                    >
                      <Scale size={14} />
                      VER LEGISLAÇÃO
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </EntradaHome>
        )}
        </div>
      </div>

    </section>
  );
}
