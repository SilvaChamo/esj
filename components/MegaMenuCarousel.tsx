"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

type CarouselItem = {
  label: string;
  href?: string;
  description?: string;
  cta?: string;
};

const VISIVEIS = 4;
const INTERVALO_MS = 4000;
const TRANSICAO_MS = 500;

/** Carrossel de 4 colunas de cards, a deslizar um card de cada vez para a esquerda, em loop infinito. */
export default function MegaMenuCarousel({ items }: { items: CarouselItem[] }) {
  const n = items.length;
  const visiveis = Math.min(VISIVEIS, n);
  const estendido = [...items, ...items.slice(0, visiveis)];

  const [index, setIndex] = useState(0);
  const [semTransicao, setSemTransicao] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || n <= visiveis) return;
    const id = setInterval(() => setIndex((i) => i + 1), INTERVALO_MS);
    return () => clearInterval(id);
  }, [paused, n, visiveis]);

  useEffect(() => {
    if (index !== n) return;
    const t = setTimeout(() => {
      setSemTransicao(true);
      setIndex(0);
    }, TRANSICAO_MS);
    return () => clearTimeout(t);
  }, [index, n]);

  useEffect(() => {
    if (!semTransicao) return;
    const id = requestAnimationFrame(() => setSemTransicao(false));
    return () => cancelAnimationFrame(id);
  }, [semTransicao]);

  if (n === 0) return null;

  const indiceReal = index % n;

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="overflow-hidden">
        <div
          className={`flex items-start ${semTransicao ? "" : "transition-transform duration-500 ease-in-out"}`}
          style={{ transform: `translateX(-${index * (100 / visiveis)}%)` }}
        >
          {estendido.map((item, i) => (
            <a
              key={`${item.label}-${i}`}
              href={item.href}
              style={{ width: `${100 / visiveis}%` }}
              className="group/card shrink-0 block px-2"
            >
              <div className="border border-navy-100 p-4 bg-white group-hover/card:border-sky group-hover/card:bg-cream transition-colors">
                <h3 className="text-sm font-bold text-navy-900 group-hover/card:text-crimson transition-colors">
                  {item.label}
                </h3>
                {item.description && (
                  <p className="mt-1.5 text-[12px] text-navy-900/60 leading-relaxed">
                    {item.description}
                  </p>
                )}
                {item.cta && (
                  <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-sky group-hover/card:text-crimson transition-colors">
                    {item.cta}
                    <ChevronRight size={12} />
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>

      {n > visiveis && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {items.map((item, i) => (
            <button
              key={item.label}
              type="button"
              aria-label={`Ver a partir de ${item.label}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === indiceReal ? "w-6 bg-sky" : "w-1.5 bg-navy-100 hover:bg-navy-900/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
