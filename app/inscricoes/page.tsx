import Link from "next/link";
import BannerInterior from "@/components/BannerInterior";

export const metadata = {
  title: "Inscrições encerradas | ESJ",
  description:
    "O prazo de pré-inscrição para o ano lectivo 2026 da Escola Superior de Jornalismo encontra-se encerrado. O próximo período, relativo a 2027, deverá abrir em novembro.",
};

export default function InscricoesEncerradasPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="ADMISSÕES"
        title="Inscrições encerradas"
        description="O período de pré-inscrição para o ano lectivo 2026 já terminou."
      />

      <section className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-5 items-start">
          <aside className="bg-white border border-navy-100 order-2 lg:order-1">
            <div className="p-5">
              <h2 className="font-serif font-bold text-navy-900">Edital 2026</h2>
              <p className="mt-2 text-sm text-navy-900/65 leading-relaxed">
                Os prazos, vagas e critérios de ponderação estão no documento oficial.
                Leia-o antes de submeter o boletim.
              </p>
              <Link
                href="/edital"
                className="mt-3 inline-block text-sm font-semibold text-sky hover:text-crimson"
              >
                Consultar o edital
              </Link>
            </div>

            <div className="mx-5 h-px bg-navy-100" />

            <div className="p-5">
              <h2 className="font-serif font-bold text-navy-900">Exames de admissão</h2>
              <ul className="mt-3 space-y-1.5 text-sm text-navy-900/75">
                <li>Português — 50%</li>
                <li>História — 50%</li>
              </ul>
              <p className="mt-3 text-sm text-navy-900/60 leading-relaxed">
                As duas disciplinas aplicam-se a todas as licenciaturas, nos turnos
                diurno e pós-laboral.
              </p>
            </div>

            <div className="mx-5 h-px bg-navy-100" />

            <div className="p-5">
              <h2 className="font-serif font-bold text-navy-900">Documentos</h2>
              <ul className="mt-3 space-y-1.5 text-sm text-navy-900/75">
                <li>BI ou passaporte</li>
                <li>Fotografia tipo passe</li>
                <li>Certidão de nascimento</li>
                <li>Certificado da 12.ª classe</li>
                <li>Recibo da taxa de pré-inscrição</li>
              </ul>
            </div>
          </aside>

          <div className="bg-white border border-navy-100 px-6 py-6 md:py-8 md:px-12 md:py-12 order-1 lg:order-2">
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
                <strong className="text-navy-900">ano lectivo 2027</strong>. Por
                regra, as inscrições começam em{" "}
                <strong className="text-navy-900">novembro</strong>, nos prazos,
                vagas e condições que constarão do edital de admissão a publicar
                nesta página.
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
                className="text-xs text-navy-900/40 hover:text-navy-900/70 transition-colors"
              >
                Testar registo
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
