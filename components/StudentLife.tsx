import Image from "next/image";
import { ChevronRight } from "lucide-react";

const photos = [
  { src: "/Graduacao-ESJ.jpg", position: "object-[50%_30%]", caption: "Cerimónia de Graduação" },
  { src: "/curso-jornalismo-ESJ.jpg", position: "object-center", caption: "Prática em Jornalismo" },
  { src: "/Graduacao-ESJ.jpg", position: "object-[70%_50%]", caption: "Semana da Comunicação" },
  { src: "/ESJ-background.jpg", position: "object-center", caption: "Investigação & Biblioteca" },
  { src: "/Curso-Publicidade-e-Marketing-ESJ.jpg", position: "object-center", caption: "ESJ TV & Marketing" },
];

export default function StudentLife() {
  return (
    <section id="galeria" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-sky-700 font-semibold tracking-widest text-xs mb-3">VIDA ACADÉMICA</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-900">
              Para Além da Sala de Aula
            </h2>
          </div>
          <a
            href="#galeria"
            className="inline-flex items-center gap-2 border border-navy-800 text-navy-900 hover:bg-crimson hover:border-crimson hover:text-white transition-colors font-semibold text-[13px] tracking-wide px-5 py-2.5"
          >
            VER GALERIA <ChevronRight size={16} />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {photos.map((p, i) => (
            <div key={i} className="relative h-40 sm:h-48 overflow-hidden group">
              <Image
                src={p.src}
                alt={p.caption}
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                className={`object-cover ${p.position} group-hover:scale-105 transition-transform duration-500`}
              />
              <div className="absolute inset-0 bg-crimson/0 group-hover:bg-crimson/50 transition-colors flex items-end p-3">
                <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  {p.caption}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
