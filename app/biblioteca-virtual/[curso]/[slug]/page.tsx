import { notFound, redirect } from "next/navigation";
import {
  CURSOS_BIBLIOTECA,
  PROJECTOS_CIENTIFICOS,
  cursoBibliotecaPorSlug,
  projectoPorSlug,
  slugsProjectosDoCurso,
} from "@/lib/producao-cientifica";
import { listProjectosPublicos } from "@/lib/biblioteca-cientifica-cms";

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

/** Leitura passa a popup no acervo; links antigos voltam ao curso. */
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

  redirect(`/biblioteca-virtual/${curso.slug}`);
}
