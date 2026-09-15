"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function EntradaHome({
  children,
  atraso = 0,
  className = "",
}: {
  children: ReactNode;
  atraso?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisivel(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisivel(true);
        io.disconnect();
      },
      { threshold: 0, rootMargin: "0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`h-full${className ? ` ${className}` : ""}`}>
      <div
        className={`esj-entrada h-full${visivel ? " esj-entrada-on" : ""}`}
        style={atraso ? { transitionDelay: visivel ? `${atraso}s` : "0s" } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
