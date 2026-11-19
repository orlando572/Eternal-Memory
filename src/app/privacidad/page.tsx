import type { Metadata } from "next";
import { privacyPage } from "@/features/site/content/siteContent";
import { ContentSections } from "@/features/site/components/ContentSections";
import { InfoPage } from "@/features/site/components/InfoPage";

export const metadata: Metadata = { title: privacyPage.title, description: privacyPage.description, alternates: { canonical: privacyPage.path } };

export default function PrivacyPage() {
  return <InfoPage kicker="Información legal" heading={privacyPage.heading} intro={privacyPage.intro}>
    <ContentSections sections={privacyPage.sections} />
  </InfoPage>;
}
