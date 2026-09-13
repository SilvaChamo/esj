import Link from "next/link";
import { Download } from "lucide-react";
import EditalPdfViewer from "@/components/EditalPdfViewer";
import { EDITAL_PDF } from "@/lib/inscricao";

export const metadata = {
  title: "Edital de Admissão 2026 | ESJ",
  description:
    "Consulte o edital de admissão da Escola Superior de Jornalismo e faça a pré-inscrição para o ano lectivo 2026.",
};

export default function EditalPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10 md:py-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-sky font-semibold tracking-[0.2em] text-[11px] mb-3">
              ADMISSÕES — ANO LECTIVO 2026
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold">
              Edital de Admissão
            </h1>
            <p className="mt-3 text-white/70 max-w-xl text-sm leading-relaxed">
              Leia o documento completo antes de se inscrever. Os exames de admissão
              cobrem Português e História para os cursos de licenciatura da ESJ.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/inscricoes"
              className="bg-leaf hover:bg-crimson text-white font-semibold text-xs tracking-wide px-6 py-3 transition-colors"
            >
              INSCREVA-SE
            </Link>
            <a
              href={EDITAL_PDF}
              download
              className="bg-white text-navy-900 hover:bg-cream font-semibold text-xs tracking-wide px-5 py-3 inline-flex items-center gap-2 transition-colors"
            >
              <Download size={15} />
              DESCARREGAR PDF
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-8">
        <EditalPdfViewer src={EDITAL_PDF} />
      </section>
    </main>
  );
}
