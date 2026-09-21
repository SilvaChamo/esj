"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [pronto, setPronto] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setPronto(true);
    });
    // Se a sessão de recuperação já tiver sido estabelecida antes deste
    // efeito correr (o link já processado pelo supabase-js ao carregar a
    // página), confirma por uma sessão activa em vez de esperar o evento.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setPronto(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("A palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("As palavras-passe não coincidem.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createBrowserSupabase();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSucesso(true);
      setTimeout(() => {
        router.push("/entrar");
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível actualizar a palavra-passe.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream flex flex-col overflow-x-hidden">
      <div className="flex-1 flex items-center justify-center px-4 py-6 md:py-8 sm:py-16">
        <div className="w-full max-w-md min-w-0 bg-white border border-navy-100 p-6 sm:p-8 md:p-10 shadow-sm rounded">
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
          <h1 className="mt-6 text-center font-serif font-bold text-navy-900 text-lg">
            Nova palavra-passe
          </h1>

          {sucesso ? (
            <p className="mt-6 text-sm text-leaf font-semibold text-center">
              Palavra-passe actualizada. A redireccionar para o início de sessão…
            </p>
          ) : !pronto ? (
            <p className="mt-6 text-sm text-navy-900/60 text-center">
              A validar o link de recuperação… Se abriu esta página directamente (sem vir do link do
              e-mail), peça um novo link em{" "}
              <Link href="/entrar" className="text-sky hover:underline font-semibold">
                Entrar
              </Link>
              .
            </p>
          ) : (
            <form onSubmit={guardar} className="mt-6 space-y-4">
              <div className="relative min-w-0">
                <label className="block text-xs font-bold text-navy-900/70 mb-1">
                  Nova palavra-passe
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="esj-field pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Esconder palavra-passe" : "Mostrar palavra-passe"}
                  className="absolute right-2 top-[30px] p-1.5 text-navy-900/55 hover:text-navy-900"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div>
                <label className="block text-xs font-bold text-navy-900/70 mb-1">
                  Confirmar palavra-passe
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="esj-field"
                />
              </div>
              {error && (
                <p className="text-sm text-crimson break-words" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-navy-800 hover:bg-crimson border-l-4 border-transparent hover:border-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide py-3.5 transition-all rounded shadow-sm"
              >
                {busy ? "A GUARDAR…" : "GUARDAR NOVA PALAVRA-PASSE"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
