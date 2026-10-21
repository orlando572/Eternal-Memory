"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Archive, ArrowDown, ArrowLeft, ArrowUp, Eye, EyeOff, FilePenLine, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/features/loading/LoadingButton";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { AdminCategory, AdminProductDraft, AdminVariantDraft, ProductStatus } from "@/features/admin-products/data/adminProducts";
import { getAdminProduct, saveAdminProduct } from "@/features/admin-products/data/adminProductRepository";
import { uploadProductImage, removeUnusedProductImage } from "../data/productImageStorage";
import { useAdminClient } from "./AdminAccessGate";
import { StatusBadge } from "./AdminProductList";
import { ProductImageField, type ProductImageEdit } from "./ProductImageField";
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
  const [savingStatus, setSavingStatus] = useState<ProductStatus | null>(null);
  const [savingPhase, setSavingPhase] = useState("Guardando producto");
  const [saving, setSaving] = useState(false);
  const [reloadRequired, setReloadRequired] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [product, setProduct] = useState<AdminProductDraft>(() => ({
    ...initialProduct,
    variants: initialProduct.variants.length
      ? initialProduct.variants.map((variant) => ({ ...variant }))
      : [{ id: "new-initial", name: "", sku: "", pricePen: "", stockOnHand: "", stockReserved: 0, isActive: true }],
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [imageEdit, setImageEdit] = useState<ProductImageEdit>({ image: initialProduct.images?.[0] ?? null, file: null, changed: false });
  const originalImageId = useRef(initialProduct.images?.[0]?.id ?? null);
  const savingLock = useRef(false);
  const pendingUpload = useRef<{ file: File; path: string } | null>(null);
  const [confirmedStatus, setConfirmedStatus] = useState(initialProduct.status);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(startArchiveConfirmation);
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
    setSaveSuccess(false);
  }

  async function handleSave(status: ProductStatus = product.status) {
    if (savingLock.current || reloadRequired) return;
    const draft = { ...product, status };
    const nextErrors = validateProduct(draft);
    if (status === "published" && !categories.some((category) => category.id === product.categoryId && category.isActive)) nextErrors.category = "Para publicar, selecciona una categoría activa.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { requestAnimationFrame(() => document.querySelector<HTMLElement>(".admin-product-form [aria-invalid='true']")?.focus()); return; }
    savingLock.current = true;
    setSavingStatus(status);
    setSavingPhase(imageEdit.file ? "Subiendo imagen" : "Guardando producto");
    setSaving(true); setSaveError(null); setSaveSuccess(false);
    try {
      let image = imageEdit.image;
      if (imageEdit.file && image) {
        if (pendingUpload.current?.file !== imageEdit.file) {
          const path = await uploadProductImage(client, imageEdit.file);
          pendingUpload.current = { file: imageEdit.file, path };
        }
        image = { ...image, storagePath: pendingUpload.current!.path, externalUrl: null };
      }
      setSavingPhase("Guardando producto");
      const id = await saveAdminProduct(client, draft, imageEdit.changed ? { originalId: originalImageId.current, image } : undefined);
      // Keep uploads on ambiguous network failures: the database may have committed.
      pendingUpload.current = null;
      if (isNew) { router.replace(`/admin/productos/${id}/editar`); return; }
      const fresh = await getAdminProduct(client, id).catch(() => null);
      if (!fresh) {
        setReloadRequired(true);
        setSaveError("El producto se guardó. Recarga la ficha antes de continuar.");
        return;
      }
      setProduct(fresh); setConfirmedStatus(fresh.status); setSaveSuccess(true); setShowArchiveConfirm(false);
      originalImageId.current = fresh.images?.[0]?.id ?? null;
      setImageEdit({ image: fresh.images?.[0] ?? null, file: null, changed: false });
    } catch (error) {
      const fault = error as { message?: string; code?: string; details?: string } | null;
      const message = fault?.message ?? (error instanceof Error ? error.message : "No se pudo guardar el producto.");
      const code = fault?.code ?? "";
      const details = fault?.details ?? "";
      if (pendingUpload.current && /^[0-9A-Z]{5}$/.test(code)) {
        // A returned database error rolls back the entire RPC, so this upload is unused.
        if (await removeUnusedProductImage(client, pendingUpload.current.path).catch(() => false)) pendingUpload.current = null;
      }
      if (message.includes("IMAGE_INVALID")) setSaveError("No se puede leer la imagen. Elige otro archivo JPG, PNG o WebP.");
      else if (message.includes("IMAGE_UPLOAD_FAILED")) setSaveError("No se pudo subir la imagen. Conservamos los datos para que puedas volver a guardar.");
      else if (message.includes("IMAGE_CONFLICT")) setSaveError("La imagen principal cambió en otra sesión. Recarga la ficha antes de guardar.");
      else if (message.includes("PRODUCT_CONFLICT") || message.includes("VARIANT_CONFLICT") || code === "40001") setSaveError("Otra persona modificó este producto. Recarga la ficha para ver la versión reciente antes de guardar.");
      else if (message.includes("ADMIN_REQUIRED") || code === "42501") setSaveError("No tienes permisos para administrar productos.");
      else if (message.includes("STOCK_RESERVED")) setSaveError(`Las existencias son inferiores a las ${details || "unidades"} reservadas actualmente. Recarga la ficha y corrige la cantidad.`);
      else if (message.includes("CATEGORY_UNAVAILABLE")) setSaveError("La categoría no existe o está inactiva para publicar.");
      else if (message.includes("ACTIVE_PRICE_REQUIRED")) setSaveError("Cada variante activa publicada necesita precio mayor que S/ 0.00.");
      else if (message.includes("ACTIVE_VARIANT_REQUIRED")) setSaveError("Para publicar necesitas al menos una variante activa.");
      else if (message.includes("product_variants_sku_lower_unique") || message.includes("product_variants_sku_key")) setSaveError("Ese SKU ya pertenece a otra variante.");
      else if (message.includes("product_variants_normalized_name_unique") || message.includes("product_variants_product_id_name_key")) setSaveError("Ya existe una variante con ese nombre en este producto.");
      else if (message.includes("products_slug_key")) { setErrors({ slug: "Este identificador ya pertenece a otro producto." }); setSaveError("Este identificador ya pertenece a otro producto. Cambia el nombre para generar otro."); }
      else setSaveError("No se pudo guardar. Revisa los datos e inténtalo de nuevo.");
    } finally { savingLock.current = false; setSaving(false); }
  }

  function moveVariant(index: number, direction: -1 | 1) {
    setProduct((current) => {
      const next = [...current.variants];
      [next[index], next[index + direction]] = [next[index + direction], next[index]];
      return { ...current, variants: next };
    });
    setSaveSuccess(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSave(confirmedStatus === "archived" ? "draft" : "published");
  }

  return (
    <section className="admin-content admin-editor" aria-labelledby="admin-form-title">
      <div className="admin-form-topline"><Link href="/admin/productos"><ArrowLeft size={17} /> Volver a productos</Link><span>{isNew ? "Producto nuevo" : "Edición de producto"}</span></div>
      <header className="admin-page-heading admin-form-heading">
        <div><p className="admin-path">Catálogo / Productos / {isNew ? "Nuevo" : "Editar"}</p><h1 id="admin-form-title">{isNew ? "Crear producto" : "Editar producto"}</h1><p>{isNew ? "Prepara una ficha nueva para el catálogo." : "Revisa la información, las variantes y su publicación."}</p></div>
        <StatusBadge status={confirmedStatus} />
      </header>


      <form className="admin-product-form" onSubmit={handleSubmit} noValidate>
        <fieldset disabled={saving || reloadRequired} className="admin-editor-fields">
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

            <ProductImageField value={imageEdit} onChange={(value) => { setImageEdit(value); setSaveSuccess(false); }} publicUrl={(path) => client.storage.from("product-images").getPublicUrl(path).data.publicUrl} />

            <section className="admin-form-section" aria-labelledby="variants-title">
              <div className="admin-form-section-heading admin-variants-heading"><div className="admin-heading-with-icon"><span className="admin-stack-icon" aria-hidden="true"><span /><span /></span><div><h2 id="variants-title">Variantes y precios</h2><p>Cada opción conserva su precio y existencias propios.</p></div></div><Button type="button" variant="outline" size="sm" onClick={() => { setProduct((current) => ({ ...current, variants: [...current.variants, createBlankVariant()] })); setSaveSuccess(false); }}><Plus size={16} /> Añadir variante</Button></div>
              <div className="admin-variant-list">
                {product.variants.map((variant, index) => {
                  const prefix = `variant-${variant.id}`;
                  const canRemove = variant.id.startsWith("new-");
                  return <div className={`admin-variant ${variant.isActive ? "" : "admin-variant-inactive"}`} key={variant.id}>
                    <div className="admin-variant-heading"><div><span className="admin-variant-index">{String(index + 1).padStart(2, "0")}</span><h3>{variant.name.trim() || "Variante sin nombre"}</h3><span className="admin-variant-state">{variant.isActive ? "Activa" : "Inactiva"}</span></div><div className="admin-variant-actions"><Button type="button" variant="ghost" size="icon" disabled={index === 0} aria-label={`Subir variante ${index + 1}`} title="Subir variante" onClick={() => moveVariant(index, -1)}><ArrowUp size={16} /></Button><Button type="button" variant="ghost" size="icon" disabled={index === product.variants.length - 1} aria-label={`Bajar variante ${index + 1}`} title="Bajar variante" onClick={() => moveVariant(index, 1)}><ArrowDown size={16} /></Button><Button type="button" variant="ghost" size="sm" aria-pressed={variant.isActive} onClick={() => updateVariant(variant.id, "isActive", !variant.isActive)}>{variant.isActive ? <Eye size={16} /> : <EyeOff size={16} />}{variant.isActive ? "Desactivar" : "Activar"}</Button>{canRemove && <Button type="button" variant="ghost" size="icon" aria-label={`Quitar variante ${index + 1} sin guardar`} onClick={() => { setProduct((current) => ({ ...current, variants: current.variants.filter((item) => item.id !== variant.id) })); setSaveSuccess(false); }}><Trash2 size={16} /></Button>}</div></div>
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

        </div>
        </fieldset>
        <div className="admin-form-footer">
          <div className="admin-review-message" aria-live="polite">
            {saveError && <span role="alert">{saveError} {saveError.includes("Recarga") && <button type="button" onClick={() => window.location.reload()}>Recargar</button>}</span>}
            {saveSuccess && <span role="status">Cambios guardados.</span>}
            {Object.keys(errors).length > 0 && <span role="alert">Corrige los campos indicados antes de guardar. {errors.status}</span>}
          </div>
          <div className="admin-form-buttons">
            {!isNew && confirmedStatus !== "archived" && <details className="admin-more-actions"><summary>Más acciones</summary><div>{confirmedStatus === "published" && <LoadingButton busy={saving && savingStatus === "draft"} busyLabel={savingPhase} type="button" variant="ghost" disabled={saving || reloadRequired} onClick={() => void handleSave("draft")}><EyeOff size={16} />Guardar como borrador</LoadingButton>}<Button type="button" variant="ghost" disabled={saving || reloadRequired} onClick={() => setShowArchiveConfirm(true)}><Archive size={16} />Archivar producto</Button></div></details>}
            {confirmedStatus === "draft" && <LoadingButton busy={saving && savingStatus === "draft"} busyLabel={savingPhase} type="button" variant="outline" disabled={saving || reloadRequired} onClick={() => void handleSave("draft")}>Guardar borrador</LoadingButton>}
            <LoadingButton busy={saving && savingStatus === (confirmedStatus === "archived" ? "draft" : "published")} busyLabel={savingPhase} type="submit" disabled={saving || reloadRequired}><Save size={17} />{confirmedStatus === "archived" ? "Restaurar como borrador" : confirmedStatus === "published" ? "Guardar cambios" : "Publicar producto"}</LoadingButton>
          </div>
        </div>
        {showArchiveConfirm && <div className="admin-inline-confirm" role="group" aria-label="Confirmar archivo"><div><h2>¿Archivar “{product.name}”?</h2><p>Se guardarán también los cambios de este formulario y el producto dejará de aparecer en el catálogo. Podrás restaurarlo como borrador.</p></div><div><Button type="button" variant="outline" disabled={saving || reloadRequired} onClick={() => setShowArchiveConfirm(false)}>Cancelar</Button><LoadingButton busy={saving && savingStatus === "archived"} busyLabel={savingPhase} type="button" disabled={saving || reloadRequired} onClick={() => void handleSave("archived")}>Guardar y archivar</LoadingButton></div></div>}
      </form>
      <AdminEngravingSettings categoryId={product.categoryId} />
    </section>
  );
}
