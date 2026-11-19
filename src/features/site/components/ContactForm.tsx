"use client";

import { useId, useState, type FormEvent } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildWhatsAppUrl, CONTACT_MESSAGE_MAX, CONTACT_NAME_MAX, readContactInput, type ContactErrors } from "@/features/site/lib/whatsapp";

export function ContactForm({ whatsappUrl }: { whatsappUrl: string }) {
  const id = useId();
  const [errors, setErrors] = useState<ContactErrors>({});
  const [openedUrl, setOpenedUrl] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input = readContactInput(String(data.get("name") ?? ""), String(data.get("message") ?? ""));
    if (!input.ok) {
      setErrors(input.errors);
      setOpenedUrl(null);
      event.currentTarget.querySelector<HTMLElement>(input.errors.name ? "[name=name]" : "[name=message]")?.focus();
      return;
    }
    setErrors({});
    const url = buildWhatsAppUrl(whatsappUrl, input.value);
    setOpenedUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return <form className="contact-form" onSubmit={submit} noValidate>
    <div>
      <label htmlFor={`${id}-name`}>Tu nombre</label>
      <Input id={`${id}-name`} name="name" autoComplete="name" maxLength={CONTACT_NAME_MAX} required aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? `${id}-name-error` : undefined} />
      {errors.name && <p id={`${id}-name-error`} className="contact-error" role="alert">{errors.name}</p>}
    </div>
    <div>
      <label htmlFor={`${id}-message`}>Tu consulta</label>
      <Textarea id={`${id}-message`} name="message" rows={5} maxLength={CONTACT_MESSAGE_MAX} required aria-invalid={errors.message ? true : undefined} aria-describedby={errors.message ? `${id}-message-error` : `${id}-hint`} />
      {errors.message && <p id={`${id}-message-error`} className="contact-error" role="alert">{errors.message}</p>}
    </div>
    <p id={`${id}-hint`} className="contact-hint">Al continuar se abre WhatsApp con tu mensaje ya escrito. Solo nos llega cuando pulses «Enviar» en WhatsApp; no guardamos lo que escribes aquí.</p>
    <Button type="submit"><MessageCircle size={18} aria-hidden="true" />Continuar en WhatsApp</Button>
    {openedUrl && <p className="contact-status" role="status">
      Abrimos WhatsApp con tu mensaje. En esa página elige «Abrir aplicación» o «Continuar en WhatsApp Web» (no «Log In», que no conserva el mensaje) y pulsa «Enviar». Si no se abrió, <a href={openedUrl} target="_blank" rel="noopener noreferrer">usa este enlace</a>.
    </p>}
  </form>;
}
