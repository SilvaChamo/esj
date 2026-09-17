"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cursoBibliotecaPorSlug } from "@/lib/producao-cientifica";

function normalizar(path: string) {
  return path.split("?")[0].replace(/\/$/, "") || "/";
}

function voltar(artigo: "a" | "à" | "ao" | "às" | "aos", nome: string) {
  return `Voltar ${artigo} ${nome}`;
}

/**
 * Hierarquia a partir da Home.
 * Ex.: Home > acervo > Jornalismo > projecto — ao voltar sobe um nível.
 */
function destinoHierarquico(pathname: string) {
  const p = normalizar(pathname);

  if (p.startsWith("/biblioteca-virtual/")) {
    const partes = p.split("/").filter(Boolean);
    if (partes.length >= 3) {
      const curso = cursoBibliotecaPorSlug(partes[1] ?? "");
      return {
        href: `/biblioteca-virtual/${partes[1]}`,
        label: voltar("a", curso?.titulo ?? "curso"),
      };
    }
    return { href: "/biblioteca-virtual", label: voltar("ao", "acervo") };
  }

  if (p === "/biblioteca-virtual") {
    return { href: "/", label: voltar("à", "Home") };
  }

  if (p.startsWith("/noticias/") && p !== "/noticias") {
    return { href: "/noticias", label: voltar("às", "notícias") };
  }
  if (p === "/noticias") {
    return { href: "/", label: voltar("à", "Home") };
  }

  if (p.startsWith("/galeria/") && p !== "/galeria") {
    return { href: "/galeria", label: voltar("à", "galeria") };
  }
  if (p === "/galeria") {
    return { href: "/", label: voltar("à", "Home") };
  }

  if (p.startsWith("/resultados/") && p !== "/resultados") {
    return { href: "/resultados", label: voltar("aos", "resultados") };
  }
  if (p === "/resultados") {
    return { href: "/inscricoes", label: voltar("às", "admissões") };
  }

  if (p.startsWith("/cursos/")) {
    return { href: "/#ensino", label: voltar("ao", "Ensino") };
  }

  if (p === "/edital" || p === "/inscricao") {
    return { href: "/inscricoes", label: voltar("às", "admissões") };
  }
  if (p === "/inscricoes") {
    return { href: "/", label: voltar("à", "Home") };
  }

  if (p === "/docencia/partilhar") {
    return { href: "/docencia", label: voltar("à", "docência") };
  }

  if (
    p === "/calendario" ||
    p === "/documentos" ||
    p === "/docencia" ||
    p === "/estudantes-internacionais"
  ) {
    return { href: "/#ensino", label: voltar("ao", "Ensino") };
  }

  if (p === "/videos" || p === "/contacto" || p === "/busca") {
    return { href: "/", label: voltar("à", "Home") };
  }

  return { href: "/", label: voltar("à", "Home") };
}

export default function VoltarBanner({ className }: { className?: string }) {
  const pathname = usePathname();
  const dest = destinoHierarquico(pathname);

  return (
    <Link
      href={dest.href}
      className={`group inline-flex items-center gap-2 text-sky font-semibold text-sm hover:text-crimson transition-colors ${
        className ?? "mt-4"
      }`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sky group-hover:border-crimson transition-colors">
        <ArrowLeft size={14} className="text-sky group-hover:text-crimson transition-colors" />
      </span>
      {dest.label}
    </Link>
  );
}
