"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleCheck, CircleX, Clock, RefreshCw, SearchCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingIndicator, LoadingRegion, FormSkeleton } from "@/features/loading/Loading";
import { checkoutRequest, CheckoutRequestError, money, paymentStatusLabel } from "@/features/checkout/lib/checkoutClient";
import { canRetryPayment, orderHistoryHref, paymentResultView, POLL_INTERVAL_MS, POLL_MAX_MS, type PaymentView } from "@/features/checkout/lib/paymentResult";
import { CheckoutSummary } from "@/features/checkout/components/CheckoutSummary";
import { PayButton } from "@/features/checkout/components/PayButton";
import type { CheckoutOrder } from "@/features/checkout/types/checkout";

const FATAL_CODES = new Set(["UNAUTHENTICATED", "ORDER_NOT_FOUND"]);

export function PaymentResult({ orderId, canceledByUser }: { orderId: string; canceledByUser: boolean }) {
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [failure, setFailure] = useState<{ message: string; code: string } | null>(null);
  const [now, setNow] = useState(0);
  const [stalled, setStalled] = useState(false);
  const [refresh, setRefresh] = useState(0);

  // Consulta el pedido y repite cada pocos segundos mientras el pago siga pendiente.
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const started = Date.now();

    async function check() {
      let again = false;
      try {
        const result = await checkoutRequest<CheckoutOrder>(`/api/checkout/pedidos/${orderId}`);
        if (!active) return;
        const current = Date.now();
        setOrder(result);
        setFailure(null);
        setNow(current);
        again = paymentResultView(result, { canceledByUser, now: current }) === "pending";
      } catch (caught) {
        if (!active) return;
        const code = caught instanceof CheckoutRequestError ? caught.code : "NETWORK_ERROR";
        setFailure({ message: caught instanceof Error ? caught.message : "No pudimos consultar el pedido.", code });
        // Un fallo temporal no borra lo que ya se mostraba; se vuelve a intentar.
        again = !FATAL_CODES.has(code);
      }
      if (!again) return;
      if (Date.now() - started > POLL_MAX_MS) { setStalled(true); return; }
      timer = setTimeout(check, POLL_INTERVAL_MS);
    }

    void check();
    return () => { active = false; if (timer) clearTimeout(timer); };
  }, [orderId, canceledByUser, refresh]);

  function checkAgain() {
    setStalled(false);
    setRefresh((value) => value + 1);
  }

  if (!order) {
    if (!failure) return <LoadingRegion label="Consultando el estado de tu pedido"><FormSkeleton fields={2} /></LoadingRegion>;
    return <section className="checkout-receipt" role="alert">
      <CircleX size={30} aria-hidden="true" />
      <h1>{failure.code === "ORDER_NOT_FOUND" ? "No encontramos este pedido" : failure.code === "UNAUTHENTICATED" ? "Inicia sesión para ver tu pedido" : "No pudimos consultar tu pedido"}</h1>
      <p>{failure.message}</p>
      <div className="checkout-actions">
        {failure.code === "UNAUTHENTICATED" ? <Button asChild><Link href="/login">Iniciar sesión</Link></Button>
          : failure.code === "ORDER_NOT_FOUND" ? <Button asChild><Link href="/catalogo">Volver al catálogo</Link></Button>
            : <Button type="button" onClick={checkAgain}><RefreshCw size={16} aria-hidden="true" />Intentar de nuevo</Button>}
      </div>
    </section>;
  }

  const view = paymentResultView(order, { canceledByUser, now });
  const retry = canRetryPayment(order, now);

  return <div className="checkout-grid checkout-result">
    <section className="checkout-receipt" aria-live="polite" aria-labelledby="payment-result-title">
      <ViewIcon view={view} />
      <h1 id="payment-result-title" tabIndex={-1}>{TITLES[view]}</h1>
      <p className="checkout-order-id">Pedido {order.id}</p>
      <p>{describe(view, order, stalled)}</p>
      {view === "pending" && !stalled && <p className="checkout-caption"><LoadingIndicator label="Actualizando el estado del pedido" /> Esta página se actualiza sola; no hace falta recargarla ni volver a pagar.</p>}
      {failure && view === "pending" && <p role="alert" className="checkout-field-error">No pudimos actualizar el estado ahora mismo. Seguimos intentándolo.</p>}
      <p className="checkout-caption">Estado del pago: {paymentStatusLabel(order.paymentStatus)}.</p>
      <div className="checkout-actions">
        {view === "pending" && stalled && <Button type="button" onClick={checkAgain}><RefreshCw size={16} aria-hidden="true" />Comprobar de nuevo</Button>}
        {view === "canceled" && retry && <PayButton orderId={order.id}>Reintentar el pago</PayButton>}
        {(view === "canceled" || view === "expired") && <Button asChild variant="outline"><Link href="/catalogo">Volver al catálogo</Link></Button>}
        {view !== "expired" && <Button asChild variant="outline"><Link href={orderHistoryHref()}>Ver mi pedido</Link></Button>}
      </div>
    </section>
    <CheckoutSummary calculating={false} quote={null} order={order} now={now} valid={false} busy={false} onConfirm={() => {}} />
  </div>;
}

const TITLES: Record<PaymentView, string> = {
  paid: "Recibimos tu pago",
  pending: "Estamos confirmando tu pago",
  canceled: "El pago no se completó",
  expired: "La reserva de tu pedido venció",
  review: "Tu pedido está en revisión",
};

function describe(view: PaymentView, order: CheckoutOrder, stalled: boolean): string {
  switch (view) {
    case "paid": return `El pago de ${money(order.totalPen)} está confirmado. Esto no garantiza una fecha de entrega.`;
    case "pending": return stalled
      ? "Todavía no recibimos la confirmación de tu pago. Si ya pagaste, no lo repitas: vuelve a comprobar en unos minutos."
      : "Estamos esperando la confirmación del pago. Puede tardar unos segundos.";
    case "canceled": return order.status === "canceled"
      ? "Este pedido se canceló y ya no admite pago. Puedes elegir tus productos otra vez desde el catálogo."
      : "No se realizó ningún cobro. Tu pedido sigue reservado hasta que termine el plazo; puedes volver a intentar el pago.";
    case "expired": return "No se registró ningún pago antes de que terminara la reserva. Elige tus productos otra vez desde el catálogo.";
    default: return order.paymentStatus === "paid"
      ? "Recibimos tu pago, pero el pedido necesita una revisión manual, por ejemplo porque el pago llegó después de terminar la reserva. Nos pondremos en contacto contigo."
      : "Tu pedido necesita una revisión. Conservamos sus datos mientras tanto.";
  }
}

function ViewIcon({ view }: { view: PaymentView }) {
  if (view === "paid") return <CircleCheck size={30} aria-hidden="true" />;
  if (view === "pending") return <Clock size={30} aria-hidden="true" />;
  if (view === "review") return <SearchCheck size={30} aria-hidden="true" />;
  return <CircleX size={30} aria-hidden="true" />;
}
