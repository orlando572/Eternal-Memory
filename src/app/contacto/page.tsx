import type { Metadata } from "next";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { footerContact } from "@/features/footer/footerContent";
import { ContactForm } from "@/features/site/components/ContactForm";
import { InfoPage } from "@/features/site/components/InfoPage";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos por WhatsApp o llámanos para resolver tus dudas sobre productos, grabado o envíos.",
  alternates: { canonical: "/contacto" },
};

export default function ContactPage() {
  return <InfoPage kicker="Contacto" heading="Estamos para orientarte" intro="Escríbenos o llámanos y resolvemos tus dudas sobre productos, opciones de grabado o entrega, a tu ritmo.">
    <div className="contact-layout">
      <section className="info-section" aria-labelledby="contact-channels-title">
        <h2 id="contact-channels-title">Nuestros canales</h2>
        <ul className="contact-channels">
          <li><MessageCircle size={20} aria-hidden="true" /><div><span>WhatsApp</span><a href={footerContact.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label={`Escribir por WhatsApp al ${footerContact.phone}, abre una pestaña nueva`}>{footerContact.phone}</a></div></li>
          <li><Phone size={20} aria-hidden="true" /><div><span>Teléfono</span><a href={footerContact.phoneHref}>{footerContact.phone}</a></div></li>
          <li><Clock size={20} aria-hidden="true" /><div><span>Horario de atención</span><p>{footerContact.schedule}</p></div></li>
          <li><MapPin size={20} aria-hidden="true" /><div><span>Ubicación</span><p>{footerContact.location}</p></div></li>
        </ul>
      </section>
      <section className="info-section" aria-labelledby="contact-form-title">
        <h2 id="contact-form-title">Envíanos tu consulta</h2>
        <ContactForm whatsappUrl={footerContact.whatsappUrl} />
      </section>
    </div>
  </InfoPage>;
}
