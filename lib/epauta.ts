import type { CursoDocenciaSlug } from "@/lib/docencia";
import type { CadeiraCurriculo, RegimeCurso } from "@/lib/curriculo";
import type { NotaEstudante } from "@/lib/notas";

export type NotaEstudanteEPauta = {
  numeroEstudante: string;
  nomeEstudante: string;
  notaFrequencia?: number;
  exameNormal?: number;
  exameRecorrencia?: number;
  mediaFinal?: number;
  resultado?: "Admitido" | "Excluído" | "Aprovado" | "Reprovado" | "Pendente";
};

export type EPautaEletronica = {
  id: string;
  curso: CursoDocenciaSlug;
  cursoNome: string;
  regime: RegimeCurso;
  cadeira: string;
  codigoCadeira: string;
  docenteNome: string;
  anoLectivo: string;
  semestre: string;
  dataPublicacao: string;
  estudantes: NotaEstudanteEPauta[];
};

function escapeHtml(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function exportarEpautaPDF(epautaOriginal: EPautaEletronica) {
  if (typeof window === "undefined") return;

  const janela = window.open("", "_blank");
  if (!janela) return;

  // Os nomes e números de estudante vêm de dados reais preenchidos pelos
  // próprios utilizadores no registo — nunca interpolar sem escapar antes
  // de injectar no HTML exportado (document.write).
  const epauta: EPautaEletronica = {
    ...epautaOriginal,
    cadeira: escapeHtml(epautaOriginal.cadeira),
    codigoCadeira: escapeHtml(epautaOriginal.codigoCadeira),
    docenteNome: escapeHtml(epautaOriginal.docenteNome),
    cursoNome: escapeHtml(epautaOriginal.cursoNome),
    estudantes: epautaOriginal.estudantes.map((e) => ({
      ...e,
      numeroEstudante: escapeHtml(e.numeroEstudante),
      nomeEstudante: escapeHtml(e.nomeEstudante),
    })),
  };

  const html = `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="UTF-8" />
      <title>Pauta Eletrónica — ${epauta.cadeira}</title>
      <style>
        body { font-family: 'Times New Roman', serif; margin: 30px; color: #111; }
        .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; }
        .header h2 { margin: 4px 0 0 0; font-size: 14px; font-weight: normal; color: #444; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; margin-bottom: 20px; font-size: 13px; }
        .meta-item strong { color: #111; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
        th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
        th { background-color: #f0f0f0; font-weight: bold; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .aprovado { color: #047857; font-weight: bold; }
        .excluido { color: #b91c1c; font-weight: bold; }
        .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; text-align: center; }
        .signature { width: 40%; border-top: 1px solid #333; pt-2; margin-top: 50px; }
        @media print {
          @page { size: A4 landscape; margin: 15mm; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <button onclick="window.print()" style="position:fixed; top:20px; right:20px; padding:10px 16px; background:#002B49; color:#fff; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">
        🖨️ Imprimir / Guardar como PDF
      </button>

      <div class="header">
        <h1>Escola Superior de Jornalismo</h1>
        <h2>Secretaria Académica — Pauta Eletrónica Oficial</h2>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><strong>Curso:</strong> ${epauta.cursoNome} (${epauta.regime.toUpperCase()})</div>
        <div class="meta-item"><strong>Ano Lectivo:</strong> ${epauta.anoLectivo}</div>
        <div class="meta-item"><strong>Cadeira:</strong> ${epauta.cadeira} (${epauta.codigoCadeira})</div>
        <div class="meta-item"><strong>Semestre:</strong> ${epauta.semestre}</div>
        <div class="meta-item"><strong>Docente Responsável:</strong> ${epauta.docenteNome}</div>
        <div class="meta-item"><strong>Data de Emissão:</strong> ${epauta.dataPublicacao}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th class="text-center" style="width: 40px;">#</th>
            <th style="width: 110px;">Nº Estudante</th>
            <th>Nome Completo</th>
            <th class="text-center">Nota de Frequência</th>
            <th class="text-center">Exame Normal</th>
            <th class="text-center">Exame de Recorrência</th>
            <th class="text-center">Média</th>
            <th class="text-center">Observação</th>
          </tr>
        </thead>
        <tbody>
          ${epauta.estudantes
            .map(
              (e, idx) => `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td><strong>${e.numeroEstudante}</strong></td>
              <td>${e.nomeEstudante}</td>
              <td class="text-center"><strong>${e.notaFrequencia !== undefined ? e.notaFrequencia.toFixed(1) : "-"}</strong></td>
              <td class="text-center">${e.exameNormal !== undefined ? e.exameNormal.toFixed(1) : "-"}</td>
              <td class="text-center">${e.exameRecorrencia !== undefined ? e.exameRecorrencia.toFixed(1) : "-"}</td>
              <td class="text-center"><strong>${e.mediaFinal !== undefined ? e.mediaFinal.toFixed(1) : "-"}</strong></td>
              <td class="text-center ${e.resultado === "Aprovado" ? "aprovado" : e.resultado === "Excluído" ? "excluido" : ""}">
                ${e.resultado || "Pendente"}
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div class="footer">
        <div class="signature">
          <p>O Docente da Cadeira</p>
          <br /><br />
          <p>_____________________________________<br />(${epauta.docenteNome})</p>
        </div>
        <div class="signature">
          <p>O Director de Curso</p>
          <br /><br />
          <p>_____________________________________<br />(Secretaria Académica ESJ)</p>
        </div>
      </div>

      <script>
        window.onload = function() {
          // opcional: auto print
        };
      </script>
    </body>
    </html>
  `;

  janela.document.write(html);
  janela.document.close();
}

/** Constrói uma pauta eletrónica a partir de dados reais (currículo + notas lançadas) para exportação em PDF. */
export function montarEpauta(
  curso: CursoDocenciaSlug,
  cursoNome: string,
  regime: RegimeCurso,
  cadeira: CadeiraCurriculo,
  notas: NotaEstudante[]
): EPautaEletronica {
  return {
    id: `ep-${cadeira.codigo}`,
    curso,
    cursoNome,
    regime,
    cadeira: cadeira.nome,
    codigoCadeira: cadeira.codigo,
    docenteNome: cadeira.docente,
    anoLectivo: String(cadeira.anoConclusao || new Date().getFullYear()),
    semestre: `${cadeira.semestre}º Semestre`,
    dataPublicacao: new Date().toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    estudantes: notas.map((n) => ({
      numeroEstudante: n.numeroEstudante,
      nomeEstudante: n.nomeEstudante,
      notaFrequencia: n.notaFrequencia ?? undefined,
      exameNormal: n.exameNormal ?? undefined,
      exameRecorrencia: n.exameRecorrencia ?? undefined,
      mediaFinal: n.mediaFinal ?? undefined,
      resultado: n.resultado === "Em Frequência" ? "Pendente" : n.resultado,
    })),
  };
}
