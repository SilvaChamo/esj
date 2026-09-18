import Link from "next/link";
import BannerInterior from "@/components/BannerInterior";
import { CURSOS_BIBLIOTECA } from "@/lib/producao-cientifica";

export const metadata = {
  title: "Produção científica | ESJ",
  description:
    "Repositório científico da Escola Superior de Jornalismo — monografias e projectos experimentais por curso.",
};

export default function BibliotecaVirtualPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="INVESTIGAÇÃO"
        title={
          <>
            Produção <span className="text-sky">científica</span>
          </>
        }
        description={
          <>
            Porta de entrada do repositório científico da ESJ. Explore monografias e projectos
            experimentais organizados por curso — Jornalismo, Publicidade e Marketing, Relações
            Públicas e Biblioteconomia e Documentação.
          </>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <div className="grid sm:grid-cols-2 gap-5">
          {CURSOS_BIBLIOTECA.map((curso) => (
            <Link
              key={curso.codigo}
              href={`/biblioteca-virtual/${curso.slug}`}
              className="esj-card-move group bg-white border border-navy-100 p-7 hover:border-sky flex flex-col"
            >
              <h3 className="font-serif text-xl font-bold text-navy-900 group-hover:text-crimson transition-colors">
                {curso.titulo}
              </h3>
              <p className="mt-3 text-sm text-navy-900/70 leading-relaxed">{curso.descricao}</p>
              <p className="mt-4 text-xs text-navy-900/55 leading-relaxed border-t border-navy-100 pt-4">
                {curso.expectativa}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-bold tracking-wide text-navy-900 group-hover:text-sky transition-colors">
                Explorar repositório
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5"
                >
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
