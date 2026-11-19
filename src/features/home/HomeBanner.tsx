import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { homeBanner } from "@/features/home/homeContent";

// Una sola franja estática: todo su contenido viene de `homeBanner`.
export function HomeBanner() {
  const { kicker, title, text, action, image, referenceNote } = homeBanner;
  return (
    <section className="home-section home-banner" aria-labelledby="home-banner-title">
      <div className="home-banner-image">
        <Image src={image.src} width={image.width} height={image.height} alt={image.alt}
          sizes="(max-width: 900px) 92vw, 46vw" />
        {image.isReference && <span className="home-banner-note">{referenceNote}</span>}
      </div>
      <div className="home-banner-body">
        <p className="home-kicker">{kicker}</p>
        <h2 id="home-banner-title">{title}</h2>
        <p className="home-banner-text">{text}</p>
        <Button asChild>
          <Link className="home-banner-action" href={action.href}>{action.label} <ArrowRight size={18} aria-hidden="true" /></Link>
        </Button>
      </div>
    </section>
  );
}
