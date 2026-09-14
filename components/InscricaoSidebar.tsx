export default function InscricaoSidebar() {
  return (
    <aside className="space-y-5">
      <div className="bg-navy-800 text-white p-5">
        <h2 className="font-serif font-bold">Secretaria</h2>
        <p className="mt-3 text-sm text-white/75 leading-relaxed">
          Av. 24 de Julho, antiga Escola Industrial, Maputo
        </p>
        <a href="tel:+25821302721" className="mt-3 block text-sm text-sky-300 hover:text-white">
          +258 21 302 721
        </a>
        <a
          href="https://esj.edondzo.ac.mz"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-sm text-sky-300 hover:text-white"
        >
          Portal eDondzo
        </a>
      </div>
    </aside>
  );
}
