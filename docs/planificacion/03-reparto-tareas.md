# Reparto de tareas por integrante

> Fecha de elaboración: 18/11/2026. Equipo: Orlando (líder, `orlando572`) y
> Evelyn (`Eve3000a`). Este documento es un plan: no prueba que nada esté
> implementado. **Sustituye a las secciones de reparto** de
> `01-mejoras-tienda.md` y `02-avance-3-docker-cd-cloud.md`; el detalle técnico
> de cada tarea sigue en esos documentos.

## 1. Criterios del reparto

- **Primero las mejoras y correcciones de la tienda (etapa 1); después el Avance 3 (etapa 2).**
- **Orlando:** portada, productos y categorías, y panel de administrador.
- **Evelyn:** pagos, pedidos del cliente, páginas comerciales y calidad.
- Ambos tienen la **misma cantidad de tareas** (14 cada uno), con trabajo de frontend y backend y una mezcla de issues ya abiertos y tareas nuevas.
- En el Avance 3 se respeta el PDF del curso: Alumno 1 Dockerfile (Orlando), Alumno 2 BD en `docker-compose` y `.env` (Evelyn) y Alumno 3 seeders, dividido en dos mitades iguales (una para cada uno).
- Tamaño: **S** ≈ medio día (1 punto) · **M** ≈ 1–2 días (2 puntos) · **L** ≈ 3 días o más (3 puntos).
- Prioridad: **P0** imprescindible para un e-commerce completo · **P1** importante · **P2** deseable.

## 2. Estado real al 18/11/2026

Comprobado en GitHub (issues, PR y milestone «Ecommerce funcional») y en el código de `develop` (`b560c57`).

