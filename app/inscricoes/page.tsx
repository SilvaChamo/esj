import Link from "next/link";

export const metadata = {
  title: "Inscrições encerradas | ESJ",
  description:
    "O prazo de pré-inscrição para o ano lectivo 2026 da Escola Superior de Jornalismo encontra-se encerrado. O próximo período, relativo a 2027, deverá abrir em novembro.",
};

export default function InscricoesEncerradasPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10 md:py-12">
          <p className="text-sky font-semibold tracking-[0.2em] text-[11px] mb-3">
            ADMISSÕES
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold">
            Inscrições encerradas
          </h1>
          <p className="mt-3 text-white/70 max-w-2xl text-sm leading-relaxed">
            O período de pré-inscrição para o ano lectivo 2026 já terminou.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 lg:px-8 py-14 md:py-20">
        <div className="bg-white border border-navy-100 px-6 py-10 md:px-12 md:py-12">
          <p className="text-leaf font-bold tracking-widest text-[11px]">
            SECRETARIA ACADÉMICA
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy-900 mt-3">
            Candidaturas ao ano lectivo 2026
          </h2>
          <div className="mt-6 space-y-4 text-navy-900/75 leading-relaxed">
            <p>
              A Escola Superior de Jornalismo informa que o prazo de pré-inscrição
              para o ano lectivo 2026 se encontra encerrado. Neste momento não se
              aceitam novas candidaturas, nem se recebem boletins ou documentos de
              admissão.
            </p>
            <p>
              Os interessados em ingressar na ESJ deverão aguardar a abertura do
              próximo ciclo, relativo ao{" "}
              <strong className="text-navy-900">ano lectivo 2027</strong>. Por regra,
              as inscrições começam em{" "}
              <strong className="text-navy-900">novembro</strong>, nos prazos, vagas e
              condições que constarão do edital de admissão a publicar nesta página.
            </p>
            <p>
              Recomenda-se o acompanhamento regular deste portal, onde serão
              anunciadas as datas exactas, os exames de Português e História, e a
              lista de documentos exigidos pela Secretaria Académica.
            </p>
          </div>

          <div className="mt-10">
            <Link
              href="/"
              className="inline-flex bg-navy-800 hover:bg-crimson text-white font-semibold text-xs tracking-wide px-7 py-3.5 transition-colors"
            >
              VOLTAR À PÁGINA INICIAL
            </Link>
          </div>

          <p className="mt-10 pt-6 border-t border-navy-100">
            <Link
              href="/inscricao"
              className="text-[10px] text-navy-900/35 hover:text-navy-900/60 transition-colors"
            >
              Testar registo
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
