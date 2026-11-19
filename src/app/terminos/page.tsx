import type { Metadata } from "next";
import { termsPage } from "@/features/site/content/siteContent";
import { ContentSections } from "@/features/site/components/ContentSections";
import { InfoPage } from "@/features/site/components/InfoPage";

export const metadata: Metadata = { title: termsPage.title, description: termsPage.description, alternates: { canonical: termsPage.path } };

export default function TermsPage() {
  return <InfoPage kicker="Información legal" heading={termsPage.heading} intro={termsPage.intro}>
    <ContentSections sections={termsPage.sections} />
  </InfoPage>;
}
