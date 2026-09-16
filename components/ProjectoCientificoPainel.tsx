"use client";

import type { ProjectoCientifico } from "@/lib/producao-cientifica";
import LeitorDocumento from "@/components/LeitorDocumento";

export default function ProjectoCientificoPainel({
  projecto,
  onClose,
}: {
  projecto: ProjectoCientifico;
  onClose?: () => void;
}) {
  const ficheiro = projecto.ficheiro;

  if (!ficheiro) {
    return (
      <div className="bg-white border border-navy-100 px-6 py-16 text-center">
        <p className="text-sm text-navy-900/55 italic">
          O ficheiro deste trabalho ainda não está disponível para leitura.
        </p>
      </div>
    );
  }

  return (
    <LeitorDocumento
      url={ficheiro}
      title={projecto.titulo}
      modo={onClose ? "modal" : "pagina"}
      stickyTop={!onClose}
      onClose={onClose}
    />
  );
}
