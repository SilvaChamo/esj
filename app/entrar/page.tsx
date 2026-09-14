"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const floatingLabelClass =
  "absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-navy-900/55 transition-all duration-150 pointer-events-none" +
  " peer-focus:-top-2 peer-focus:left-2.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:text-sky peer-focus:bg-white peer-focus:px-1" +
  " peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1";

function Field({
  id,
  label,
  type = "text",
  name,
  required,
  minLength,
  autoComplete,
  trailing,
}: {
  id: string;
  label: string;
  type?: string;
  name: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="relative min-w-0">
      <input
        id={id}
        type={type}
        name={name}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder=" "
        className={`esj-field peer ${trailing ? "pr-11" : ""}`}
      />
      <label htmlFor={id} className={floatingLabelClass}>
        {label}
      </label>
      {trailing}
    </div>
  );
}

export default function EntrarPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const entrar = async (form: HTMLFormElement) => {
    const email = String(new FormData(form).get("email") || "").trim();
    const password = String(new FormData(form).get("password") || "");
    setBusy(true);
    setError("");
    try {
      const supabase = createBrowserSupabase();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      router.push("/gestao");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível entrar.";
      setError(
        message.includes("Invalid login") ? "Correio ou palavra-passe incorrectos." : message
      );
    } finally {
      setBusy(false);
    }
  };

  const onSubmitEntrar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void entrar(e.currentTarget);
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
        <div className="w-full max-w-sm min-w-0 bg-white border border-navy-100 p-5 sm:p-8 md:p-10">
          <Link href="/" className="block mx-auto w-fit">
            <Image
              src="/esj-logo-mark.png"
              alt="ESJ"
              width={64}
              height={64}
              className="h-14 w-14 object-contain rounded-sm"
              unoptimized
            />
          </Link>
          <p className="mt-2 text-center font-serif font-bold text-sky">
            Escola Superior de Jornalismo
          </p>

          <form onSubmit={onSubmitEntrar} className="mt-8 space-y-4">
            <Field
              id="entrar-email"
              label="Correio electrónico"
              type="email"
              name="email"
              required
              autoComplete="username"
            />
            <Field
              id="entrar-password"
              label="Palavra-passe"
              type={showPassword ? "text" : "password"}
              name="password"
              required
              minLength={6}
              autoComplete="current-password"
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Esconder palavra-passe" : "Mostrar palavra-passe"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-navy-900/55 hover:text-navy-900"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
            {error && (
              <p className="text-sm text-crimson break-words" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-navy-800 hover:bg-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide py-3.5 transition-colors"
            >
              {busy ? "A ENTRAR…" : "ENTRAR"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
