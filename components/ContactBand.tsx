"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { Clock, Globe, MapPin, Phone } from "lucide-react";
import EntradaHome from "@/components/EntradaHome";
import NewsletterSeccao from "@/components/NewsletterSeccao";

const fieldClass =
  "w-full bg-transparent border border-white/80 px-3 text-sm text-white placeholder:text-white/80 outline-none focus:border-white";

function growMessageField(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${Math.max(el.scrollHeight, 88)}px`;
}

export default function ContactBand() {
  const [msgState, setMsgState] = useState<"idle" | "busy" | "ok" | "err">("idle");

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
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-6 md:pt-24 md:pb-8">
        <div className="mb-[72px]">
          <div className="flex flex-col md:flex-row md:items-stretch">
            <EntradaHome className="w-full md:flex-1 md:self-center">
            <form
              onSubmit={sendMessage}
              className="relative z-0 overflow-hidden flex flex-col justify-center border border-white p-8 sm:p-10 w-full md:translate-y-5"
            >
              <Image
                src="/JornalistaII.jpg"
                alt=""
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                aria-hidden
                className="-z-10 object-cover object-[50%_30%]"
              />
              <div className="absolute inset-0 -z-10 bg-[#1a5a78]/90" aria-hidden />
              <div className="absolute inset-0 -z-10 bg-[#1a5a78]/35" aria-hidden />
              <p className="flex items-center gap-3 text-leaf font-bold tracking-widest text-sm mb-3">
                <span className="h-px w-[40px] shrink-0 bg-leaf" aria-hidden />
                CONTACTO
              </p>
              <h2 className="font-serif text-3xl md:text-[2.05rem] font-bold text-navy-900">
                Fale <span className="text-sky">connosco</span>
              </h2>
              <p className="mt-4 mb-7 text-sm text-white/85 leading-relaxed">
                A Escola Superior de Jornalismo está disponível para esclarecer dúvidas sobre
                admissões, cursos e parcerias. Contacte a Secretaria Académica pelos meios ao
                lado ou preencha o formulário abaixo e responderemos o mais breve possível.
              </p>
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
                  className="esj-btn-move h-11 px-6 bg-white text-navy-900 text-[11px] font-bold tracking-[0.14em] hover:text-white disabled:opacity-60"
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
            </EntradaHome>

            <EntradaHome atraso={0.1} className="w-full md:w-[360px] md:shrink-0 md:-mb-10">
            <aside className="relative z-0 flex flex-col justify-center bg-navy-800 text-white w-full h-full">
              <div className="bg-navy-900 p-8 sm:p-10">
                <h3 className="font-serif text-xl font-bold text-white text-center uppercase">Nossa Localização</h3>
              </div>
              <div className="h-1.5 bg-crimson" aria-hidden />
              <dl className="p-8 sm:p-10 divide-y divide-white/20 text-[15px] leading-relaxed">
                <div className="pb-5 flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-sky-300">
                    <MapPin size={16} className="text-sky-300" />
                  </span>
                  <div>
                    <dt className="font-semibold mb-1.5">Morada</dt>
                    <dd className="text-white/95">
                      Av. 24 de Julho, antiga Escola Industrial, Maputo
                    </dd>
                  </div>
                </div>
                <div className="py-5 flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-sky-300">
                    <Phone size={16} className="text-sky-300" />
                  </span>
                  <div>
                    <dt className="font-semibold mb-1.5">Telefone</dt>
                    <dd>
                      <a href="tel:+25821302721" className="hover:underline">
                        +258 21 302 721
                      </a>
                    </dd>
                  </div>
                </div>
                <div className="py-5 flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-sky-300">
                    <Globe size={16} className="text-sky-300" />
                  </span>
                  <div>
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
                </div>
                <div className="pt-5 flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-sky-300">
                    <Clock size={16} className="text-sky-300" />
                  </span>
                  <div>
                    <dt className="font-semibold mb-1.5">Horário</dt>
                    <dd>
                      Seg–Sex: 8h00–15h30
                      <br />
                      Sáb–Dom: encerrado
                    </dd>
                  </div>
                </div>
              </dl>
            </aside>
            </EntradaHome>
          </div>
        </div>
      </div>

      <NewsletterSeccao />
    </section>
  );
}
