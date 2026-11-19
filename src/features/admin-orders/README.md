# Estados de pedidos para administradores — TSK-15

`PATCH /api/admin/pedidos/[id]/estado` con `{ "status": "...", "reason": "..." }` (JSON del mismo origen). Exige sesión de administrador (`requireAdmin`); el autor del cambio sale siempre de la sesión y el cuerpo no puede indicarlo. Responde `{ id, status, paymentStatus }`. El panel de pedidos (TSK-16) la usará.

## Transiciones permitidas

| Desde | Hacia | Motivo |
| --- | --- | --- |
| `paid` | `processing` | opcional |
| `processing` | `shipped` | opcional |
| `shipped` | `completed` | opcional |
| `processing` ↔ `review_required` | | obligatorio |
| cualquier estado salvo `canceled` | `canceled` | obligatorio |

`paid` **nunca** lo asigna un administrador: solo el webhook de pago. Una transición inválida responde `409 INVALID_TRANSITION`; la falta de motivo, `422 REASON_REQUIRED`. Cada cambio guarda autor, fecha y motivo en `order_status_history` (el motivo es de uso interno y no se muestra al cliente).

La regla vive en la migración `20261119040000_admin_change_order_status.sql` (función `admin_change_order_status`, solo ejecutable por el servidor) y se repite en `lib/orderTransitions.ts` para que el panel muestre solo las transiciones válidas. Una prueba comprueba que ambas listas coinciden.

## Qué hace al cancelar

- Un pedido **pendiente de pago**: libera la reserva, vence sus intentos de pago, queda con pago `failed` y se cierra su página de pago en Stripe (si Stripe no responde, la cancelación se mantiene).
- Un pedido **ya pagado**: solo cambia el estado. **No** devuelve inventario ni crea un reembolso; ambos se gestionan a mano, porque no se sabe si el producto sigue disponible.

## Verificación

`npm run test:order-status` ejecuta 16 pruebas: la tabla de transiciones, que migración y TypeScript coinciden, y el servicio con una base de datos simulada. La función SQL **no se ha ejecutado contra una base de datos real**; la migración se aplica con `supabase db push` en coordinación con el equipo.
