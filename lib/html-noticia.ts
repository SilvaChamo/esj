const ALLOWED = new Set([
  "P",
  "BR",
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "UL",
  "OL",
  "LI",
  "A",
  "BLOCKQUOTE",
  "SPAN",
  "DIV",
  "IMG",
  "FIGURE",
  "FIGCAPTION",
]);

export function textoDeHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function paraHtmlEditor(raw: string) {
  const texto = raw.trim();
  if (!texto) return "";
  if (/<[a-z][\s\S]*>/i.test(texto)) return texto;
  return texto
    .split(/\n+/)
    .map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
    .join("");
}

export function htmlParaParagrafos(html: string) {
  if (typeof window === "undefined") {
    const limpo = textoDeHtml(html);
    return limpo ? [html] : [];
  }
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const blocos = [...doc.body.children]
    .map((el) => (el as HTMLElement).outerHTML)
    .filter((bloco) => textoDeHtml(bloco) || /<img /i.test(bloco));
  if (blocos.length) return blocos;
  const texto = doc.body.textContent?.trim();
  return texto ? [`<p>${texto}</p>`] : [];
}

function hrefSeguro(valor: string) {
  const href = valor.trim();
  if (/^(https?:\/\/|mailto:|\/|#)/i.test(href)) return href;
  if (/^www\./i.test(href)) return `https://${href}`;
  return "";
}

function srcSeguro(valor: string) {
  const src = valor.trim();
  if (/^(https?:\/\/|\/)/i.test(src)) return src;
  return "";
}

function estiloSeguro(valor: string) {
  const font = /font-size\s*:\s*(\d{1,3})px/i.exec(valor);
  const align = /text-align\s*:\s*(left|center|right)/i.exec(valor);
  const partes: string[] = [];
  if (font) partes.push(`font-size: ${font[1]}px`);
  if (align) partes.push(`text-align: ${align[1].toLowerCase()}`);
  return partes.join("; ");
}

function attrsSeguros(nome: string, attrs: string) {
  if (nome === "IMG") {
    const src = srcSeguro(/src\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1] || "");
    const alt = (/alt\s*=\s*["']([^"']*)["']/i.exec(attrs)?.[1] || "").replace(/[<>]/g, "");
    if (!src) return "";
    return ` src="${src}" alt="${alt}"`;
  }
  if (nome === "A") {
    const href = hrefSeguro(/href\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1] || "");
    return href ? ` href="${href}" target="_blank" rel="noopener noreferrer"` : "";
  }
  const style = estiloSeguro(/style\s*=\s*["']([^"']*)["']/i.exec(attrs)?.[1] || "");
  return style ? ` style="${style}"` : "";
}

export function sanitizarHtmlNoticia(html: string) {
  let limpo = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/<\/?([a-z0-9]+)(\s[^>]*)?>/gi, (full, tag: string, attrs = "") => {
      const nome = tag.toUpperCase();
      if (nome === "FONT") {
        const size = /size\s*=\s*["']?(\d+)/i.exec(attrs)?.[1];
        const mapa: Record<string, string> = { "1": "12", "2": "13", "3": "16", "4": "18", "5": "24", "6": "32", "7": "32" };
        const px = mapa[size || "3"] || "16";
        return full.startsWith("</") ? "</span>" : `<span style="font-size: ${px}px">`;
      }
      if (!ALLOWED.has(nome)) return "";
      if (full.startsWith("</")) return `</${tag.toLowerCase()}>`;
      if (nome === "BR") return "<br>";
      if (nome === "IMG") {
        const extra = attrsSeguros(nome, attrs);
        return extra ? `<img${extra}>` : "";
      }
      return `<${tag.toLowerCase()}${attrsSeguros(nome, attrs)}>`;
    });

  if (typeof window === "undefined") return limpo;

  const doc = new DOMParser().parseFromString(`<div>${limpo}</div>`, "text/html");

  const limpar = (node: ParentNode) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.parentNode?.removeChild(child);
        return;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      const el = child as HTMLElement;
      if (!ALLOWED.has(el.tagName)) {
        const parent = el.parentNode;
        if (!parent) return;
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
        limpar(node);
        return;
      }
      [...el.attributes].forEach((attr) => {
        if (el.tagName === "A" && attr.name === "href") {
          const href = hrefSeguro(attr.value);
          if (href) {
            el.setAttribute("href", href);
            el.setAttribute("rel", "noopener noreferrer");
            el.setAttribute("target", "_blank");
          } else el.removeAttribute("href");
          return;
        }
        if (el.tagName === "IMG" && (attr.name === "src" || attr.name === "alt")) {
          if (attr.name === "src") {
            const src = srcSeguro(attr.value);
            if (src) el.setAttribute("src", src);
            else el.remove();
          }
          return;
        }
        if (attr.name === "style") {
          const style = estiloSeguro(attr.value);
          if (style) el.setAttribute("style", style);
          else el.removeAttribute("style");
          return;
        }
        el.removeAttribute(attr.name);
      });
      limpar(el);
    });
  };

  limpar(doc.body);
  return doc.body.innerHTML;
}
