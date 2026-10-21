"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Archive, ArrowDown, ArrowLeft, ArrowUp, Check, CircleCheck, Eye, EyeOff, FilePenLine, Info, LockKeyhole, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { AdminCategory, AdminProductDraft, AdminVariantDraft, ProductStatus } from "@/features/admin-products/data/adminProducts";
import { getAdminProduct, saveAdminProduct } from "@/features/admin-products/data/adminProductRepository";
import { useAdminClient } from "./AdminAccessGate";
import { StatusBadge } from "./AdminProductList";
import { AdminEngravingSettings } from "@/features/checkout/components/AdminEngravingSettings";

type FormErrors = Record<string, string>;

function createBlankVariant(): AdminVariantDraft {
  return {
    id: `new-${crypto.randomUUID()}`,
    name: "",
    sku: "",
    pricePen: "",
    stockOnHand: "",
    stockReserved: 0,
    isActive: true,
  };
}

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function isBlankVariant(variant: AdminVariantDraft) {
  return !variant.name.trim() && !variant.sku.trim() && !variant.pricePen.trim() && !variant.stockOnHand.trim();
}

function parsePrice(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const price = Number(normalized);
  return Number.isFinite(price) && price <= 9_999_999_999.99 ? price : null;
}

function validateProduct(product: AdminProductDraft): FormErrors {
  const errors: FormErrors = {};
  if (!product.name.trim()) errors.name = "Escribe un nombre para el producto.";
  if (!product.categoryId) errors.category = "Elige una categoría.";
  if (!product.slug) errors.slug = "Escribe un nombre que permita generar un identificador.";

  const variants = product.variants.filter((variant) => !isBlankVariant(variant));
  const names = new Set<string>();
  const skus = new Set<string>();

  for (const variant of variants) {
    const prefix = `variant-${variant.id}`;
    const name = variant.name.trim().replace(/\s+/g, " ").toLocaleLowerCase("es-PE");
    const sku = variant.sku.trim().toLocaleLowerCase("es-PE");
    const price = parsePrice(variant.pricePen);

    if (!name) errors[`${prefix}-name`] = "Escribe el nombre de la variante.";
    else if (names.has(name)) errors[`${prefix}-name`] = "Este nombre ya se usa en otra variante.";
    else names.add(name);

    if (sku) {
      if (skus.has(sku)) errors[`${prefix}-sku`] = "Este SKU ya se usa en otra variante.";
      else skus.add(sku);
    }

    if (price === null) errors[`${prefix}-price`] = "Ingresa un precio en soles con hasta dos decimales.";
    else if (product.status === "published" && variant.isActive && price <= 0) {
      errors[`${prefix}-price`] = "Una variante activa publicada necesita un precio mayor que S/ 0.00.";
    }

    const stock = variant.stockOnHand.trim();
    if (!/^\d+$/.test(stock)) errors[`${prefix}-stock`] = "Ingresa existencias enteras iguales o mayores que cero.";
    else if (Number(stock) > 2_147_483_647) errors[`${prefix}-stock`] = "Las existencias superan el límite permitido.";
    else if (Number(stock) < variant.stockReserved) {
      errors[`${prefix}-stock`] = `Hay ${variant.stockReserved} unidades reservadas. Usa una cifra igual o mayor.`;
    }
  }

  if (product.status === "published" && variants.filter((variant) => variant.isActive).length === 0) {
    errors.status = "Para publicar, agrega al menos una variante activa con precio válido.";
  }
  return errors;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p className="admin-field-error" id={id}><AlertCircle size={14} aria-hidden="true" />{message}</p> : null;
}

