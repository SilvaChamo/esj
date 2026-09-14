import {
  ANO_LECTIVO,
  MEDIA_MINIMA,
  PESO_HISTORIA,
  PESO_PORTUGUES,
  REGIME_LABEL,
  formatNota,
  tituloPauta,
  type CursoAdmissao,
  type Regime,
} from "@/lib/admissao";
import { letraGrupo, rankingMerito, type LinhaPauta } from "@/lib/pauta";

type Props = {
  curso: CursoAdmissao;
  regime: Regime;
  anoLectivo?: string;
  linhas: LinhaPauta[];
};

export default function PautaAdmissao({
  curso,
  regime,
  anoLectivo = ANO_LECTIVO,
  linhas,
}: Props) {
  const merito = rankingMerito(linhas);
  const total = linhas.length;

  return (
    <article className="bg-white border border-navy-100 print:border-0">
      <header className="border-b border-navy-100 px-5 sm:px-8 py-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <img
          src="/esj-logo-mark.png"
          alt="Escola Superior de Jornalismo"
          className="h-16 w-16 object-contain"
        />
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-widest text-sky">
            ESCOLA SUPERIOR DE JORNALISMO
          </p>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-navy-900 mt-1 leading-tight">
            {tituloPauta(curso, regime)}
          </h1>
          <p className="mt-1 text-sm text-navy-900/65">
            Ano lectivo {anoLectivo} · Lista única · {REGIME_LABEL[regime]}
          </p>
        </div>
      </header>

      <div className="px-5 sm:px-8 py-4 text-sm text-navy-900/70 leading-relaxed border-b border-navy-100">
        Média final = (Português × {PESO_PORTUGUES * 100}%) + (História × {PESO_HISTORIA * 100}%).
        Admitido se a média for igual ou superior a {formatNota(MEDIA_MINIMA)} valores.
        Os nomes estão em ordem alfabética (A, B, C…). O número de ordem desce a partir de {total || 0}.
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-cream text-left text-[11px] font-bold tracking-wide text-navy-900/70">
              <th className="px-3 py-3">Letra</th>
              <th className="px-3 py-3">N.º</th>
              <th className="px-3 py-3">Apelido</th>
              <th className="px-3 py-3">Nome</th>
              <th className="px-3 py-3 text-right">Português (50%)</th>
              <th className="px-3 py-3 text-right">História (50%)</th>
              <th className="px-3 py-3 text-right">Média final</th>
              <th className="px-3 py-3">Resultado</th>
              <th className="px-3 py-3 text-right">Mérito</th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-navy-900/50">
                  Ainda não há resultados publicados para este curso e regime.
                </td>
              </tr>
            )}
            {linhas.map((linha, index) => {
              const letra = letraGrupo(linha.apelido);
              const showLetra = index === 0 || letraGrupo(linhas[index - 1].apelido) !== letra;
              return (
                <tr key={linha.id} className="border-t border-navy-100">
                  <td className="px-3 py-2.5 font-serif font-bold text-navy-900">
                    {showLetra ? letra : ""}
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-navy-900">{total - index}</td>
                  <td className="px-3 py-2.5 font-semibold text-navy-900">{linha.apelido}</td>
                  <td className="px-3 py-2.5 text-navy-900">{linha.nome}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatNota(linha.notaPortugues)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatNota(linha.notaHistoria)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-navy-900">
                    {formatNota(linha.media)}
                  </td>
                  <td
                    className={`px-3 py-2.5 font-semibold ${
                      linha.resultado === "Admitido" ? "text-leaf" : "text-crimson"
                    }`}
                  >
                    {linha.resultado}
                  </td>
                  <td className="px-3 py-2.5 text-right text-navy-900/60">
                    {merito.get(linha.id)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}
