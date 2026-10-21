# TSK-04 — Administración de productos

**Estado:** interfaz y backend implementados; cuenta administradora configurada  
**Responsable previsto:** Orlando  
**Rama prevista:** `feature/admin-productos`  
**Área:** interfaz y persistencia administrativa

## Objetivo

Una persona con rol `admin` puede crear y editar productos y sus variantes desde una interfaz interna. Puede cambiar precios en soles, existencias y el estado `draft`, `published` o `archived`. Una operación válida se guarda completa y se ve al volver a abrir el producto en la administración. La interfaz explica errores de datos y permisos.

## Punto de partida comprobado

- La aplicación usa Next.js App Router. No existe aún `/admin/productos`.
- El inicio de sesión usa Supabase Auth y admite retorno a la ruta administrativa.
- Las migraciones aplicadas definen `categories`, `products`, `product_variants`, `staff_roles`, RLS y la política de escritura para `admin`. También cargan 48 productos como borradores, 94 variantes y stock cero. Las migraciones TSK-04 `admin_product_save` y `admin_variant_name_uniqueness` están aplicadas al proyecto de Supabase. Los archivos `supabase/` siguen sin seguimiento en Git.
- El catálogo público y la ficha todavía leen `src/features/products/data/productsData.ts`. La conexión del catálogo público a Supabase corresponde a TSK-06.
- El modelo almacena `price_pen` como `numeric(12,2)`, `stock_on_hand` y `stock_reserved` como enteros, y variantes con identificadores persistentes. Los pedidos futuros referenciarán esos identificadores.

## Alcance

1. Lista administrativa de productos con nombre, categoría, estado y fecha de actualización; búsqueda por nombre o slug y filtro por estado. Incluye acceso a **Crear producto** y **Editar**.
2. Formulario de creación y edición con nombre, categoría existente, descripción, estado y variantes. El slug se genera al crear el producto, debe ser único y no se edita después.
3. Cada variante permite editar nombre, SKU opcional, precio en soles, existencias totales (`stock_on_hand`), estado activo y orden. Se pueden crear variantes y desactivar las existentes; no se borran físicamente.
4. Un único botón **Guardar cambios** guarda producto y variantes como una sola operación: todo se confirma o nada cambia.
5. Una acción **Archivar producto** pide confirmación, cambia el estado a `archived` sin eliminar datos y permite **Restaurar como borrador**. No hay borrado definitivo de productos.
6. Vista de detalle administrativa que vuelve a consultar los datos persistidos al abrir o recargar, incluyendo variantes inactivas. Muestra estados de carga, vacío, error y guardado satisfactorio.
7. Acceso restringido a administradores tanto en la interfaz como en la operación de lectura/escritura. Una cuenta sin rol suficiente recibe un mensaje explícito; no puede modificar datos llamando directamente a la operación.

## Fuera de alcance

- Conectar el catálogo y la ficha públicos a Supabase (TSK-06). Publicar aquí cambia `products.status` en la base, pero la interfaz pública actual seguirá usando datos locales hasta esa tarea.
- Crear o editar categorías, subir o reemplazar imágenes (TSK-19), importar productos en lote, borrar productos o variantes, checkout y pedidos.
- Modificar reservas (`stock_reserved`) desde el formulario. Se muestra como dato de solo lectura cuando existe.

## Reglas de negocio y validación

| Dato | Regla |
| --- | --- |
| Nombre del producto | Obligatorio tras quitar espacios al inicio y al final. |
| Categoría | Debe existir. Para publicar, debe estar activa. |
| Slug | Se genera desde el nombre al crear; solo minúsculas, números y guiones, único. Si hay colisión, se informa antes de guardar. Permanece fijo en ediciones posteriores. |
| Descripción | Opcional en esta tarea. |
| Nombre de variante | Obligatorio y único dentro del producto, ignorando diferencias triviales de espacios. |
| SKU | Opcional; si se informa, debe ser único entre variantes. |
| Precio | Entrada decimal en PEN, máximo dos decimales, entre `0` y el límite de `numeric(12,2)`. No se guardan cadenas con `S/` en la base. |
| Existencias | Entero no negativo. No puede quedar por debajo de `stock_reserved`; el valor reservado se consulta al guardar, no se confía en el valor mostrado inicialmente. |
| Variante inactiva | Permanece almacenada y visible en la administración, pero no cuenta para publicar ni para futuras consultas públicas. |
| Producto publicado | Requiere categoría activa y al menos una variante activa. Todas las variantes activas deben tener precio mayor que `S/ 0.00`. Puede publicarse con stock cero; la disponibilidad se tratará al conectar el catálogo. |
| Producto borrador o archivado | Puede conservar variantes con precio cero o ninguna variante activa. No debe aparecer en futuras consultas públicas. |

