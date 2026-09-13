"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function EntrarPage() {
  const router = useRouter();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push("/gestao");
  };

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      <div className="bg-navy-800 text-white text-[11px] font-medium">
        <div className="mx-auto max-w-lg px-4 h-10 flex items-center justify-between">
          <span>Área de gestão — proposta</span>
          <Link href="/" className="hover:text-sky-300 transition-colors">
            Voltar ao sítio
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white border border-navy-100 p-8 md:p-10">
          <Image
            src="/esj-logo-mark.png"
            alt="ESJ"
            width={64}
            height={64}
            className="h-14 w-14 object-contain rounded-sm"
            unoptimized
          />
          <h1 className="font-serif text-2xl font-bold text-navy-900 mt-5">Entrar</h1>
          <p className="mt-2 text-sm text-navy-900/65 leading-relaxed">
            Acesso da Secretaria e da Direcção à gestão do sítio, do edital e dos
            anúncios aos estudantes.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="block text-sm font-bold text-navy-900 mb-1.5">
                Correio electrónico
              </span>
              <input
                type="email"
                name="email"
                defaultValue="secretaria@esj.ac.mz"
                className="esj-field"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-bold text-navy-900 mb-1.5">
                Palavra-passe
              </span>
              <input
                type="password"
                name="password"
                defaultValue="proposta"
                className="esj-field"
              />
            </label>
            <button
              type="submit"
              onClick={() => router.push("/gestao")}
              className="w-full bg-navy-800 hover:bg-crimson text-white font-semibold text-xs tracking-wide py-3.5 transition-colors"
            >
              ENTRAR
            </button>
          </form>

          <p className="mt-6 text-[10px] text-navy-900/40 leading-relaxed">
            Esboço sem autenticação real. Qualquer clique em Entrar abre o painel
            de demonstração.
          </p>
        </div>
      </div>
    </main>
  );
}
