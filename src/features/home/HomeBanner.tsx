"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { homeBanner } from "@/features/home/homeContent";

// Carrusel de mensajes: todo su contenido viene de `homeBanner`.
export function HomeBanner() {
  const { label, autoplayDelayMs, referenceNote, previousLabel, nextLabel, slides } = homeBanner;
  const [autoplay] = useState(() => Autoplay({ delay: autoplayDelayMs, stopOnInteraction: false, stopOnMouseEnter: true }));
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect).on("reInit", onSelect);
    // Sin avance automático para quien pide menos movimiento en su sistema.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = () => (reducedMotion.matches ? autoplay.stop() : autoplay.play());
    applyMotion();
    reducedMotion.addEventListener("change", applyMotion);
    return () => {
      api.off("select", onSelect).off("reInit", onSelect);
      reducedMotion.removeEventListener("change", applyMotion);
    };
  }, [api, autoplay]);

  return (
    <section className="home-section home-banner" aria-label={label}>
      <Carousel setApi={setApi} opts={{ loop: true }} plugins={[autoplay]}>
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id} aria-label={`${index + 1} de ${slides.length}`}>
              <div className="home-banner-slide">
                <div className="home-banner-image">
                  <Image src={slide.image.src} width={slide.image.width} height={slide.image.height} alt={slide.image.alt}
                    sizes="(max-width: 900px) 92vw, 46vw" style={slide.image.position ? { objectPosition: slide.image.position } : undefined} />
                  {slide.image.isReference && <span className="home-banner-note">{referenceNote}</span>}
                </div>
                <div className="home-banner-body">
                  <p className="home-kicker">{slide.kicker}</p>
                  <h3 className="home-banner-title">{slide.title}</h3>
                  <p className="home-banner-text">{slide.text}</p>
                  <Button asChild>
                    <Link className="home-banner-action" href={slide.action.href}>{slide.action.label} <ArrowRight size={18} aria-hidden="true" /></Link>
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="home-banner-controls">
          <Button type="button" variant="outline" size="icon" className="home-banner-arrow" aria-label={previousLabel} onClick={() => api?.scrollPrev()}><ArrowLeft size={18} aria-hidden="true" /></Button>
          <div className="home-banner-dots">
            {slides.map((slide, index) => (
              <button key={slide.id} type="button" className="home-banner-dot" aria-label={`Ir al mensaje ${index + 1}: ${slide.kicker}`}
                aria-current={index === selected ? "true" : undefined} onClick={() => api?.scrollTo(index)} />
            ))}
          </div>
          <Button type="button" variant="outline" size="icon" className="home-banner-arrow" aria-label={nextLabel} onClick={() => api?.scrollNext()}><ArrowRight size={18} aria-hidden="true" /></Button>
        </div>
      </Carousel>
    </section>
  );
}
