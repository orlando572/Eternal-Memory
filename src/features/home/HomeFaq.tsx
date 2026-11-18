import { ChevronDown } from "lucide-react";
import { homeFaq } from "@/features/home/homeContent";
import { HomeSectionIntro } from "@/features/home/HomeSectionIntro";

export function HomeFaq() {
  const { kicker, title, intro, items } = homeFaq;
  return (
    <section className="home-section home-faq" aria-labelledby="home-faq-title">
      <HomeSectionIntro id="home-faq-title" kicker={kicker} title={title} intro={intro} />
      <div className="home-faq-list">
        {items.map((item) => (
          <details className="home-faq-item" key={item.id}>
            <summary>
              <span>{item.question}</span>
              <ChevronDown size={20} aria-hidden="true" />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
