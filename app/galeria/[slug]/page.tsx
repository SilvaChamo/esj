import GaleriaAlbumClient from "@/components/GaleriaAlbumClient";

export const metadata = {
  title: "Álbum | Galeria ESJ",
};

export default function GaleriaAlbumPage({ params }: { params: { slug: string } }) {
  return <GaleriaAlbumClient slug={params.slug} />;
}
