"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AUTOPLAY_MS, useSlideProgress } from "@/components/SlideProgressContext";

const slides = [
  {
    image: "/Graduacao-ESJ-III.jpg",
    position: "object-[40%_40%]",
    eyebrow: "INSTITUIÇÃO PÚBLICA DESDE 2008",
    titleLine1: "Formando Profissionais",
    titleLine2: "Para o Futuro da",
    titleLine3: "Comunicação",
    text: "A ESJ forma profissionais críticos, éticos e competentes nas Ciências da Comunicação e da Informação, ao serviço de Moçambique.",
  },
  {
    image: "/JornalistaII.jpg",
    position: "object-center",
    eyebrow: "ENSINO SUPERIOR PÚBLICO",
    titleLine1: "Da Sala de Aula",
    titleLine2: "Para a",
    titleLine3: "Redação",
    text: "Estúdios de televisão e laboratórios de rádio numa redação com aprendizagem verdadeiramente alinhada à prática do jornalismo contemporâneo.",
  },
  {
    image: "/grupo-do-campo.jpg",
    position: "object-[50%_40%]",
    eyebrow: "ATENTA ÀS MUDANÇAS",
    titleLine1: "Extensão e Inovação",
    titleLine2: "ao Serviço da",
    titleLine3: "Sociedade",
    text: "Da incubadora às políticas de extensão, a ESJ liga o conhecimento académico aos desafios reais da comunicação em Moçambique.",
  },
];

export default function Hero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const elapsedRef = useRef(0);
  const { setProgress, setEnabled, setSlideIndex } = useSlideProgress();

  const goTo = (index: number) => {
    elapsedRef.current = 0;
    setProgress(0);
    setActive(index);
    setSlideIndex(index);
  };

  const next = () => goTo((active + 1) % slides.length);
  const prev = () => goTo((active - 1 + slides.length) % slides.length);

  useEffect(() => {
    setEnabled(true);
    return () => {
      setEnabled(false);
      setProgress(0);
    };
  }, [setEnabled, setProgress]);

  useEffect(() => {
    if (paused) return;
    let start = performance.now() - elapsedRef.current;
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      elapsedRef.current = elapsed;
      setProgress(Math.min(elapsed / AUTOPLAY_MS, 1));
      if (elapsed >= AUTOPLAY_MS) {
        elapsedRef.current = 0;
        setProgress(0);
        setActive((i) => {
          const nextIndex = (i + 1) % slides.length;
          setSlideIndex(nextIndex);
          return nextIndex;
        });
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, paused, setProgress, setSlideIndex]);

  return (
    <section id="inicio" className="relative">
      <div
        className="relative h-[560px] md:h-[620px] overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {slides.map((s, i) => (
          <div
            key={s.image}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={s.image}
              alt=""
              fill
              sizes="100vw"
              priority={i === 0}
              className={`object-cover ${s.position}`}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/60 to-navy-900/20" />

        <div className="relative h-full mx-auto max-w-7xl px-4 lg:px-8 flex flex-col justify-center">
          <div className="max-w-2xl text-white">
            <p className="text-leaf font-bold tracking-widest text-[10px] md:text-xs mb-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]">
              {slides[active].eyebrow}
            </p>
            <h1 className="font-serif text-[2.125rem] md:text-[2.625rem] font-bold tracking-wide leading-none [text-shadow:0.4px_0_0_currentColor,-0.4px_0_0_currentColor,0_0.4px_0_currentColor,0_-0.4px_0_currentColor]">
              <span className="block">{slides[active].titleLine1}</span>
              <span className="block mt-2.5">{slides[active].titleLine2}</span>
              <span className="block mt-2.5 text-sky">{slides[active].titleLine3}</span>
            </h1>
            <p className="mt-5 text-white/85 text-base leading-relaxed max-w-lg">
              {slides[active].text}
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4 w-full">
            <div className="flex flex-wrap gap-3">
              <a
                href="#ensino"
                className="bg-sky hover:bg-crimson transition-colors text-white font-semibold text-xs tracking-wide px-5 py-3 flex items-center gap-2"
              >
                LICENCIATURA <ChevronRight size={14} />
              </a>
              <a
                href="#ensino"
                className="bg-crimson hover:bg-crimson/90 transition-colors text-white font-semibold text-xs tracking-wide px-5 py-3 flex items-center gap-2"
              >
                PÓS-GRADUAÇÃO <ChevronRight size={14} />
              </a>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={prev}
                aria-label="Anterior"
                className="w-9 h-9 rounded-full border-2 border-white text-white flex items-center justify-center hover:bg-white/15 transition-colors shrink-0"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Slide ${i + 1}`}
                    onClick={() => goTo(i)}
                    className={`h-2.5 rounded-full transition-all ${
                      i === active ? "w-9 bg-white" : "w-2.5 bg-white"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                aria-label="Seguinte"
                className="w-9 h-9 rounded-full border-2 border-white text-white flex items-center justify-center hover:bg-white/15 transition-colors shrink-0"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
