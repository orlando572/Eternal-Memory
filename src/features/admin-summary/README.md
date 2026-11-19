# Resumen del administrador — TSK-32

`/admin` es la página de inicio del administrador (pestaña «Resumen» de `AdminShell`) y el destino por defecto tras iniciar sesión con rol de administrador. Es de **solo lectura**. La ruta vive en el grupo `src/app/admin/(resumen)/` para tener su propio `AdminShell` sin envolver a `productos` ni a `pedidos`.

## Qué muestra

| Tarjeta | Cálculo | Enlace |
| --- | --- | --- |
| Pedidos por atender | `status` = `paid` + `processing` | `/admin/pedidos?estado=paid` y `?estado=processing` |
| Pedidos de hoy | `created_at` dentro del día actual en horario de Perú (UTC−5), en cualquier estado | `/admin/pedidos?desde=<hoy>&hasta=<hoy>` |
| Productos | Conteo de `published` y `draft` (los archivados no cuentan) | `/admin/productos` |
| Opciones sin stock | Opciones activas de productos no archivados con `stock_on_hand - stock_reserved <= 0`; se listan las 5 primeras | Editor de cada producto |

Debajo, los 5 últimos pedidos enlazan a su detalle en `/admin/pedidos/[id]`.

## Acceso y datos

Mismo criterio que el panel de pedidos (TSK-16): sin sesión lleva a `/login?next=/admin`; una cuenta sin rol de administrador ve un aviso. `getAdminSummary` exige `requireAdmin` y lee con la **sesión del administrador con RLS activa**, no con la clave privilegiada. No hay migraciones nuevas.

PostgREST no puede comparar dos columnas, así que «sin stock» se calcula en el servidor sobre las opciones activas. Si el catálogo crece mucho, convendría moverlo a una vista o función SQL.

## Verificación

`npm run test:admin-summary`: día de Lima en el cambio de fecha UTC, regla de sin stock, enlaces, permisos y errores de la base de datos con un cliente simulado. Las consultas **no se han ejecutado contra una base de datos real** en estas pruebas.
