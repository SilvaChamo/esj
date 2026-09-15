import BannerInterior from "@/components/BannerInterior";
import ContactBand from "@/components/ContactBand";

export const metadata = {
  title: "Contacto | ESJ",
  description:
    "Contacte a Escola Superior de Jornalismo — morada, telefone, formulário e newsletter.",
};

export default function ContactoPage() {
  return (
    <main className="bg-cream min-h-[70vh]">
      <BannerInterior
        kicker="ESJ"
        title="Contacto"
        description="Fale com a Secretaria Académica ou subscreva a nossa newsletter."
      />
      <ContactBand />
    </main>
  );
}