Las mismas reglas se validan al guardar, además de mostrarse en el formulario. Si se edita un producto ya publicado y el cambio deja de cumplir las reglas de publicación, el guardado se rechaza hasta corregirlo o pasarlo a borrador/archivado en esa misma operación.

## Flujo de interfaz

### Entrada y permisos

- Rutas propuestas: `/admin/productos`, `/admin/productos/nuevo` y `/admin/productos/[id]/editar`.
- Si no hay sesión, enviar a `/login` conservando la ruta de retorno para volver a la administración después de iniciar sesión.
- Si hay sesión sin rol `admin`, mostrar **No tienes permisos para administrar productos** y un enlace de salida apropiado. No mostrar controles de edición.
- Confirmar el rol en el servidor o la base en cada lectura y escritura; ocultar botones por sí solo no constituye autorización.

### Crear y editar

- Al crear, iniciar en `draft`, mostrar una variante editable vacía y generar una propuesta de slug a partir del nombre. Una fila de variante completamente vacía no se envía. El administrador puede guardar un borrador sin variantes, siempre que cumpla las restricciones básicas del producto.
- Al editar, cargar el producto y todas sus variantes de la fuente persistente. Mostrar el slug como solo lectura, el stock reservado como solo lectura y una indicación clara de que desactivar una variante conserva su historial.
- Mostrar importes con `S/` en la interfaz y enviar números decimales a la persistencia. El control no debe redondear silenciosamente más de dos decimales.
- Antes de cambiar de `published` a `draft` o `archived`, explicar que el producto dejará de estar disponible en el futuro catálogo conectado a la base.
- Archivar un producto pide confirmación y conserva producto y variantes. Un producto `archived` se restaura primero a `draft`; después puede publicarse si cumple todas las reglas de publicación.
- Mientras se guarda, deshabilitar el botón para evitar envíos duplicados. Tras éxito, mostrar confirmación y datos actualizados. Si falla, conservar los valores ingresados y señalar la causa.
- Si otro administrador modificó el producto desde que se abrió el formulario, evitar sobrescribirlo silenciosamente; mostrar un conflicto y permitir recargar la versión reciente.

## Persistencia y autorización

- Leer y escribir `public.products` y `public.product_variants`; leer `public.categories` y `public.staff_roles` según las políticas existentes. Preservar el `id` de cada variante al editar.
- Ejecutar el guardado conjunto de producto y variantes en una transacción de base de datos, por ejemplo mediante una RPC invocada con la identidad del usuario. Una secuencia de peticiones independientes que pueda guardar solo parte del formulario no satisface este spec.
- Comprobar el rol `admin` en la operación de persistencia y mantener RLS. No exponer `service_role` ni claves secretas al navegador. La comprobación del rol debe basarse en `staff_roles`, no en metadatos de usuario editables.
- La regla de publicación y el control de stock reservado deben aplicarse en la operación confiable de escritura. Si siguen existiendo otras rutas de escritura directa a las tablas, deben impedir que eludan esas reglas.
- Comparar las versiones `updated_at` del producto y de las variantes editadas para detectar ediciones concurrentes y devolver un resultado de conflicto. El control de stock reservado se realiza además bajo bloqueo transaccional al guardar. Los errores de unicidad y restricciones de base deben traducirse a mensajes de campo cuando sea posible.
- No modificar `stock_reserved` desde la administración. No eliminar variantes: su `is_active` pasa a `false` cuando se retiran.

## Mensajes y estados de error

| Situación | Comportamiento esperado |
| --- | --- |
| Campo inválido | Mensaje junto al campo; resumen accesible al intentar guardar y foco en el primer error. |
| Slug, SKU o nombre de variante duplicado | Mensaje específico que indique qué valor debe cambiar. |
| Falta categoría activa o variante válida para publicar | Explicar la condición que bloquea la publicación sin perder el formulario. |
| Stock inferior al reservado | Mostrar la cantidad reservada actual y solicitar una cifra admisible. |
| Sesión vencida | Solicitar iniciar sesión de nuevo y conservar, en lo posible, el trabajo no guardado. |
| Permisos insuficientes | Mensaje de acceso denegado; no se confirma ningún cambio. |
| Edición concurrente | Mostrar que hay una versión nueva y ofrecer recarga; no sobrescribir automáticamente. |
| Fallo de red o servidor | Mensaje general recuperable y opción de reintentar; no mostrar éxito ni datos parciales. |

