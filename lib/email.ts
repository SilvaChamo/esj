export function siteUrl(request?: Request) {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") || "";
  if (env) return env;
  const origin = request?.headers.get("origin")?.replace(/\/$/, "") || "";
  if (origin) return origin;
  return "https://esj.edondzo.ac.mz";
}

export function emailProvider() {
  const key = process.env.RESEND_API_KEY?.trim() || "";
  const from = process.env.EMAIL_FROM?.trim() || process.env.RESEND_FROM?.trim() || "";
  if (key && from) return { tipo: "resend" as const, key, from };
  return null;
}

export function emailsValidos(lista: string[]) {
  const set = new Set<string>();
  for (const raw of lista) {
    const email = raw.trim().toLowerCase();
    if (email.includes("@") && email.includes(".")) set.add(email);
  }
  return [...set];
}

export async function enviarUmEmail(para: string, assunto: string, html: string) {
  const provider = emailProvider();
  if (!provider) throw new Error("O envio de correio ainda não está configurado no servidor.");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: provider.from,
      to: [para],
      subject: assunto,
      html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err.slice(0, 180) || `Correio ${res.status}`);
  }
}

export function htmlNewsletter(params: {
  origem: string;
  pecas: { title: string; resumo: string; slug: string }[];
}) {
  const pecas = params.pecas
    .map(
      (p) => `
        <tr>
          <td style="padding:0 0 28px;">
            <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:20px;line-height:1.3;color:#0C1D3B;">
              ${escaparHtml(p.title)}
            </p>
            <p style="margin:0 0 12px;font-family:Georgia,serif;font-size:15px;line-height:1.55;color:#122A55;">
              ${escaparHtml(p.resumo)}
            </p>
            <a href="${params.origem}/noticias/${encodeURIComponent(p.slug)}"
              style="color:#159BDB;font-family:Georgia,serif;font-size:14px;">
              Ler no sítio da ESJ
            </a>
          </td>
        </tr>`
    )
    .join("");

  return envelope(`
    <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:13px;letter-spacing:.12em;color:#159BDB;">
      NEWSLETTER ESJ
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${pecas}</table>
  `);
}

export function htmlFolha(params: { origem: string; titulo: string; ficheiro: string }) {
  return envelope(`
    <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:13px;letter-spacing:.12em;color:#159BDB;">
      FOLHA ACADÉMICA
    </p>
    <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:20px;line-height:1.3;color:#0C1D3B;">
      ${escaparHtml(params.titulo)}
    </p>
    <p style="margin:0 0 18px;font-family:Georgia,serif;font-size:15px;line-height:1.55;color:#122A55;">
      Saiu uma nova edição do jornal da Escola Superior de Jornalismo.
    </p>
    <a href="${params.ficheiro}"
      style="display:inline-block;background:#2E9E4F;color:#ffffff;text-decoration:none;font-family:Georgia,serif;font-size:13px;padding:12px 18px;">
      Descarregar o PDF
    </a>
  `);
}

function envelope(interior: string) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F7F7F5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F7F7F5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #D7E0EF;">
          <tr>
            <td style="background:#0C1D3B;padding:18px 28px;color:#ffffff;font-family:Georgia,serif;font-size:16px;">
              Escola Superior de Jornalismo
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">${interior}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escaparHtml(valor: string) {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
