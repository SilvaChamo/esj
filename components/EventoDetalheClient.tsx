"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FotoACarregar } from "@/components/Carregando";
import {
  eventoMissingTable,
  formatDataEvento,
  getEventoBySlug,
  labelTipoEvento,
  type EventoEsj,
} from "@/lib/eventos-esj";

export default function EventoDetalheClient({ slug }: { slug: string }) {
  const [evento, setEvento] = useState<EventoEsj | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    getEventoBySlug(slug)
      .then((e) => {
        setEvento(e);
        if (!e) setErro("Evento não encontrado.");
      })
      .catch((err) => {
        if (eventoMissingTable(err)) setErro("Ainda sem tabela de eventos na base.");
        else setErro("Não foi possível carregar o evento.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <p className="mx-auto max-w-7xl px-4 py-16 text-sm text-navy-900/50">A carregar o evento…</p>
    );
  }

  if (!evento) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <p className="text-sm text-navy-900/55">{erro}</p>
        <Link href="/eventos" className="mt-4 inline-block text-sky font-semibold hover:underline">
          ← Voltar aos eventos
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-7xl px-4 lg:px-8 py-10 md:py-14">
      <Link href="/eventos" className="text-sm text-sky font-semibold hover:underline">
        ← Eventos ESJ
      </Link>

      <div className="mt-8 grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-10 items-start">
        <div className="relative aspect-[3/4] w-full max-w-md mx-auto lg:mx-0 overflow-hidden border border-navy-100 bg-navy-100/40">
          <FotoACarregar
            src={evento.cartaz_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 35vw, 90vw"
            className="object-cover"
            priority
          />
        </div>

        <div>
          <p className="text-[11px] font-bold tracking-widest text-sky uppercase">
            {labelTipoEvento(evento.tipo)}
          </p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl font-bold text-navy-900 leading-tight uppercase">
            {evento.titulo}
          </h1>
          <p className="mt-4 text-sm text-navy-900/60">
            {formatDataEvento(evento.data_inicio)}
            {evento.data_fim ? ` — ${formatDataEvento(evento.data_fim)}` : ""}
            {evento.hora ? ` · ${evento.hora}` : ""}
            {evento.local ? ` · ${evento.local}` : ""}
          </p>

          {(evento.descricao || evento.resumo) && (
            <section className="mt-10">
              <h2 className="text-xs font-bold tracking-widest text-navy-900 uppercase border-b border-navy-100 pb-2">
                Sobre o evento
              </h2>
              <p className="mt-4 text-navy-900/80 leading-relaxed whitespace-pre-line">
                {evento.descricao || evento.resumo}
              </p>
            </section>
          )}

          {(evento.convidado || evento.oradores) && (
            <section className="mt-10">
              <h2 className="text-xs font-bold tracking-widest text-navy-900 uppercase border-b border-navy-100 pb-2">
                {evento.convidado ? "Convidado" : "Oradores"}
              </h2>
              <p className="mt-4 text-navy-900/80 leading-relaxed whitespace-pre-line">
                {evento.convidado || evento.oradores}
              </p>
            </section>
          )}

          {evento.programa.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xs font-bold tracking-widest text-navy-900 uppercase border-b border-navy-100 pb-2">
                Programa
              </h2>
              <ul className="mt-4 space-y-3">
                {evento.programa.map((p, i) => (
                  <li key={i} className="flex gap-4 text-sm text-navy-900/80">
                    {p.hora ? <span className="font-bold text-sky w-16 shrink-0">{p.hora}</span> : null}
                    <span>
                      {p.dia ? <strong>{p.dia} — </strong> : null}
                      {p.item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {evento.inscricao_url ? (
            <a
              href={evento.inscricao_url}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex bg-crimson text-white text-xs font-bold tracking-wide uppercase px-5 py-3 hover:bg-navy-900 transition-colors"
            >
              Inscrever-se
            </a>
          ) : null}
        </div>
      </div>

      {evento.galeria_urls.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xs font-bold tracking-widest text-navy-900 uppercase border-b border-navy-100 pb-2">
            Galeria
          </h2>
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {evento.galeria_urls.map((url) => (
              <div key={url} className="relative aspect-[4/3] overflow-hidden border border-navy-100">
                <FotoACarregar src={url} alt="" fill sizes="25vw" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {evento.documentos.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xs font-bold tracking-widest text-navy-900 uppercase border-b border-navy-100 pb-2">
            Documentos
          </h2>
          <ul className="mt-4 space-y-2">
            {evento.documentos.map((d) => (
              <li key={d.url}>
                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky font-semibold hover:underline text-sm"
                >
                  {d.titulo || "Documento"}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
