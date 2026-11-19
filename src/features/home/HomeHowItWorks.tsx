import Image from "next/image";
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
  const { kicker, title, intro, steps, image, referenceNote } = homeHowItWorks;
  return (
    <section className="home-section home-how" aria-labelledby="home-how-title">
      <HomeSectionIntro id="home-how-title" kicker={kicker} title={title} intro={intro} />
      <div className="home-how-layout">
        <div className="home-how-image">
          <Image src={image.src} width={image.width} height={image.height} alt={image.alt} sizes="(max-width: 900px) 92vw, 340px" />
          {image.isReference && <span className="home-banner-note">{referenceNote}</span>}
        </div>
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
      </div>
    </section>
  );
}
