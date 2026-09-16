'use client';

import { useState } from 'react';

interface ProductGalleryProps {
  images?: string[];
}

export default function ProductGallery({ images = [] }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0] || '');

  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-4/5 w-full bg-ink-700 rounded-md border border-white/10 flex flex-col items-center justify-center relative p-4 overflow-hidden">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt="Vista de producto"
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <span className="text-bone-500 text-sm">imagen del producto</span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(img)}
              className={`w-20 h-20 rounded border transition-all shrink-0 bg-ink-700 p-1 ${
                selectedImage === img
                  ? 'border-brass-300 opacity-100'
                  : 'border-white/10 opacity-50 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Vista ${index + 1}`} className="w-full h-full object-cover rounded" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}