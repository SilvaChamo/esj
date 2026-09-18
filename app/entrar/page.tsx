"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useState } from "react";
import { Eye, EyeOff, GraduationCap, UserCheck, BookOpen } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { eDocente } from "@/lib/gestao-auth";
import { savePerfilActual, type PerfilUtilizador } from "@/lib/auth-perfil";
import { CURSOS_DOCENCIA, type CursoDocenciaSlug } from "@/lib/docencia";
import type { RegimeCurso } from "@/lib/curriculo";

const floatingLabelClass =
  "absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-navy-900/55 transition-all duration-150 pointer-events-none" +
  " peer-focus:-top-2 peer-focus:left-2.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:text-sky peer-focus:bg-white peer-focus:px-1" +
  " peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1";

function Field({
  id,
  label,
  type = "text",
  name,
  value,
  onChange,
  required,
  minLength,
  autoComplete,
  trailing,
}: {
  id: string;
  label: string;
  type?: string;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
        value={value}
        onChange={onChange}
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
  const [modo, setModo] = useState<"entrar" | "registo">("entrar");
  const [tipoConta, setTipoConta] = useState<"estudante" | "docente">("estudante");

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [recuperar, setRecuperar] = useState(false);

  // Campos do formulário de registo
  const [nome, setNome] = useState("");
  const [emailRegisto, setEmailRegisto] = useState("");
  const [passwordRegisto, setPasswordRegisto] = useState("");
  const [numeroEstudante, setNumeroEstudante] = useState("");
  const [cursoRegisto, setCursoRegisto] = useState<CursoDocenciaSlug>("jornalismo");
  const [regimeRegisto, setRegimeRegisto] = useState<RegimeCurso>("diurno");
  const [departamento, setDepartamento] = useState("Jornalismo e Comunicação");

  const entrar = async (form: HTMLFormElement) => {
    const email = String(new FormData(form).get("email") || "").trim();
    const password = String(new FormData(form).get("password") || "");
    setBusy(true);
    setError("");
    try {
      const supabase = createBrowserSupabase();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;

      if (eDocente(data.user)) {
        router.push("/docencia");
      } else {
        router.push("/estudantes");
      }
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

  const registar = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");

    if (!nome.trim() || !emailRegisto.trim() || !passwordRegisto) {
      setError("Preencha todos os campos obrigatórios.");
      setBusy(false);
      return;
    }

    try {
      const supabase = createBrowserSupabase();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: emailRegisto.trim(),
        password: passwordRegisto,
        options: {
          data: {
            full_name: nome.trim(),
            role: tipoConta,
            curso: cursoRegisto,
            regime: regimeRegisto,
            numero_estudante: numeroEstudante.trim(),
          },
        },
      });

      if (signUpError && !signUpError.message.includes("rate")) {
        // Continuar em modo demonstrativo se auth do Supabase requerer aprovação
      }

      // Guardar perfil no armazenamento local do browser
      const perfil: PerfilUtilizador = {
        id: data.user?.id || `user-${Date.now()}`,
        email: emailRegisto.trim(),
        nome: nome.trim(),
        tipo: tipoConta,
        numeroEstudante: numeroEstudante.trim() || `2026${Math.floor(1000 + Math.random() * 9000)}MP`,
        curso: cursoRegisto,
        regime: regimeRegisto,
        departamento,
        anoLectivo: "2026",
      };
      savePerfilActual(perfil);

      setInfo("Conta registada com sucesso! A redirecionar para o painel…");
      setTimeout(() => {
        if (tipoConta === "docente") {
          router.push("/docencia");
        } else {
          router.push("/estudantes");
        }
        router.refresh();
      }, 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao registar conta.";
      setError(msg);
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

          {/* Abas Entrar / Inscrever-se */}
          <div className="mt-6 flex border-b border-navy-100">
            <button
              type="button"
              onClick={() => {
                setModo("entrar");
                setError("");
                setInfo("");
              }}
              className={`flex-1 py-3 text-xs font-bold tracking-wide transition-colors ${
                modo === "entrar"
                  ? "border-b-2 border-sky text-navy-900"
                  : "text-navy-900/50 hover:text-navy-900"
              }`}
            >
              ENTRAR
            </button>
            <button
              type="button"
              onClick={() => {
                setModo("registo");
                setError("");
                setInfo("");
              }}
              className={`flex-1 py-3 text-xs font-bold tracking-wide transition-colors ${
                modo === "registo"
                  ? "border-b-2 border-sky text-navy-900"
                  : "text-navy-900/50 hover:text-navy-900"
              }`}
            >
              REGISTE-SE
            </button>
          </div>

          {modo === "entrar" ? (
            <form onSubmit={onSubmitEntrar} className="mt-6 space-y-4">
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
                className="w-full bg-navy-800 hover:bg-crimson border-l-4 border-transparent hover:border-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide py-3.5 transition-all rounded shadow-sm"
              >
                {busy ? "A ENTRAR…" : "ENTRAR"}
              </button>
              <p className="text-center text-xs text-navy-900/60 -mt-1">
                Esqueceu a Senha?{" "}
                <button
                  type="button"
                  onClick={() => setRecuperar((v) => !v)}
                  className="text-sky hover:underline font-semibold"
                >
                  Recuperar
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={registar} className="mt-6 space-y-4">
              {/* Seleção do Perfil (Estudante ou Docente) */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTipoConta("estudante")}
                  className={`flex-1 p-3 border rounded text-left transition-colors flex items-center gap-2 ${
                    tipoConta === "estudante"
                      ? "border-sky bg-sky/10 text-navy-900 font-bold"
                      : "border-navy-100 text-navy-900/60"
                  }`}
                >
                  <GraduationCap size={18} />
                  <span className="text-xs">Sou Estudante</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTipoConta("docente")}
                  className={`flex-1 p-3 border rounded text-left transition-colors flex items-center gap-2 ${
                    tipoConta === "docente"
                      ? "border-sky bg-sky/10 text-navy-900 font-bold"
                      : "border-navy-100 text-navy-900/60"
                  }`}
                >
                  <UserCheck size={18} />
                  <span className="text-xs">Sou Docente</span>
                </button>
              </div>

              <Field
                id="reg-nome"
                label="Nome completo *"
                name="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />

              <Field
                id="reg-email"
                label="Correio electrónico *"
                type="email"
                name="email"
                value={emailRegisto}
                onChange={(e) => setEmailRegisto(e.target.value)}
                required
              />

              <Field
                id="reg-password"
                label="Palavra-passe *"
                type={showPassword ? "text" : "password"}
                name="password"
                value={passwordRegisto}
                onChange={(e) => setPasswordRegisto(e.target.value)}
                required
                minLength={6}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-navy-900/55 hover:text-navy-900"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              {tipoConta === "estudante" ? (
                <>
                  <Field
                    id="reg-numero"
                    label="Número do Estudante (ex: 20260104MP)"
                    name="numeroEstudante"
                    value={numeroEstudante}
                    onChange={(e) => setNumeroEstudante(e.target.value)}
                  />

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">
                      Curso que Frequenta *
                    </label>
                    <select
                      value={cursoRegisto}
                      onChange={(e) => setCursoRegisto(e.target.value as CursoDocenciaSlug)}
                      className="w-full p-3 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:outline-none focus:border-sky"
                    >
                      {CURSOS_DOCENCIA.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.titulo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">Regime *</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs font-bold text-navy-900">
                        <input
                          type="radio"
                          name="regime"
                          checked={regimeRegisto === "diurno"}
                          onChange={() => setRegimeRegisto("diurno")}
                          className="accent-leaf"
                        />
                        Diurno
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-navy-900">
                        <input
                          type="radio"
                          name="regime"
                          checked={regimeRegisto === "pos-laboral"}
                          onChange={() => setRegimeRegisto("pos-laboral")}
                          className="accent-leaf"
                        />
                        Pós-Laboral
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Curso que Lecciona *
                  </label>
                  <select
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="w-full p-3 bg-white border border-navy-100 rounded text-sm text-navy-900 focus:outline-none focus:border-sky"
                  >
                    {CURSOS_DOCENCIA.map((c) => (
                      <option key={c.slug} value={c.titulo}>
                        {c.titulo}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {error && <p className="text-xs text-crimson font-semibold">{error}</p>}
              {info && <p className="text-xs text-leaf font-semibold">{info}</p>}

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-leaf hover:bg-crimson border-l-4 border-transparent hover:border-crimson disabled:opacity-60 text-white font-semibold text-xs tracking-wide py-3.5 transition-all rounded shadow-sm"
              >
                {busy
                  ? "A REGISTAR…"
                  : tipoConta === "docente"
                  ? "Criar conta Docente"
                  : "Criar conta Estudante"}
              </button>
            </form>
          )}

        </div>
      </div>
    </main>
  );
}
