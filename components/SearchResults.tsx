"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { searchSite, type SearchItem } from "@/lib/search-index";
import { listProjectosPublicos } from "@/lib/biblioteca-cientifica-cms";
import type { ProjectoCientifico } from "@/lib/producao-cientifica";
import { listNoticias, type Noticia } from "@/lib/noticias";

function normalizarSeccao(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export default function SearchResults() {
  const params = useSearchParams();
  const query = (params.get("q") ?? "").trim();
  const secao = (params.get("secao") ?? "").trim();
  const [remotos, setRemotos] = useState<ProjectoCientifico[] | null>(null);
  const [noticias, setNoticias] = useState<Noticia[] | null>(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let cancelado = false;
    void Promise.all([listProjectosPublicos(), listNoticias()]).then(([lista, listaNoticias]) => {
      if (cancelado) return;
      setRemotos(lista);
      setNoticias(listaNoticias);
      setPronto(true);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  const todos: SearchItem[] = pronto
    ? searchSite(query, remotos ?? [], noticias ?? [])
    : searchSite(query, [], []);
  const results: SearchItem[] = secao
    ? todos.filter((item) => normalizarSeccao(item.category) === normalizarSeccao(secao))
    : todos;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 md:py-8 min-h-[40vh]">
      {query ? (
        <p className="mt-3 text-navy-900/70">
          {results.length === 1
            ? `1 resultado para “${query}”`
            : `${results.length} resultados para “${query}”`}
          {secao ? ` em ${secao}` : ""}
        </p>
      ) : (
        <p className="mt-3 text-navy-900/70">Escreva um termo na barra de pesquisa e prima Enter.</p>
      )}

      {query && results.length === 0 && pronto && (
        <div className="mt-10 border border-navy-100 bg-white p-8 text-center">
          <Search className="mx-auto text-navy-900/30" size={32} />
          <p className="mt-4 font-serif font-bold text-navy-900">Nenhum resultado encontrado</p>
          <p className="mt-2 text-sm text-navy-900/60">
            Tente autor, tutor, avaliador, título, área, tipo de projecto ou curso.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex bg-sky hover:bg-crimson transition-colors text-white font-semibold text-xs tracking-wide px-5 py-3"
          >
            VOLTAR AO INÍCIO
          </Link>
        </div>
      )}

      <ul className="mt-10 space-y-4">
        {results.map((item) => (
          <li key={`${item.href}-${item.title}`}>
            <Link
              href={item.href}
              className="esj-card-move block bg-white border border-navy-100 hover:border-crimson p-6"
            >
              <span className="text-[11px] font-semibold tracking-widest text-crimson">
                {item.category.toUpperCase()}
              </span>
              <h2 className="font-serif text-xl font-bold text-navy-900 mt-2">{item.title}</h2>
              <p className="mt-2 text-sm text-navy-900/65 leading-relaxed">{item.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
