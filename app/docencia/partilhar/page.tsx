import DocenciaDashboard from "@/components/DocenciaDashboard";

export const metadata = {
  title: "Publicar Material | Docência | ESJ",
  description: "Publicação de pautas, livros e recursos de ensino para os cursos da ESJ.",
};

export default function DocenciaPartilharPage() {
  return <DocenciaDashboard initialSection="partilhar" />;
}
