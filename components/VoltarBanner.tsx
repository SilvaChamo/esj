import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function VoltarBanner({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group mt-4 inline-flex items-center gap-2 text-leaf font-semibold text-sm hover:text-crimson transition-colors"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/40 group-hover:border-crimson transition-colors">
        <ArrowLeft size={14} className="text-white group-hover:text-crimson transition-colors" />
      </span>
      {label}
    </Link>
  );
}
