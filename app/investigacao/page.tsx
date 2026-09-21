import Link from "next/link";
import BannerInterior from "@/components/BannerInterior";

export const metadata = {
  title: "Investigação | ESJ",
  description: "Linhas de pesquisa, projectos e política científica da Escola Superior de Jornalismo.",
};

const LIGACOES = [
  {
    titulo: "Linhas de Pesquisa",
    href: "/investigacao/linhas-de-pesquisa",
    texto: "Áreas e temas de investigação em curso na ESJ.",
  },
  {
    titulo: "Projectos",
    href: "/investigacao/projectos",
    texto: "Projectos de investigação e parcerias científicas em desenvolvimento.",
  },
  {
    titulo: "Centro de Pesquisa em Ciências da Comunicação da Informação",
    href: "/investigacao/centro-de-pesquisa",
    texto: "Missão, actividades e publicações do centro de pesquisa.",
  },
  {
    titulo: "Biblioteca",
    href: "/biblioteca-virtual",
    texto: "Acervo científico e materiais de apoio à investigação, por curso.",
  },
  {
    titulo: "Política de Investigação",
    href: "/investigacao/politica-de-investigacao",
    texto: "Princípios e regras que orientam a actividade de investigação na ESJ.",
  },
  {
    titulo: "Política de Publicação",
    href: "/investigacao/politica-de-publicacao",
    texto: "Critérios e procedimentos para publicação científica na ESJ.",
  },
];

export default function InvestigacaoPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="INVESTIGAÇÃO"
        title="Investigação"
        description="Linhas de pesquisa, projectos, centro de pesquisa e política científica da Escola Superior de Jornalismo."
      />
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8 grid sm:grid-cols-2 gap-5">
        {LIGACOES.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="esj-card-move bg-white border border-navy-100 p-6 hover:border-sky flex flex-col"
          >
            <h2 className="font-serif text-lg font-bold text-navy-900">{l.titulo}</h2>
            <p className="mt-2 text-sm text-navy-900/65 leading-relaxed">{l.texto}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
