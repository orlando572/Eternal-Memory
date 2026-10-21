import type { ReactNode } from "react";

const categoryShapes: Record<string, ReactNode> = {
  urnas: (
    <>
      <path d="M11 3h2v2M9 6.5V5h6v1.5M7.5 6.5h9" />
      <path d="M8 6.5v2c0 1.5-2.5 2.5-2.5 6a6.5 6.5 0 0 0 4 6v1h5v-1a6.5 6.5 0 0 0 4-6c0-3.5-2.5-4.5-2.5-6v-2" />
      <path d="M9.5 19h5" />
    </>
  ),
  ataudes: (
    <>
      <path d="M9 3h6l4 5-3 13H8L5 8Z" />
      <path d="m10 6-2 3 2 9h4l2-9-2-3Z" />
    </>
  ),
  "arreglos-florales": (
    <>
      <path d="m9 3 3 2 3-2v4a3 3 0 0 1-6 0ZM3 7l3 2 3-2v4a3 3 0 0 1-6 0ZM15 7l3 2 3-2v4a3 3 0 0 1-6 0Z" />
      <path d="M12 10v11M6 14l6 7 6-7M8.5 17.5h7" />
    </>
  ),
  relicarios: (
    <>
      <path d="m6 3 6 6 6-6" />
      <circle cx="12" cy="10.5" r="1.5" />
      <ellipse cx="12" cy="16.5" rx="5.5" ry="5" />
      <path d="M12 19c-3.5-2-2-4.5 0-3 2-1.5 3.5 1 0 3Z" />
    </>
  ),
};

const fallbackShape = (
  <>
    <rect x="4" y="4" width="6" height="6" rx="1.5" />
    <rect x="14" y="4" width="6" height="6" rx="1.5" />
    <rect x="4" y="14" width="6" height="6" rx="1.5" />
    <rect x="14" y="14" width="6" height="6" rx="1.5" />
  </>
);

export function HomeCategoryIcon({ categorySlug }: { categorySlug: string }) {
  return (
    <svg className="home-category-icon" xmlns="http://www.w3.org/2000/svg"
      width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false">
      {Object.hasOwn(categoryShapes, categorySlug) ? categoryShapes[categorySlug] : fallbackShape}
    </svg>
  );
}
