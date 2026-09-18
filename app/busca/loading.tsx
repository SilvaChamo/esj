import PaginaCarregando from "@/components/PaginaCarregando";

export default function Loading() {
  return (
    <PaginaCarregando
      kicker="PESQUISA"
      title="Resultados da Busca"
      texto="A carregar a pesquisa…"
    />
  );
}
