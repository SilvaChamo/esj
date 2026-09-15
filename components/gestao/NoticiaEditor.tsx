"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import ImageSelector from "@/components/gestao/ImageSelector";
import { paraHtmlEditor, sanitizarHtmlNoticia } from "@/lib/html-noticia";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

const TAMANHOS = [
  { label: "12", px: "12px" },
  { label: "14", px: "14px" },
  { label: "16", px: "16px" },
  { label: "18", px: "18px" },
  { label: "24", px: "24px" },
  { label: "32", px: "32px" },
];

function Icon({ d, title }: { d: string; title: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="currentColor">
      <title>{title}</title>
      <path d={d} />
    </svg>
  );
}

function aplicar(comando: string, valor?: string) {
  document.execCommand(comando, false, valor);
}

export default function NoticiaEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [galeria, setGaleria] = useState(false);
  const [tamanho, setTamanho] = useState("16");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const html = paraHtmlEditor(value);
    if (document.activeElement !== el && el.innerHTML !== html) {
      el.innerHTML = html;
    }
  }, [value]);

  const emitir = () => {
    const el = ref.current;
    if (!el) return;
    onChange(sanitizarHtmlNoticia(el.innerHTML));
  };

  const comando = (cmd: string, valor?: string) => {
    ref.current?.focus();
    aplicar(cmd, valor);
    emitir();
  };

  const ligacao = () => {
    const actual = window.getSelection()?.anchorNode?.parentElement?.closest("a");
    const sugerido = actual?.getAttribute("href") || "https://";
    const url = window.prompt("Endereço da ligação", sugerido);
    if (url === null) return;
    if (!url.trim()) {
      comando("unlink");
      return;
    }
    comando("createLink", url.trim());
  };

  const tamanhoFonte = (px: string, label: string) => {
    ref.current?.focus();
    aplicar("fontSize", "7");
    ref.current?.querySelectorAll('font[size="7"]').forEach((font) => {
      const span = document.createElement("span");
      span.style.fontSize = px;
      span.innerHTML = font.innerHTML;
      font.replaceWith(span);
    });
    setTamanho(label);
    emitir();
  };

  const inserirImagem = (url: string) => {
    const legenda = window.prompt("Legenda da imagem (opcional)", "") || "";
    const alt = legenda.replace(/"/g, "&quot;");
    const figura = `<figure class="noticia-figura"><img src="${url}" alt="${alt}">${
      legenda.trim() ? `<figcaption>${legenda.replace(/</g, "")}</figcaption>` : ""
    }</figure><p><br></p>`;
    ref.current?.focus();
    aplicar("insertHTML", figura);
    emitir();
    setGaleria(false);
  };

  return (
    <div className="noticia-editor">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-[#f6f7f7]">
        <Tool label="Negrito" onClick={() => comando("bold")}>
          <Icon title="Negrito" d="M7.2 4.5h5.1c2.7 0 4.5 1.5 4.5 3.6 0 1.5-.9 2.7-2.3 3.2 1.8.4 3 1.8 3 3.6 0 2.4-2 4.1-5.1 4.1H7.2V4.5zm3.1 5.7h1.8c1.1 0 1.8-.6 1.8-1.5s-.7-1.4-1.8-1.4H10.3v2.9zm0 6.1h2.2c1.3 0 2.1-.6 2.1-1.6s-.8-1.6-2.2-1.6h-2.1v3.2z" />
        </Tool>
        <Tool label="Itálico" onClick={() => comando("italic")}>
          <Icon title="Itálico" d="M10 4.5h7.2v2.2h-2.3l-3.4 10.6h2.4v2.2H6.8v-2.2h2.3L12.5 6.7H10V4.5z" />
        </Tool>
        <Tool label="Sublinhado" onClick={() => comando("underline")}>
          <Icon title="Sublinhado" d="M6 19.2h12v1.6H6v-1.6zM8.2 4.5h2.3v8.1c0 1.6 1 2.6 2.5 2.6s2.5-1 2.5-2.6V4.5H17.8v8.2c0 2.9-1.9 4.7-4.8 4.7s-4.8-1.8-4.8-4.7V4.5z" />
        </Tool>
        <Sep />
        <label className="relative mx-0.5">
          <span className="sr-only">Tamanho da letra</span>
          <select
            value={tamanho}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              const opt = TAMANHOS.find((t) => t.label === e.target.value);
              if (opt) tamanhoFonte(opt.px, opt.label);
            }}
            className="h-8 pl-2 pr-7 text-[12px] font-semibold text-[#1d2327] bg-white border border-[#dcdcde] rounded-[4px] outline-none focus:border-[#2271b1]"
            title="Tamanho da letra"
          >
            {TAMANHOS.map((t) => (
              <option key={t.label} value={t.label}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <Sep />
        <Tool label="Alinhar à esquerda" onClick={() => comando("justifyLeft")}>
          <Icon title="Esquerda" d="M4 5.2h16v1.8H4V5.2zm0 4h11v1.8H4V9.2zm0 4h16v1.8H4v-1.8zm0 4h11v1.8H4v-1.8z" />
        </Tool>
        <Tool label="Centrar" onClick={() => comando("justifyCenter")}>
          <Icon title="Centrar" d="M4 5.2h16v1.8H4V5.2zm2.5 4h11v1.8h-11V9.2zM4 13.2h16v1.8H4v-1.8zm2.5 4h11v1.8h-11v-1.8z" />
        </Tool>
        <Tool label="Alinhar à direita" onClick={() => comando("justifyRight")}>
          <Icon title="Direita" d="M4 5.2h16v1.8H4V5.2zm5 4h11v1.8H9V9.2zM4 13.2h16v1.8H4v-1.8zm5 4h11v1.8H9v-1.8z" />
        </Tool>
        <Sep />
        <Tool label="Lista" onClick={() => comando("insertUnorderedList")}>
          <Icon title="Lista" d="M8.5 6.2H20v1.8H8.5V6.2zm0 5H20v1.8H8.5v-1.8zm0 5H20v1.8H8.5v-1.8zM4 5.6h2.2v2.2H4V5.6zm0 5h2.2v2.2H4v-2.2zm0 5h2.2v2.2H4v-2.2z" />
        </Tool>
        <Tool label="Lista numerada" onClick={() => comando("insertOrderedList")}>
          <Icon title="Lista numerada" d="M8.5 6.2H20v1.8H8.5V6.2zm0 5H20v1.8H8.5v-1.8zm0 5H20v1.8H8.5v-1.8zM4.2 4.8h2.2v.9H5.2v.7h1.2v.9H4.2V6.4h1V5.7H4.2V4.8zm0 5.2h2.2v2.5H4.2v-.9h1.2v-.7H4.2v-.9zm0 5h2.2v.9H5.3v.5h1.1v.9H5.3v.5h1.1v.9H4.2v-.9h1v-.5H4.2v-.9h1v-.5H4.2v-.9z" />
        </Tool>
        <Tool label="Citação" onClick={() => comando("formatBlock", "blockquote")}>
          <Icon title="Citação" d="M6.2 16.8c1.9 0 3.4-1.6 3.4-3.6S8.1 9.6 6.2 9.6c-.2 0-.5 0-.7.1C6 7.3 7.8 5.8 11 5.2v-1.8C6.3 4.2 3.5 7 3.5 11.4c0 3 1.4 5.4 2.7 5.4zm8.6 0c1.9 0 3.4-1.6 3.4-3.6s-1.5-3.6-3.4-3.6c-.2 0-.5 0-.7.1.5-2.4 2.3-3.9 5.5-4.5V3.4c-4.7.8-7.5 3.6-7.5 8 0 3 1.4 5.4 2.7 5.4z" />
        </Tool>
        <Sep />
        <Tool label="Ligação" onClick={ligacao}>
          <Icon title="Ligação" d="M10.4 13.6 9 15c-.9.9-2.4.9-3.3 0s-.9-2.4 0-3.3l2.4-2.4c.9-.9 2.4-.9 3.3 0l.7.7 1.3-1.3-.7-.7c-1.6-1.6-4.3-1.6-5.9 0L3.4 10.4c-1.6 1.6-1.6 4.3 0 5.9s4.3 1.6 5.9 0l1.4-1.4-1.3-1.3zm3.2-3.2 1.4-1.4c.9-.9.9-2.4 0-3.3s-2.4-.9-3.3 0L9.3 8.1 8 6.8l.7-.7c1.6-1.6 4.3-1.6 5.9 0l2.4 2.4c1.6 1.6 1.6 4.3 0 5.9s-4.3 1.6-5.9 0l-1.4-1.4 1.3-1.3z" />
        </Tool>
        <Tool label="Inserir imagem com legenda" onClick={() => setGaleria(true)}>
          <Icon title="Imagem" d="M5 5.2h14A1.8 1.8 0 0 1 20.8 7v10A1.8 1.8 0 0 1 19 18.8H5A1.8 1.8 0 0 1 3.2 17V7A1.8 1.8 0 0 1 5 5.2zM5 16.2h14l-4.4-5.3-3 3.6-2.1-2.5L5 16.2zM8.6 9.4a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z" />
        </Tool>
        <Sep />
        <Tool label="Anular" onClick={() => comando("undo")}>
          <Icon title="Anular" d="M12.2 7.2A6.3 6.3 0 1 1 7.4 18H9a4.7 4.7 0 1 0 3.2-8.1 4.6 4.6 0 0 0-3.3 1.4H12v1.8H4.8V6.3h1.8v3A6.2 6.2 0 0 1 12.2 7.2z" />
        </Tool>
        <Tool label="Refazer" onClick={() => comando("redo")}>
          <Icon title="Refazer" d="M11.8 7.2A6.3 6.3 0 1 0 16.6 18H15a4.7 4.7 0 1 1-3.2-8.1 4.6 4.6 0 0 1 3.3 1.4H12V9.5h7.2V6.3h-1.8v3A6.2 6.2 0 0 0 11.8 7.2z" />
        </Tool>
      </div>
      <div
        ref={ref}
        role="textbox"
        aria-label="Corpo da notícia"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder || "Comece a escrever…"}
        onInput={emitir}
        onBlur={emitir}
        className="noticia-editor-area min-h-[18rem] px-4 py-3 text-[16px] text-[#2c3338] leading-relaxed outline-none bg-white resize-y overflow-auto"
      />
      {galeria && (
        <ImageSelector initialTab="galeria" onClose={() => setGaleria(false)} onSelect={inserirImagem} />
      )}
    </div>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-[#dcdcde]" aria-hidden />;
}

function Tool({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="h-8 w-8 inline-flex items-center justify-center rounded-[4px] text-[#1d2327] hover:bg-white hover:text-[#2271b1]"
    >
      {children}
    </button>
  );
}
