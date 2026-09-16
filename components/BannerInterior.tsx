import type { ReactNode } from "react";
import BannerInteriorRodape from "@/components/BannerInteriorRodape";

export default function BannerInterior({
  kicker,
  title,
  description,
  actions,
  compact,
  printHidden,
  busca = true,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  compact?: boolean;
  printHidden?: boolean;
  /** Mostrar pesquisa no banner. Desligar em páginas só de leitura. */
  busca?: boolean;
}) {
  const conteudo = (
    <>
      {kicker ? (
        <p className="flex items-center gap-3 text-leaf font-bold tracking-widest text-sm mb-3 uppercase">
          <span className="h-px w-[40px] shrink-0 bg-leaf" aria-hidden />
          {kicker}
        </p>
      ) : null}
      <h1
        className={`font-serif font-bold leading-tight text-[36px] ${
          compact ? "max-w-lg" : ""
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
    </>
  );

  return (
    <div className={printHidden ? "print:hidden" : undefined}>
      <BannerInteriorRodape actions={actions} busca={busca}>
        {conteudo}
      </BannerInteriorRodape>
    </div>
  );
}
