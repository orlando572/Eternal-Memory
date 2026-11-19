"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { orderStatusLabel } from "@/features/checkout/lib/checkoutClient";
import { REASON_MAX_LENGTH, allowedTransitions, type OrderTransition } from "@/features/admin-orders/lib/orderTransitions";

const actionLabels: Record<string, string> = {
  processing: "Pasar a preparación",
  shipped: "Marcar como enviado",
  completed: "Marcar como completado",
  review_required: "Enviar a revisión",
  canceled: "Cancelar pedido",
};

function actionLabel(transition: OrderTransition): string {
  if (transition.from === "review_required" && transition.to === "processing") return "Retomar la preparación";
  return actionLabels[transition.to] ?? orderStatusLabel(transition.to);
}

function actionHint(transition: OrderTransition): string {
  if (transition.to === "canceled") {
    return transition.from === "pending_payment"
      ? "Se liberará el stock reservado y se cerrará su página de pago. No se puede deshacer."
      : "El pedido quedará cancelado y no se puede deshacer. No se devuelve el stock ni se crea un reembolso: ambos se gestionan a mano.";
  }
  if (transition.to === "review_required") return "El pedido queda en pausa hasta que lo retomes. Indica qué hay que revisar.";
  return "El cliente verá el nuevo estado en el seguimiento de su pedido.";
}

type Failure = { message: string; login?: boolean };

async function readFailure(response: Response): Promise<Failure> {
  const body = await response.json().catch(() => null) as { error?: unknown; code?: unknown } | null;
  const serverMessage = typeof body?.error === "string" ? body.error : null;
  if (response.status === 401) return { message: "Tu sesión terminó. Inicia sesión de nuevo para continuar.", login: true };
  if (response.status === 403) return { message: "No tienes permisos de administrador para cambiar este pedido." };
  if (response.status === 404) return { message: "No se encontró el pedido. Puede que se haya eliminado." };
  if (response.status === 409) return { message: "El pedido ya no admite ese cambio: su estado cambió mientras lo revisabas. Mostramos su estado actual." };
  return { message: serverMessage ?? "No se pudo cambiar el estado del pedido. Inténtalo más tarde." };
}

/** Solo ofrece las transiciones válidas de TSK-15; la base de datos vuelve a validarlas. */
export function OrderStatusActions({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const reasonId = useId();
  const transitions = allowedTransitions(status);
  const [selected, setSelected] = useState<OrderTransition | null>(null);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [reasonError, setReasonError] = useState(false);
  const [notice, setNotice] = useState("");

  function choose(transition: OrderTransition | null) {
    setSelected(transition);
    setReason("");
    setFailure(null);
    setReasonError(false);
    if (transition) setNotice("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || pending) return;
    const cleanReason = reason.trim();
    if (selected.reasonRequired && !cleanReason) {
      setReasonError(true);
      setFailure({ message: "Indica el motivo del cambio." });
      return;
    }
    setPending(true);
    setFailure(null);
    setReasonError(false);
    try {
      const response = await fetch(`/api/admin/pedidos/${orderId}/estado`, {
        method: "PATCH",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanReason ? { status: selected.to, reason: cleanReason } : { status: selected.to }),
      });
      if (!response.ok) {
        const result = await readFailure(response);
        setFailure(result);
        if (response.status === 422) setReasonError(true);
        // El estado cambió en otro lado: se recarga para mostrar solo las transiciones válidas.
        if (response.status === 409) { setSelected(null); router.refresh(); }
        return;
      }
      const result = await response.json().catch(() => null) as { status?: string } | null;
      setSelected(null);
      setReason("");
      setNotice(`Pedido actualizado: ahora está «${orderStatusLabel(result?.status ?? selected.to)}».`);
      router.refresh();
    } catch {
      setFailure({ message: "No se pudo conectar. Revisa tu conexión e inténtalo de nuevo." });
    } finally {
      setPending(false);
    }
  }

  return <section className="admin-order-panel admin-order-actions" aria-labelledby="order-actions-title">
    <h2 id="order-actions-title">Atender el pedido</h2>
    <p className="admin-order-current">Estado actual: <strong>{orderStatusLabel(status)}</strong></p>
    <p className="admin-order-notice" role="status" aria-live="polite">
      {notice && <><CheckCircle2 size={16} aria-hidden="true" /> {notice}</>}
    </p>

    {status === "pending_payment" && <p className="admin-order-muted">Este pedido espera el pago del cliente. El pago lo confirma la pasarela de pago y no se marca a mano; solo puedes cancelarlo.</p>}
    {transitions.length === 0
      ? <p className="admin-order-muted">Este pedido ya no admite cambios de estado.</p>
      : selected === null
        ? <div className="admin-order-action-list">
          {transitions.map((transition) => <Button
            key={transition.to}
            type="button"
            variant={transition.to === "canceled" ? "ghost" : transition.to === "review_required" ? "outline" : "default"}
            className={transition.to === "canceled" ? "admin-order-cancel" : undefined}
            onClick={() => choose(transition)}
          >{actionLabel(transition)}</Button>)}
        </div>
        : <form className="admin-order-confirm" onSubmit={submit} noValidate>
          <h3>{actionLabel(selected)}</h3>
          <p>{actionHint(selected)}</p>
          <label htmlFor={reasonId}>
            Motivo {selected.reasonRequired ? <span>(obligatorio)</span> : <span className="admin-order-optional">(opcional)</span>}
          </label>
          <Textarea
            id={reasonId}
            value={reason}
            onChange={(event) => { setReason(event.target.value); setReasonError(false); }}
            maxLength={REASON_MAX_LENGTH}
            required={selected.reasonRequired}
            aria-invalid={reasonError || undefined}
            aria-describedby={`${reasonId}-help`}
            placeholder={selected.reasonRequired ? "Explica el motivo para el equipo" : "Nota interna para el equipo"}
            disabled={pending}
          />
          <p id={`${reasonId}-help`} className="admin-field-help">Uso interno: el cliente no ve el motivo. Hasta {REASON_MAX_LENGTH} caracteres.</p>
          <div className="admin-order-confirm-buttons">
            <Button type="submit" disabled={pending} className={selected.to === "canceled" ? "admin-order-cancel-confirm" : undefined}>
              {pending ? "Guardando…" : selected.to === "canceled" ? "Sí, cancelar pedido" : "Confirmar cambio"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => choose(null)} disabled={pending}>Volver</Button>
          </div>
        </form>}
    {failure && <p className="admin-field-error admin-order-error" role="alert">
      <AlertCircle size={14} aria-hidden="true" />
      <span>{failure.message}{failure.login && <> <Link href={`/login?next=${encodeURIComponent(`/admin/pedidos/${orderId}`)}`}>Iniciar sesión</Link></>}</span>
    </p>}
  </section>;
}
