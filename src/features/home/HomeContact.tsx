import Link from "next/link";
import { Clock, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { homeContact } from "@/features/home/homeContent";

export function HomeContact() {
  const { kicker, title, text, whatsappLabel, contactPageLabel, scheduleLabel, contact } = homeContact;
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
          <Link href="/contacto">
            <Mail size={18} aria-hidden="true" />{contactPageLabel}
          </Link>
        </Button>
      </div>
      <p className="home-contact-hours"><Clock size={17} aria-hidden="true" />{scheduleLabel}: {contact.schedule}</p>
    </section>
  );
}
