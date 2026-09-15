import Link from "next/link";
import { Download } from "lucide-react";
import EditalPdfViewer from "@/components/EditalPdfViewer";
import BannerInterior from "@/components/BannerInterior";
import { loadEdital } from "@/lib/editais";

export const metadata = {
  title: "Edital de Admissão 2026 | ESJ",
  description:
    "Consulte o edital de admissão da Escola Superior de Jornalismo e faça a pré-inscrição para o ano lectivo 2026.",
};

export const dynamic = "force-dynamic";

export default async function EditalPage() {
  const edital = await loadEdital();

  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="ADMISSÕES — ANO LECTIVO 2026"
        title="Edital de Admissão"
        description="Leia o documento completo antes de se inscrever. Os exames de admissão cobrem Português e História para os cursos de licenciatura da ESJ."
        actions={
          <>
            <Link
              href="/inscricoes"
              className="bg-leaf hover:bg-crimson text-white font-semibold text-xs tracking-wide px-6 py-3 transition-colors"
            >
              INSCREVA-SE
            </Link>
            <a
              href={edital.file_url}
              download
              className="bg-white text-navy-900 hover:bg-cream font-semibold text-xs tracking-wide px-5 py-3 inline-flex items-center gap-2 transition-colors"
            >
              <Download size={15} />
              DESCARREGAR PDF
            </a>
          </>
        }
      />

      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
        <EditalPdfViewer src={edital.file_url} />
      </section>
    </main>
  );
}
