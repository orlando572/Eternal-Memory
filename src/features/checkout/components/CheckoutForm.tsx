"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormSkeleton, LoadingRegion, LoadingIndicator, Skeleton } from "@/features/loading/Loading";
import { LoadingButton } from "@/features/loading/LoadingButton";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/features/cart/context/CartContext";
import { CheckoutError, readCheckoutInput } from "@/features/checkout/lib/validation";
import { attemptStorageKey, checkoutRequest, CheckoutRequestError, isCheckoutOrder, money, orderStatusLabel, paymentStatusLabel, readAttempt, type CheckoutAttempt } from "@/features/checkout/lib/checkoutClient";
import type { CheckoutInput, CheckoutOptions, CheckoutOrder, CheckoutQuote } from "@/features/checkout/types/checkout";
import { CheckoutSummary } from "@/features/checkout/components/CheckoutSummary";

type Contact = Pick<CheckoutInput, "contactName" | "contactEmail" | "contactPhone">;
type Engraving = { enabled: boolean; perUnit: boolean; text: string; names: string[] };
type ReviewedQuote = { quote: CheckoutQuote; signature: string };
const noEngraving: Engraving = { enabled: false, perUnit: false, text: "", names: [] };
const definiteFailures = new Set(["QUOTE_EXPIRED", "QUOTE_CHANGED", "IDEMPOTENCY_CONFLICT", "INVALID_INPUT", "INVALID_CART", "INVALID_LOCATION", "INVALID_CUSTOMIZATION", "DELIVERY_UNAVAILABLE", "DELIVERY_NOT_CONFIGURED", "VARIANT_UNAVAILABLE", "INSUFFICIENT_STOCK"]);

