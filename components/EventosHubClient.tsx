"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FotoACarregar } from "@/components/Carregando";
import {
  EVENTO_TIPOS,
  formatDataEvento,
  labelTipoEvento,
  listEventosPublicos,
  partesDataEvento,
  type EventoEsj,
  eventoMissingTable,
} from "@/lib/eventos-esj";

export default function EventosHubClient() {
  const [lista, setLista] = useState<EventoEsj[]>([]);
  const [loading, setLoading] = useState(true);
  const [semTabela, setSemTabela] = useState(false);

  useEffect(() => {
    listEventosPublicos()
      .then(setLista)
      .catch((err) => {
        if (eventoMissingTable(err)) setSemTabela(true);
        setLista([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const ultimo = lista[0] || null;
  const proximos = lista.filter((e) => e.estado === "proximo").slice(0, 5);
  const anteriores = lista.filter((e) => e.estado === "realizado").slice(0, 4);

  return (
    <>
      {loading && (
        <p className="mx-auto max-w-7xl px-4 lg:px-8 py-10 text-sm text-navy-900/50">
          A carregar os eventos…
        </p>
      )}

      {semTabela && !loading && (
        <p className="mx-auto max-w-7xl px-4 lg:px-8 py-10 text-sm text-navy-900/55">
          Ainda sem eventos publicados. No painel, corre o SQL de eventos e adicione o primeiro
          cartaz.
        </p>
      )}

      {!loading && !semTabela && (
        <>
          {/* Último evento */}
          <section className="mx-auto max-w-7xl px-4 lg:px-8 py-12 md:py-16">
            {ultimo ? (
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <Link
                  href={`/eventos/${ultimo.slug}`}
                  className="relative block aspect-[3/4] max-h-[560px] overflow-hidden border border-navy-100 bg-navy-100/40"
                >
                  <FotoACarregar
                    src={ultimo.cartaz_url}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                    priority
                  />
                  <span className="absolute top-4 left-4 bg-navy-900/85 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5">
                    {labelTipoEvento(ultimo.tipo)}
                    {partesDataEvento(ultimo.data_inicio).ano
                      ? ` ${partesDataEvento(ultimo.data_inicio).ano}`
                      : ""}
                  </span>
                </Link>
                <div>
                  <p className="text-[11px] font-bold tracking-widest text-sky uppercase">
                    Último evento
                  </p>
                  <h2 className="mt-3 font-serif text-3xl md:text-4xl font-bold text-navy-900 leading-tight">
                    {ultimo.titulo}
                  </h2>
                  {ultimo.resumo ? (
                    <p className="mt-4 text-navy-900/75 leading-relaxed max-w-xl">{ultimo.resumo}</p>
                  ) : null}
                  <p className="mt-3 text-sm text-navy-900/55">
                    {formatDataEvento(ultimo.data_inicio)}
                    {ultimo.local ? ` · ${ultimo.local}` : ""}
                  </p>
                  <Link
                    href={`/eventos/${ultimo.slug}`}
                    className="esj-btn-move esj-btn-outline-navy mt-8 inline-flex items-center border bg-transparent text-sm font-semibold px-5 py-2.5"
                  >
                    Ver evento
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm text-navy-900/55">Ainda sem eventos no arquivo.</p>
            )}
          </section>

          {/* Explorar */}
          <section className="bg-white border-y border-navy-100">
            <div className="mx-auto max-w-7xl px-4 lg:px-8 py-14 md:py-20">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy-900 text-center">
                Explorar os nossos <span className="text-sky">eventos</span>
              </h2>
              <div className="mt-10 grid md:grid-cols-3 gap-6">
                {EVENTO_TIPOS.map((t) => (
                  <Link
                    key={t.id}
                    href={t.href}
                    className="group border border-navy-100 bg-cream p-6 md:p-8 hover:border-sky transition-colors flex flex-col"
                  >
                    <h3 className="font-serif text-xl font-bold text-navy-900 leading-snug group-hover:text-sky transition-colors">
                      {t.label}
                    </h3>
                    <p className="mt-3 text-sm text-navy-900/65 leading-relaxed flex-1">
                      {t.descricao}
                    </p>
                    <span className="mt-6 text-xs font-bold tracking-wide text-navy-900 uppercase">
                      Explorar →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Próximos */}
          <section className="mx-auto max-w-7xl px-4 lg:px-8 py-14 md:py-20">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy-900">
              Próximos eventos
            </h2>
            {proximos.length === 0 ? (
              <p className="mt-6 text-sm text-navy-900/55">Não há eventos próximos anunciados.</p>
            ) : (
              <ul className="mt-8 space-y-4">
                {proximos.map((e) => {
                  const d = partesDataEvento(e.data_inicio);
                  return (
                    <li
                      key={e.id}
                      className="flex flex-col sm:flex-row gap-4 sm:gap-6 border border-navy-100 bg-white p-4 sm:p-5"
                    >
                      <div className="shrink-0 w-20 h-20 bg-navy-900 text-white flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-serif font-bold leading-none">{d.dia}</span>
                        <span className="mt-1 text-[10px] font-bold tracking-wide">{d.mes}</span>
                        <span className="text-[10px] text-white/70">{d.ano}</span>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold tracking-widest text-sky uppercase">
                            {labelTipoEvento(e.tipo)}
                          </p>
                          <h3 className="mt-1 font-serif text-lg font-bold text-navy-900 leading-snug">
                            {e.titulo}
                          </h3>
                          <p className="mt-1 text-sm text-navy-900/60">
                            {[e.local, e.hora].filter(Boolean).join(" · ") || formatDataEvento(e.data_inicio)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
                          <Link
                            href={`/eventos/${e.slug}`}
                            className="inline-flex items-center border border-navy-900 text-navy-900 text-xs font-bold tracking-wide uppercase px-4 py-2 hover:bg-navy-900 hover:text-white transition-colors"
                          >
                            Ver programa
                          </Link>
                          {e.inscricao_url ? (
                            <a
                              href={e.inscricao_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center bg-crimson text-white text-xs font-bold tracking-wide uppercase px-4 py-2 hover:bg-navy-900 transition-colors"
                            >
                              Inscrever-se
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Anteriores */}
          <section className="bg-white border-t border-navy-100">
            <div className="mx-auto max-w-7xl px-4 lg:px-8 py-14 md:py-20">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy-900">
                Eventos anteriores
              </h2>
              {anteriores.length === 0 ? (
                <p className="mt-6 text-sm text-navy-900/55">O arquivo ainda está a crescer.</p>
              ) : (
                <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {anteriores.map((e) => (
                    <Link key={e.id} href={`/eventos/${e.slug}`} className="group block">
                      <div className="relative aspect-[3/4] overflow-hidden border border-navy-100 bg-navy-100/40">
                        <FotoACarregar
                          src={e.cartaz_url}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 25vw, 50vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <p className="mt-3 font-serif font-bold text-navy-900 text-sm leading-snug line-clamp-2 group-hover:text-sky transition-colors">
                        {e.titulo}
                      </p>
                      <p className="mt-1 text-[11px] text-navy-900/50">
                        {partesDataEvento(e.data_inicio).ano || formatDataEvento(e.data_inicio)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
              <div className="mt-10 text-center">
                <Link
                  href="/eventos/arquivo"
                  className="esj-btn-move esj-btn-outline-navy inline-flex items-center border bg-transparent text-sm font-semibold px-5 py-2.5"
                >
                  Ver arquivo de eventos
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
