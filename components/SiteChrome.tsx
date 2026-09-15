"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const anterior = sessionStorage.getItem("esj-pagina");
    if (anterior && anterior !== pathname) {
      sessionStorage.setItem("esj-origem", anterior);
    }
    sessionStorage.setItem("esj-pagina", pathname);
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
