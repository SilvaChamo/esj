"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  DEFAULT_PUBLICACAO,
  LIVROS_ANTERIORES,
  readPublicacao,
  type LivroThumb,
  type Publicacao,
} from "@/lib/publicacao";

export default function Academics() {
  const [open, setOpen] = useState(false);
  const [book, setBook] = useState<Publicacao>(DEFAULT_PUBLICACAO);
  const [viewer, setViewer] = useState<LivroThumb | null>(null);

  useEffect(() => {
    const load = () => setBook(readPublicacao());
    load();
    window.addEventListener("esj-publicacao", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("esj-publicacao", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const show = (item: LivroThumb) => {
    setViewer(item);
    setOpen(true);
  };

  const isLivro = book.tipo === "livro";

  return (
    <section id="ensino" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-start">
        <div>
          <p className="text-sky font-bold tracking-widest text-sm mb-3">ENSINO E HISTÓRIA</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-800 leading-tight">
            Formamos, comunicamos e
            <br />
            Investigamos
          </h2>
          <p className="mt-3 font-serif italic text-lg text-navy-800">
            O palco da ESJ não se apaga
          </p>
          <p className="mt-5 text-navy-900 leading-relaxed">
            A Escola Superior de Jornalismo forma profissionais críticos, investiga a
            comunicação contemporânea e devolve conhecimento à sociedade. O ensino
            liga a sala de aula à redação, à pesquisa e à vida pública.
          </p>
          <p className="mt-4 text-sm text-navy-900/70 leading-relaxed">
            Conferências, a Semana da Comunicação, colóquios e a cerimónia de graduação
            trazem a cidade para o campus — e levam a escola para o país. A agenda do
            ano lectivo é palco aberto: venha, ouça e participe!
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 sm:divide-x sm:divide-[#B8C5DB]">
            <div className="py-1 sm:pr-6">
              <p className="text-base font-bold tracking-wide text-sky">Título da obra:</p>
              <p className="mt-2 font-serif font-bold text-navy-900">{book.title}</p>
            </div>
            <div className="py-1 sm:px-6">
              <p className="text-base font-bold tracking-wide text-sky">Autores:</p>
              <div className="mt-2 text-navy-900 leading-relaxed">
                {book.authors.split("\n").map((name) => (
                  <p key={name}>{name}</p>
                ))}
              </div>
            </div>
            <div className="py-1 sm:pl-6">
              <p className="text-base font-bold tracking-wide text-sky">Data:</p>
              <p className="mt-2 text-navy-900">{book.date}</p>
              <p className="text-navy-900">{book.venue}</p>
            </div>
          </div>
        </div>

        <div className="relative w-full aspect-[210/297] overflow-hidden bg-cream border border-navy-100 flex flex-col">
          <button
            type="button"
            onClick={() => show({ image: book.image, title: book.title })}
            className={`relative min-h-0 ${isLivro ? "flex-1" : "h-full"}`}
            aria-label={`Ver cartaz de ${book.title}`}
          >
            <img
              src={book.image}
              alt={book.title}
              className={
                isLivro
                  ? "absolute inset-0 w-full h-full object-contain p-2 pb-1"
                  : "absolute inset-0 w-full h-full object-cover"
              }
            />
          </button>

          {isLivro && (
            <div className="grid grid-cols-3 gap-1 px-1.5 pb-1.5 flex-[0_0_27%]">
              {LIVROS_ANTERIORES.map((liv) => (
                <button
                  key={liv.image}
                  type="button"
                  onClick={() => show(liv)}
                  className="relative h-full overflow-hidden border border-navy-100 bg-white hover:border-crimson transition-colors"
                  aria-label={`Ver ${liv.title}`}
                >
                  <img
                    src={liv.image}
                    alt={liv.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {open && viewer && (
        <div
          className="fixed inset-0 z-[80] bg-navy-900/85 flex items-center justify-center p-4 md:p-10"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={viewer.title}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar"
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X size={28} />
          </button>
          <div className="relative max-h-[90vh] max-w-[92vw]" onClick={(e) => e.stopPropagation()}>
            <img
              src={viewer.image}
              alt={viewer.title}
              className="max-h-[90vh] max-w-[92vw] w-auto h-auto object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </section>
  );
}
