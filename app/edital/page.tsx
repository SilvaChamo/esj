import { Suspense } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import EditalPdfViewer from "@/components/EditalPdfViewer";
import BannerInterior from "@/components/BannerInterior";
import { CarregandoTexto } from "@/components/Carregando";
import { loadEdital, nomeDescargaEdital, rotuloDescargaEdital } from "@/lib/editais";

export const metadata = {
  title: "Edital de Admissão 2026 | ESJ",
  description:
    "Consulte o edital de admissão da Escola Superior de Jornalismo e faça a pré-inscrição para o ano lectivo 2026.",
};

export const dynamic = "force-dynamic";

async function EditalBotaoDownload() {
  const edital = await loadEdital();
  return (
    <a
      href={edital.file_url}
      download={nomeDescargaEdital(edital.file_url, edital.title)}
      className="bg-white text-navy-900 hover:bg-cream font-semibold text-xs tracking-wide px-5 py-3 inline-flex items-center gap-2 transition-colors"
    >
      <Download size={15} />
      {rotuloDescargaEdital(edital.file_url)}
    </a>
  );
}

async function EditalConteudo() {
  const edital = await loadEdital();
  return <EditalPdfViewer src={edital.file_url} title={edital.title} />;
}

export default function EditalPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="ADMISSÕES — ANO LECTIVO 2026"
        title="Edital de Admissão"
        description="Leia o documento completo antes de se inscrever. Os exames de admissão cobrem Português e História para os cursos de licenciatura da ESJ."
        busca={false}
        actions={
          <>
            <Link
              href="/inscricoes"
              className="bg-leaf hover:bg-crimson text-white font-semibold text-xs tracking-wide px-6 py-3 transition-colors"
            >
              INSCREVA-SE
            </Link>
            <Suspense
              fallback={
                <span className="bg-white/80 text-navy-900/60 font-semibold text-xs tracking-wide px-5 py-3 inline-flex items-center gap-2">
                  <Download size={15} /> DESCARREGAR EDITAL
                </span>
              }
            >
              <EditalBotaoDownload />
            </Suspense>
          </>
        }
      />

      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
        <Suspense
          fallback={
            <div className="bg-white border border-navy-100 p-8">
              <CarregandoTexto texto="A carregar o edital de admissão…" />
            </div>
          }
        >
          <EditalConteudo />
        </Suspense>
      </section>
    </main>
  );
}
