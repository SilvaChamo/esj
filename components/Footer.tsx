import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Phone, MapPin, Youtube } from "lucide-react";

const quickLinks: { label: string; href: string }[] = [
  { label: "Início", href: "/#inicio" },
  { label: "Ensino", href: "/#ensino" },
  { label: "Notícias", href: "/noticias" },
  { label: "Contacto", href: "/#contacto" },
  { label: "Eventos", href: "/#ensino" },
];

const info: { label: string; href?: string }[] = [
  { label: "Edital de Admissão 2026", href: "/edital" },
  { label: "Pré-inscrição", href: "/inscricoes" },
  { label: "Calendário Académico" },
  { label: "Regulamentos" },
  { label: "Minutas (Formulários)" },
  { label: "Plano Estratégico" },
];

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white/80">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16 grid sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-12">
        <div>
          <Link href="/" className="inline-block mb-5">
            <Image
              src="/esj-logo.png"
              alt="Escola Superior de Jornalismo"
              width={160}
              height={160}
              className="h-20 w-20 object-contain rounded-sm bg-white/95 p-1"
            />
          </Link>
          <p className="text-xs leading-relaxed">
            Escola Superior de Jornalismo — instituição pública de ensino superior em Moçambique,
            a formar profissionais de Comunicação desde 2008.
          </p>
          <a
            href="https://esj.edondzo.ac.mz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-sky text-xs font-semibold hover:text-sky-300 hover:underline transition-colors"
          >
            Portal eDondzo →
          </a>
        </div>

        <div>
          <h4 className="text-white font-serif font-bold mb-5 tracking-wide text-sm">LIGAÇÕES RÁPIDAS</h4>
          <ul className="space-y-2.5 text-xs">
            {quickLinks.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="hover:text-sky-300 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/entrar" className="hover:text-sky-300 transition-colors">
                Entrar
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-serif font-bold mb-5 tracking-wide text-sm">INFORMAÇÃO</h4>
          <ul className="space-y-2.5 text-xs">
            {info.map((l) => (
              <li key={l.label}>
                {l.href ? (
                  <Link href={l.href} className="hover:text-sky-300 transition-colors">
                    {l.label}
                  </Link>
                ) : (
                  <span className="text-white/40 cursor-default">{l.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-serif font-bold mb-5 tracking-wide text-sm">CONTACTO</h4>
          <ul className="space-y-4 text-xs">
            <li className="flex gap-3">
              <MapPin size={16} className="shrink-0 mt-0.5 text-sky" />
              <span>
                <strong className="text-white/95 block">Sede</strong>
                Av. 24 de Julho, antiga Escola Industrial, Maputo
              </span>
            </li>
            <li className="flex gap-3">
              <Phone size={16} className="shrink-0 mt-0.5 text-sky" />
              <a href="tel:+25821302721" className="hover:text-sky-300 transition-colors">
                +258 21 302 721
              </a>
            </li>
          </ul>

          <div className="mt-6 flex gap-3">
            <a
              href="https://www.youtube.com/@EscolaSuperiordeJornalismo"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube da ESJ"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#FF0000] hover:bg-[#CC0000] text-white transition-colors"
            >
              <Youtube size={17} strokeWidth={1.75} />
            </a>
            <a
              href="https://www.facebook.com/ESJ.mz"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook da ESJ"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1877F2] hover:bg-[#166FE5] text-white transition-colors"
            >
              <Facebook size={17} strokeWidth={1.75} />
            </a>
            <span
              aria-label="Instagram da ESJ (brevemente)"
              title="Brevemente"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white/40 cursor-default"
            >
              <Instagram size={17} strokeWidth={1.75} />
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/50">
          <p>© 2026 Escola Superior de Jornalismo (ESJ). Todos os direitos reservados.</p>
          <div className="flex gap-5">
            <span className="text-white/40 cursor-default">Política de Privacidade</span>
            <span className="text-white/40 cursor-default">Termos de Uso</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