export function ProductForm({ initialProduct, categories, isNew, startArchiveConfirmation = false }: { initialProduct: AdminProductDraft; categories: AdminCategory[]; isNew: boolean; startArchiveConfirmation?: boolean }) {
  const client = useAdminClient();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [product, setProduct] = useState<AdminProductDraft>(() => ({
    ...initialProduct,
    variants: initialProduct.variants.length
      ? initialProduct.variants.map((variant) => ({ ...variant }))
      : [{ id: "new-initial", name: "", sku: "", pricePen: "", stockOnHand: "", stockReserved: 0, isActive: true }],
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [reviewReady, setReviewReady] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(startArchiveConfirmation);
  const [archiveNotice, setArchiveNotice] = useState<string | null>(null);

  const shownVariants = useMemo(() => product.variants.filter((variant) => !isBlankVariant(variant)), [product.variants]);
  const startingPrice = shownVariants.filter((variant) => variant.isActive)
    .map((variant) => parsePrice(variant.pricePen))
    .filter((price): price is number => price !== null)
    .sort((a, b) => a - b)[0];

  function updateProduct<K extends keyof AdminProductDraft>(key: K, value: AdminProductDraft[K]) {
    setProduct((current) => {
      const next = { ...current, [key]: value };
      if (key === "name" && isNew) next.slug = slugify(String(value));
      return next;
    });
    setErrors((current) => {
      const next = { ...current };
      delete next[String(key)];
      if (key === "name") delete next.slug;
      return next;
    });
    setReviewReady(false);
    setSaveSuccess(false);
  }

  function updateVariant(id: string, key: keyof AdminVariantDraft, value: string | boolean) {
    setProduct((current) => ({
      ...current,
      variants: current.variants.map((variant) => variant.id === id ? { ...variant, [key]: value } : variant),
    }));
    setErrors((current) => {
      const next = { ...current };
      delete next[`variant-${id}-${key === "pricePen" ? "price" : key === "stockOnHand" ? "stock" : key}`];
      delete next.status;
      return next;
    });
    setReviewReady(false);
    setSaveSuccess(false);
  }

  async function handleSave() {
    const nextErrors = validateProduct(product);
    if (product.status === "published" && !categories.some((category) => category.id === product.categoryId && category.isActive)) nextErrors.category = "Para publicar, selecciona una categoría activa.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { requestAnimationFrame(() => document.querySelector<HTMLElement>(".admin-product-form [aria-invalid='true']")?.focus()); return; }
    setSaving(true); setSaveError(null); setSaveSuccess(false);
    try {
      const id = await saveAdminProduct(client, product);
      const fresh = await getAdminProduct(client, id);
      if (!fresh) throw new Error("El producto se guardó, pero no se pudo volver a consultar.");
      if (isNew) { router.replace(`/admin/productos/${id}/editar`); return; }
      setProduct(fresh); setSaveSuccess(true); setReviewReady(false); setArchiveNotice(null);
    } catch (error) {
      const fault = error as { message?: string; code?: string; details?: string } | null;
      const message = fault?.message ?? (error instanceof Error ? error.message : "No se pudo guardar el producto.");
      const code = fault?.code ?? "";
      const details = fault?.details ?? "";
      if (message.includes("PRODUCT_CONFLICT") || message.includes("VARIANT_CONFLICT") || code === "40001") setSaveError("Otra persona modificó este producto. Recarga la ficha para ver la versión reciente antes de guardar.");
      else if (message.includes("ADMIN_REQUIRED") || code === "42501") setSaveError("No tienes permisos para administrar productos.");
      else if (message.includes("STOCK_RESERVED")) setSaveError(`Las existencias son inferiores a las ${details || "unidades"} reservadas actualmente. Recarga la ficha y corrige la cantidad.`);
      else if (message.includes("CATEGORY_UNAVAILABLE")) setSaveError("La categoría no existe o está inactiva para publicar.");
      else if (message.includes("ACTIVE_PRICE_REQUIRED")) setSaveError("Cada variante activa publicada necesita precio mayor que S/ 0.00.");
      else if (message.includes("ACTIVE_VARIANT_REQUIRED")) setSaveError("Para publicar necesitas al menos una variante activa.");
      else if (message.includes("product_variants_sku_lower_unique") || message.includes("product_variants_sku_key")) setSaveError("Ese SKU ya pertenece a otra variante.");
      else if (message.includes("product_variants_normalized_name_unique") || message.includes("product_variants_product_id_name_key")) setSaveError("Ya existe una variante con ese nombre en este producto.");
      else if (message.includes("products_slug_key")) { setErrors({ slug: "Este identificador ya pertenece a otro producto." }); setSaveError("Este identificador ya pertenece a otro producto. Cambia el nombre para generar otro."); }
      else setSaveError("No se pudo guardar. Revisa los datos e inténtalo de nuevo.");
    } finally { setSaving(false); }
  }

  function moveVariant(index: number, direction: -1 | 1) {
    setProduct((current) => {
      const next = [...current.variants];
      [next[index], next[index + direction]] = [next[index + direction], next[index]];
      return { ...current, variants: next };
    });
    setReviewReady(false);
    setSaveSuccess(false);
  }

  function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateProduct(product);
    if (product.status === "published" && !categories.some((category) => category.id === product.categoryId && category.isActive)) nextErrors.category = "Para publicar, selecciona una categoría activa.";
    setErrors(nextErrors);
    setReviewReady(Object.keys(nextErrors).length === 0);
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>(".admin-product-form [aria-invalid='true']")?.focus();
      });
    }
  }

  return (
    <section className="admin-content admin-editor" aria-labelledby="admin-form-title">
      <div className="admin-form-topline"><Link href="/admin/productos"><ArrowLeft size={17} /> Volver a productos</Link><span>{isNew ? "Producto nuevo" : "Edición de producto"}</span></div>
      <header className="admin-page-heading admin-form-heading">
        <div><p className="admin-path">Catálogo / Productos / {isNew ? "Nuevo" : "Editar"}</p><h1 id="admin-form-title">{isNew ? "Crear producto" : "Editar producto"}</h1><p>{isNew ? "Prepara una ficha nueva para el catálogo." : "Revisa la información, las variantes y su publicación."}</p></div>
        {!isNew && <StatusBadge status={product.status} />}
      </header>


      <form className="admin-product-form" onSubmit={handleReview} noValidate>
        <div className="admin-form-columns">
          <div className="admin-form-body">
            <section className="admin-form-section" aria-labelledby="product-details-title">
              <div className="admin-form-section-heading"><FilePenLine size={20} aria-hidden="true" /><div><h2 id="product-details-title">Información del producto</h2><p>Los datos que identifican esta ficha.</p></div></div>
              <div className="admin-field-grid">
                <div className="admin-field admin-field-full"><label htmlFor="admin-name">Nombre del producto <span>*</span></label><Input id="admin-name" value={product.name} onChange={(event) => updateProduct("name", event.target.value)} placeholder="Ej. Urna Serenidad en bronce" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "admin-name-error" : undefined} /><FieldError id="admin-name-error" message={errors.name} /></div>
                <div className="admin-field"><label htmlFor="admin-category">Categoría <span>*</span></label><NativeSelect id="admin-category" value={product.categoryId} onChange={(event) => { const chosen = categories.find((category) => category.id === event.target.value); setProduct((current) => ({ ...current, categoryId: event.target.value, category: chosen?.name ?? "" })); setErrors((current) => { const next = { ...current }; delete next.category; return next; }); setSaveSuccess(false); }} aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? "admin-category-error" : undefined}><option value="">Selecciona una categoría</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}{category.isActive ? "" : " (inactiva)"}</option>)}</NativeSelect><FieldError id="admin-category-error" message={errors.category} /></div>
                <div className="admin-field"><label htmlFor="admin-slug">Identificador de la ficha</label><Input id="admin-slug" value={product.slug} readOnly placeholder="Se genera desde el nombre" aria-invalid={Boolean(errors.slug)} aria-describedby={errors.slug ? "admin-slug-error" : "admin-slug-help"} /><p className="admin-field-help" id="admin-slug-help">{isNew ? "Se genera al escribir el nombre y quedará fijo al crear." : "Este identificador no cambia al editar el nombre."}</p><FieldError id="admin-slug-error" message={errors.slug} /></div>
                <div className="admin-field admin-field-full"><label htmlFor="admin-description">Descripción</label><Textarea id="admin-description" value={product.description} onChange={(event) => updateProduct("description", event.target.value)} placeholder="Material, acabado y características que ayuden a reconocer el producto." rows={4} /><p className="admin-field-help">Escribe información comprobada; las imágenes actuales son referenciales.</p></div>
              </div>
            </section>

            <section className="admin-form-section" aria-labelledby="variants-title">
              <div className="admin-form-section-heading admin-variants-heading"><div className="admin-heading-with-icon"><span className="admin-stack-icon" aria-hidden="true"><span /><span /></span><div><h2 id="variants-title">Variantes y precios</h2><p>Cada opción conserva su precio y existencias propios.</p></div></div><Button type="button" variant="outline" size="sm" onClick={() => { setProduct((current) => ({ ...current, variants: [...current.variants, createBlankVariant()] })); setReviewReady(false); }}><Plus size={16} /> Añadir variante</Button></div>
              <div className="admin-variant-list">
                {product.variants.map((variant, index) => {
                  const prefix = `variant-${variant.id}`;
                  const canRemove = variant.id.startsWith("new-");
                  return <div className={`admin-variant ${variant.isActive ? "" : "admin-variant-inactive"}`} key={variant.id}>
                    <div className="admin-variant-heading"><div><span className="admin-variant-index">{String(index + 1).padStart(2, "0")}</span><h3>{variant.name.trim() || "Variante sin nombre"}</h3><span className="admin-variant-state">{variant.isActive ? "Activa" : "Inactiva"}</span></div><div className="admin-variant-actions"><Button type="button" variant="ghost" size="icon" disabled={index === 0} aria-label={`Subir variante ${index + 1}`} title="Subir variante" onClick={() => moveVariant(index, -1)}><ArrowUp size={16} /></Button><Button type="button" variant="ghost" size="icon" disabled={index === product.variants.length - 1} aria-label={`Bajar variante ${index + 1}`} title="Bajar variante" onClick={() => moveVariant(index, 1)}><ArrowDown size={16} /></Button><Button type="button" variant="ghost" size="sm" aria-pressed={variant.isActive} onClick={() => updateVariant(variant.id, "isActive", !variant.isActive)}>{variant.isActive ? <Eye size={16} /> : <EyeOff size={16} />}{variant.isActive ? "Desactivar" : "Activar"}</Button>{canRemove && <Button type="button" variant="ghost" size="icon" aria-label={`Quitar variante ${index + 1} sin guardar`} onClick={() => { setProduct((current) => ({ ...current, variants: current.variants.filter((item) => item.id !== variant.id) })); setReviewReady(false); }}><Trash2 size={16} /></Button>}</div></div>
                    <div className="admin-variant-fields">
                      <div className="admin-field"><label htmlFor={`${prefix}-name`}>Nombre <span>*</span></label><Input id={`${prefix}-name`} value={variant.name} onChange={(event) => updateVariant(variant.id, "name", event.target.value)} placeholder="Ej. Bronce pulido" aria-invalid={Boolean(errors[`${prefix}-name`])} aria-describedby={errors[`${prefix}-name`] ? `${prefix}-name-error` : undefined} /><FieldError id={`${prefix}-name-error`} message={errors[`${prefix}-name`]} /></div>
                      <div className="admin-field"><label htmlFor={`${prefix}-sku`}>SKU</label><Input id={`${prefix}-sku`} value={variant.sku} onChange={(event) => updateVariant(variant.id, "sku", event.target.value)} placeholder="Código interno opcional" aria-invalid={Boolean(errors[`${prefix}-sku`])} aria-describedby={errors[`${prefix}-sku`] ? `${prefix}-sku-error` : undefined} /><FieldError id={`${prefix}-sku-error`} message={errors[`${prefix}-sku`]} /></div>
                      <div className="admin-field"><label htmlFor={`${prefix}-price`}>Precio en soles <span>*</span></label><div className="admin-money-input"><span aria-hidden="true">S/</span><Input id={`${prefix}-price`} inputMode="decimal" value={variant.pricePen} onChange={(event) => updateVariant(variant.id, "pricePen", event.target.value)} placeholder="0.00" aria-label={`Precio en soles de variante ${index + 1}`} aria-invalid={Boolean(errors[`${prefix}-price`])} aria-describedby={errors[`${prefix}-price`] ? `${prefix}-price-error` : undefined} /></div><FieldError id={`${prefix}-price-error`} message={errors[`${prefix}-price`]} /></div>
                      <div className="admin-field"><label htmlFor={`${prefix}-stock`}>Existencias <span>*</span></label><Input id={`${prefix}-stock`} inputMode="numeric" value={variant.stockOnHand} onChange={(event) => updateVariant(variant.id, "stockOnHand", event.target.value)} placeholder="0" aria-invalid={Boolean(errors[`${prefix}-stock`])} aria-describedby={errors[`${prefix}-stock`] ? `${prefix}-stock-error` : `${prefix}-stock-help`} /><p className="admin-field-help" id={`${prefix}-stock-help`}>{variant.stockReserved} reservadas, solo lectura</p><FieldError id={`${prefix}-stock-error`} message={errors[`${prefix}-stock`]} /></div>
                    </div>
                  </div>;
                })}
              </div>
            </section>
          </div>

          <aside className="admin-form-aside" aria-label="Publicación y resumen">
            <section className="admin-publish-panel">
              <div className="admin-aside-heading"><span className="admin-aside-icon"><Eye size={19} /></span><div><h2>Publicación</h2><p>Define cuándo estará disponible.</p></div></div>
              {product.status === "archived" ? (
                <div className="admin-archived-state"><StatusBadge status="archived" /><p>El producto y sus variantes se conservan. Puedes recuperarlo como borrador.</p><Button type="button" variant="outline" onClick={() => { updateProduct("status", "draft"); setArchiveNotice("Restaurado como borrador en esta vista. Aún no se ha guardado."); }}><RotateCcw size={16} /> Restaurar como borrador</Button></div>
              ) : (
                <div className="admin-field"><label htmlFor="admin-status">Estado del producto</label><NativeSelect id="admin-status" value={product.status} onChange={(event) => { updateProduct("status", event.target.value as ProductStatus); setArchiveNotice(null); }} aria-invalid={Boolean(errors.status)} aria-describedby={errors.status ? "admin-status-error" : undefined}><option value="draft">Borrador</option><option value="published">Publicado</option></NativeSelect><FieldError id="admin-status-error" message={errors.status} /></div>
              )}
              <div className="admin-publication-rule"><Info size={16} aria-hidden="true" /><p>Para publicar necesitas una categoría activa y al menos una variante activa con precio mayor que S/ 0.00.</p></div>
              {initialProduct.status === "published" && product.status !== "published" && <div className="admin-unpublish-note" role="status">Al guardar, este producto dejaría de estar publicado.</div>}
            </section>
            {!isNew && product.status !== "archived" && <section className="admin-archive-panel" aria-label="Archivar producto"><div><Archive size={18} aria-hidden="true" /><h2>Retirar del catálogo</h2></div><p>Archivar conserva la ficha y las variantes para recuperarlas después.</p>{showArchiveConfirm ? <div className="admin-archive-confirm" role="group" aria-label="Confirmar archivo"><p>¿Archivar “{product.name}”?</p><div><Button type="button" variant="outline" size="sm" onClick={() => setShowArchiveConfirm(false)}>Cancelar</Button><Button type="button" size="sm" onClick={() => { updateProduct("status", "archived"); setShowArchiveConfirm(false); setArchiveNotice("Marcado como archivado en esta vista. Aún no se ha guardado."); }}><Archive size={15} /> Sí, archivar</Button></div></div> : <Button type="button" variant="outline" size="icon" className="admin-archive-trigger" aria-label="Archivar producto" title="Archivar producto" onClick={() => setShowArchiveConfirm(true)}><Archive size={17} /></Button>}</section>}
            {archiveNotice && <p className="admin-archive-notice" role="status">{archiveNotice}</p>}
            <section className="admin-preview-panel"><h2>Resumen de la ficha</h2><div className="admin-preview-rule" /><p className="admin-preview-category">{product.category || "Sin categoría"}</p><h3>{product.name.trim() || "Nombre del producto"}</h3><p className="admin-preview-description">{product.description.trim() || "La descripción aparecerá aquí cuando la escribas."}</p><div className="admin-preview-footer"><span>{shownVariants.length} {shownVariants.length === 1 ? "variante" : "variantes"}</span><strong>{startingPrice === undefined ? "Sin precio" : `S/ ${startingPrice.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</strong></div></section>
            <div className="admin-permission-note"><LockKeyhole size={16} /><p>Solo administradores pueden guardar. Los cambios se confirman juntos.</p></div>
          </aside>
        </div>

        <div className="admin-form-footer"><div className="admin-review-message" aria-live="polite">{saveError && <span role="alert">{saveError} {saveError.includes("Recarga") && <button type="button" onClick={() => window.location.reload()}>Recargar</button>}</span>}{saveSuccess && <span role="status">Cambios guardados. La ficha se volvió a consultar.</span>}{Object.keys(errors).length > 0 ? <><AlertCircle size={17} /> Corrige {Object.keys(errors).length} {Object.keys(errors).length === 1 ? "campo" : "campos"} antes de guardar.</> : reviewReady ? <><CircleCheck size={17} /> Los datos están listos para guardar.</> : <><Info size={17} /> Revisa los datos y guarda los cambios.</>}</div><div className="admin-form-buttons"><Button type="submit" variant="outline"><Check size={17} /> Revisar datos</Button><Button type="button" disabled={saving} onClick={() => void handleSave()}><Save size={17} /> {saving ? "Guardando…" : "Guardar cambios"}</Button></div></div>
      </form>
      <AdminEngravingSettings categoryId={product.categoryId} />
    </section>
  );
}
