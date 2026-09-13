import Image from "next/image";
import { Tv, Megaphone, BookOpen, Landmark } from "lucide-react";
import { ChevronRight } from "lucide-react";

const facilities = [
  {
    image: "/televisao.jpeg",
    position: "object-[68%_center]",
    icon: Tv,
    title: "Estúdio de Televisão",
    text: "Prática jornalística em ambiente real de televisão.",
  },
  {
    image: "/Curso-Publicidade-e-Marketing-ESJ.jpg",
    position: "object-center",
    icon: Megaphone,
    title: "Laboratório de Marketing Digital",
    text: "Ferramentas de publicidade e redes sociais.",
  },
  {
    image: "/ESJ-background.png",
    position: "object-center",
    icon: BookOpen,
    title: "Biblioteca",
    text: "Acervo de referência em Ciências da Comunicação.",
  },
  {
    image: "/Graduacao-ESJ.jpg",
    position: "object-[48%_22%]",
    icon: Landmark,
    title: "Auditório",
    text: "Espaço para cerimónias, conferências e eventos.",
  },
];

export default function Facilities() {
  return (
    <section id="extensao" className="mx-auto max-w-7xl px-4 lg:px-8 py-20">
      <p className="text-sky-700 font-semibold tracking-widest text-xs mb-3">INFRAESTRUTURAS</p>
      <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-900 mb-10">
        Infraestruturas ao Serviço da Comunicação
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {facilities.map(({ image, position, icon: Icon, title, text }) => (
          <div key={title} className="group">
            <div className="relative h-52 overflow-hidden">
              <Image
                src={image}
                alt={title}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className={`object-cover ${position} group-hover:scale-105 transition-transform duration-500`}
              />
              <div className="absolute bottom-3 left-3 w-11 h-11 rounded-full bg-sky group-hover:bg-crimson transition-colors flex items-center justify-center shadow-md">
                <Icon size={19} className="text-white" />
              </div>
            </div>
            <div className="bg-white px-1 py-4">
              <div className="font-serif font-bold text-navy-900">{title}</div>
              <p className="text-sm text-navy-900/60 mt-1 leading-relaxed">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <a
          href="#investigacao"
          className="inline-flex items-center gap-2 border border-navy-800 text-navy-900 hover:bg-crimson hover:border-crimson hover:text-white transition-colors font-semibold text-[13px] tracking-wide px-6 py-3"
        >
          VER TODAS AS INFRAESTRUTURAS <ChevronRight size={16} />
        </a>
      </div>
    </section>
  );
}
