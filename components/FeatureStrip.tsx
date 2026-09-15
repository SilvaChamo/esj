import { Landmark, Users, MapPinned, Radio } from "lucide-react";

const features = [
  {
    icon: Landmark,
    title: "Ensino Superior Público",
    text: "Instituição pública de ensino, fundada em 2008.",
  },
  {
    icon: Users,
    title: "Corpo Docente Qualificado",
    text: "Docentes experientes nas Ciências da Comunicação.",
  },
  {
    icon: MapPinned,
    title: "Duas Delegações",
    text: "Sede em Maputo e delegação académica em Manica.",
  },
  {
    icon: Radio,
    title: "Estúdios e Redação",
    text: "Prática em televisão, rádio e imprensa na ESJ.",
  },
];

export default function FeatureStrip() {
  return (
    <div className="relative z-10 -mt-14 mx-auto max-w-7xl px-4 lg:px-8">
      <div className="esj-entrada-hero esj-entrada-hero-atraso">
        <div className="bg-white shadow-xl rounded-sm px-0 py-2 lg:py-8 grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[#B8C5DB]">
        {features.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex flex-col items-start gap-2 px-5 md:px-7 py-4 lg:py-1">
            <Icon className="text-sky" size={26} strokeWidth={1.75} />
            <div className="font-serif font-bold text-sm text-navy-900 leading-snug">{title}</div>
            <div className="text-xs text-navy-900/60 leading-snug min-h-[2.5rem]">{text}</div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
