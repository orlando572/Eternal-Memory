import type { Metadata } from "next";
import Link from "next/link";
import { aboutPage } from "@/features/site/content/siteContent";
import { ContentSections } from "@/features/site/components/ContentSections";
import { InfoPage } from "@/features/site/components/InfoPage";

export const metadata: Metadata = { title: aboutPage.title, description: aboutPage.description, alternates: { canonical: aboutPage.path } };

export default function AboutPage() {
  return <InfoPage kicker="Eternal Memory" heading={aboutPage.heading} intro={aboutPage.intro}>
    <ContentSections sections={aboutPage.sections} />
    <p className="info-links"><Link href="/envios">Zonas y tarifas de envío</Link><Link href="/contacto">Hablar con nosotros</Link></p>
  </InfoPage>;
}
