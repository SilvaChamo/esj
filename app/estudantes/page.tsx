import EstudanteDashboard from "@/components/EstudanteDashboard";

export const metadata = {
  title: "Portal do Estudante | ESJ",
  description: "Portal do estudante da Escola Superior de Jornalismo: materiais de estudo, pautas, calendário e requerimentos.",
};

export default function EstudantesPage() {
  return <EstudanteDashboard initialSection="materiais" />;
}
