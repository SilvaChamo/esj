"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import Header from "@/components/Header";
import LeitorDocumento from "@/components/LeitorDocumento";
import {
  CURSOS_DOCENCIA,
  agruparPorCadeira,
  labelTipoMaterial,
  listMateriaisDocencia,
  type CursoDocenciaSlug,
  type MaterialDocencia,
} from "@/lib/docencia";

export default function DocenciaClient() {
  const [curso, setCurso] = useState<CursoDocenciaSlug>(CURSOS_DOCENCIA[0].slug);
  const [materiais, setMateriais] = useState<MaterialDocencia[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [ler, setLer] = useState<MaterialDocencia | null>(null);

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    listMateriaisDocencia()
      .then((rows) => {
        if (!cancelado) setMateriais(rows);
      })
      .catch(() => {
        if (!cancelado) setMateriais(null);
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (!ler) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [ler]);

  const cadeiras = useMemo(
    () => agruparPorCadeira((materiais ?? []).filter((m) => m.curso === curso)),
    [materiais, curso]
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        {CURSOS_DOCENCIA.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setCurso(c.slug)}
            className={`px-4 py-2.5 text-xs font-bold tracking-wide transition-colors ${
              curso === c.slug
                ? "bg-navy-900 text-white"
                : "bg-white text-navy-800 border border-navy-100 hover:border-sky"
            }`}
          >
            {c.titulo.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-navy-900/55">A carregar os materiais…</p>
      ) : cadeiras.length === 0 ? (
        <div className="bg-white border border-navy-100 px-6 py-12 text-center text-sm text-navy-900/55">
          Ainda não há materiais partilhados para este curso.
        </div>
      ) : (
        <div className="space-y-8">
          {cadeiras.map((cadeira) => (
            <div key={cadeira.slug} className="bg-white border border-navy-100">
              <div className="px-5 md:px-6 py-4 border-b border-navy-100 bg-cream">
                <h2 className="font-serif text-lg font-bold text-navy-900">{cadeira.nome}</h2>
              </div>
              <ul className="divide-y divide-navy-100">
                {cadeira.materiais.map((m, i) => (
                  <li key={m.id} className={i % 2 === 1 ? "bg-cream/50" : "bg-white"}>
                    <button
                      type="button"
                      onClick={() => setLer(m)}
                      className="group flex w-full items-start gap-4 text-left px-5 md:px-6 py-5 hover:bg-cream/70 transition-colors"
                    >
                      <FileText size={20} className="shrink-0 mt-0.5 text-sky" />
                      <div className="min-w-0">
                        <span className="inline-block mb-1.5 px-2 py-0.5 bg-sky/10 text-sky text-[10px] font-bold uppercase tracking-wide">
                          {labelTipoMaterial(m.tipo)}
                        </span>
                        <h3 className="font-serif text-[15px] md:text-base font-bold text-navy-900 leading-snug group-hover:text-sky transition-colors">
                          {m.titulo}
                        </h3>
                        <p className="mt-1.5 text-[12px] text-navy-900/55">
                          Por: {m.autor || "Docente"}
                          {m.createdAt
                            ? ` · ${new Date(m.createdAt).toLocaleDateString("pt-PT")}`
                            : ""}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {ler ? (
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
