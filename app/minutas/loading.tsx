import PaginaCarregando from "@/components/PaginaCarregando";

export default function Loading() {
  return (
    <PaginaCarregando
      kicker="DOCUMENTOS"
      title="Minutas"
      texto="A carregar as minutas…"
    />
  );
}
