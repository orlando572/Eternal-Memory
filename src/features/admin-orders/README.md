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

# Panel de pedidos — TSK-16

`/admin/pedidos` (pestaña «Pedidos» de `AdminShell`, junto a Productos) y `/admin/pedidos/[id]`. Son páginas de servidor: sin sesión llevan a `/login` y vuelven al panel; una cuenta sin rol de administrador ve un aviso. La lectura usa la **sesión del administrador con RLS activa** (`orders_owner_or_admin_select`), no la clave privilegiada, y `requireAdmin` se comprueba antes de cada consulta.

## Listado

Tabla con número, cliente (nombre y correo), fecha, zona de entrega, total, estado del pedido y estado del pago, del más reciente al más antiguo y de 20 en 20. Los filtros viven en la URL (formulario GET), así que se pueden compartir y funcionan sin JavaScript:

| Parámetro | Valor |
| --- | --- |
| `q` | Número (`#1A2B3C4D` o parte inicial), nombre o correo. Sin `#`, un texto hexadecimal busca a la vez número, nombre y correo. |
| `estado` | Uno de los estados del pedido. |
| `desde`, `hasta` | `AAAA-MM-DD`, días completos en horario de Perú (UTC−5); un rango invertido se ordena. |
| `pagina` | Desde 1; fuera de rango lleva a la última página. |

El número visible son los 8 primeros caracteres del UUID (`shortOrderNumber`), por eso se busca como un rango de identificadores y no hace falta una columna nueva. Los comodines y los caracteres que delimitan el filtro de PostgREST se quitan del texto de búsqueda. Un valor inválido se ignora.

## Detalle y cambios de estado

Contacto, entrega y zona, líneas con el nombre a grabar, importes e historial con fecha, autor («Administración» o «Sistema») y motivo, que es de uso interno. El bloque «Atender el pedido» ofrece solo `allowedTransitions(estado)` de `lib/orderTransitions.ts`, pide confirmación y motivo cuando es obligatorio, y llama a `PATCH /api/admin/pedidos/[id]/estado`. Tras guardar, la página se vuelve a pedir al servidor (`router.refresh()`) y muestra el estado y el historial actualizados. Una sesión vencida (401), la falta de permisos (403), un pedido que cambió entretanto (409, que además recarga el estado) y la falta de motivo (422) muestran su propio mensaje.

## Verificación del panel

`npm run test:admin-orders` ejecuta 17 pruebas: lectura y saneamiento de filtros, rango de fechas de Lima, búsqueda por número como rango de UUID, enlaces, transiciones ofrecidas por estado y el servicio con una base de datos simulada (exige administrador, filtra, pagina, 404 con identificador inválido y no muestra errores SQL). No consultan Supabase.
