import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function VoltarBanner({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mt-4 inline-flex items-center gap-2 text-leaf font-semibold text-sm hover:text-white transition-colors"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/40">
        <ArrowLeft size={14} className="text-white" />
      </span>
      {label}
    </Link>
  );
}
