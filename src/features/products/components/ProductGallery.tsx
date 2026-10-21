"use client";

import { useState } from "react";
import type { CatalogImage } from "@/features/catalogo/types/catalog";
import { ProductImage } from "./ProductImage";

export default function ProductGallery({ images, name }: { images: CatalogImage[]; name: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex];

  return (
    <div className="detail-gallery">
      <div className="detail-main-image">
        <ProductImage src={selectedImage?.src} alt={selectedImage?.alt || `${selectedImage?.isReference ? "Imagen referencial de " : ""}${name}`} sizes="(max-width: 740px) 90vw, 50vw" />
      </div>
      {images.length > 1 && (
        <div className="detail-thumbnails" role="group" aria-label="Otras vistas del producto">
          {images.map((image, index) => (
            <button key={image.id} type="button" className={selectedIndex === index ? "active" : ""} onClick={() => setSelectedIndex(index)} aria-label={`Ver imagen ${index + 1} de ${name}`} aria-pressed={selectedIndex === index}>
              <ProductImage src={image.src} alt="" sizes="80px" />
            </button>
          ))}
        </div>
      )}
      <p className="shop-image-note">{selectedImage?.isReference ? "Imagen referencial. " : ""}Consulta la descripción y las opciones del producto.</p>
    </div>
  );
}
