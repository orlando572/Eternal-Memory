import { Clock, Coins, PenLine, Truck, type LucideIcon } from "lucide-react";
import { homeSupport, type HomeSupportIcon } from "@/features/home/homeContent";
import { HomeSectionIntro } from "@/features/home/HomeSectionIntro";

const supportIcons: Record<HomeSupportIcon, LucideIcon> = {
  prices: Coins,
  engraving: PenLine,
  delivery: Truck,
  contact: Clock,
};

export function HomeSupport() {
  const { kicker, title, intro, points } = homeSupport;
  return (
    <section className="home-section home-support" aria-labelledby="home-support-title">
      <HomeSectionIntro id="home-support-title" kicker={kicker} title={title} intro={intro} />
      <ul className="home-support-list">
        {points.map((point) => {
          const Icon = supportIcons[point.icon];
          return (
            <li key={point.title}>
              <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
              <h3>{point.title}</h3>
              <p>{point.text}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