export function CheckoutForm({ userId, initialContact }: { userId: string; initialContact: Contact }) {
  const { cart, initialized, validation, error: cartError, retry, openCart, consumeOrder, storageWarning } = useCart();
  const [fields, setFields] = useState({ ...initialContact, addressLine: "", addressDetail: "", ubigeo: "" });
  const [department, setDepartment] = useState("");
  const [province, setProvince] = useState("");
  const [engravings, setEngravings] = useState<Record<string, Engraving>>({});
  const [options, setOptions] = useState<CheckoutOptions | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [optionsRetry, setOptionsRetry] = useState(0);
  const [reviewed, setReviewed] = useState<ReviewedQuote | null>(null);
  const [busy, setBusy] = useState<"quote" | "order" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [attempt, setAttempt] = useState<CheckoutAttempt | null>(null);
  const [recovered, setRecovered] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [now, setNow] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef<HTMLDivElement>(null);
  const requestLock = useRef(false);
  const storageKey = attemptStorageKey(userId);
  const productIds = JSON.stringify([...new Set(cart.flatMap((line) => line.productId ? [line.productId] : []))].sort());
  const selection = cart.map(({ key, productId, variantId, quantity }) => ({ key, productId, variantId, quantity }));
  const signature = JSON.stringify({ fields, selection, engravings });
  const validCart = !!validation && validation.lines.length === cart.length && cart.every((item) => item.productId && item.variantId && validation.lines.some((line) => line.key === item.key && line.status === "valid"));
  const quoteValid = !!reviewed && reviewed.signature === signature && Date.parse(reviewed.quote.expiresAt) > now && validCart && now > 0;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    queueMicrotask(() => setNow(Date.now()));
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try { setAttempt(readAttempt(sessionStorage.getItem(storageKey))); }
      catch { setStorageBlocked(true); setError("No pudimos recuperar el intento guardado en esta pestaña. No confirmes otro pedido hasta revisar el resultado anterior."); }
      setRecovered(true);
    });
    return () => { active = false; };
  }, [storageKey]);

  useEffect(() => {
    const ids = JSON.parse(productIds) as string[];
    if (!initialized || !ids.length) return;
    let active = true;
    void checkoutRequest<CheckoutOptions>("/api/checkout/opciones", { productIds: ids }).then((data) => {
      if (active) {
        setOptions(data); setOptionsError(null);
        setReviewed((previous) => previous && previous.quote.summary.lines.some((line) => {
          if (!line.customization) return false;
          const rule = data.products.find((product) => product.id === line.productId)?.customization;
          return !rule || rule.unitSurchargePen !== line.customizationUnitPen;
        }) ? null : previous);
      }
    }).catch((caught) => { if (active) setOptionsError(caught instanceof Error ? caught.message : "No se pudieron cargar las opciones de entrega."); });
    return () => { active = false; };
  }, [initialized, productIds, optionsRetry]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      clearTimeout(timer);
      timer = setTimeout(() => setOptionsRetry((value) => value + 1), 100);
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { clearTimeout(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, []);

  useEffect(() => {
    if (error) noticeRef.current?.focus();
  }, [error]);
  useEffect(() => { if (order) orderRef.current?.focus(); }, [order]);

  async function finishAttempt(current: CheckoutAttempt) {
    if (requestLock.current) return;
    requestLock.current = true;
    setBusy("order");
    setError(null);
    try {
      const result = current.orderId
        ? await checkoutRequest<CheckoutOrder>(`/api/checkout/pedidos/${current.orderId}`)
        : await checkoutRequest<CheckoutOrder>("/api/checkout/pedidos", { quoteId: current.quoteId, idempotencyKey: current.idempotencyKey });
      if (!isCheckoutOrder(result)) throw new CheckoutRequestError("No se pudo verificar la respuesta. Recupera el resultado del mismo intento.");
      const completed = { ...current, orderId: result.id, finalized: true };
      try { sessionStorage.setItem(storageKey, JSON.stringify(completed)); } catch { /* The original pending attempt still recovers the same order. */ }
      if (!current.finalized && result.status === "pending_payment" && Date.parse(result.reservationExpiresAt) > Date.now()) consumeOrder(current.selection);
      setAttempt(completed);
      setOrder(result);
    } catch (caught) {
      setNeedsLogin(caught instanceof CheckoutRequestError && caught.code === "UNAUTHENTICATED");
      if (caught instanceof CheckoutRequestError && definiteFailures.has(caught.code)) {
        try { sessionStorage.removeItem(storageKey); setAttempt(null); }
        catch { setStorageBlocked(true); }
        setReviewed(null);
      }
      setError(caught instanceof Error ? caught.message : "No pudimos confirmar el resultado del pedido.");
    } finally { setBusy(null); requestLock.current = false; }
  }

  // An interrupted confirmation is resumed before allowing another order, even if the cart is empty.
  useEffect(() => {
    if (!initialized || !recovered || !attempt || order || storageBlocked) return;
    let active = true;
    queueMicrotask(() => { if (active) void finishAttempt(attempt); });
    // Retry is explicit after the first automatic recovery; changing cart metadata must not resubmit.
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, recovered]);

  function update(field: keyof typeof fields, value: string) {
    setFields((previous) => ({ ...previous, [field]: value }));
    setReviewed(null);
    setFieldErrors((previous) => ({ ...previous, [field]: "" }));
    setError(null);
  }
  function updateEngraving(key: string, value: Partial<Engraving>) {
    setEngravings((previous) => ({ ...previous, [key]: { ...(previous[key] ?? noEngraving), ...value } }));
    setReviewed(null);
    setFieldErrors({});
    setError(null);
  }

  function buildInput(): CheckoutInput {
    const lines = cart.flatMap((item) => {
      const engraving = engravings[item.key] ?? noEngraving;
      const base = { key: item.key, productId: item.productId, variantId: item.variantId, quantity: item.quantity };
      if (engraving.enabled && engraving.perUnit && item.quantity > 1) return Array.from({ length: item.quantity }, (_, index) => ({ ...base, key: `${item.key.slice(0, 180)}:name:${index}`, quantity: 1, customization: { mode: "urn_name", text: engraving.names[index] ?? "" } }));
      return [{ ...base, customization: engraving.enabled ? { mode: "urn_name", text: engraving.text } : null }];
    });
    if (lines.length > 50) throw new CheckoutError("INVALID_CART", "El pedido admite hasta 50 grupos de productos. Usa un mismo nombre para varias urnas o reduce la selección.", 422, "lines");
    return readCheckoutInput({ ...fields, lines });
  }

  async function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestLock.current || attempt || storageBlocked) return;
    setError(null);
    setFieldErrors({});
    setReviewed(null);
    if (!validCart || !options) { setError("Espera la validación del carrito y revisa sus avisos antes de continuar."); return; }
    let input: CheckoutInput;
    try {
      input = buildInput();
      if (!options.locations.find((location) => location.ubigeo === input.ubigeo)?.is_covered) throw new CheckoutError("DELIVERY_UNAVAILABLE", "Esta ubicación está fuera de nuestra cobertura de entrega.", 422, "ubigeo");
    } catch (caught) { showError(caught); return; }
    requestLock.current = true;
    setBusy("quote");
    try {
      const result = await checkoutRequest<CheckoutQuote>("/api/checkout/resumen", input);
      setReviewed({ quote: result, signature });
      requestAnimationFrame(() => document.getElementById("checkout-summary-title")?.focus());
    } catch (caught) { showError(caught); }
    finally { setBusy(null); requestLock.current = false; }
  }

  function showError(caught: unknown) {
    const message = caught instanceof Error ? caught.message : "Revisa los datos del pedido.";
    setError(message);
    setNeedsLogin(caught instanceof CheckoutRequestError && caught.code === "UNAUTHENTICATED");
    if (caught instanceof CheckoutError || caught instanceof CheckoutRequestError) {
      if (caught.field) {
        setFieldErrors({ [caught.field]: message });
        requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[data-field="${caught.field}"] input, [data-field="${caught.field}"] select, [data-field="${caught.field}"] textarea`)?.focus());
      }
      const failedLines = caught.lines;
      if (Array.isArray(failedLines)) setFieldErrors((previous) => ({ ...previous, ...Object.fromEntries(failedLines.filter((line) => line.status !== "valid").map((line) => {
        const item = cart.find((entry) => entry.key === line.key || line.key.startsWith(`${entry.key.slice(0, 180)}:name:`));
        return [`line:${item?.key ?? line.key}`, line.message ?? message];
      })) }));
    }
  }

  async function confirm() {
    if (!quoteValid || !reviewed || requestLock.current || attempt || !options || storageBlocked) return;
    const current: CheckoutAttempt = { quoteId: reviewed.quote.quoteId, idempotencyKey: crypto.randomUUID(), selection: cart.map((line) => ({ key: line.key, productId: line.productId!, variantId: line.variantId!, quantity: line.quantity })) };
    try { sessionStorage.setItem(storageKey, JSON.stringify(current)); }
    catch { setError("No pudimos guardar el intento en esta pestaña. Permite su almacenamiento antes de confirmar; todavía no se creó ningún pedido."); return; }
    setAttempt(current);
    await finishAttempt(current);
  }

  const departments = [...new Map(options?.locations.map((location) => [location.ubigeo.slice(0, 2), location.department])).entries()];
  const provinces = [...new Map(options?.locations.filter((location) => department && location.ubigeo.startsWith(department)).map((location) => [location.ubigeo.slice(0, 4), location.province])).entries()];
  const districts = options?.locations.filter((location) => province && location.ubigeo.startsWith(province)) ?? [];
  const destination = options?.locations.find((location) => location.ubigeo === fields.ubigeo);
  const disabled = busy !== null || !!attempt || storageBlocked;
  const fieldError = (field: string) => fieldErrors[field] ? <p className="checkout-field-error" id={`error-${field}`}>{fieldErrors[field]}</p> : null;
  const inputProps = (field: keyof typeof fields) => ({ id: field, name: field, value: fields[field], onChange: (event: React.ChangeEvent<HTMLInputElement>) => update(field, event.target.value), "aria-invalid": !!fieldErrors[field], "aria-describedby": fieldErrors[field] ? `error-${field}` : undefined });

  return <main className="shop-page checkout-page"><div className="shop-container">
    <header className="checkout-heading"><Link href="/catalogo" className="shop-back-link"><ArrowLeft size={15} aria-hidden="true" /> Volver al catálogo</Link><p className="checkout-kicker">Tu selección, con calma</p><h1>Revisa tu pedido.</h1><p>Completa la entrega, elige un grabado si lo deseas y revisa el total antes de confirmar.</p></header>
    {error && <div ref={noticeRef} tabIndex={-1} role="alert" className="checkout-notice checkout-error"><p>{error}</p>{needsLogin && <Link href="/login?next=%2Fcheckout">Iniciar sesión y volver a mi pedido</Link>}</div>}
    {!initialized || !recovered ? <LoadingRegion label="Recuperando selección y pedido"><div className="checkout-grid"><FormSkeleton fields={4} /><FormSkeleton fields={2} /></div></LoadingRegion> : order ? <>
      <div ref={orderRef} tabIndex={-1} className="checkout-receipt" role="status"><PackageCheck size={30} aria-hidden="true" /><h2>{order.status === "pending_payment" ? "Tu pedido está registrado" : "Estado de tu pedido"}</h2><p className="checkout-order-id">Pedido {order.id}</p><p>{order.status === "pending_payment" ? (Date.parse(order.reservationExpiresAt) > now ? `Pendiente de pago. Reserva hasta ${new Date(order.reservationExpiresAt).toLocaleString("es-PE", { timeZone: "America/Lima" })} (hora de Perú).` : "El plazo de reserva terminó. El estado se actualizará al procesar el vencimiento.") : order.status === "canceled" ? "El pedido está cancelado; no se ha creado otra reserva." : `Estado: ${orderStatusLabel(order.status)}. Estado de pago: ${paymentStatusLabel(order.paymentStatus)}.`}</p><p>El pago en línea todavía no está habilitado. La confirmación del pedido no equivale a un pago ni garantiza una fecha de entrega.</p><Button type="button" variant="outline" onClick={() => { try { sessionStorage.removeItem(storageKey); setAttempt(null); setOrder(null); setReviewed(null); setEngravings({}); setError(null); } catch { setError("No pudimos liberar el intento guardado. Inténtalo de nuevo."); } }}>Preparar otro pedido</Button></div>
      <CheckoutSummary calculating={busy === "quote"} quote={null} order={order} now={now} valid={false} busy={false} onConfirm={() => {}} />
    </> : attempt ? <section className="checkout-empty" aria-busy={busy === "order"}>{busy ? <div className="loading-checkout-recovery"><LoadingIndicator label="Recuperando confirmación del pedido" /></div> : <><h2>Recuperar la confirmación</h2><p>No recibimos la confirmación. Recupera el resultado del mismo intento antes de crear otro pedido.</p></>}<LoadingButton busy={busy !== null} type="button" disabled={busy !== null} onClick={() => void finishAttempt(attempt)}>Recuperar resultado del pedido</LoadingButton></section>
    : cart.length === 0 ? <section className="checkout-empty"><h2>Tu selección está vacía</h2><p>Elige productos y variantes antes de preparar la entrega.</p><Button asChild><Link href="/catalogo">Explorar catálogo <ArrowRight size={16} aria-hidden="true" /></Link></Button></section>
    : <div className="checkout-grid">
      <form ref={formRef} onSubmit={review} noValidate className="checkout-form" aria-busy={busy !== null}>
        {storageWarning && <p className="checkout-notice" role="alert">{storageWarning}</p>}
        {(!validCart || cartError) && <div className="checkout-notice" aria-live="polite">{!validation && !cartError ? <LoadingIndicator label="Comprobando precios y existencias" /> : <p>{cartError ?? "Revisa las líneas indicadas antes de continuar."}</p>}{validation?.lines.filter((line) => line.status !== "valid").map((line) => <p key={line.key}>{line.name ?? "Producto"}: {line.message}</p>)}<Button type="button" variant="outline" onClick={openCart}>Revisar carrito</Button>{cartError && <Button type="button" variant="ghost" onClick={retry}>Reintentar validación</Button>}</div>}
        {optionsError && <div className="checkout-notice" role="alert"><p>{optionsError}</p><Button type="button" variant="outline" onClick={() => { setOptionsError(null); setOptions(null); setOptionsRetry((value) => value + 1); }}>Reintentar opciones de entrega</Button></div>}
        {!options && !optionsError && <LoadingRegion label="Cargando opciones de entrega y grabado"><div className="loading-options"><Skeleton className="loading-input" /><Skeleton className="loading-input" /></div></LoadingRegion>}
        <fieldset disabled={disabled} className="checkout-section" aria-labelledby="checkout-contact-title"><h2 id="checkout-contact-title">Contacto</h2><p>Usamos tu perfil como ayuda. Los cambios aquí solo se guardarán en este pedido.</p>
          <div className="checkout-fields"><div data-field="contactName" className="checkout-wide"><label htmlFor="contactName">Nombre completo <span>(obligatorio)</span></label><Input {...inputProps("contactName")} autoComplete="name" required maxLength={120} />{fieldError("contactName")}</div>
            <div data-field="contactEmail"><label htmlFor="contactEmail">Correo electrónico <span>(obligatorio)</span></label><Input {...inputProps("contactEmail")} type="email" autoComplete="email" required maxLength={254} />{fieldError("contactEmail")}</div>
            <div data-field="contactPhone"><label htmlFor="contactPhone">Teléfono <span>(obligatorio)</span></label><Input {...inputProps("contactPhone")} type="tel" autoComplete="tel" required maxLength={20} />{fieldError("contactPhone")}</div></div>
        </fieldset>
        <fieldset disabled={disabled || !options} className="checkout-section" aria-labelledby="checkout-delivery-title"><h2 id="checkout-delivery-title">Entrega</h2><p>Selecciona departamento, provincia y distrito. El envío se confirmará en el resumen.</p>
          <div className="checkout-fields"><div><label htmlFor="checkout-department">Departamento <span>(obligatorio)</span></label><NativeSelect id="checkout-department" value={department} onChange={(event) => { setDepartment(event.target.value); setProvince(""); update("ubigeo", ""); }}><option value="">Selecciona departamento</option>{departments.map(([id, name]) => <option value={id} key={id}>{name}</option>)}</NativeSelect></div>
            <div><label htmlFor="checkout-province">Provincia <span>(obligatorio)</span></label><NativeSelect id="checkout-province" disabled={!department} value={province} onChange={(event) => { setProvince(event.target.value); update("ubigeo", ""); }}><option value="">Selecciona provincia</option>{provinces.map(([id, name]) => <option value={id} key={id}>{name}</option>)}</NativeSelect></div>
            <div data-field="ubigeo" className="checkout-wide"><label htmlFor="checkout-district">Distrito <span>(obligatorio)</span></label><NativeSelect id="checkout-district" disabled={!province} value={fields.ubigeo} onChange={(event) => update("ubigeo", event.target.value)} aria-invalid={!!fieldErrors.ubigeo} aria-describedby={fieldErrors.ubigeo ? "error-ubigeo" : "checkout-coverage"}><option value="">Selecciona distrito</option>{districts.map((location) => <option key={location.ubigeo} value={location.ubigeo}>{location.district}{location.is_covered ? "" : " — Sin cobertura"}</option>)}</NativeSelect>{fieldError("ubigeo")}</div>
            <div data-field="addressLine" className="checkout-wide"><label htmlFor="addressLine">Dirección de entrega <span>(obligatorio)</span></label><Input {...inputProps("addressLine")} autoComplete="street-address" maxLength={240} required placeholder="Calle, número, urbanización o referencia de dirección" />{fieldError("addressLine")}</div>
            <div data-field="addressDetail" className="checkout-wide"><label htmlFor="addressDetail">Referencias para la entrega <span>(opcional)</span></label><Textarea id="addressDetail" name="addressDetail" value={fields.addressDetail} onChange={(event) => update("addressDetail", event.target.value)} maxLength={300} aria-invalid={!!fieldErrors.addressDetail} aria-describedby={fieldErrors.addressDetail ? "error-addressDetail" : undefined} />{fieldError("addressDetail")}</div></div>
          <p id="checkout-coverage" className={destination && !destination.is_covered ? "checkout-field-error" : "checkout-caption"}>{destination && !destination.is_covered ? "Esta ubicación está fuera de cobertura. Selecciona otra dirección para continuar." : "Sin cobertura: provincia de Purús (Ucayali), provincia de Putumayo (Loreto) y distrito de Megantoni (Cusco)."}</p>
        </fieldset>
        <fieldset disabled={disabled || !options} className="checkout-section" aria-labelledby="checkout-products-title"><h2 id="checkout-products-title">Productos y grabado</h2><p>El grabado es opcional y solo está disponible en las urnas admitidas.</p>{fieldError("lines")}
          {cart.map((item, itemIndex) => {
            const product = options?.products.find((entry) => entry.id === item.productId);
            const rule = product?.customization;
            const engraving = engravings[item.key] ?? noEngraving;
            const units = Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 50 ? item.quantity : 1;
            const lineOffset = cart.slice(0, itemIndex).reduce((total, previous) => total + (engravings[previous.key]?.enabled && engravings[previous.key]?.perUnit ? previous.quantity : 1), 0);
            const engravingField = (index: number) => `lines.${lineOffset + index}.customization.text`;
            return <div className="checkout-product" key={item.key}><h3>{product?.name ?? item.nombre}</h3><p>{item.selectedOption} · {item.quantity} {item.quantity === 1 ? "unidad" : "unidades"}</p>
              {fieldErrors[`line:${item.key}`] && <p className="checkout-field-error">{fieldErrors[`line:${item.key}`]}</p>}
              {rule ? <><label className="checkout-check"><input type="checkbox" checked={engraving.enabled} onChange={(event) => updateEngraving(item.key, { enabled: event.target.checked })} /><span>Grabar el nombre de la persona fallecida <strong>+ {money(rule.unitSurchargePen)} por urna</strong></span></label>
                {engraving.enabled && <div className="checkout-engraving-fields">{item.quantity > 1 && <label className="checkout-check"><input type="checkbox" checked={engraving.perUnit} onChange={(event) => updateEngraving(item.key, { perUnit: event.target.checked })} /><span>Usar un nombre diferente en cada urna</span></label>}
                  {engraving.perUnit && units > 1 ? Array.from({ length: units }, (_, index) => <div key={index} data-field={engravingField(index)}><label htmlFor={`engraving-${itemIndex}-${index}`}>Nombre para la urna {index + 1} <span>(obligatorio)</span></label><Input id={`engraving-${itemIndex}-${index}`} value={engraving.names[index] ?? ""} onChange={(event) => { const names = [...engraving.names]; names[index] = event.target.value; updateEngraving(item.key, { names }); }} maxLength={rule.maxCharacters} required aria-invalid={!!fieldErrors[engravingField(index)]} aria-describedby={fieldErrors[engravingField(index)] ? `error-${engravingField(index)}` : undefined} />{fieldError(engravingField(index))}</div>) : <div data-field={engravingField(0)}><label htmlFor={`engraving-${itemIndex}`}>Nombre a grabar <span>(obligatorio)</span></label><Input id={`engraving-${itemIndex}`} value={engraving.text} onChange={(event) => updateEngraving(item.key, { text: event.target.value })} maxLength={rule.maxCharacters} required aria-invalid={!!fieldErrors[engravingField(0)]} aria-describedby={fieldErrors[engravingField(0)] ? `error-${engravingField(0)}` : undefined} />{fieldError(engravingField(0))}</div>}
                  <p className="checkout-caption">Hasta {rule.maxCharacters} caracteres. Revisa la escritura y los acentos. {item.quantity > 1 && !engraving.perUnit ? "El mismo nombre se aplicará a todas las urnas de esta línea." : "El recargo se aplica a cada unidad personalizada."}</p></div>}
              </> : options ? <p className="checkout-caption">Sin opción de grabado para este producto.</p> : <Skeleton className="loading-line" />}
            </div>;
          })}
          <Button variant="ghost" type="button" onClick={openCart}>Agregar más al carrito</Button>
        </fieldset>
        <div className="checkout-review-action"><LoadingButton busy={busy === "quote"} type="submit" disabled={disabled || !options || !!optionsError || !validCart || destination?.is_covered === false}>Revisar mi pedido<ArrowRight size={17} aria-hidden="true" /></LoadingButton></div>
      </form>
      <CheckoutSummary calculating={busy === "quote"} quote={reviewed?.quote ?? null} now={now} valid={quoteValid && !optionsError} busy={busy === "order"} onConfirm={() => void confirm()} />
    </div>}
  </div></main>;
}
