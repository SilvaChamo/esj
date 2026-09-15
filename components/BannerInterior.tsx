import type { ReactNode } from "react";
import VoltarBanner from "@/components/VoltarBanner";

export default function BannerInterior({
  kicker,
  title,
  description,
  actions,
  compact,
  printHidden,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  compact?: boolean;
  printHidden?: boolean;
}) {
  const bloco = (
    <>
      {kicker ? (
        <p className="text-sky font-semibold tracking-[0.2em] text-[11px] mb-3">{kicker}</p>
      ) : null}
      <h1
        className={`font-serif font-bold leading-tight ${
          compact ? "text-2xl md:text-3xl max-w-lg" : "text-3xl md:text-4xl"
        }`}
      >
        {title}
      </h1>
      {description ? (
        <div
          className={`mt-3 text-white/70 text-sm leading-relaxed ${
            compact ? "max-w-lg" : "max-w-2xl"
          }`}
        >
          {description}
        </div>
      ) : null}
      <VoltarBanner />
    </>
  );

  return (
    <section className={`bg-navy-900 text-white${printHidden ? " print:hidden" : ""}`}>
      <div
        className={`mx-auto max-w-7xl px-4 lg:px-8 py-10 md:py-12${
          actions ? " flex flex-col md:flex-row md:items-end justify-between gap-6" : ""
        }`}
      >
        {actions ? <div>{bloco}</div> : bloco}
        {actions ? <div className="flex flex-wrap gap-3 shrink-0">{actions}</div> : null}
      </div>
    </section>
  );
}
