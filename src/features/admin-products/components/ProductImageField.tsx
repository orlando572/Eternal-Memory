"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/features/loading/Loading";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminProductImage } from "../data/adminProducts";

export interface ProductImageEdit {
  image: AdminProductImage | null;
  file: File | null;
  changed: boolean;
}

export function ProductImageField({ value, onChange, publicUrl }: {
  value: ProductImageEdit;
  onChange: (value: ProductImageEdit) => void;
  publicUrl: (path: string) => string;
}) {
  const [loadedSource, setLoadedSource] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const source = value.file ? preview : value.image?.externalUrl || (value.image?.storagePath ? publicUrl(value.image.storagePath) : null);

  return <section className="admin-form-section" aria-labelledby="product-image-title">
    <div className="admin-form-section-heading"><ImagePlus size={20} aria-hidden="true" /><div><h2 id="product-image-title">Imagen principal</h2><p>La primera imagen que se muestra en el catálogo.</p></div></div>
    <div className="admin-image-editor">
      <div className="admin-image-preview">{source ? <>{loadedSource !== source && <Skeleton className="loading-image" />}<Image onLoad={() => setLoadedSource(source)} onError={() => { setLoadedSource(source); setError("No se pudo mostrar la imagen seleccionada."); }} src={source} width={200} height={200} unoptimized alt={value.image?.altText || "Vista previa de la imagen principal"} /></> : <ImagePlus size={32} aria-hidden="true" />}</div>
      <div className="admin-image-fields">
        <div className="admin-image-actions"><Button type="button" variant="outline" onClick={() => input.current?.click()}><ImagePlus size={16} />{value.image ? "Cambiar imagen" : "Añadir imagen"}</Button>{value.image && <Button type="button" variant="ghost" onClick={() => { onChange({ image: null, file: null, changed: true }); setError(null); }}><Trash2 size={16} />Quitar</Button>}</div>
        <input ref={input} className="admin-file-input" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Seleccionar imagen principal" aria-describedby="admin-image-help" onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size === 0 || file.size > 5 * 1024 * 1024) { setError("Elige una imagen JPG, PNG o WebP de hasta 5 MB."); return; }
          setError(null);
          setPreview(URL.createObjectURL(file));
          onChange({ file, changed: true, image: { id: value.image?.id ?? "", storagePath: null, externalUrl: null, altText: value.image?.altText ?? "", isReference: value.image?.isReference ?? true } });
        }} />
        <p className="admin-field-help" id="admin-image-help">JPG, PNG o WebP · Hasta 5 MB. Se aplica al guardar.</p>
        {error && <p className="admin-field-error" role="alert">{error}</p>}
        {value.image && <><div className="admin-field"><label htmlFor="admin-image-alt">Descripción de la imagen</label><Input id="admin-image-alt" value={value.image.altText} maxLength={1000} placeholder="Ej. Urna de bronce con acabado pulido" onChange={(event) => onChange({ ...value, changed: true, image: { ...value.image!, altText: event.target.value } })} /></div><label className="admin-image-reference"><input type="checkbox" checked={value.image.isReference} onChange={(event) => onChange({ ...value, changed: true, image: { ...value.image!, isReference: event.target.checked } })} />Imagen referencial</label></>}
        {!value.image && value.changed && <p className="admin-field-help">Al guardar se quitará la imagen principal. Si hay más imágenes, la siguiente ocupará su lugar.</p>}
      </div>
    </div>
  </section>;
}
