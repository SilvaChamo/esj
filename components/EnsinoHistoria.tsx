"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import EntradaHome from "@/components/EntradaHome";
import {
  loadPublicacao,
  type Categoria,
  type Publicacao,
} from "@/lib/publicacao";

export default function EnsinoHistoria({ embedded = false }: { embedded?: boolean }) {
  const [active, setActive] = useState<Categoria>("livro");
  const [livroBook, setLivroBook] = useState<Publicacao | null>(null);
  const [eventoBook, setEventoBook] = useState<Publicacao | null>(null);
  const [open, setOpen] = useState(false);
  const [viewer, setViewer] = useState<Publicacao | null>(null);

  useEffect(() => {
    let cancelado = false;
    const load = () => {
      void Promise.all([loadPublicacao("livro"), loadPublicacao("evento")]).then(
        ([livro, evento]) => {
          if (cancelado) return;
          setLivroBook(livro);
          setEventoBook(evento);
        }
      );
    };
    load();
    window.addEventListener("esj-publicacao", load);
    window.addEventListener("storage", load);
    return () => {
      cancelado = true;
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

  const actual = active === "livro" ? livroBook : eventoBook;

  const content = (
    <>
      <EntradaHome>
        <div className="grid lg:grid-cols-[1fr_1.08fr] gap-5 lg:gap-5 items-start">
          <div>
            <p className="flex items-center gap-3 text-leaf font-bold tracking-widest text-sm mb-3">
              <span className="h-px w-[40px] shrink-0 bg-leaf" aria-hidden />
              ENSINO E HISTÓRIA
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-900 leading-tight">
              Formamos, comunicamos e
              <br />
              <span className="text-sky">Investigamos</span>
            </h2>
            <p className="mt-3 font-serif italic text-lg text-navy-800">
              O palco da ESJ não se apaga
            </p>
            <p className="mt-5 text-navy-900 leading-relaxed">
              A Escola Superior de Jornalismo forma profissionais críticos, investiga a
              comunicação contemporânea e devolve conhecimento à sociedade. O ensino liga a
              sala de aula à redação, à pesquisa e à vida pública.
            </p>
            <p className="mt-4 text-sm text-navy-900/70 leading-relaxed">
              Conferências, a Semana da Comunicação, colóquios e a cerimónia de graduação
              trazem a cidade para o campus — e levam a escola para o país. A agenda do ano
              lectivo é palco aberto: venha, ouça e participe!
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActive("livro")}
                className={`px-6 py-3.5 text-xs font-bold tracking-wide transition-colors ${
                  active === "livro"
                    ? "bg-navy-800 text-white"
                    : "bg-white text-navy-800 border border-navy-100 hover:border-sky"
                }`}
              >
                LANÇAMENTO DO LIVRO
              </button>
              <button
                type="button"
                onClick={() => setActive("evento")}
                className={`px-6 py-3.5 text-xs font-bold tracking-wide transition-colors ${
                  active === "evento"
                    ? "bg-navy-800 text-white"
                    : "bg-white text-navy-800 border border-navy-100 hover:border-sky"
                }`}
              >
                EVENTOS
              </button>
            </div>
          </div>

          <div>
            <div
              className={
                active === "livro"
                  ? "relative"
                  : active === "evento"
                    ? "relative w-full lg:w-[calc(100%+50px)]"
                    : "hidden"
              }
            >
              <div
                className={`relative w-full overflow-hidden bg-cream border border-navy-100 ${
                  active === "livro" ? "aspect-square" : "aspect-[210/297]"
                }`}
              >
                {actual?.image ? (
                  <button
                    type="button"
                    onClick={() => {
                      setViewer(actual);
                      setOpen(true);
                    }}
                    className="absolute inset-0"
                    aria-label={
                      active === "livro" ? "Ver lançamento do livro" : "Ver cartaz de eventos"
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      key={actual.image}
                      src={actual.image}
                      alt=""
                      className={
                        active === "livro"
                          ? "absolute inset-0 w-full h-full object-contain p-2"
                          : "absolute inset-0 w-full h-full object-cover"
                      }
                    />
                  </button>
                ) : (
                  <span className="absolute inset-0 bg-navy-100/30" aria-hidden />
                )}
              </div>
            </div>
          </div>
        </div>
      </EntradaHome>

      {open && viewer && (
        <div
          className="fixed inset-0 z-[80] bg-navy-900/85 flex items-center justify-center p-4 md:p-10"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Imagem"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar"
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X size={28} />
          </button>
          <div
            className="relative min-h-[200px] min-w-[200px] max-h-[90vh] max-w-[92vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={viewer.image}
              alt=""
              className="max-h-[90vh] max-w-[92vw] w-auto h-auto object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );

  if (embedded) {
    return (
      <div id="ensino-historia" className="scroll-mt-24">
        {content}
      </div>
    );
  }

  return (
    <section id="ensino-historia" className="bg-white scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">{content}</div>
    </section>
  );
}
