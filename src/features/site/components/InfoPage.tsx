import type { ReactNode } from "react";
import "@/features/site/site-pages.css";

export function InfoPage({ kicker, heading, intro, children }: { kicker: string; heading: string; intro: string; children: ReactNode }) {
  return (
    <main id="main-content" className="shop-page info-page">
      <header className="shop-heading">
        <div className="shop-container">
          <p className="info-kicker">{kicker}</p>
          <h1>{heading}</h1>
          <p>{intro}</p>
        </div>
      </header>
      <div className="shop-container info-content">{children}</div>
    </main>
  );
}
