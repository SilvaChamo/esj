import Hero from "@/components/Hero";
import FeatureStrip from "@/components/FeatureStrip";
import About from "@/components/About";
import Academics from "@/components/Academics";
import News from "@/components/News";

export default function Home() {
  return (
    <main>
      <Hero />
      <FeatureStrip />
      <About />
      <Academics />
      <News />
    </main>
  );
}
