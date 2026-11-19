"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { buildFloatingUrl, isFloatingContactHidden } from "@/features/contact-float/lib/floatingContact";
import "@/features/contact-float/contact-float.css";

export function WhatsAppFloat({ whatsappUrl, phone }: { whatsappUrl: string; phone: string }) {
  const pathname = usePathname();
  if (isFloatingContactHidden(pathname)) return null;
  return <a
    className="whatsapp-float"
    href={buildFloatingUrl(whatsappUrl)}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`Escribir por WhatsApp al ${phone}, abre una pestaña nueva`}
  >
    <MessageCircle size={26} aria-hidden="true" />
  </a>;
}
