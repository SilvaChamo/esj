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
  imagem,
}: {
  kicker?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  compact?: boolean;
  printHidden?: boolean;
  /** Mostrar pesquisa no banner. Desligar em páginas só de leitura. */
  busca?: boolean;
  /** Foto de fundo do banner (estática, sem slide). Substitui o fundo navy liso. */
  imagem?: string;
}) {
  const conteudo = (
    <div>
      {kicker ? (
        <p className="flex items-center gap-3 text-leaf font-bold tracking-widest text-sm mb-3 uppercase">
          <span className="h-px w-[40px] shrink-0 bg-leaf" aria-hidden />
          {kicker}
        </p>
      ) : null}
      {title ? (
        <h1
          className={`font-serif font-bold leading-tight text-[36px] ${
            compact ? "sm:whitespace-nowrap" : ""
          }`}
        >
          {title}
        </h1>
      ) : null}
      {description ? (
        <div
          className={`mt-3 text-white/70 text-sm leading-relaxed ${
            compact ? "max-w-lg" : "max-w-2xl"
          }`}
        >
          {description}
        </div>
      ) : null}
    </div>
  );

  return (
    <div className={printHidden ? "print:hidden" : undefined}>
      <BannerInteriorRodape actions={actions} busca={busca} compact={compact} imagem={imagem}>
        {conteudo}
      </BannerInteriorRodape>
    </div>
  );
}
