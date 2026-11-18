import { ClipboardCheck, PenLine, Search, ShoppingBag, type LucideIcon } from "lucide-react";
import { homeHowItWorks, type HomeStepIcon } from "@/features/home/homeContent";
import { HomeSectionIntro } from "@/features/home/HomeSectionIntro";

const stepIcons: Record<HomeStepIcon, LucideIcon> = {
  explore: Search,
  choose: ShoppingBag,
  review: PenLine,
  confirm: ClipboardCheck,
};

export function HomeHowItWorks() {
  const { kicker, title, intro, steps } = homeHowItWorks;
  return (
    <section className="home-section home-how" aria-labelledby="home-how-title">
      <HomeSectionIntro id="home-how-title" kicker={kicker} title={title} intro={intro} />
      <ol className="home-steps">
        {steps.map((step, index) => {
          const Icon = stepIcons[step.icon];
          return (
            <li className="home-step" key={step.title}>
              <div className="home-step-marker">
                <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
