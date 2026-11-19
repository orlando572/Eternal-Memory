import { Clock, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { homeContact } from "@/features/home/homeContent";

export function HomeContact() {
  const { kicker, title, text, whatsappLabel, emailLabel, scheduleLabel, contact } = homeContact;
  return (
    <section className="home-section home-contact" aria-labelledby="home-contact-title">
      <p className="home-kicker">{kicker}</p>
      <h2 id="home-contact-title">{title}</h2>
      <p className="home-contact-text">{text}</p>
      <div className="home-contact-actions">
        <Button asChild>
          <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer"
            aria-label={`${whatsappLabel} al ${contact.phone}, abre una pestaña nueva`}>
            <MessageCircle size={18} aria-hidden="true" />{whatsappLabel}
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={`mailto:${contact.email}`} aria-label={`${emailLabel} a ${contact.email}`}>
            <Mail size={18} aria-hidden="true" />{emailLabel}
          </a>
        </Button>
      </div>
      <p className="home-contact-hours"><Clock size={17} aria-hidden="true" />{scheduleLabel}: {contact.schedule}</p>
    </section>
  );
}
