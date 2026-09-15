export type InscricaoSms = {
  telefone: string | null;
  curso: string | null;
  delegacao: string | null;
};

export function normalizarTelemovelMz(valor: string) {
  const digits = valor.replace(/\D/g, "");
  if (!digits) return null;
  let n = digits;
  if (n.startsWith("00258")) n = n.slice(2);
  if (n.startsWith("258") && n.length >= 12) return `+${n}`;
  if (n.length === 9 && /^8[2-7]/.test(n)) return `+258${n}`;
  if (n.length === 12 && n.startsWith("258")) return `+${n}`;
  return null;
}

export function filtrarInscricoesSms(rows: InscricaoSms[], destinatarios: string) {
  const dest = destinatarios.toLowerCase();
  return rows.filter((row) => {
    if (dest.startsWith("todos")) return true;
    if (dest.includes("maputo")) return /maputo/i.test(row.delegacao || "");
    if (dest.includes("manica")) return /manica/i.test(row.delegacao || "");
    const curso = (row.curso || "").toLowerCase();
    if (dest.includes("jornalismo")) return curso.includes("jornalismo");
    if (dest.includes("publicidade")) return curso.includes("publicidade");
    if (dest.includes("relações públicas") || dest.includes("relacoes publicas")) {
      return curso.includes("relações") || curso.includes("relacoes");
    }
    if (dest.includes("biblioteconomia")) return curso.includes("biblioteconomia");
    return true;
  });
}

export function destEhSubscritores(destinatarios: string) {
  return /subscritor/i.test(destinatarios);
}

export function telemoveisDeContactos(telefones: (string | null | undefined)[], extra = "") {
  const set = new Set<string>();
  for (const valor of telefones) {
    const tel = normalizarTelemovelMz(valor || "");
    if (tel) set.add(tel);
  }
  for (const linha of extra.split(/[\n,;]+/)) {
    const tel = normalizarTelemovelMz(linha);
    if (tel) set.add(tel);
  }
  return [...set];
}

export function telemoveisUnicos(rows: InscricaoSms[], destinatarios: string, extra = "") {
  if (destEhSubscritores(destinatarios)) {
    return telemoveisDeContactos(rows.map((row) => row.telefone), extra);
  }
  const set = new Set<string>();
  for (const row of filtrarInscricoesSms(rows, destinatarios)) {
    const tel = normalizarTelemovelMz(row.telefone || "");
    if (tel) set.add(tel);
  }
  for (const linha of extra.split(/[\n,;]+/)) {
    const tel = normalizarTelemovelMz(linha);
    if (tel) set.add(tel);
  }
  return [...set];
}

export function segmentosSms(texto: string) {
  const ucs2 = /[^\u0000-\u007f]/.test(texto);
  const porSms = ucs2 ? 70 : 160;
  const n = Math.max(1, Math.ceil(texto.length / porSms) || 1);
  return { caracteres: texto.length, segmentos: texto.length === 0 ? 0 : n, porSms };
}

export function smsProvider() {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim() || "";
  const token = process.env.TWILIO_AUTH_TOKEN?.trim() || "";
  const from = process.env.TWILIO_FROM?.trim() || process.env.SMS_FROM?.trim() || "";
  if (sid && token && from) return { tipo: "twilio" as const, sid, token, from };
  const url = process.env.SMS_API_URL?.trim() || "";
  const apiToken = process.env.SMS_API_TOKEN?.trim() || "";
  if (url && from) return { tipo: "http" as const, url, token: apiToken, from };
  return null;
}

export async function enviarUmSms(para: string, texto: string) {
  const provider = smsProvider();
  if (!provider) throw new Error("O envio de SMS ainda não está configurado no servidor.");

  if (provider.tipo === "twilio") {
      const auth = btoa(`${provider.sid}:${provider.token}`);
    const body = new URLSearchParams({ To: para, From: provider.from, Body: texto });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${provider.sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err.slice(0, 180) || `Twilio ${res.status}`);
    }
    return;
  }

  const res = await fetch(provider.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(provider.token ? { Authorization: `Bearer ${provider.token}` } : {}),
    },
    body: JSON.stringify({ to: para, from: provider.from, message: texto }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err.slice(0, 180) || `SMS ${res.status}`);
  }
}
