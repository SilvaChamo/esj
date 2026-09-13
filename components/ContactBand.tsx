"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

const fieldClass =
  "w-full bg-transparent border border-white/80 px-3 text-sm text-white placeholder:text-white/80 outline-none focus:border-white";

function growMessageField(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${Math.max(el.scrollHeight, 88)}px`;
}

export default function ContactBand() {
  const [newsState, setNewsState] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const [msgState, setMsgState] = useState<"idle" | "busy" | "ok" | "err">("idle");

  const subscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("news_email") || "").trim();
    if (!email) return;
    setNewsState("busy");
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "newsletter", email }),
      });
      if (!res.ok) throw new Error("fail");
      setNewsState("ok");
      e.currentTarget.reset();
    } catch {
      setNewsState("err");
    }
  };

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setMsgState("busy");
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "mensagem",
          nome: String(data.get("nome") || "").trim(),
          email: String(data.get("email") || "").trim(),
          mensagem: String(data.get("mensagem") || "").trim(),
        }),
      });
      if (!res.ok) throw new Error("fail");
      setMsgState("ok");
      form.reset();
      const ta = form.querySelector("textarea");
      if (ta) {
        ta.style.height = "";
      }
    } catch {
      setMsgState("err");
    }
  };

  return (
    <section id="contacto" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 pt-16 pb-6 md:pt-24 md:pb-8">
        <div className="relative mb-[72px]">
          <div className="absolute inset-0 overflow-hidden" aria-hidden>
            <Image
              src="/JornalistaII.jpg"
              alt=""
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-[50%_30%]"
            />
            <div className="absolute inset-0 bg-[#1a5a78]/90" />
          </div>

          <div className="relative flex flex-col md:flex-row md:items-stretch">
            <form
              onSubmit={sendMessage}
              className="relative z-10 border border-white bg-[#1a5a78]/35 px-5 py-8 sm:px-10 sm:py-10 w-full md:flex-1 md:-mr-14 md:pr-20"
            >
              <h2 className="font-serif text-3xl md:text-[2.05rem] font-bold text-white mb-7">
                Fale <span className="text-sky-300">connosco</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  name="nome"
                  required
                  autoComplete="name"
                  placeholder="Nome"
                  className={`${fieldClass} h-11`}
                />
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Correio"
                  className={`${fieldClass} h-11`}
                />
                <textarea
                  name="mensagem"
                  required
                  rows={3}
                  placeholder="Mensagem"
                  onInput={(e) => growMessageField(e.currentTarget)}
                  className={`${fieldClass} sm:col-span-2 min-h-[5.5rem] py-2.5 leading-relaxed resize-y overflow-hidden`}
                />
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={msgState === "busy"}
                  className="h-11 px-6 bg-white text-navy-900 text-[11px] font-bold tracking-[0.14em] hover:bg-cream disabled:opacity-60"
                >
                  {msgState === "busy" ? "A ENVIAR…" : "ENVIAR MENSAGEM"}
                </button>
              </div>
              {msgState === "ok" && (
                <p className="mt-4 text-sm text-white text-right">Mensagem recebida. Obrigado.</p>
              )}
              {msgState === "err" && (
                <p className="mt-4 text-sm text-white text-right">Não foi possível enviar. Tente de novo.</p>
              )}
            </form>

            <aside className="relative z-0 bg-navy-800 text-white px-8 py-9 w-full md:w-[280px] md:shrink-0 md:-my-10 md:pl-20">
              <dl className="divide-y divide-white/20 text-[13px] leading-snug">
                <div className="pb-5">
                  <dt className="font-semibold mb-1.5">Morada</dt>
                  <dd className="text-white/95">
                    Av. 24 de Julho, antiga Escola Industrial, Maputo
                  </dd>
                </div>
                <div className="py-5">
                  <dt className="font-semibold mb-1.5">Telefone</dt>
                  <dd>
                    <a href="tel:+25821302721" className="hover:underline">
                      +258 21 302 721
                    </a>
                  </dd>
                </div>
                <div className="py-5">
                  <dt className="font-semibold mb-1.5">Portal</dt>
                  <dd>
                    <a
                      href="https://esj.edondzo.ac.mz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline break-all"
                    >
                      esj.edondzo.ac.mz
                    </a>
                  </dd>
                </div>
                <div className="pt-5">
                  <dt className="font-semibold mb-1.5">Horário</dt>
                  <dd>
                    Seg–Sex: 8h00–15h30
                    <br />
                    Sáb–Dom: encerrado
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </div>

      <div className="relative bg-[#0c3348]/85">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 py-9 md:py-12">
          <form
            onSubmit={subscribe}
            className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
          >
            <h2 className="font-serif text-3xl md:text-[2.15rem] font-bold shrink-0 text-white">
              A nossa <span className="text-sky-300">newsletter</span>
            </h2>
            <input
              type="email"
              name="news_email"
              required
              autoComplete="email"
              placeholder="Introduza o seu correio electrónico"
              className="h-11 w-full md:flex-1 bg-white/15 px-4 text-sm text-white placeholder:text-white/80 outline-none"
            />
            <button
              type="submit"
              disabled={newsState === "busy"}
              className="h-11 px-6 bg-white text-navy-900 text-[11px] font-bold tracking-[0.14em] shrink-0 hover:bg-cream disabled:opacity-60"
            >
              {newsState === "busy" ? "A SUBSCREVER…" : "SUBSCREVER AGORA"}
            </button>
          </form>
          {newsState === "ok" && (
            <p className="text-sm text-white pb-2 -mt-1">Inscrição recebida.</p>
          )}
          {newsState === "err" && (
            <p className="text-sm text-white pb-2 -mt-1">Não foi possível subcrever. Tente de novo.</p>
          )}
        </div>
      </div>
    </section>
  );
}
