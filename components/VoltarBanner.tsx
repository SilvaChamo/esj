"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

function destinoDe(path: string) {
  const p = path.split("?")[0].replace(/\/$/, "") || "/";
  if (p === "/") return { href: "/", label: "Voltar à página inicial" };
  if (p === "/noticias" || p.startsWith("/noticias/")) {
    return { href: "/noticias", label: "Voltar às notícias" };
  }
  if (p === "/videos") return { href: "/videos", label: "Voltar aos vídeos" };
  if (p === "/inscricoes") return { href: "/inscricoes", label: "Voltar às admissões" };
  if (p === "/inscricao") return { href: "/inscricao", label: "Voltar à pré-inscrição" };
  if (p === "/edital") return { href: "/edital", label: "Voltar ao edital" };
  if (p === "/resultados") return { href: "/resultados", label: "Voltar aos resultados" };
  if (p.startsWith("/resultados/")) return { href: "/resultados", label: "Voltar aos cursos" };
  if (p === "/busca") return { href: "/busca", label: "Voltar à pesquisa" };
  return { href: path || "/", label: "Voltar à página anterior" };
}

function origemPadrao(pathname: string) {
  if (pathname.startsWith("/noticias/") && pathname !== "/noticias") {
    return destinoDe("/noticias");
  }
  if (pathname.startsWith("/resultados/") && pathname !== "/resultados") {
    return destinoDe("/resultados");
  }
  if (pathname === "/edital" || pathname === "/inscricao") {
    return destinoDe("/inscricoes");
  }
  if (pathname === "/resultados") {
    return { href: "/#ensino", label: "Voltar ao calendário académico" };
  }
  return destinoDe("/");
}

export default function VoltarBanner() {
  const pathname = usePathname();
  const [dest, setDest] = useState(() => origemPadrao(pathname));

  useEffect(() => {
    const origem = sessionStorage.getItem("esj-origem");
    const mesmoSitio = origem && origem.split("?")[0] !== pathname;
    setDest(mesmoSitio ? destinoDe(origem) : origemPadrao(pathname));
  }, [pathname]);

  return (
    <Link
      href={dest.href}
      className="group mt-4 inline-flex items-center gap-2 text-leaf font-semibold text-sm hover:text-crimson transition-colors"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/40 group-hover:border-crimson transition-colors">
        <ArrowLeft size={14} className="text-white group-hover:text-crimson transition-colors" />
      </span>
      {dest.label}
    </Link>
  );
}
