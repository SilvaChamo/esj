"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  COURSES,
  DELEGACOES,
  DOCUMENT_FIELDS,
  ESTADOS_CIVIS,
  PROVINCIAS,
  SEXOS,
  SHIFTS,
} from "@/lib/inscricao";

type FileMap = Record<string, File | null>;

const emptyFiles = DOCUMENT_FIELDS.reduce((acc, doc) => {
  acc[doc.id] = null;
  return acc;
}, {} as FileMap);

const STEPS = [
  { title: "Curso pretendido", tab: "Curso", docs: [] as string[] },
  { title: "Identificação", tab: "Identificação", docs: ["bi", "foto"] },
  { title: "Contacto e residência", tab: "Contacto", docs: [] as string[] },
  {
    title: "Habilitações literárias",
    tab: "Habilitações",
    docs: ["certificado", "nascimento", "equivalencia"],
  },
  { title: "Declaração", tab: "Declaração", docs: ["pagamento"] },
];

function protocolNumber() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `ESJ-2026-${n}`;
}

export default function InscricaoForm() {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<FileMap>(emptyFiles);
  const [course1, setCourse1] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState("");
  const last = step === STEPS.length - 1;

  const onFile = (id: string, file: File | null) => {
    if (file && file.size > 5 * 1024 * 1024) {
      setError(`O ficheiro “${file.name}” ultrapassa 5 MB.`);
      return;
    }
    setError("");
    setFiles((prev) => ({ ...prev, [id]: file }));
  };

  const goNext = () => {
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!last) {
      goNext();
      return;
    }
    setError("");
    setSubmitted(protocolNumber());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    return (
      <div className="border border-navy-100 bg-white p-8 md:p-12">
        <p className="text-leaf font-semibold text-sm">Pré-inscrição recebida</p>
        <h2 className="font-serif text-3xl font-bold text-navy-900 mt-2">
          Guarde o número de protocolo
        </h2>
        <p className="mt-6 font-serif text-2xl text-sky">{submitted}</p>
        <p className="mt-4 text-sm text-navy-900/70 leading-relaxed max-w-xl">
          A Secretaria Académica vai conferir os documentos. Use este número em
          qualquer contacto sobre a candidatura ao ano lectivo 2026.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/edital"
            className="bg-navy-800 hover:bg-crimson text-white font-semibold text-xs tracking-wide px-5 py-3 transition-colors"
          >
            VOLTAR AO EDITAL
          </Link>
          <Link
            href="/"
            className="border border-navy-800 text-navy-800 hover:bg-navy-800 hover:text-white font-semibold text-xs tracking-wide px-5 py-3 transition-colors"
          >
            IR AO INÍCIO
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <nav aria-label="Etapas da pré-inscrição" className="bg-white border border-navy-100 border-b-0">
        <ul className="flex overflow-x-auto">
          {STEPS.map((item, i) => (
            <li key={item.tab} className="flex-1 min-w-max">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep(i);
                }}
                aria-current={i === step ? "step" : undefined}
                className={`w-full px-4 py-3.5 text-sm font-bold text-center whitespace-nowrap border-b-2 transition-colors ${
                  i === step
                    ? "text-leaf border-leaf"
                    : "text-navy-900/60 border-transparent hover:text-navy-900/85"
                }`}
              >
                {item.tab}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <form noValidate onSubmit={onSubmit} className="border border-navy-100 bg-white">
        <div className="px-6 md:px-10 py-8 md:py-10">
        <h2 className="font-serif text-2xl font-bold text-navy-900 mb-6">{STEPS[step].title}</h2>

        <div data-step="0" className={step === 0 ? "space-y-6" : "hidden"}>
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Primeira opção" required>
              <select
                required={step === 0}
                value={course1}
                onChange={(e) => setCourse1(e.target.value)}
                className="esj-field"
              >
                <option value="">Seleccione o curso</option>
                {COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Segunda opção">
              <select name="curso2" className="esj-field">
                <option value="">Nenhuma</option>
                {COURSES.filter((c) => c !== course1).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Turno" required>
              <select name="turno" required={step === 0} className="esj-field">
                <option value="">Seleccione</option>
                {SHIFTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ano lectivo">
              <input className="esj-field bg-cream" value="2026" readOnly />
            </Field>
            <Field label="Delegação" required className="md:col-span-2">
              <select name="delegacao" required={step === 0} className="esj-field">
                <option value="">Seleccione a delegação</option>
                {DELEGACOES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div data-step="1" className={step === 1 ? "space-y-6" : "hidden"}>
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Nome completo" required className="md:col-span-2">
              <input name="nome" required={step === 1} autoComplete="name" className="esj-field" />
            </Field>
            <Field label="Nome do pai" required>
              <input name="pai" required={step === 1} className="esj-field" />
            </Field>
            <Field label="Nome da mãe" required>
              <input name="mae" required={step === 1} className="esj-field" />
            </Field>
            <Field label="Sexo" required>
              <select name="sexo" required={step === 1} className="esj-field">
                <option value="">Seleccione</option>
                {SEXOS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Estado civil" required>
              <select name="estadoCivil" required={step === 1} className="esj-field">
                <option value="">Seleccione</option>
                {ESTADOS_CIVIS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Data de nascimento" required>
              <input name="nascimento" type="date" required={step === 1} className="esj-field" />
            </Field>
            <Field label="Nacionalidade" required>
              <input
                name="nacionalidade"
                required={step === 1}
                defaultValue="Moçambicana"
                className="esj-field"
              />
            </Field>
            <Field label="Naturalidade (província)" required>
              <select name="naturalidade" required={step === 1} className="esj-field">
                <option value="">Seleccione</option>
                {PROVINCIAS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="N.º do BI ou Passaporte" required>
              <input name="bi" required={step === 1} className="esj-field" />
            </Field>
            <Field label="Validade do documento" required>
              <input name="biValidade" type="date" required={step === 1} className="esj-field" />
            </Field>
            <Field label="NUIT">
              <input name="nuit" className="esj-field" />
            </Field>
          </div>
          <Attachments ids={STEPS[1].docs} files={files} onFile={onFile} active={step === 1} />
        </div>

        <div data-step="2" className={step === 2 ? "space-y-6" : "hidden"}>
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Telemóvel" required>
              <input name="telefone" type="tel" required={step === 2} autoComplete="tel" className="esj-field" />
            </Field>
            <Field label="Telemóvel alternativo">
              <input name="telefone2" type="tel" className="esj-field" />
            </Field>
            <Field label="Correio electrónico" required className="md:col-span-2">
              <input name="email" type="email" required={step === 2} autoComplete="email" className="esj-field" />
            </Field>
            <Field label="Província de residência" required>
              <select name="provincia" required={step === 2} className="esj-field">
                <option value="">Seleccione</option>
                {PROVINCIAS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Distrito / município" required>
              <input name="distrito" required={step === 2} className="esj-field" />
            </Field>
            <Field label="Bairro, avenida ou rua" required className="md:col-span-2">
              <input name="morada" required={step === 2} className="esj-field" />
            </Field>
          </div>
        </div>

        <div data-step="3" className={step === 3 ? "space-y-6" : "hidden"}>
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Escola de proveniência" required className="md:col-span-2">
              <input name="escola" required={step === 3} className="esj-field" />
            </Field>
            <Field label="Ano de conclusão da 12.ª classe" required>
              <input
                name="anoConclusao"
                type="number"
                min="1990"
                max="2026"
                required={step === 3}
                className="esj-field"
              />
            </Field>
            <Field label="Média final" required>
              <input
                name="media"
                type="number"
                min="10"
                max="20"
                step="0.1"
                required={step === 3}
                className="esj-field"
              />
            </Field>
            <p className="md:col-span-2 text-sm text-navy-900/65 leading-relaxed">
              Os exames de admissão da ESJ são em Português e História, para todas as licenciaturas.
            </p>
          </div>
          <Attachments ids={STEPS[3].docs} files={files} onFile={onFile} active={step === 3} />
        </div>

        <div data-step="4" className={step === 4 ? "space-y-6" : "hidden"}>
          <label className="flex items-start gap-3 text-sm text-navy-900/80 leading-relaxed">
            <input type="checkbox" required={step === 4} className="mt-1 accent-leaf shrink-0" />
            <span>
              Declaro que os dados e documentos apresentados são verdadeiros e assumo as
              consequências legais de qualquer falsidade, nos termos do edital de admissão da ESJ.
            </span>
          </label>
          <Attachments ids={STEPS[4].docs} files={files} onFile={onFile} active={step === 4} />
        </div>

        {error && (
          <p className="mt-6 text-sm text-crimson" role="alert">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="border border-navy-800 text-navy-800 hover:bg-navy-800 hover:text-white font-semibold text-xs tracking-wide px-6 py-3.5 transition-colors"
            >
              ANTERIOR
            </button>
          )}
          {last ? (
            <button
              type="submit"
              className="bg-sky hover:bg-crimson text-white font-semibold text-xs tracking-wide px-8 py-3.5 transition-colors"
            >
              SUBMETER PRÉ-INSCRIÇÃO
            </button>
          ) : (
            <button
              type="submit"
              className="bg-sky hover:bg-crimson text-white font-semibold text-xs tracking-wide px-8 py-3.5 transition-colors"
            >
              SEGUINTE
            </button>
          )}
          <Link
            href="/edital"
            className="text-sm text-navy-800 hover:text-crimson underline-offset-4 hover:underline"
          >
            Voltar ao edital
          </Link>
        </div>
      </div>
    </form>
    </div>
  );
}

function Attachments({
  ids,
  files,
  onFile,
  active,
}: {
  ids: string[];
  files: FileMap;
  onFile: (id: string, file: File | null) => void;
  active: boolean;
}) {
  const docs = DOCUMENT_FIELDS.filter((d) => ids.includes(d.id));
  if (!docs.length) return null;

  return (
    <div className="border-t border-navy-100 pt-6">
      <h3 className="font-serif text-lg font-bold text-navy-900 mb-1">Anexos desta página</h3>
      <p className="text-sm text-navy-900/60 mb-4">PDF, JPG ou PNG até 5 MB.</p>
      <div className="space-y-4">
        {docs.map((doc) => (
          <label key={doc.id} className="block">
            <span className="block text-sm font-bold text-navy-900 mb-1">
              {doc.label}
              {doc.required ? " *" : " (facultativo)"}
            </span>
            <span className="block text-xs text-navy-900/55 mb-2">{doc.hint}</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              required={active && doc.required}
              className="esj-field-file"
              onChange={(e) => onFile(doc.id, e.target.files?.[0] ?? null)}
            />
            {files[doc.id] && (
              <span className="mt-1 block text-xs text-leaf">{files[doc.id]?.name}</span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-bold text-navy-900 mb-1.5">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}
