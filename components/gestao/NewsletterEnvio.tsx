"use client";

export default function NewsletterEnvio({ onAction: _onAction }: { onAction: (m: string) => void }) {
  return (
    <div className="bg-white border border-navy-100 p-8">
      <h2 className="font-serif text-2xl font-bold text-navy-900">Newsletter</h2>
      <p className="mt-3 text-sm text-navy-900/65 leading-relaxed max-w-xl">
        Em breve. Os envios da newsletter serão feitos a partir deste ecrã.
      </p>
    </div>
  );
}
