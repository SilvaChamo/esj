"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export default function EntrarPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"in" | "up" | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const run = async (form: HTMLFormElement, mode: "in" | "up") => {
    const email = String(new FormData(form).get("email") || "").trim();
    const password = String(new FormData(form).get("password") || "");
    setBusy(mode);
    setError("");
    try {
      const supabase = createBrowserSupabase();
      if (mode === "up") {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
      }
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        if (mode === "up") {
          throw new Error(
            "Conta criada. Confirme o correio electrónico se o Supabase o exigir, e volte a entrar."
          );
        }
        throw authError;
      }
      router.push("/gestao");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível entrar.";
      setError(
        message.includes("Invalid login")
          ? "Correio ou palavra-passe incorrectos."
          : message
      );
    } finally {
      setBusy(null);
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void run(e.currentTarget, "in");
  };

  return (
    <main className="min-h-screen bg-cream flex flex-col overflow-x-hidden">
      <div className="bg-navy-800 text-white text-[11px] font-medium">
        <div className="mx-auto max-w-lg px-4 h-10 flex items-center justify-between gap-3">
          <span className="truncate">Área de gestão</span>
          <Link href="/" className="hover:text-sky-300 transition-colors shrink-0">
            Voltar ao sítio
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md min-w-0 bg-white border border-navy-100 p-5 sm:p-8 md:p-10">
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
            Acesso da Secretaria e da Direcção à gestão do sítio, do edital e das
            candidaturas.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block min-w-0">
              <span className="block text-sm font-bold text-navy-900 mb-1.5">
                Correio electrónico
              </span>
              <input
                type="email"
                name="email"
                required
                autoComplete="username"
                className="esj-field"
              />
            </label>
            <label className="block min-w-0">
              <span className="block text-sm font-bold text-navy-900 mb-1.5">
                Palavra-passe
              </span>
              <span className="relative block">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  autoComplete={busy === "up" ? "new-password" : "current-password"}
                  className="esj-field pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Esconder palavra-passe" : "Mostrar palavra-passe"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-navy-900/55 hover:text-navy-900"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>
            {error && (
              <p className="text-sm text-crimson break-words" role="alert">
                {error}
              </p>
            )}
            <div className="flex flex-col gap-3 pt-1">
              <button
                type="submit"
                disabled={busy !== null}
                className="w-full bg-navy-800 hover:bg-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide py-3.5 transition-colors"
              >
                {busy === "in" ? "A ENTRAR…" : "ENTRAR"}
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={(e) => {
                  const form = e.currentTarget.form;
                  if (form) void run(form, "up");
                }}
                className="w-full border border-navy-800 text-navy-800 hover:bg-navy-800 hover:text-white disabled:opacity-60 font-semibold text-xs tracking-wide py-3.5 transition-colors"
              >
                {busy === "up" ? "A REGISTAR…" : "REGISTAR"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
