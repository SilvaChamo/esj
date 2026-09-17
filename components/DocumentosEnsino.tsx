"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText } from "lucide-react";
import BannerInterior from "@/components/BannerInterior";
import LeitorDocumento from "@/components/LeitorDocumento";
import { DOC_SECOES, secaoPorId, type DocLink } from "@/lib/ensino-docs";

export default function DocumentosEnsino() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const secao = secaoPorId(searchParams.get("sec"));
  const [ler, setLer] = useState<DocLink | null>(null);

  const escolher = (id: string) => {
    router.replace(`/documentos?sec=${id}`, { scroll: false });
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          <aside className="lg:w-56 shrink-0">
            <p className="text-[11px] font-bold tracking-widest text-sky mb-3">FILTRAR</p>
            <nav className="bg-white border border-navy-100 divide-y divide-navy-100">
              {DOC_SECOES.map((s) => {
                const activo = s.id === secao.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => escolher(s.id)}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      activo
                        ? "bg-navy-900 text-white font-semibold"
                        : "text-navy-900 hover:bg-cream"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="flex-1 min-w-0">
            <h2 className="font-serif font-bold text-2xl text-navy-900">{secao.label}</h2>
            <p className="mt-1 text-sm text-navy-900/60">{secao.description}</p>

            <ul className="mt-6 bg-white border border-navy-100 divide-y divide-navy-100">
              {secao.items.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <button
                      type="button"
                      onClick={() => setLer(item)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-sm text-navy-900 hover:bg-cream transition-colors text-left"
                    >
                      <FileText className="w-5 h-5 text-sky shrink-0" />
                      <span className="flex-1 font-medium min-w-0">{item.label}</span>
                      <span className="text-xs text-sky font-semibold shrink-0">Ver</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-4 px-5 py-4 text-sm text-navy-900/50">
                      <FileText className="w-5 h-5 shrink-0" />
                      <span className="flex-1 font-medium min-w-0">{item.label}</span>
                      <span className="text-xs tracking-wide shrink-0">Em breve</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <p className="mt-6 text-sm text-navy-900/55">
              Precisa de ajuda?{" "}
              <Link href="/contacto" className="text-sky hover:underline">
                Contacte a Secretaria Académica
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {ler?.href && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[85vh] bg-white border border-navy-100 flex flex-col overflow-hidden">
            <LeitorDocumento
              url={ler.href}
              title={ler.label}
              modo="modal"
              onClose={() => setLer(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
