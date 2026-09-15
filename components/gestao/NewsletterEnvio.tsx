"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import SchemaInstall from "@/components/gestao/SchemaInstall";
import {
  cmsError,
  isMissingTable,
  listAnunciosGestao,
  listNewsletterGestao,
  listNoticiasGestao,
} from "@/lib/cms";

type Noticia = { slug: string; title: string; excerpt: string; estado?: string };
type Subscritor = { id: string; email: string; telefone?: string | null };

export default function NewsletterEnvio({ onAction }: { onAction: (m: string) => void }) {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [subscritores, setSubscritores] = useState<Subscritor[]>([]);
  const [escolhidas, setEscolhidas] = useState<string[]>([]);
  const [resumos, setResumos] = useState<Record<string, string>>({});
  const [ids, setIds] = useState<string[]>([]);
  const [assunto, setAssunto] = useState("");
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState(false);
  const [emailOk, setEmailOk] = useState<boolean | null>(null);
  const [envios, setEnvios] = useState<{ id: string; assunto: string; destinatarios: string }[]>([]);

  const publicadas = useMemo(
    () => noticias.filter((n) => (n.estado || "publicado") === "publicado"),
    [noticias]
  );

  const pecas = escolhidas
    .map((slug) => publicadas.find((n) => n.slug === slug))
    .filter(Boolean) as Noticia[];

  useEffect(() => {
    listNoticiasGestao()
      .then(setNoticias)
      .catch((err) => {
        if (isMissingTable(err)) setMissing(true);
      });
    listNewsletterGestao()
      .then((rows) => {
        setSubscritores(rows);
        setIds(rows.map((r) => r.id));
      })
      .catch((err) => {
        if (isMissingTable(err)) setMissing(true);
      });
    listAnunciosGestao("email")
      .then(setEnvios)
      .catch(() => setEnvios([]));
    fetch("/api/newsletter")
      .then((res) => res.json())
      .then((data) => setEmailOk(Boolean(data.configurado)))
      .catch(() => setEmailOk(false));
  }, []);

  const toggleNoticia = (slug: string, excerpt: string) => {
    setEscolhidas((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 2) return prev;
      setResumos((r) => ({ ...r, [slug]: r[slug] || excerpt }));
      return [...prev, slug];
    });
  };

  const toggleSub = (id: string) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pecas.length === 0 || ids.length === 0) return;
    setBusy(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assunto: assunto.trim(),
          ids,
          pecas: pecas.map((p) => ({
            slug: p.slug,
            title: p.title,
            resumo: (resumos[p.slug] || p.excerpt).trim(),
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível enviar a newsletter.");
      setAssunto("");
      listAnunciosGestao("email").then(setEnvios).catch(() => setEnvios([]));
      onAction(
        data.falhados
          ? `Newsletter enviada a ${data.enviados} de ${data.total} subscritores.`
          : `Newsletter enviada a ${data.enviados} subscritor(es).`
      );
    } catch (error) {
      onAction(cmsError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">
      <form className="bg-white border border-navy-100 p-8 space-y-6" onSubmit={onSubmit}>
        <h2 className="font-serif text-2xl font-bold text-navy-900">Newsletter</h2>
        <p className="text-sm text-navy-900/65 leading-relaxed">
          Escolha uma ou duas notícias, ajuste o resumo e seleccione quem recebe.
        </p>
        {missing && <SchemaInstall />}
        {emailOk === false && (
          <div className="border border-navy-100 bg-cream p-4 text-sm text-navy-900/80 leading-relaxed">
            Para activar o envio, defina no servidor{" "}
            <span className="font-semibold">RESEND_API_KEY</span> e{" "}
            <span className="font-semibold">EMAIL_FROM</span>.
          </div>
        )}

        <fieldset>
          <legend className="text-sm font-bold text-navy-900 mb-2">Notícias</legend>
          <ul className="divide-y divide-navy-100 border border-navy-100 max-h-64 overflow-y-auto">
            {publicadas.length === 0 && (
              <li className="px-4 py-3 text-sm text-navy-900/50">Ainda sem notícias publicadas.</li>
            )}
            {publicadas.map((n) => {
              const marcada = escolhidas.includes(n.slug);
              const cheio = escolhidas.length >= 2 && !marcada;
              return (
                <li key={n.slug}>
                  <label
                    className={`flex items-start gap-3 px-4 py-3 text-sm ${
                      cheio ? "opacity-40" : "cursor-pointer hover:bg-cream"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={marcada}
                      disabled={cheio}
                      onChange={() => toggleNoticia(n.slug, n.excerpt)}
                    />
                    <span>
                      <span className="block font-semibold text-navy-900">{n.title}</span>
                      <span className="block text-navy-900/55 text-xs mt-0.5 line-clamp-2">
                        {n.excerpt}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>

        {pecas.map((p) => (
          <label key={p.slug} className="block">
            <span className="block text-sm font-bold text-navy-900 mb-1.5">Resumo — {p.title}</span>
            <textarea
              className="esj-field-area"
              value={resumos[p.slug] ?? p.excerpt}
              onChange={(e) => setResumos((r) => ({ ...r, [p.slug]: e.target.value }))}
            />
          </label>
        ))}

        <label className="block">
          <span className="block text-sm font-bold text-navy-900 mb-1.5">Assunto do correio</span>
          <input
            className="esj-field"
            placeholder="Em branco, usa o título da notícia"
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
          />
        </label>

        <fieldset>
          <legend className="text-sm font-bold text-navy-900 mb-2">
            Subscritores
            <button
              type="button"
              className="ml-3 text-xs font-semibold tracking-wide text-sky hover:text-crimson"
              onClick={() =>
                setIds(ids.length === subscritores.length ? [] : subscritores.map((s) => s.id))
              }
            >
              {ids.length === subscritores.length ? "NENHUM" : "TODOS"}
            </button>
          </legend>
          <ul className="divide-y divide-navy-100 border border-navy-100 max-h-56 overflow-y-auto">
            {subscritores.length === 0 && (
              <li className="px-4 py-3 text-sm text-navy-900/50">Ainda sem subscritores.</li>
            )}
            {subscritores.map((s) => (
              <li key={s.id}>
                <label className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer hover:bg-cream">
                  <input
                    type="checkbox"
                    checked={ids.includes(s.id)}
                    onChange={() => toggleSub(s.id)}
                  />
                  <span className="text-navy-900">{s.email}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <button
          type="submit"
          disabled={busy || emailOk === false || pecas.length === 0 || ids.length === 0}
          className="bg-leaf hover:bg-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
        >
          {busy ? "A ENVIAR…" : "ENVIAR NEWSLETTER"}
        </button>
      </form>

      <aside className="bg-white border border-navy-100 p-6">
        <h3 className="font-serif font-bold text-navy-900">Envios</h3>
        <ul className="mt-4 space-y-3 text-sm">
          {envios.length === 0 && <li className="text-navy-900/50">Ainda sem envios.</li>}
          {envios.map((a) => (
            <li key={a.id}>
              <span className="block font-semibold text-navy-900">{a.assunto}</span>
              <span className="text-navy-900/55 text-xs">{a.destinatarios}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
