import type { ContentSection } from "@/features/site/content/siteContent";

export function ContentSections({ sections }: { sections: ContentSection[] }) {
  return <div className="info-sections">
    {sections.map((section) => <section key={section.title} className="info-section">
      <h2>{section.title}</h2>
      <p>{section.text}</p>
    </section>)}
  </div>;
}
