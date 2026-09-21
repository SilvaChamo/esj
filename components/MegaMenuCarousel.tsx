"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

type CarouselItem = {
  label: string;
  href?: string;
  description?: string;
  cta?: string;
};

/** Carrinho de um cartão por vez, a deslizar para a esquerda, em loop infinito. */
export default function MegaMenuCarousel({ items }: { items: CarouselItem[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = items.length;

  useEffect(() => {
    if (paused || n <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % n), 4500);
    return () => clearInterval(id);
  }, [paused, n]);

  if (n === 0) return null;

  return (
    <div
      className="w-full max-w-md"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[200px] overflow-hidden">
        {items.map((item, i) => {
          let d = i - index;
          if (d > n / 2) d -= n;
          if (d < -n / 2) d += n;
          const activo = d === 0;
          return (
            <a
              key={item.label}
              href={item.href}
              aria-hidden={!activo}
              tabIndex={activo ? 0 : -1}
              style={{ transform: `translateX(${d * 100}%)` }}
              className={`group/card absolute inset-0 block border p-5 bg-white transition-[transform,opacity] duration-500 ease-in-out ${
                activo
                  ? "opacity-100 border-navy-100 hover:border-sky hover:bg-cream pointer-events-auto"
                  : "opacity-0 border-navy-100 pointer-events-none"
              }`}
            >
              <h3 className="text-sm font-bold text-navy-900 group-hover/card:text-crimson transition-colors">
                {item.label}
              </h3>
              {item.description && (
                <p className="mt-2 text-[12px] text-navy-900/60 leading-relaxed">
                  {item.description}
                </p>
              )}
              {item.cta && (
                <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-bold text-sky group-hover/card:text-crimson transition-colors">
                  {item.cta}
                  <ChevronRight size={12} />
                </span>
              )}
            </a>
          );
        })}
      </div>

      {n > 1 && (
        <div className="mt-3 flex items-center gap-1.5">
          {items.map((item, i) => (
            <button
              key={item.label}
              type="button"
              aria-label={`Ver ${item.label}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-sky" : "w-1.5 bg-navy-100 hover:bg-navy-900/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
