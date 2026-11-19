# Pedidos de la cuenta — TSK-13

API de solo lectura para que una persona consulte sus propios pedidos. La pantalla de historial es de TSK-14.

Ambas rutas exigen sesión verificada (`requireUser`) y responden con `Cache-Control: private, no-store`. Usan la **sesión de la persona con RLS activa**, no la clave privilegiada, y filtran siempre por `customer_id = auth.uid()`. La política `orders_owner_or_admin_select` también deja leer todos los pedidos a un administrador, por eso el filtro explícito es el que limita estas rutas a los pedidos propios, administrador incluido. `order_items` y `order_status_history` solo son visibles si lo es su pedido.

## `GET /api/cuenta/pedidos`

Lista paginada, del pedido más reciente al más antiguo. Parámetros opcionales: `pagina` (por defecto 1) y `porPagina` (por defecto 10, máximo 50). Un valor inválido o fuera de rango vuelve al valor por defecto.

```json
{ "orders": [{ "id": "…", "createdAt": "…", "status": "paid", "paymentStatus": "paid", "totalPen": 135, "itemCount": 3 }],
  "page": 1, "pageSize": 10, "total": 14, "totalPages": 2 }
```

## `GET /api/cuenta/pedidos/[id]`

Detalle: contacto, dirección, importes, líneas (con grabado) e historial de estados (`fromStatus`, `toStatus`, `createdAt`). El motivo y el autor de cada cambio no se exponen. Un identificador inválido, uno inexistente y el pedido de otra cuenta responden igual (`404 ORDER_NOT_FOUND`), para no revelar si existe.

## Verificación

`npm run test:account-orders` ejecuta 9 pruebas con una base de datos simulada que emula la política RLS: el usuario A no obtiene el pedido de B, un administrador no recibe pedidos ajenos por estas rutas, la paginación valida sus parámetros y un fallo de la base de datos no filtra el error interno. Estas pruebas **no** consultan Supabase: la política RLS se revisó leyendo la migración inicial y no se ejecutó contra la base de datos real.
