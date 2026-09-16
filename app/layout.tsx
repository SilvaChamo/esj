import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { SlideProgressProvider } from "@/components/SlideProgressContext";

const libreBaskerville = localFont({
  src: [
    {
      path: "./Libre_Baskerville/LibreBaskerville-VariableFont_wght.ttf",
      weight: "400 700",
      style: "normal",
    },
    {
      path: "./Libre_Baskerville/LibreBaskerville-Italic-VariableFont_wght.ttf",
      weight: "400 700",
      style: "italic",
    },
  ],
  variable: "--font-libre-baskerville",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ESJ | Escola Superior de Jornalismo",
  description:
    "Escola Superior de Jornalismo (ESJ) — instituição pública de ensino superior em Moçambique, desde 2008. Cursos de Jornalismo, Publicidade e Marketing, Relações Públicas e Biblioteconomia e Documentação.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-MZ">
      <body className={`${libreBaskerville.variable} font-sans bg-cream`}>
        <SlideProgressProvider>
          <SiteChrome>{children}</SiteChrome>
        </SlideProgressProvider>
      </body>
    </html>
  );
}
