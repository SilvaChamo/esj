import Hero from "@/components/Hero";
import FeatureStrip from "@/components/FeatureStrip";
import About from "@/components/About";
import Academics from "@/components/Academics";
import News from "@/components/News";
import ContactBand from "@/components/ContactBand";

export default function Home() {
  return (
    <main>
      <Hero />
      <FeatureStrip />
      <About />
      <Academics />
      <News />
      <ContactBand />
    </main>
  );
}