## Criterios de aceptación verificables

1. **Creación:** con sesión `admin`, al crear un producto borrador con datos válidos y dos variantes, guardar y recargar la ruta administrativa muestra el mismo producto, los mismos identificadores de variantes, precios y existencias.
2. **Edición:** al cambiar nombre, descripción, precio, SKU, orden o existencias y volver a abrir el producto, se ven los valores persistidos. El slug conserva su valor original.
3. **Desactivación:** al desactivar una variante, esta sigue visible como inactiva en la administración y conserva su identificador; no se borra de la base.
4. **Archivo y recuperación:** al confirmar **Archivar producto** y guardar, la ficha vuelve a consultarse con estado `archived` y sus variantes intactas. Al elegir **Restaurar como borrador** y guardar, vuelve a `draft` con los mismos identificadores. Cancelar la confirmación no modifica el formulario.
5. **Publicación válida:** un producto con categoría activa y al menos una variante activa de precio positivo pasa a `published` y el estado persiste al volver a consultar la vista administrativa.
6. **Publicación inválida:** se rechaza publicar si la categoría está inactiva, no hay variantes activas o alguna variante activa tiene precio cero. Se muestran errores concretos y el estado persistido no cambia.
7. **Stock:** se rechazan negativos, fracciones y cantidades inferiores a las reservas actuales. El rechazo no cambia ningún campo del producto ni de sus variantes.
8. **Atomicidad:** si una variante falla por SKU duplicado, precio inválido o conflicto, no se guarda tampoco la edición del producto ni de las otras variantes.
9. **Permisos:** un visitante o usuario autenticado sin `staff_roles.role = 'admin'` no puede leer borradores administrativos ni crear, editar, desactivar o publicar por la interfaz o por petición directa. La interfaz informa el motivo sin exponer datos internos.
10. **Concurrencia:** dos administradores editan el mismo producto; el segundo guardado con una versión antigua recibe conflicto y no pisa el primero.
11. **Estados de interfaz:** la lista y el formulario presentan carga, vacío, error y éxito; un fallo deja los valores ingresados disponibles para corregir o reintentar.

## Estado de verificación

- La operación `save_admin_product(jsonb)` comprueba `staff_roles`, bloquea filas, compara versiones, valida publicación y stock y guarda todo en una transacción. Se revocó la escritura directa de productos y variantes a `authenticated`.
- Se verificaron en transacciones revertidas creación, edición, archivo, restauración y rechazos por permiso, precio, stock y conflicto. Las políticas RLS dieron acceso a 48 productos y 94 variantes con rol temporal `admin`, y cero borradores sin rol.
- La cuenta administradora se registró y recibió el rol `admin`. Una consulta con ese rol ve los 48 productos y 94 variantes existentes.
- Con `playwright-cli` y la sesión administradora se comprobaron creación con dos variantes, recarga, edición de precio/stock/orden, desactivación, publicación, búsqueda, archivo, cancelación, restauración y validaciones visibles. La prueba de dos pestañas detectó reintentos infinitos al usar SQLSTATE `40001`; la migración `admin_product_conflict_error` lo cambió a `P0001` y se verificó que la segunda pestaña muestra conflicto sin sobrescribir. El producto temporal se eliminó al terminar; permanecen 48 productos y 94 variantes.
- Falta una prueba de interfaz con una cuenta autenticada sin rol; el acceso sin sesión y la política RLS sin rol sí fueron verificados.

## Dependencias y orden de implementación

1. Confirmar que TSK-03 y las migraciones de `supabase/` están versionadas y aplicadas en el entorno de pruebas. Preparar una cuenta administradora y otra cuenta normal.
2. Definir la operación transaccional y las reglas de publicación/stock en la capa confiable de persistencia, con autorización comprobable.
3. Construir lista, formulario y estados de error siguiendo `DESIGN.md` y los componentes existentes.
4. Verificar los escenarios de aceptación con lecturas nuevas de la base y con peticiones de una cuenta sin permisos.

**Relación con otras tareas:** TSK-19 añade gestión de imágenes; TSK-06 conecta catálogo y ficha públicos a los productos publicados. Ninguna de las dos bloquea guardar borradores en esta administración.
