import Link from "next/link";

export default function InscricaoSidebar() {
  return (
    <aside className="lg:sticky lg:top-28 space-y-5">
      <div className="bg-white border border-navy-100 p-5">
        <h2 className="font-serif font-bold text-navy-900">Edital 2026</h2>
        <p className="mt-2 text-sm text-navy-900/65 leading-relaxed">
          Os prazos, vagas e critérios de ponderação estão no documento oficial. Leia-o antes de
          submeter o boletim.
        </p>
        <Link
          href="/edital"
          className="mt-4 inline-block text-sm font-semibold text-sky hover:text-crimson"
        >
          Consultar o edital
        </Link>
      </div>

      <div className="bg-white border border-navy-100 p-5">
        <h2 className="font-serif font-bold text-navy-900">Exames de admissão</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-navy-900/75">
          <li>Português — 50%</li>
          <li>História — 50%</li>
        </ul>
        <p className="mt-3 text-sm text-navy-900/60 leading-relaxed">
          As duas disciplinas aplicam-se a todas as licenciaturas, nos turnos diurno e pós-laboral.
        </p>
      </div>

      <div className="bg-white border border-navy-100 p-5">
        <h2 className="font-serif font-bold text-navy-900">Cursos</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-navy-900/75">
          <li>Jornalismo</li>
          <li>Publicidade e Marketing</li>
          <li>Relações Públicas</li>
          <li>Biblioteconomia e Documentação</li>
        </ul>
      </div>

      <div className="bg-white border border-navy-100 p-5">
        <h2 className="font-serif font-bold text-navy-900">Delegações</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-navy-900/75">
          <li>Maputo (Sede)</li>
          <li>Manica (Delegação Académica)</li>
        </ul>
      </div>

      <div className="bg-white border border-navy-100 p-5">
        <h2 className="font-serif font-bold text-navy-900">Documentos</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-navy-900/75">
          <li>BI ou passaporte</li>
          <li>Fotografia tipo passe</li>
          <li>Certidão de nascimento</li>
          <li>Certificado da 12.ª classe</li>
          <li>Recibo da taxa de pré-inscrição</li>
        </ul>
      </div>

      <div className="bg-navy-800 text-white p-5">
        <h2 className="font-serif font-bold">Secretaria</h2>
        <p className="mt-3 text-sm text-white/75 leading-relaxed">
          Av. 24 de Julho, antiga Escola Industrial, Maputo
        </p>
        <a href="tel:+25821302721" className="mt-3 block text-sm text-sky-300 hover:text-white">
          +258 21 302 721
        </a>
        <a
          href="https://esj.edondzo.ac.mz"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-sm text-sky-300 hover:text-white"
        >
          Portal eDondzo
        </a>
      </div>
    </aside>
  );
}
