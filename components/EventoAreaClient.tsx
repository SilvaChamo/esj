"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import EventoCartazCard from "@/components/EventoCartazCard";
import { FotoACarregar } from "@/components/Carregando";
import {
  eventoMissingTable,
  formatDataEvento,
  labelTipoEvento,
  listEventosPublicos,
  type EventoEsj,
  type EventoTipo,
} from "@/lib/eventos-esj";

const TOM: Record<EventoTipo, string> = {
  conferencia: "institucional",
  semana: "dinamica",
  coloquio: "editorial",
};

export default function EventoAreaClient({ tipo }: { tipo: EventoTipo }) {
  const [lista, setLista] = useState<EventoEsj[]>([]);
  const [loading, setLoading] = useState(true);
  const tom = TOM[tipo];

  useEffect(() => {
    listEventosPublicos({ tipo })
      .then(setLista)
      .catch((err) => {
        if (!eventoMissingTable(err)) console.error(err);
        setLista([]);
      })
      .finally(() => setLoading(false));
  }, [tipo]);

  const destaque = useMemo(() => {
    const prox = lista.find((e) => e.estado === "proximo");
    return prox || lista[0] || null;
  }, [lista]);

  const proximos = lista.filter((e) => e.estado === "proximo" && e.id !== destaque?.id);
  const anteriores = lista.filter((e) => e.estado === "realizado" && e.id !== destaque?.id);

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12 md:py-16 space-y-16">
      {loading && <p className="text-sm text-navy-900/50">A carregar…</p>}

      {!loading && !destaque && (
        <p className="text-sm text-navy-900/55">Ainda sem edições nesta área.</p>
      )}

      {destaque && (
        <section
          className={
            tom === "editorial"
              ? "grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start"
              : "grid lg:grid-cols-2 gap-10 items-start"
          }
        >
          <Link href={`/eventos/${destaque.slug}`} className="relative block aspect-[3/4] overflow-hidden border border-navy-100">
            <FotoACarregar
              src={destaque.cartaz_url}
              alt=""
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
              priority
            />
          </Link>
          <div>
            <p className="text-[11px] font-bold tracking-widest text-sky uppercase">
              {destaque.estado === "proximo" ? "Próxima edição" : "Última edição"}
            </p>
            <h2 className="mt-2 font-serif text-2xl md:text-3xl font-bold text-navy-900 leading-tight">
              {destaque.titulo}
            </h2>
            <p className="mt-3 text-sm text-navy-900/60">
              {formatDataEvento(destaque.data_inicio)}
              {destaque.hora ? ` · ${destaque.hora}` : ""}
              {destaque.local ? ` · ${destaque.local}` : ""}
            </p>
            {destaque.resumo ? (
              <p className="mt-4 text-navy-900/75 leading-relaxed">{destaque.resumo}</p>
            ) : null}
            {destaque.programa.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xs font-bold tracking-widest text-navy-900 uppercase">Programa</h3>
                <ul className="mt-3 space-y-2 border-t border-navy-100 pt-3">
                  {destaque.programa.slice(0, 6).map((p, i) => (
                    <li key={i} className="text-sm text-navy-900/80 flex gap-3">
                      {p.hora ? (
                        <span className="font-semibold text-sky shrink-0 w-14">{p.hora}</span>
                      ) : null}
                      <span>
                        {p.dia ? <span className="font-semibold">{p.dia}: </span> : null}
                        {p.item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link
              href={`/eventos/${destaque.slug}`}
              className="esj-btn-move esj-btn-outline-navy mt-8 inline-flex border bg-transparent text-sm font-semibold px-5 py-2.5"
            >
              Ver evento
            </Link>
          </div>
        </section>
      )}

      {tipo === "coloquio" && (proximos.length > 0 || anteriores.length > 0) && (
        <section>
          <h2 className="font-serif text-2xl font-bold text-navy-900">
            {proximos.length > 0 ? "Próximos colóquios" : "Colóquios anteriores"}
          </h2>
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
            {[...proximos, ...anteriores].map((e) => (
              <EventoCartazCard key={e.id} evento={e} />
            ))}
          </div>
        </section>
      )}

      {tipo !== "coloquio" && proximos.length > 0 && (
        <section>
          <h2 className="font-serif text-2xl font-bold text-navy-900">Outras edições próximas</h2>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {proximos.map((e) => (
              <EventoCartazCard key={e.id} evento={e} />
            ))}
          </div>
        </section>
      )}

      {tipo !== "coloquio" && anteriores.length > 0 && (
        <section>
          <h2 className="font-serif text-2xl font-bold text-navy-900">Edições anteriores</h2>
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {anteriores.map((e) => (
              <EventoCartazCard key={e.id} evento={e} />
            ))}
          </div>
        </section>
      )}

      {destaque?.galeria_urls?.length ? (
        <section>
          <h2 className="font-serif text-2xl font-bold text-navy-900">Galeria</h2>
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {destaque.galeria_urls.slice(0, 8).map((url) => (
              <div key={url} className="relative aspect-[4/3] border border-navy-100 overflow-hidden">
                <FotoACarregar src={url} alt="" fill sizes="25vw" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <p className="text-sm text-navy-900/55">
        Ver no{" "}
        <Link
          href={`/eventos/arquivo?tipo=${tipo}`}
          className="text-sky font-semibold hover:underline"
        >
          arquivo de {labelTipoEvento(tipo).toLowerCase()}
        </Link>
        .
      </p>
    </div>
  );
}
