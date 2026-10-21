"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductImage({ src, alt, sizes }: { src?: string; alt: string; sizes: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || failedSrc === src) return <span className="product-image-fallback">Imagen no disponible</span>;

  // Serve persisted external or Storage URLs directly without broadening the
  // image optimizer's allowlist. Failed photos retain a readable fallback.
  return <Image src={src} alt={alt} fill sizes={sizes} unoptimized onError={() => setFailedSrc(src)} />;
}
