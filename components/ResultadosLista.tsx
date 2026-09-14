"use client";

import Link from "next/link";
import { Award, FileX } from "lucide-react";
import AdmissaoSidebar, { useFiltroAdmissao } from "@/components/AdmissaoSidebar";
import { cursosDoNivel, filtroQuery, REGIME_LABEL } from "@/lib/admissao";

export default function ResultadosLista() {
  const { filtro } = useFiltroAdmissao();
  const cursos = cursosDoNivel(filtro.nivel);
  const query = filtroQuery(filtro);

  return (
    <section className="mx-auto max-w-7xl px-4 lg:px-8 py-10 md:py-14">
      <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start">
        <AdmissaoSidebar inscricoesHref />
        <div className="min-w-0">
          <div className="grid sm:grid-cols-2 gap-5">
            {cursos.map((curso) => (
              <Link
                key={curso.slug}
                href={`/resultados/${curso.slug}?${query}`}
                className="bg-white border border-navy-100 p-6 hover:border-sky transition-colors flex flex-col"
              >
                <Award size={20} className="text-sky" />
                <h2 className="font-serif text-lg font-bold text-navy-900 mt-3">
                  {curso.nome}
                </h2>
                <p className="mt-2 text-sm text-navy-900/65 leading-relaxed">
                  {curso.titulo} — {REGIME_LABEL[filtro.regime]}
                </p>
                <span className="mt-4 inline-flex items-center text-sm text-sky">
                  Ver pauta de resultados →
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-8 text-xs text-navy-900/45 flex items-center gap-2">
            <FileX size={14} />
            Se a pauta ainda não estiver publicada, a lista aparece vazia depois de
            correr o SQL da tabela.
          </p>
        </div>
      </div>
    </section>
  );
}
