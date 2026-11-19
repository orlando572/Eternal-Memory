"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ImagePlus, RefreshCw, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/features/loading/Loading";
import {
  ACCEPTED_IMAGE_TYPES, MAX_PRODUCT_IMAGES, isAcceptedImageFile, moveGalleryItem, type GalleryItem,
} from "../data/productGallery";

function GalleryThumb({ source, alt }: { source: string | null; alt: string }) {
  const [loaded, setLoaded] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  if (!source || failed === source) return <span className="admin-gallery-missing"><ImagePlus size={28} aria-hidden="true" />Sin vista previa</span>;
  return <>{loaded !== source && <Skeleton className="loading-image" />}<Image src={source} alt={alt} width={240} height={240} unoptimized onLoad={() => setLoaded(source)} onError={() => setFailed(source)} /></>;
}

export function ProductGalleryField({ items, onChange, publicUrl }: {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
  publicUrl: (path: string) => string;
}) {
  const addInput = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const replaceKey = useRef<string | null>(null);
  const previews = useRef(new Set<string>());
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  // Release object URLs of previews that left the gallery (and all on unmount).
  useEffect(() => {
    const active = new Set(items.flatMap((item) => item.preview ? [item.preview] : []));
    for (const url of previews.current) if (!active.has(url)) { URL.revokeObjectURL(url); previews.current.delete(url); }
  }, [items]);
  useEffect(() => {
    const urls = previews.current;
    return () => { for (const url of urls) URL.revokeObjectURL(url); urls.clear(); };
  }, []);

  function newItem(file: File, altText = "", isReference = true): GalleryItem {
    const preview = URL.createObjectURL(file);
    previews.current.add(preview);
    return { key: `new-${crypto.randomUUID()}`, file, preview, image: { id: "", storagePath: null, externalUrl: null, altText, isReference } };
  }

  function addFiles(files: File[]) {
    const room = MAX_PRODUCT_IMAGES - items.length;
    const valid = files.filter(isAcceptedImageFile);
    const rejected = files.length - valid.length;
    const accepted = valid.slice(0, Math.max(room, 0));
    const messages = [];
    if (rejected) messages.push(`${rejected === 1 ? "Un archivo no es" : `${rejected} archivos no son`} JPG, PNG o WebP de hasta 5 MB.`);
    if (valid.length > accepted.length) messages.push(`Cada producto admite hasta ${MAX_PRODUCT_IMAGES} imágenes.`);
    setError(messages.length ? messages.join(" ") : null);
    if (!accepted.length) return;
    onChange([...items, ...accepted.map((file) => newItem(file))]);
    setAnnouncement(accepted.length === 1 ? "Imagen añadida. Se subirá al guardar." : `${accepted.length} imágenes añadidas. Se subirán al guardar.`);
  }

  function replace(key: string, file: File) {
    if (!isAcceptedImageFile(file)) { setError("Elige una imagen JPG, PNG o WebP de hasta 5 MB."); return; }
    setError(null);
    onChange(items.map((item) => item.key === key ? newItem(file, item.image.altText, item.image.isReference) : item));
    setAnnouncement("Imagen reemplazada. El cambio se aplica al guardar.");
  }

  function move(from: number, to: number, message: string) {
    onChange(moveGalleryItem(items, from, to));
    setAnnouncement(message);
  }

  function update(key: string, patch: Partial<GalleryItem["image"]>) {
    onChange(items.map((item) => item.key === key ? { ...item, image: { ...item.image, ...patch } } : item));
  }

  const full = items.length >= MAX_PRODUCT_IMAGES;
  return <section className="admin-form-section" aria-labelledby="product-images-title">
    <div className="admin-form-section-heading admin-gallery-heading">
      <div className="admin-heading-with-icon"><ImagePlus size={20} aria-hidden="true" /><div><h2 id="product-images-title">Imágenes del producto</h2><p>La primera es la portada del catálogo; las demás se ven en la ficha en este orden.</p></div></div>
      <Button type="button" variant="outline" size="sm" disabled={full} onClick={() => addInput.current?.click()}><ImagePlus size={16} />Añadir imágenes</Button>
    </div>
    <input ref={addInput} className="admin-file-input" type="file" multiple accept={ACCEPTED_IMAGE_TYPES.join(",")} aria-label="Seleccionar imágenes para añadir" onChange={(event) => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = "";
      if (files.length) addFiles(files);
    }} />
    <input ref={replaceInput} className="admin-file-input" type="file" accept={ACCEPTED_IMAGE_TYPES.join(",")} aria-label="Seleccionar imagen de reemplazo" onChange={(event) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (file && replaceKey.current) replace(replaceKey.current, file);
      replaceKey.current = null;
    }} />
    <p className="admin-field-help" id="admin-gallery-help">JPG, PNG o WebP · Hasta 5 MB cada una · Máximo {MAX_PRODUCT_IMAGES}. Los cambios se aplican al guardar.</p>
    {error && <p className="admin-field-error" role="alert">{error}</p>}
    <p className="sr-only" aria-live="polite">{announcement}</p>

    {items.length === 0
      ? <button type="button" className="admin-gallery-empty" onClick={() => addInput.current?.click()}><ImagePlus size={28} aria-hidden="true" /><span>Este producto no tiene imágenes.</span><span>Añade la primera para usarla como portada.</span></button>
      : <ol className="admin-gallery-list">
        {items.map((item, index) => {
          const number = index + 1;
          const source = item.preview ?? item.image.externalUrl ?? (item.image.storagePath ? publicUrl(item.image.storagePath) : null);
          const altId = `admin-image-alt-${item.key}`;
          return <li key={item.key} className="admin-gallery-item">
            <div className="admin-gallery-preview">
              <GalleryThumb source={source} alt={item.image.altText || `Imagen ${number}`} />
              {index === 0 && <span className="admin-gallery-badge"><Star size={12} aria-hidden="true" />Portada</span>}
              {item.file && <span className="admin-gallery-badge admin-gallery-badge-pending">Sin guardar</span>}
            </div>
            <div className="admin-gallery-order">
              <span>Imagen {number} de {items.length}</span>
              <div>
                <Button type="button" variant="ghost" size="icon" disabled={index === 0} aria-label={`Mover imagen ${number} antes`} title="Mover antes" onClick={() => move(index, index - 1, `Imagen movida a la posición ${index}.`)}><ArrowLeft size={16} /></Button>
                <Button type="button" variant="ghost" size="icon" disabled={index === items.length - 1} aria-label={`Mover imagen ${number} después`} title="Mover después" onClick={() => move(index, index + 1, `Imagen movida a la posición ${index + 2}.`)}><ArrowRight size={16} /></Button>
              </div>
            </div>
            <div className="admin-field"><label htmlFor={altId}>Descripción de la imagen</label><Input id={altId} value={item.image.altText} maxLength={1000} placeholder="Ej. Urna de bronce con acabado pulido" onChange={(event) => update(item.key, { altText: event.target.value })} /></div>
            <label className="admin-image-reference"><input type="checkbox" checked={item.image.isReference} onChange={(event) => update(item.key, { isReference: event.target.checked })} />Imagen referencial</label>
            <div className="admin-gallery-actions">
              {index > 0 && <Button type="button" variant="ghost" size="sm" onClick={() => move(index, 0, "Imagen elegida como portada.")}><Star size={15} />Usar como portada</Button>}
              <Button type="button" variant="ghost" size="sm" aria-label={`Reemplazar imagen ${number}`} onClick={() => { replaceKey.current = item.key; replaceInput.current?.click(); }}><RefreshCw size={15} />Reemplazar</Button>
              <Button type="button" variant="ghost" size="sm" aria-label={`Quitar imagen ${number}`} onClick={() => { onChange(items.filter((other) => other.key !== item.key)); setAnnouncement(`Imagen ${number} quitada. Se eliminará al guardar.`); }}><Trash2 size={15} />Quitar</Button>
            </div>
          </li>;
        })}
      </ol>}
  </section>;
}
