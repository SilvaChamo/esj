import BannerInterior from "@/components/BannerInterior";
import { CarregandoTexto } from "@/components/Carregando";

/**
 * Estado de carregamento padrão com o BannerInterior já visível.
 * Usar nos ficheiros loading.tsx de cada rota pública para que
 * o cabeçalho e o banner apareçam imediatamente enquanto o
 * conteúdo da página carrega.
 */
export default function PaginaCarregando({
  kicker = "ESJ",
  title = "Escola Superior de Jornalismo",
  texto = "A carregar…",
}: {
  kicker?: string;
  title?: string;
  texto?: string;
}) {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker={kicker}
        title={title}
        busca={false}
      />
      <section className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <div className="bg-white border border-navy-100">
          <CarregandoTexto texto={texto} />
        </div>
      </section>
    </main>
  );
}