| Tarea | Estado |
| --- | --- |
| TSK-01 a TSK-10, TSK-17, TSK-21 a TSK-28 | Cerradas en GitHub. |
| TSK-29 · Actualización del README | Hecha (PR #56 unido a `develop`). Issue #58 creado después y cerrado. |
| TSK-30 · Orden, limpieza, documentación y retiro de Playwright | Hecha (PR #57 unido a `develop`). Issue #59 creado después y cerrado. |
| TSK-31 · Este reparto | Issue #60, rama `docs/tsk-31-reparto-tareas` y PR hacia `develop`. |
| TSK-11 a TSK-16, TSK-19, TSK-20 | Abiertas. No existe código de Stripe, `/checkout/resultado`, API de pedidos de la cuenta, `/admin/pedidos` ni páginas `/nosotros`, `/contacto`, `/envios`. `/perfil/historial` existe pero está vacío. |
| TSK-18 · Almacenamiento de imágenes | **Casi hecha.** El bucket `product-images` limita a 5 MB y a JPG/PNG/WebP, solo los administradores pueden escribir, cada subida usa un nombre nuevo sin sobrescribir y `removeUnusedProductImage` no borra imágenes ya vinculadas. Falta verificarlo en un entorno real y cerrar el issue con evidencia. |
| TSK-32 a TSK-42 | Definidas en `01-mejoras-tienda.md` y creadas como issues #61 a #71. Sin implementar. |
| TSK-43 a TSK-50 | Definidas en `02-avance-3-docker-cd-cloud.md` y en este documento, y creadas como issues #72 a #79. No existen `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `.env.example` ni `cd.yml`. |

Otros hallazgos que afectan al reparto:

- El CI solo ejecuta `test:roles`, `test:profile` y `test:ci`; las pruebas de checkout y carrito existen pero no corren en CI (lo resuelve TSK-42).
- El footer conserva datos provisionales (`+51 900 000 000`, `contacto@eternalmemory.pe`). La antigua «TSK-31 · Datos comerciales reales» de `01-mejoras-tienda.md` **se integra en TSK-20**, y el código TSK-31 pasa a este reparto.
- La tabla `product_images` ya tiene `sort_order` y `alt_text`, lo que facilita la galería múltiple (TSK-19).
- La migración inicial ya incluye `register_payment_session` y `record_payment_event` (pago y eventos idempotentes) y `advance_order_status` (`paid → processing → shipped → completed`, solo administradores, con historial). TSK-11 y TSK-15 parten de esas funciones: falta la integración con Stripe, las rutas de la aplicación y las transiciones de cancelación y revisión.
- Antes de este reparto, TSK-29 a TSK-50 no tenían issue y el tablero solo tenía TSK-01 a TSK-28 y la tarjeta del PR #56.

## 3. Resumen por persona

| | Orlando | Evelyn |
| --- | --- | --- |
| **Etapa 1 — mejoras y correcciones** | TSK-18, TSK-19, TSK-36, TSK-37, TSK-38, TSK-33, TSK-39, TSK-34, TSK-16, TSK-32 | TSK-13, TSK-14, TSK-11, TSK-12, TSK-40, TSK-15, TSK-20, TSK-35, TSK-42, TSK-41 |
| Tareas / puntos etapa 1 | 10 / 17 | 10 / 18 |
| De ellas, issues ya abiertos | 3 (TSK-16, 18, 19) | 6 (TSK-11, 12, 13, 14, 15, 20) |
| De ellas, tareas nuevas | 7 | 4 |
| **Etapa 2 — Avance 3** | TSK-43, TSK-45, TSK-46, TSK-48 | TSK-44, TSK-49, TSK-47, TSK-50 |
| Tareas / puntos etapa 2 | 4 / 6 | 4 / 7 |
| **Total** | **14 tareas · 23 puntos** | **14 tareas · 25 puntos** |
| Gestión (fuera del cómputo) | TSK-31 (este reparto), revisión de PR de Evelyn | Revisión de PR de Orlando |

Evelyn tiene más issues heredados del tablero porque los pendientes de pago y pedidos ya estaban abiertos; Orlando compensa con más tareas nuevas de portada, catálogo y administración.

| Área | Orlando | Evelyn |
| --- | --- | --- |
| Frontend | TSK-16, 19, 32, 33, 34, 36, 37, 39 | TSK-12, 14, 20, 35, 41 |
| Backend | TSK-18, 38, 45 (y consultas de 32, 36, 37) | TSK-11, 13, 15, 49 (y tabla de contacto de 20) |
| CI / DevOps | TSK-43, 46, 48 | TSK-42, 44, 47 |
| Documentación y recursos | — | TSK-40, 50 |

## 4. Orden de ejecución

Regla del tablero: **una tarea en `In Progress` por persona**. Las columnas de una misma ola se hacen en paralelo porque tocan archivos distintos. Cada tarea: rama desde `develop` → PR a `develop` → revisión del compañero → CI en verde → merge.

| Ola | Orlando | Evelyn | Por qué este orden |
| --- | --- | --- | --- |
| 1 | TSK-18 → TSK-19 | TSK-13 → TSK-14 | TSK-18 desbloquea la galería; TSK-13 desbloquea el historial. |
| 2 | TSK-36 → TSK-37 → TSK-38 | TSK-11 → TSK-12 | Catálogo y ficha frente a pago y resultado: no comparten archivos. |
| 3 | TSK-33 → TSK-39 → TSK-34 | TSK-40 → TSK-15 → TSK-20 | Las imágenes de TSK-40 llegan antes del banner (TSK-34); TSK-15 llega antes del panel de pedidos (ola 4). |
| 4 | TSK-16 → TSK-32 | TSK-35 → TSK-42 → TSK-41 | El panel necesita los estados (TSK-15); la revisión de accesibilidad va al final, sobre la tienda completa. |
| 5 | Corregir los bugs de TSK-41 en portada, catálogo y admin | Corregir los bugs de TSK-41 en checkout, perfil y pedidos | Cada uno corrige su área. |
| 6 | TSK-43 Dockerfile | TSK-44 `docker-compose` y `.env` | El servicio `app` del compose usa el Dockerfile; Evelyn puede empezar por `db` y `.env.example`. |
| 7 | TSK-45 seeder de catálogo | TSK-49 seeder de clientes y pedidos | Ambos necesitan el servicio `db` de TSK-44. |
| 8 | TSK-46 CD → TSK-48 release | TSK-47 Render → TSK-50 informe | La release publica la imagen que despliega Render; el informe recoge las evidencias finales. |

Dependencias entre personas que conviene vigilar: TSK-16 (Orlando) espera a TSK-15 (Evelyn); TSK-34 (Orlando) espera a TSK-40 (Evelyn) si se usan imágenes nuevas; TSK-47 (Evelyn) espera a la imagen publicada por TSK-46 y TSK-48 (Orlando).

---

## 5. Etapa 1 — Mejoras y correcciones de la tienda

### Orlando — portada, productos, categorías y administración

#### [TSK-18] Almacenamiento de imágenes · issue #27 (abierto)
- **Responsable:** Orlando · **Etiquetas:** `Backend` · **Prioridad:** P1 · **Tamaño:** S
- **Rama:** `bugfix/tsk-18-almacenamiento-imagenes` desde `develop` (solo si la verificación encuentra algo que corregir) · **Depende de:** —

**Descripción:** comprobar que la subida de portada ya cumple el issue y cerrarlo con evidencia.

Criterios de aceptación:
- [ ] Un administrador sube una imagen JPG, PNG o WebP de hasta 5 MB y queda vinculada al producto.
- [ ] Un archivo de otro tipo o de más de 5 MB se rechaza con un mensaje claro.
- [ ] Una cuenta de cliente no puede escribir en el bucket `product-images`.
- [ ] Si la subida o el guardado fallan, el producto conserva la imagen anterior.
- [ ] Comentario de cierre en el issue con la evidencia (migración, archivo y prueba realizada).

#### [TSK-19] Gestión visual de imágenes · issue #28 (abierto, reasignado a Orlando)
- **Responsable:** Orlando · **Etiquetas:** `Frontend`, `Backend` · **Prioridad:** P1 · **Tamaño:** M
- **Rama:** `feature/tsk-19-galeria-imagenes` · **Depende de:** TSK-18

**Descripción:** pasar de una sola portada a varias imágenes por producto en el editor de administración.

Criterios de aceptación:
- [ ] El administrador puede subir, previsualizar, reordenar, elegir portada y eliminar varias imágenes por producto.
- [ ] Cada imagen tiene un texto alternativo editable.
- [ ] La ficha (`ProductGallery.tsx`) muestra las imágenes guardadas en su orden (`sort_order`).
- [ ] Un error de subida se explica sin perder las imágenes ya guardadas.

#### [TSK-36] Ordenar y filtrar el catálogo · issue #65
- **Responsable:** Orlando · **Etiquetas:** `Frontend`, `Backend`, `enhancement` · **Prioridad:** P1 · **Tamaño:** M
- **Rama:** `feature/tsk-36-orden-filtros` · **Depende de:** —

**Descripción:** añadir orden y filtro por precio al catálogo, con parámetros en la URL.

Criterios de aceptación:
- [ ] Selector «Ordenar por»: relevancia, precio ascendente, precio descendente y nombre.
- [ ] Filtro por rango de precio (mínimo y máximo en soles).
- [ ] Los parámetros (`?orden=…&min=…&max=…`) se validan en `catalogParams.ts`; valores inválidos vuelven al valor por defecto.
- [ ] Contador de resultados y botón «Limpiar filtros».
- [ ] Prueba con `node --test` de la validación de parámetros.

#### [TSK-37] Mejoras de la ficha de producto · issue #66
- **Responsable:** Orlando · **Etiquetas:** `Frontend`, `Backend`, `enhancement` · **Prioridad:** P1 · **Tamaño:** M
- **Rama:** `feature/tsk-37-ficha-producto` · **Depende de:** — (enlaza a `/envios` de TSK-20 cuando exista)

**Descripción:** mejorar la orientación y la información de la ficha de producto.

Criterios de aceptación:
- [ ] Ruta de navegación: Inicio › Catálogo › Categoría › Producto.
- [ ] «También te puede interesar»: hasta cuatro productos publicados de la misma categoría, sin repetir el actual.
- [ ] Bloque bajo el precio: envío según zona y si el producto admite grabado.
- [ ] Aviso visible de «imagen referencial» cuando corresponda.

#### [TSK-38] Productos destacados · issue #67
- **Responsable:** Orlando · **Etiquetas:** `Backend`, `Frontend`, `enhancement` · **Prioridad:** P2 · **Tamaño:** S
- **Rama:** `feature/tsk-38-destacados` · **Depende de:** —

**Descripción:** permitir destacar productos desde el administrador y priorizarlos en la portada. Incluye revisar qué productos están publicados y cuáles siguen en borrador (antes en la antigua TSK-31).

Criterios de aceptación:
- [ ] Migración nueva con la columna `is_featured boolean default false` en `products`.
- [ ] Casilla «Destacado» en el editor de administración, que se guarda y se recupera.
- [ ] La portada muestra primero los productos destacados y publicados.
- [ ] Lista revisada de productos `published` y en borrador, anotada en el PR.

#### [TSK-33] Nuevas secciones de la portada · issue #62
- **Responsable:** Orlando · **Etiquetas:** `Frontend`, `enhancement` · **Prioridad:** P1 · **Tamaño:** M
- **Rama:** `feature/tsk-33-secciones-portada` · **Depende de:** —

**Descripción:** completar la portada bajo la rejilla de productos con componentes propios en `src/features/home/` y textos en `homeContent.ts`.

Criterios de aceptación:
- [ ] Secciones «Cómo funciona», «Te acompañamos», categorías destacadas, preguntas frecuentes (acordeón accesible) y cierre de contacto.
- [ ] Ninguna promesa no verificada (plazos de entrega, atención 24/7, stock garantizado).
- [ ] Responsive a 375 px y contraste AA, con la identidad «Patio de luz».

#### [TSK-39] SEO y vista previa al compartir · issue #68
- **Responsable:** Orlando · **Etiquetas:** `Frontend`, `enhancement` · **Prioridad:** P2 · **Tamaño:** S
- **Rama:** `feature/tsk-39-seo` · **Depende de:** — (usa la imagen Open Graph de TSK-40 si está lista)

**Descripción:** metadatos por producto y categoría, sitemap y robots. Consultar antes la guía de `node_modules/next/dist/docs/`.

Criterios de aceptación:
- [ ] `generateMetadata` en `/catalogo/[id]` (título, descripción e imagen) y en `/catalogo` según la categoría.
- [ ] `src/app/sitemap.ts` y `src/app/robots.ts`.
- [ ] Imagen Open Graph por defecto con el logo.
- [ ] Al pegar el enlace de un producto en WhatsApp se ven su nombre y su imagen.

#### [TSK-34] Banner informativo de la portada · issue #63
- **Responsable:** Orlando · **Etiquetas:** `Frontend`, `enhancement` · **Prioridad:** P2 · **Tamaño:** S
- **Rama:** `feature/tsk-34-banner-portada` · **Depende de:** TSK-40 si se usan imágenes nuevas

**Descripción:** franja informativa configurable desde `homeContent.ts`.

Criterios de aceptación:
- [ ] Componente `HomeBanner` con imagen, título, texto y botón.
- [ ] El mensaje se cambia editando `homeContent.ts`, sin tocar el componente.
- [ ] Una sola franja, sin carrusel automático ni mensajes de presión comercial.
- [ ] Versión de escritorio y móvil.

#### [TSK-16] Panel de pedidos · issue #25 (abierto)
- **Responsable:** Orlando · **Etiquetas:** `Frontend` · **Prioridad:** P1 · **Tamaño:** L
- **Rama:** `feature/tsk-16-panel-pedidos` · **Depende de:** TSK-15 (Evelyn)

**Descripción:** vista interna para buscar, filtrar y atender pedidos.

Criterios de aceptación:
- [ ] Ruta `/admin/pedidos` con pestaña en `AdminShell` junto a Productos.
- [ ] Tabla con número, cliente, fecha, total, zona, estado del pedido y estado del pago.
- [ ] Filtros por estado y fecha; búsqueda por número, nombre o correo.
- [ ] Detalle `/admin/pedidos/[id]` con contacto, líneas, grabados, historial y solo las transiciones válidas de TSK-15.
- [ ] Mensajes claros ante permisos insuficientes o transiciones rechazadas.

#### [TSK-32] Resumen del administrador · issue #61
- **Responsable:** Orlando · **Etiquetas:** `Frontend`, `Backend`, `enhancement` · **Prioridad:** P2 · **Tamaño:** M
- **Rama:** `feature/tsk-32-resumen-admin` · **Depende de:** TSK-16

**Descripción:** página de inicio del administrador, solo de lectura.

Criterios de aceptación:
- [ ] Ruta `/admin` con tarjetas: pedidos por atender (`paid` y `processing`), pedidos del día, productos publicados y en borrador, y variantes sin stock.
- [ ] Lista de los últimos pedidos con enlace al panel (TSK-16).
- [ ] Solo accesible para administradores.

### Evelyn — pagos, pedidos, páginas comerciales y calidad

#### [TSK-13] Consulta de pedidos del cliente · issue #22 (abierto)
- **Responsable:** Evelyn · **Etiquetas:** `Backend` · **Prioridad:** P0 · **Tamaño:** M
- **Rama:** `feature/tsk-13-consulta-pedidos` · **Depende de:** —

**Descripción:** API para consultar el historial y el detalle de los pedidos de la cuenta.

Criterios de aceptación:
- [ ] `GET /api/cuenta/pedidos` (lista paginada) y `GET /api/cuenta/pedidos/[id]` (líneas, importes e historial de estados).
- [ ] Ambas rutas requieren sesión válida.
- [ ] Una cuenta no puede consultar pedidos de otra aunque conozca el identificador (política RLS de `orders` y `order_items` revisada).
- [ ] Prueba con `node --test`: el usuario A no obtiene el pedido de B.

#### [TSK-14] Historial y seguimiento · issue #23 (abierto)
- **Responsable:** Evelyn · **Etiquetas:** `Frontend` · **Prioridad:** P0 · **Tamaño:** M
- **Rama:** `feature/tsk-14-historial-pedidos` · **Depende de:** TSK-13

**Descripción:** completar `/perfil/historial` y añadir el detalle de cada pedido.

Criterios de aceptación:
- [ ] Tarjetas con número corto, fecha, total, estado del pedido y estado del pago.
- [ ] Ruta `/perfil/historial/[id]` con líneas, grabados, dirección, importes y línea de tiempo de `order_status_history`.
- [ ] Una cuenta sin pedidos ve «Aún no tienes pedidos» y un enlace al catálogo.
- [ ] Etiquetas reutilizadas de `orderStatusLabel` y `paymentStatusLabel`.

#### [TSK-11] Pago de prueba con Stripe · issue #20 (abierto, reasignado a Evelyn)
- **Responsable:** Evelyn · **Etiquetas:** `Backend` · **Prioridad:** P0 · **Tamaño:** L
- **Rama:** `feature/tsk-11-pagos` · **Depende de:** checkout actual

**Descripción:** sesión de pago en modo prueba y webhook verificado, apoyados en las funciones SQL `register_payment_session` y `record_payment_event` que ya existen. Antes de empezar, comprobar que Stripe ofrece modo prueba para la cuenta del equipo; si no, acordar Mercado Pago o Culqi en sandbox y ajustar las columnas `stripe_*`.

Criterios de aceptación:
- [ ] `POST /api/checkout/pedidos/[id]/pago` crea la sesión solo para un pedido propio, `pending_payment` y con reserva vigente, con el importe leído de la base de datos.
- [ ] `POST /api/webhooks/stripe` verifica la firma, ignora eventos repetidos y solo `checkout.session.completed` marca el pedido como `paid` y escribe `order_status_history`.
- [ ] Cancelaciones, expiraciones y fallos no marcan el pedido como pagado.
- [ ] Claves solo en `.env.local` (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`), nunca en el repositorio.
- [ ] Pruebas con `node --test`: firma inválida, evento duplicado e importe distinto.

#### [TSK-12] Resultado del pago · issue #21 (abierto, reasignado a Evelyn)
- **Responsable:** Evelyn · **Etiquetas:** `Frontend` · **Prioridad:** P0 · **Tamaño:** M
- **Rama:** `feature/tsk-12-resultado-pago` · **Depende de:** TSK-11

**Descripción:** pantalla de resultado que consulta el estado real del pedido y botón «Pagar» en el recibo del checkout.

Criterios de aceptación:
- [ ] Ruta `/checkout/resultado?pedido=…` que consulta el pedido; la URL de éxito por sí sola no lo muestra como pagado.
- [ ] Vistas de pagado, pendiente (se actualiza sola cada pocos segundos) y cancelado o fallido (reintentar o volver al carrito).
- [ ] Enlace «Ver mi pedido» hacia `/perfil/historial/[id]` (TSK-14).

#### [TSK-40] Imágenes publicitarias · issue #69
- **Responsable:** Evelyn · **Etiquetas:** `Frontend`, `documentation` · **Prioridad:** P2 · **Tamaño:** M
- **Rama:** `feature/tsk-40-imagenes-publicitarias` · **Depende de:** decisión del equipo sobre el origen de las imágenes

**Descripción:** preparar las piezas visuales de la portada, el catálogo y la vista previa al compartir. Las imágenes nuevas solo se generan con aprobación expresa de Orlando.

Criterios de aceptación:
- [ ] Decisión registrada en el issue: fotos existentes, fotos con licencia libre o imágenes generadas.
- [ ] Banner de portada para escritorio (1600 × 600) y móvil (800 × 1000), cuatro cabeceras de categoría (1600 × 500), imagen Open Graph (1200 × 630) e imagen de «Cómo funciona» (800 × 800).
- [ ] Paleta de `DESIGN.md`, sin texto incrustado y menos de 250 KB por archivo, en `public/assets/banners/`.
- [ ] Origen y licencia de cada imagen anotados en `docs/recursos/`.

#### [TSK-15] Operación y estados de pedidos · issue #24 (abierto, reasignado a Evelyn)
- **Responsable:** Evelyn · **Etiquetas:** `Backend` · **Prioridad:** P1 · **Tamaño:** M
- **Rama:** `feature/tsk-15-estados-pedido` · **Depende de:** TSK-11

**Descripción:** transiciones de estado autorizadas y registradas, que usará el panel de TSK-16. Parte de `advance_order_status`, que ya cubre `paid → processing → shipped → completed`.

Criterios de aceptación:
- [ ] Migración que amplía `advance_order_status` (o la sustituye por `admin_change_order_status(order_id, to_status, reason)`) con cualquier estado → `canceled` con motivo obligatorio y `review_required ↔ processing`.
- [ ] Ruta de administración del servidor que valida la sesión de administrador y llama a la función.
- [ ] `paid` solo lo asigna el webhook de pago, nunca el administrador.
- [ ] Cada cambio guarda autor, fecha y motivo en `order_status_history`; las transiciones inválidas se rechazan.
- [ ] Prueba de transiciones válidas e inválidas.

#### [TSK-20] Páginas comerciales y contacto · issue #29 (abierto, reasignado a Evelyn)
- **Responsable:** Evelyn · **Etiquetas:** `Frontend`, `Backend` · **Prioridad:** P1 · **Tamaño:** M
- **Rama:** `feature/tsk-20-paginas-contacto` · **Depende de:** datos reales de contacto y tarifas (los aporta Orlando)

**Descripción:** páginas comerciales con URL propia y datos comerciales reales. Absorbe la antigua «TSK-31 · Datos comerciales reales».

Criterios de aceptación:
- [ ] Teléfono, correo y WhatsApp provisionales de `footerContent.ts` sustituidos por canales reales.
- [ ] Tarifas reales de `delivery_rates` (provincia de Arequipa y resto del Perú) definidas y activas.
- [ ] Páginas `/nosotros`, `/contacto` (canales, horario y formulario), `/privacidad`, `/terminos` y `/envios` (zonas y tarifas leídas de `delivery_rates`).
- [ ] Enlaces del header y del footer actualizados; los modales de privacidad y términos pasan a páginas.
- [ ] Textos legales y comerciales revisados por Orlando antes del merge.

#### [TSK-35] Botón flotante de contacto · issue #64
- **Responsable:** Evelyn · **Etiquetas:** `Frontend`, `enhancement` · **Prioridad:** P2 · **Tamaño:** S
- **Rama:** `feature/tsk-35-contacto-flotante` · **Depende de:** TSK-20 (número de WhatsApp real)

**Descripción:** acceso discreto a WhatsApp desde la tienda.

Criterios de aceptación:
- [ ] Botón abajo a la derecha que no tapa el carrito en móvil.
- [ ] Mensaje prellenado con la página actual.
- [ ] Oculto en `/admin` y `/checkout`.
- [ ] Accesible con teclado y con nombre accesible.

#### [TSK-42] Pruebas en CI de lo nuevo · issue #71
- **Responsable:** Evelyn · **Etiquetas:** `CI` · **Prioridad:** P1 · **Tamaño:** S
- **Rama:** `chore/tsk-42-pruebas-ci` · **Depende de:** TSK-11, TSK-13, TSK-15

**Descripción:** que el CI ejecute todas las pruebas del proyecto.

Criterios de aceptación:
- [ ] `ci.yml` ejecuta `npm test` (o los scripts que faltan: `test:checkout`, `test:checkout-engraving`, `test:cart-order`, `test:cart-sync`) y las pruebas nuevas de pagos, pedidos y estados.
- [ ] Prueba con `node --test` de la lógica del recorrido catálogo → carrito → checkout → resultado.
- [ ] Un PR real muestra el check `quality-and-build` en verde con las pruebas nuevas.

#### [TSK-41] Revisión de accesibilidad y responsive · issue #70
- **Responsable:** Evelyn · **Etiquetas:** `accessibility` · **Prioridad:** P1 · **Tamaño:** S
- **Rama:** no aplica (registra issues) · **Depende de:** el resto de la etapa 1

**Descripción:** recorrido final de la tienda para detectar barreras y fallos de diseño adaptable.

Criterios de aceptación:
- [ ] Portada, catálogo, ficha, carrito, checkout, perfil y admin revisados a 375, 768 y 1280 px.
- [ ] Navegación solo con teclado, foco visible y contraste AA comprobados.
- [ ] Cada hallazgo registrado como issue `bug` + `accessibility` con el formato de TSK-23 a TSK-28.
- [ ] Hallazgos de portada, catálogo y admin asignados a Orlando; los de checkout, perfil y pedidos, a Evelyn (ola 5).

---

## 6. Etapa 2 — Avance 3 (Docker, CD y nube)

Empieza cuando la etapa 1 esté integrada en `develop`. El detalle técnico está en `02-avance-3-docker-cd-cloud.md`.

### Orlando

#### [TSK-43] Dockerfile optimizado — Alumno 1 · issue #72
- **Responsable:** Orlando · **Etiquetas:** `CI` · **Prioridad:** P0 · **Tamaño:** M
- **Rama:** `feature/tsk-43-dockerfile` · **Depende de:** etapa 1

**Descripción:** imagen de producción multietapa de la aplicación.

Criterios de aceptación:
- [ ] `output: "standalone"` en `next.config.ts`.
- [ ] `Dockerfile` multietapa sobre `node:24-alpine` (`deps`, `builder`, `runner`) con usuario sin privilegios, `EXPOSE 3000` y `HEALTHCHECK`.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` como `ARG` de compilación; `SUPABASE_SECRET_KEY` nunca dentro de la imagen.
- [ ] `.dockerignore` con `node_modules`, `.next`, `.git`, `.env*`, `*.deb`, `docs` y `supabase/.temp`.
- [ ] `docker build` y `docker run -p 3000:3000` abren la tienda; tamaño de la imagen anotado para el informe.

#### [TSK-45] Seeder de catálogo y administración — Alumno 3, primera mitad · issue #74
- **Responsable:** Orlando · **Etiquetas:** `Backend` · **Prioridad:** P0 · **Tamaño:** S
- **Rama:** `feature/tsk-45-seeder-catalogo` · **Depende de:** TSK-44

**Descripción:** datos de prueba del catálogo para la base de datos del contenedor.

Criterios de aceptación:
- [ ] `docker/db/` con un script numerado que se ejecuta después de las migraciones.
- [ ] Usuario de prueba con rol administrador, productos `published`, destacados y con imágenes referenciales.
- [ ] Sin contraseñas ni claves reales; las credenciales de prueba se documentan en `.env.example` o en el README del seeder.
- [ ] `docker compose exec db psql -U postgres -c "select count(*) from public.products where status = 'published';"` devuelve más de cero.

#### [TSK-46] Pipeline de CD hacia GHCR · issue #75
- **Responsable:** Orlando · **Etiquetas:** `CI` · **Prioridad:** P0 · **Tamaño:** M
- **Rama:** `feature/tsk-46-cd` · **Depende de:** TSK-43

**Descripción:** construir y publicar la imagen al hacer merge a `main`.

Criterios de aceptación:
- [ ] `.github/workflows/cd.yml` con `push` a `main` y `workflow_dispatch`, y `permissions: packages: write, contents: read`.
- [ ] Pasos de login en GHCR, metadatos (tags `latest` y `sha-<commit>`) y build y push con los `build-args` desde las *Variables* de GitHub.
- [ ] Llamada al `RENDER_DEPLOY_HOOK_URL` solo si el secret existe.
- [ ] Paquete `ghcr.io/orlando572/eternal-memory` público.

#### [TSK-48] Release `develop → main` y protección de ramas · issue #77
- **Responsable:** Orlando · **Etiquetas:** `CI` · **Prioridad:** P0 · **Tamaño:** S
- **Rama:** PR `develop → main` · **Depende de:** TSK-43, TSK-44, TSK-45, TSK-46, TSK-49

**Descripción:** publicar la versión del avance con el flujo completo de CI y CD.

Criterios de aceptación:
- [ ] `main` protegida: PR obligatorio y check `quality-and-build` requerido.
- [ ] PR `develop → main` con CI en verde, revisado por Evelyn y unido con merge commit con referencia TSK.
- [ ] La ejecución de CD termina en verde y la imagen aparece en GHCR con `latest` y `sha-…`.
- [ ] Tag `v0.3.0` y Release de GitHub que describe el avance.

### Evelyn

#### [TSK-44] Servicio de BD y variables de entorno — Alumno 2 · issue #73
- **Responsable:** Evelyn · **Etiquetas:** `CI`, `Backend` · **Prioridad:** P0 · **Tamaño:** M
- **Rama:** `feature/tsk-44-docker-compose` · **Depende de:** TSK-43 para el servicio `app`

**Descripción:** levantar la aplicación y su base de datos con un solo comando.

Criterios de aceptación:
- [ ] `docker-compose.yml` con `app` y `db` (`supabase/postgres`), red, volumen `db-data`, `healthcheck` con `pg_isready` y `depends_on: condition: service_healthy`.
- [ ] Las migraciones de `supabase/migrations/` se aplican en orden al primer arranque sin errores.
- [ ] `.env.example` con todas las variables y valores de ejemplo, sin secretos reales.
- [ ] `docker compose up -d --build` levanta ambos servicios y `docker compose ps` los muestra *healthy*.

#### [TSK-49] Seeder de clientes, tarifas y pedidos — Alumno 3, segunda mitad · issue #78
- **Responsable:** Evelyn · **Etiquetas:** `Backend` · **Prioridad:** P0 · **Tamaño:** S
- **Rama:** `feature/tsk-49-seeder-pedidos` · **Depende de:** TSK-44 y TSK-45 (usa sus productos)

**Descripción:** datos de prueba del flujo de compra para la base de datos del contenedor.

Criterios de aceptación:
- [ ] Script numerado en `docker/db/` que se ejecuta después del seeder de catálogo.
- [ ] Dos clientes de prueba, tarifas de envío activas y pedidos en distintos estados (`pending_payment`, `paid`, `processing`, `completed`) con su historial.
- [ ] Sin datos personales reales.
- [ ] `docker compose exec db psql -U postgres -c "select status, count(*) from public.orders group by status;"` muestra los estados sembrados.

#### [TSK-47] Infraestructura en Render · issue #76
- **Responsable:** Evelyn · **Etiquetas:** `CI` · **Prioridad:** P0 · **Tamaño:** M
- **Rama:** no aplica (configuración en la nube) · **Depende de:** TSK-46 y la imagen publicada por TSK-48

**Descripción:** desplegar la imagen de GHCR en un servidor en la nube.

Criterios de aceptación:
- [ ] Web Service de Render con la imagen `ghcr.io/orlando572/eternal-memory:latest` y health check en `/`.
- [ ] Variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SECRET_KEY` configuradas en Render.
- [ ] Deploy Hook entregado a Orlando para guardarlo como secret `RENDER_DEPLOY_HOOK_URL` (requiere permisos de administrador del repositorio).
- [ ] URL de Render y `/auth/callback` añadidas en Supabase Auth (con la cuenta que tenga acceso).
- [ ] Capturas del panel, de los logs del deploy y de la tienda en la URL pública con inicio de sesión funcionando.

#### [TSK-50] Informe del Avance 3 y evidencias · issue #79
- **Responsable:** Evelyn · **Etiquetas:** `documentation` · **Prioridad:** P0 · **Tamaño:** M
- **Rama:** `docs/tsk-50-informe-avance-3` · **Depende de:** TSK-47 y TSK-48

**Descripción:** informe en PDF con la estructura de la sección 5 de `02-avance-3-docker-cd-cloud.md`.

Criterios de aceptación:
- [ ] Todas las secciones del informe completas, con la distribución del trabajo de este documento.
- [ ] Capturas del tablero, de CI, de CD, de GHCR, de Render y de `docker compose ps`.
- [ ] Diagrama de arquitectura de despliegue (Supabase, GHCR y Render) en `docs/diagramas/`.
- [ ] Checklist final de `02-avance-3-docker-cd-cloud.md` revisado por ambos antes de subirlo a UTP+CLASS.

---

## 7. Cambios aplicados en GitHub

Aplicados el 18/11/2026 con autorización de Orlando.

**Issues creados (22), todos en el tablero «Eternal Memory — Gestión del Proyecto»:**

| Issue | Código | Título | Responsable | Milestone | Estado |
| --- | --- | --- | --- | --- | --- |
| #58 | TSK-29 | Actualización del README | Orlando | Ecommerce funcional | Done (cerrado) |
| #59 | TSK-30 | Orden y limpieza del proyecto | Orlando | Ecommerce funcional | Done (cerrado) |
| #60 | TSK-31 | Planificación del reparto de tareas | Orlando | Ecommerce funcional | In Progress |
| #61 | TSK-32 | Resumen del administrador | Orlando | Tienda completa | To do |
| #62 | TSK-33 | Nuevas secciones de la portada | Orlando | Tienda completa | To do |
| #63 | TSK-34 | Banner informativo de la portada | Orlando | Tienda completa | To do |
| #64 | TSK-35 | Botón flotante de contacto | Evelyn | Tienda completa | To do |
| #65 | TSK-36 | Ordenar y filtrar el catálogo | Orlando | Tienda completa | To do |
| #66 | TSK-37 | Mejoras de la ficha de producto | Orlando | Tienda completa | To do |
| #67 | TSK-38 | Productos destacados | Orlando | Tienda completa | To do |
| #68 | TSK-39 | SEO y vista previa al compartir | Orlando | Tienda completa | To do |
| #69 | TSK-40 | Imágenes publicitarias | Evelyn | Tienda completa | To do |
| #70 | TSK-41 | Revisión de accesibilidad y responsive | Evelyn | Tienda completa | To do |
| #71 | TSK-42 | Pruebas en CI de lo nuevo | Evelyn | Tienda completa | To do |
| #72 | TSK-43 | Dockerfile optimizado | Orlando | Avance 3 | To do |
| #73 | TSK-44 | Servicio de BD y variables de entorno | Evelyn | Avance 3 | To do |
| #74 | TSK-45 | Seeder de catálogo y administración | Orlando | Avance 3 | To do |
| #75 | TSK-46 | Pipeline de CD hacia GHCR | Orlando | Avance 3 | To do |
| #76 | TSK-47 | Infraestructura en Render | Evelyn | Avance 3 | To do |
| #77 | TSK-48 | Release `develop → main` y protección de ramas | Orlando | Avance 3 | To do |
| #78 | TSK-49 | Seeder de clientes, tarifas y pedidos | Evelyn | Avance 3 | To do |
| #79 | TSK-50 | Informe del Avance 3 y evidencias | Evelyn | Avance 3 | To do |

**Cambios en issues existentes:**

- Reasignados a Evelyn: #20 TSK-11, #21 TSK-12, #24 TSK-15 y #29 TSK-20 (este último con la etiqueta `Backend` y los criterios de datos comerciales reales).
- Reasignado a Orlando: #28 TSK-19 (con la etiqueta `Backend`).
- #27 TSK-18 sigue abierto hasta verificar la subida de imágenes y cerrarlo con evidencia.

**Organización:**

- Milestones nuevos: «Tienda completa» (TSK-32 a TSK-42) y «Avance 3» (TSK-43 a TSK-50). Los issues que ya estaban abiertos siguen en «Ecommerce funcional».
- Se retiró del tablero la tarjeta del PR #56 para no contar TSK-29 dos veces.
- El tablero solo tiene el campo `Status`; la prioridad y el tamaño figuran en la descripción de cada issue.
