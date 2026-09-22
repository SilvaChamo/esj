"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import EventoCartazCard from "@/components/EventoCartazCard";
import {
  EVENTO_TIPOS,
  agruparPorAno,
  eventoMissingTable,
  listEventosPublicos,
  type EventoEsj,
  type EventoTipo,
} from "@/lib/eventos-esj";

export default function EventosArquivoClient() {
  const params = useSearchParams();
  const tipoParam = params.get("tipo") as EventoTipo | null;
  const [lista, setLista] = useState<EventoEsj[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<EventoTipo | "todos">(
    tipoParam && EVENTO_TIPOS.some((t) => t.id === tipoParam) ? tipoParam : "todos"
  );

  useEffect(() => {
    if (tipoParam && EVENTO_TIPOS.some((t) => t.id === tipoParam)) setFiltro(tipoParam);
  }, [tipoParam]);

  useEffect(() => {
    setLoading(true);
    listEventosPublicos(filtro === "todos" ? undefined : { tipo: filtro })
      .then(setLista)
      .catch((err) => {
        if (!eventoMissingTable(err)) console.error(err);
        setLista([]);
      })
      .finally(() => setLoading(false));
  }, [filtro]);

  const porAno = useMemo(() => agruparPorAno(lista), [lista]);

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12 md:py-16">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFiltro("todos")}
          className={`px-4 py-2 text-xs font-bold tracking-wide uppercase border ${
            filtro === "todos"
              ? "bg-navy-900 text-white border-navy-900"
              : "bg-white text-navy-900 border-navy-100 hover:border-sky"
          }`}
        >
          Todos
        </button>
        {EVENTO_TIPOS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFiltro(t.id)}
            className={`px-4 py-2 text-xs font-bold tracking-wide uppercase border ${
              filtro === t.id
                ? "bg-navy-900 text-white border-navy-900"
                : "bg-white text-navy-900 border-navy-100 hover:border-sky"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="mt-10 text-sm text-navy-900/50">A carregar o arquivo…</p>}

      {!loading && porAno.length === 0 && (
        <p className="mt-10 text-sm text-navy-900/55">Ainda sem eventos neste filtro.</p>
      )}

      <div className="mt-12 space-y-14">
        {porAno.map(([ano, eventos]) => (
          <section key={ano}>
            <h2 className="font-serif text-2xl font-bold text-navy-900 border-b border-navy-100 pb-3">
              {ano}
            </h2>
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {eventos.map((e) => (
                <EventoCartazCard key={e.id} evento={e} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
