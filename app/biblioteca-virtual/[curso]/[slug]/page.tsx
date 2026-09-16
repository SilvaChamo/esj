import { notFound } from "next/navigation";
import BannerInterior from "@/components/BannerInterior";
import ProjectoCientificoPainel from "@/components/ProjectoCientificoPainel";
import { listProjectosPublicos } from "@/lib/biblioteca-cientifica-cms";
import {
  CURSOS_BIBLIOTECA,
  PROJECTOS_CIENTIFICOS,
  cursoBibliotecaPorSlug,
  labelTipo,
  projectoPorSlug,
  slugsProjectosDoCurso,
} from "@/lib/producao-cientifica";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return CURSOS_BIBLIOTECA.flatMap((curso) =>
    slugsProjectosDoCurso(curso.slug).map((slug) => ({ curso: curso.slug, slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: { curso: string; slug: string };
}) {
  const remotos = await listProjectosPublicos();
  const projecto =
    remotos?.find((p) => p.slug === params.slug) ?? projectoPorSlug(params.slug);
  if (!projecto) return { title: "Projecto | ESJ" };
  return {
    title: `${projecto.titulo} | Produção científica | ESJ`,
    description: projecto.resumo,
  };
}

export default async function ProjectoCientificoPage({
  params,
}: {
  params: { curso: string; slug: string };
}) {
  const curso = cursoBibliotecaPorSlug(params.curso);
  const remotos = await listProjectosPublicos();
  const porSlug = new Map(PROJECTOS_CIENTIFICOS.map((p) => [p.slug, p]));
  if (remotos) {
    for (const p of remotos) porSlug.set(p.slug, p);
  }
  const projecto = porSlug.get(params.slug) ?? null;
  if (!curso || !projecto || projecto.curso !== curso.codigo) notFound();

  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker={curso.titulo}
        title={labelTipo(projecto.tipo)}
        description={`${projecto.ano}${projecto.ramos ? ` · ${projecto.ramos}` : ""}`}
        busca={false}
      />
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-8 md:py-10">
        <ProjectoCientificoPainel projecto={projecto} />
      </div>
    </main>
  );
}
