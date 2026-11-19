"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { LoadingButton } from "@/features/loading/LoadingButton";
import { checkoutRequest, CheckoutRequestError } from "@/features/checkout/lib/checkoutClient";
import { isStripeCheckoutUrl } from "@/features/checkout/lib/paymentResult";

export function PayButton({ orderId, children = "Pagar", variant = "default" }: { orderId: string; children?: string; variant?: "default" | "outline" }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Al volver con «Atrás» desde Stripe el navegador puede restaurar la página con el botón ocupado.
  useEffect(() => {
    const restore = (event: PageTransitionEvent) => { if (event.persisted) setBusy(false); };
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, []);

  async function pay() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { url } = await checkoutRequest<{ url: string }>(`/api/checkout/pedidos/${orderId}/pago`, {});
      if (!isStripeCheckoutUrl(url)) throw new CheckoutRequestError("No se pudo abrir la página de pago. Inténtalo de nuevo.");
      window.location.assign(url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo iniciar el pago.");
      setBusy(false);
    }
  }

  return <div className="checkout-pay">
    <LoadingButton type="button" variant={variant} busy={busy} busyLabel="Abriendo la página de pago" onClick={pay}><CreditCard size={16} aria-hidden="true" />{children}</LoadingButton>
    {error && <p role="alert" className="checkout-field-error">{error}</p>}
  </div>;
}
