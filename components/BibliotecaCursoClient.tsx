"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import LeitorDocumento from "@/components/LeitorDocumento";
import {
  TIPOS_PROJECTO,
  labelTipo,
  PROJECTOS_CIENTIFICOS,
  type CursoBiblioteca,
  type ProjectoCientifico,
  type TipoProjecto,
} from "@/lib/producao-cientifica";
import { listProjectosPublicos } from "@/lib/biblioteca-cientifica-cms";

function Meta({ label, valor }: { label: string; valor?: string | null }) {
  if (!valor) return null;
  return (
    <span>
      <strong className="font-bold text-navy-900">{label}:</strong>{" "}
      <span className="text-navy-900/70">{valor}</span>
    </span>
  );
}

export default function BibliotecaCursoClient({ curso }: { curso: CursoBiblioteca }) {
  const searchParams = useSearchParams();
  const [tipo, setTipo] = useState<TipoProjecto | "todos">("todos");
  const [acervo, setAcervo] = useState<ProjectoCientifico[]>(PROJECTOS_CIENTIFICOS);
  const [ler, setLer] = useState<ProjectoCientifico | null>(null);

  useEffect(() => {
    void listProjectosPublicos().then((remotos) => {
      if (remotos === null) return;
      const porSlug = new Map<string, ProjectoCientifico>();
      for (const p of PROJECTOS_CIENTIFICOS) porSlug.set(p.slug, p);
      for (const p of remotos) porSlug.set(p.slug, p);
      setAcervo(Array.from(porSlug.values()));
    });
  }, []);

  // Abrir projecto vindo da pesquisa do sítio (?p=slug)
  useEffect(() => {
    const slug = (searchParams.get("p") || "").trim();
    if (!slug) return;
    const projecto = acervo.find((p) => p.slug === slug && p.curso === curso.codigo);
    if (projecto?.ficheiro) setLer(projecto);
  }, [acervo, curso.codigo, searchParams]);

  useEffect(() => {
    if (!ler) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [ler]);

  const lista = useMemo(
    () =>
      acervo
        .filter((p) => p.curso === curso.codigo && (tipo === "todos" || p.tipo === tipo))
        .sort((a, b) => b.ano - a.ano || a.titulo.localeCompare(b.titulo, "pt")),
    [acervo, curso.codigo, tipo]
  );

  const abrir = (p: ProjectoCientifico) => {
    if (!p.ficheiro) return;
    setLer(p);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <aside className="lg:w-64 shrink-0">
        <nav className="bg-white border border-navy-100" aria-label="Tipo de projecto">
          {TIPOS_PROJECTO.map((t, i) => {
            const activo = tipo === t.id;
            const ultimo = i === TIPOS_PROJECTO.length - 1;
            return (
              <div key={t.id} className={activo ? undefined : "px-4"}>
                <button
                  type="button"
                  onClick={() => setTipo(t.id)}
                  className={`w-full text-left py-3 text-sm transition-colors ${
                    activo
                      ? "bg-navy-900 text-white font-semibold px-4"
                      : `text-navy-900 hover:bg-cream ${ultimo ? "" : "border-b border-navy-100"}`
                  }`}
                >
                  {t.label}
                </button>
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 min-w-0 bg-white border border-navy-100">
        {lista.length === 0 ? (
          <p className="px-5 md:px-6 py-8 text-sm text-navy-900/55 italic">
            Ainda não há trabalhos neste filtro. Experimente outro tipo de projecto.
          </p>
        ) : (
          <ul className="divide-y divide-navy-100">
            {lista.map((p, i) => {
              const corpo = (
                <>
                  <p className="text-[11px] text-navy-900/40 truncate">
                    esj.ac.mz › acervo › {curso.titulo.toLowerCase()}
                  </p>
                  <h3 className="mt-1 font-serif text-[15px] md:text-base font-bold text-sky leading-snug line-clamp-3 group-hover:underline underline-offset-2">
                    {p.titulo}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed flex flex-wrap gap-x-3 gap-y-1">
                    <Meta label="Tipo" valor={labelTipo(p.tipo)} />
                    <Meta label="Ano" valor={String(p.ano)} />
                    {p.numeroEstudante ? (
                      <Meta label="N.º estudante" valor={p.numeroEstudante} />
                    ) : null}
                    <Meta label="Autor(es)" valor={p.autores.join(", ")} />
                    <Meta label="Tutor" valor={p.tutor} />
                    <Meta label="Avaliador" valor={p.avaliador} />
                    <Meta label="Ramos" valor={p.ramos} />
                  </p>
                </>
              );
              return (
                <li key={p.slug} className={i % 2 === 1 ? "bg-cream/50" : "bg-white"}>
                  {p.ficheiro ? (
                    <button
                      type="button"
                      onClick={() => abrir(p)}
                      className="group block w-full text-left px-5 md:px-6 py-5 hover:bg-cream/70 transition-colors"
                    >
                      {corpo}
                    </button>
                  ) : (
                    <div className="px-5 md:px-6 py-5 opacity-70">
                      {corpo}
                      <p className="mt-2 text-[12px] text-crimson italic">
                        Ficheiro ainda não disponível.
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {ler?.ficheiro ? (
        <div
          className="fixed inset-0 z-[200] bg-white flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={ler.titulo}
        >
          <Header />
          <div className="flex-1 min-h-0 flex flex-col">
            <LeitorDocumento
              url={ler.ficheiro}
              title={ler.titulo}
              modo="modal"
              onClose={() => setLer(null)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
