import DocenciaDashboard from "@/components/DocenciaDashboard";

export const metadata = {
  title: "Painel do Docente | ESJ",
  description: "Painel de administração e gestão de materiais académicos para docentes da ESJ.",
};

export default function DocenciaPage() {
  return <DocenciaDashboard initialSection="materiais" />;
}
