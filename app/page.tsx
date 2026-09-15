import { Suspense } from "react";
import Hero from "@/components/Hero";
import FeatureStrip from "@/components/FeatureStrip";
import About from "@/components/About";
import Academics from "@/components/Academics";
import News from "@/components/News";
import ContactBand from "@/components/ContactBand";
import { CarregandoTexto } from "@/components/Carregando";

export default function Home() {
  return (
    <main>
      <Hero />
      <FeatureStrip />
      <About />
      <Academics />
      <Suspense
        fallback={
          <section className="bg-cream">
            <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
              <div className="bg-white border border-navy-100">
                <CarregandoTexto texto="A carregar as notícias e os vídeos…" />
              </div>
            </div>
          </section>
        }
      >
        <News />
      </Suspense>
      <ContactBand />
    </main>
  );
}
