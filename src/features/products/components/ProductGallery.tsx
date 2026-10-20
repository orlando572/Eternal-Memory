"use client";

import { useState } from "react";

interface ProductGalleryProps {
  images?: string[];
  name: string;
}

export default function ProductGallery({ images = [], name }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex];

  return (
    <div className="detail-gallery">
      <div className="detail-main-image">
        {selectedImage ? <img src={selectedImage} alt={`Imagen referencial de ${name}`} /> : <span>Imagen no disponible</span>}
      </div>
      {images.length > 1 && (
        <div className="detail-thumbnails" aria-label="Otras vistas del producto">
          {images.map((image, index) => (
            <button key={`${image}-${index}`} type="button" className={selectedIndex === index ? "active" : ""} onClick={() => setSelectedIndex(index)} aria-label={`Ver imagen ${index + 1}`} aria-pressed={selectedIndex === index}>
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      )}
      <p className="shop-image-note">Imagen referencial. Consulta la descripción y las opciones del producto.</p>
    </div>
  );
}
