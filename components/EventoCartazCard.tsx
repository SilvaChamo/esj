"use client";

import Link from "next/link";
import { FotoACarregar } from "@/components/Carregando";
import {
  formatDataEvento,
  labelTipoEvento,
  type EventoEsj,
} from "@/lib/eventos-esj";

export default function EventoCartazCard({
  evento,
  destaque = false,
}: {
  evento: EventoEsj;
  destaque?: boolean;
}) {
  return (
    <Link href={`/eventos/${evento.slug}`} className="group block">
      <div
        className={`relative overflow-hidden border border-navy-100 bg-navy-100/40 ${
          destaque ? "aspect-[3/4] max-h-[640px]" : "aspect-[3/4]"
        }`}
      >
        <FotoACarregar
          src={evento.cartaz_url}
          alt=""
          fill
          sizes={destaque ? "(min-width: 1024px) 40vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <p className="mt-3 text-[10px] font-bold tracking-widest text-sky uppercase">
        {labelTipoEvento(evento.tipo)}
      </p>
      <h3
        className={`mt-1 font-serif font-bold text-navy-900 leading-snug group-hover:text-sky transition-colors ${
          destaque ? "text-xl md:text-2xl" : "text-base md:text-lg line-clamp-2"
        }`}
      >
        {evento.titulo}
      </h3>
      <p className="mt-1 text-xs text-navy-900/55">
        {formatDataEvento(evento.data_inicio)}
        {evento.local ? ` · ${evento.local}` : ""}
        {evento.hora ? ` · ${evento.hora}` : ""}
      </p>
      {destaque && evento.resumo ? (
        <p className="mt-3 text-sm text-navy-900/70 leading-relaxed line-clamp-3">{evento.resumo}</p>
      ) : null}
      <span className="mt-4 inline-block text-xs font-bold tracking-wide text-navy-900 uppercase">
        Ver evento →
      </span>
    </Link>
  );
}
