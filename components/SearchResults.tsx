"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { searchSite } from "@/lib/search-index";

export default function SearchResults() {
  const params = useSearchParams();
  const query = (params.get("q") ?? "").trim();
  const results = searchSite(query);

  return (
    <section className="mx-auto max-w-7xl px-4 lg:px-8 py-10 min-h-[40vh]">
      {query ? (
        <p className="mt-3 text-navy-900/70">
          {results.length === 1
            ? `1 resultado para “${query}”`
            : `${results.length} resultados para “${query}”`}
        </p>
      ) : (
        <p className="mt-3 text-navy-900/70">Escreva um termo na barra de pesquisa e prima Enter.</p>
      )}

      {query && results.length === 0 && (
        <div className="mt-10 border border-navy-100 bg-white p-8 text-center">
          <Search className="mx-auto text-navy-900/30" size={32} />
          <p className="mt-4 font-serif font-bold text-navy-900">Nenhum resultado encontrado</p>
          <p className="mt-2 text-sm text-navy-900/60">
            Tente outra palavra-chave, como jornalismo, admissões ou contacto.
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
              className="block bg-white border border-navy-100 hover:border-crimson p-6 transition-colors"
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
