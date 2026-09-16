"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function paginaActual(pathname: string) {
  if (typeof window === "undefined") return pathname;
  return pathname + window.location.hash;
}

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const actual = paginaActual(pathname);
    const anterior = sessionStorage.getItem("esj-pagina");
    const anteriorPath = (anterior ?? "").split("#")[0] || "/";
    if (anterior && anteriorPath !== pathname) {
      sessionStorage.setItem("esj-origem", anterior);
    }
    sessionStorage.setItem("esj-pagina", actual);

    const onHash = () => {
      sessionStorage.setItem("esj-pagina", paginaActual(pathname));
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [pathname]);

  if (pathname.startsWith("/gestao") || pathname.startsWith("/entrar")) {
    return <>{children}</>;
  }
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
