"use client";

import { FormEvent, useState } from "react";

export default function NewsletterSeccao() {
  const [newsBusy, setNewsBusy] = useState(false);
  const [newsPopup, setNewsPopup] = useState<{ ok: boolean; texto: string } | null>(null);

  const subscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const dados = new FormData(form);
    const email = String(dados.get("news_email") || "").trim();
    const telefone = String(dados.get("news_contacto") || "").trim();
    if (!email || !telefone) return;
    setNewsBusy(true);
    setNewsPopup(null);
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "newsletter", email, telefone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível subcrever. Tente de novo.");
      form.reset();
      setNewsPopup({ ok: true, texto: "Inscrição recebida." });
    } catch (err) {
      setNewsPopup({
        ok: false,
        texto: err instanceof Error ? err.message : "Não foi possível subcrever. Tente de novo.",
      });
    } finally {
      setNewsBusy(false);
    }
  };

  return (
    <>
      <div className="relative bg-mark">
        <div className="h-1.5 w-full bg-sky" aria-hidden />
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 py-9 md:py-12">
          <form
            onSubmit={subscribe}
            className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4"
          >
            <h2 className="font-serif text-3xl md:text-[2.15rem] font-bold shrink-0 text-navy-900">
              A nossa <span className="text-sky">newsletter</span>
            </h2>
            <input
              type="email"
              name="news_email"
              required
              autoComplete="email"
              placeholder="E-mail"
              className="h-11 w-full md:flex-1 bg-white/55 px-4 text-sm text-navy-900 placeholder:text-navy-900/50 outline-none"
            />
            <input
              type="tel"
              name="news_contacto"
              required
              autoComplete="tel"
              placeholder="Contacto"
              className="h-11 w-full md:w-40 md:shrink-0 bg-white/55 px-4 text-sm text-navy-900 placeholder:text-navy-900/50 outline-none"
            />
            <button
              type="submit"
              disabled={newsBusy}
              className="esj-btn-move h-11 px-6 bg-navy-900 text-white text-[11px] font-bold tracking-[0.14em] shrink-0 disabled:opacity-60"
            >
              {newsBusy ? "A SUBSCREVER…" : "SUBSCREVER"}
            </button>
          </form>
        </div>
      </div>
      {newsPopup && (
        <div
          className="fixed inset-0 z-[220] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setNewsPopup(null)}
        >
          <div
            className="bg-white border border-navy-100 px-8 py-6 max-w-sm w-full"
            role="alertdialog"
            aria-live="polite"
            onClick={(e) => e.stopPropagation()}
          >
            <p className={`text-sm leading-relaxed ${newsPopup.ok ? "text-navy-900" : "text-crimson"}`}>
              {newsPopup.texto}
            </p>
            <button
              type="button"
              onClick={() => setNewsPopup(null)}
              className="mt-5 h-11 px-6 bg-white text-navy-900 text-[11px] font-bold tracking-[0.14em] border border-navy-900 hover:text-white"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
