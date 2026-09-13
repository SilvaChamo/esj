import Link from "next/link";
import { Download, FileX } from "lucide-react";
import { loadResultados } from "@/lib/resultados";

export const metadata = {
  title: "Resultados de Admissão | ESJ",
  description:
    "Resultados dos exames de admissão da Escola Superior de Jornalismo, por curso.",
};

export const dynamic = "force-dynamic";

export default async function ResultadosPage() {
  const resultados = await loadResultados();

  return (
    <main className="bg-cream min-h-[70vh]">
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10 md:py-12">
          <p className="text-sky font-semibold tracking-[0.2em] text-[11px] mb-3">
            ADMISSÕES
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold">
            Resultados de Admissão
          </h1>
          <p className="mt-3 text-white/70 max-w-2xl text-sm leading-relaxed">
            Resultados dos exames de admissão, por curso. Consulte o documento
            correspondente à licenciatura a que se candidatou.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 lg:px-8 py-14 md:py-20">
        <div className="grid sm:grid-cols-2 gap-5">
          {resultados.map((r) => (
            <div key={r.curso} className="bg-white border border-navy-100 p-6 flex flex-col">
              <h2 className="font-serif text-lg font-bold text-navy-900">{r.curso}</h2>
              <div className="mt-4">
                {r.fileUrl ? (
                  <a
                    href={r.fileUrl}
                    download
                    className="inline-flex items-center gap-2 bg-navy-800 hover:bg-crimson text-white font-semibold text-xs tracking-wide px-5 py-3 transition-colors"
                  >
                    <Download size={15} />
                    DESCARREGAR RESULTADOS
                  </a>
                ) : (
                  <p className="inline-flex items-center gap-2 text-sm text-navy-900/45">
                    <FileX size={16} />
                    Resultados ainda não publicados
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link href="/#ensino" className="text-sm text-sky hover:underline">
            ← Voltar à secção de Ensino
          </Link>
        </div>
      </section>
    </main>
  );
}
