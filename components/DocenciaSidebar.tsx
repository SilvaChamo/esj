// components/DocenciaSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Sidebar for the Docência page.
 * Provides quick navigation for faculty members.
 */
export default function DocenciaSidebar() {
  const pathname = usePathname();
  const linkClass = (href: string) =>
    `block py-2 px-3 rounded hover:bg-cream/50 text-sm ${
      pathname === href ? "bg-leaf text-white" : "text-navy-900"
    }`;

  return (
    <aside className="w-64 flex-shrink-0 border-r border-navy-100 bg-cream p-4">
      <nav>
        <Link href="/docencia" className={linkClass("/docencia")}>Materiais</Link>
        <Link href="/docencia/partilhar" className={linkClass("/docencia/partilhar")}>Partilhar</Link>
        {/* Add more links here as needed */}
      </nav>
    </aside>
  );
}
