# Planificación — Mejoras de la tienda (Parte 2)

> Orden de trabajo acordado: **primero esta parte (página web)** y después la
> contenerización, CD y nube del Avance 3 (`02-avance-3-docker-cd-cloud.md`).
>
> Fecha de elaboración: 18/11/2026. Equipo: Orlando (líder) y Evelyn.
> Este documento es un plan; no prueba que nada esté implementado.

## 1. Punto de partida (comprobado en el código)

| Área | Estado actual |
| --- | --- |
| Portada (`/`) | Hero que cambia de texto según la categoría y rejilla de productos. Sin secciones de confianza, proceso, FAQ ni banners. |
| Catálogo (`/catalogo`) | Datos desde Supabase, filtro por categoría, búsqueda por nombre y paginación. Sin orden por precio ni filtros adicionales. |
| Ficha (`/catalogo/[id]`) | Galería, selector de variante y cantidad. Sin relacionados, sin ruta de navegación, sin metadatos por producto. |
| Carrito | `localStorage`, sincronización entre pestañas y validación de precios/stock en el servidor. |
| Checkout (`/checkout`) | Crea pedidos `pending_payment` con reserva. **El pago en línea no existe.** |
| Perfil (`/perfil`) | Datos personales funcionando. `/perfil/historial` existe pero **está vacío**. |
| Admin (`/admin/productos`) | CRUD de productos y variantes, imagen de portada con subida a Storage, ajustes de grabado. **No hay panel de pedidos.** |
| Base de datos | Ya existen `orders`, `order_items`, `order_status_history`, `payment_attempts`, `payment_events` (preparadas para Stripe). |
| Footer | Contacto **provisional** (`+51 900 000 000`, `contacto@eternalmemory.pe`) y modales de privacidad y términos. |

Issues abiertos relacionados: TSK-11, 12, 13, 14, 15, 16, 18, 19 y 20.

## 2. Reglas que deben respetar todas las tareas

- Identidad visual «Patio de luz»: colores, tipografías y radios de `DESIGN.md` y `src/app/globals.css`. Componentes base de shadcn/ui.
- Tono de `PRODUCT.md`: **elegir con calma, sin presión comercial**. Nada de cuentas regresivas, «últimas unidades», descuentos agresivos ni pop-ups.
- **No publicar promesas no verificadas**: entrega en 24 h, atención 24/7, cobertura en todo el Perú, stock garantizado o grabado incluido. Si se muestran, deben estar confirmadas por el negocio.
- Imágenes de producto: usar las existentes y marcarlas como referenciales. Las imágenes publicitarias nuevas se generan solo con aprobación expresa (ver Fase 5).
- Flujo de trabajo ya usado: un issue `TSK-xx` → una rama (`feature/…`, `bugfix/…`) → PR a `develop` con CI en verde y revisión del compañero.
- Antes de cada PR: `npm run lint`, `npm run typecheck`, `npm run build` y las pruebas de la funcionalidad tocada.

## 3. Resumen de fases

| Fase | Objetivo | Tareas | Prioridad |
| --- | --- | --- | --- |
| 0 | Limpieza y datos base | TSK-30, TSK-31 | P0 |
| 1 | Cerrar el flujo de compra | TSK-11, TSK-12, TSK-13, TSK-14 | P0 |
| 2 | Operación del administrador | TSK-15, TSK-16, TSK-18, TSK-19, TSK-32 | P1 |
| 3 | Portada y páginas comerciales | TSK-33, TSK-34, TSK-35, TSK-20 | P1 |
| 4 | Catálogo, ficha y SEO | TSK-36, TSK-37, TSK-38, TSK-39 | P1 / P2 |
| 5 | Imágenes publicitarias | TSK-40 | P2 |
| 6 | Calidad y cierre | TSK-41, TSK-42 | P1 |

Tamaño estimado: **S** ≈ medio día · **M** ≈ 1–2 días · **L** ≈ 3+ días.

Las fases 1 y 3 pueden avanzar en paralelo (una persona en cada una), porque no tocan los mismos archivos.

---

## Fase 0 — Limpieza y datos base

### TSK-30 · Orden del proyecto y documentación vigente — Orlando · S
**Rama:** `chore/tsk-30-orden-documentacion` (creada desde `develop`, solo local hasta autorizar el push)

- [x] Quitar archivos sin uso: SVG de la plantilla de Next en `public/`, tres fotos de `public/assets/plates/` sin referencias, `productsData.ts` (catálogo local reemplazado por Supabase) y `src/lib/supabaseClient.ts` (duplicaba `src/lib/supabase/client.ts`).
- [x] Versionar `docs/` (quitar `/docs/` del `.gitignore`) y ordenarla en `diagramas/`, `planificacion/`, `specs/` y `recursos/`, con un índice en `docs/README.md`.
- [x] Mover `GESTION_PROYECTO.md` a `docs/planificacion/gestion-proyecto.md`.
- [x] `README.md`: quitar «Stripe» y «Simulación de pagos» como hechos y enlazar la documentación.
- [x] `AGENTS.md`, `PRODUCT.md` y `supabase/README.md`: describir el estado real (catálogo en Supabase, checkout con pedidos, pruebas y CI).
- [ ] Borrar o mover fuera del proyecto `cloudflared.deb` (20 MB, sin seguimiento; decisión de Orlando).
- [ ] Crear el issue `[TSK-30]` en GitHub, subir la rama y abrir el PR hacia `develop` (con autorización).

### TSK-31 · Datos comerciales reales — Orlando · S
**Rama:** `chore/tsk-31-datos-comerciales`

- [ ] Sustituir el teléfono, correo y WhatsApp provisionales de `src/features/footer/footerContent.ts` por los canales reales del equipo o del negocio.
- [ ] Definir las tarifas reales de `delivery_rates` (provincia de Arequipa y resto del Perú) y activarlas.
- [ ] Revisar qué productos están en `published` y cuáles siguen en borrador.

**Criterio de aceptación:** ningún dato visible en la web es un marcador de posición.

---

## Fase 1 — Cerrar el flujo de compra (núcleo e-commerce)

Es lo más importante para que la tienda se considere un e-commerce completo: hoy el pedido queda «pendiente de pago» y el cliente no puede verlo después.

### TSK-11 · Pago de prueba con Stripe — Orlando · L (issue abierto)
**Rama:** `feature/pagos` · **Depende de:** checkout actual

1. Crear cuenta de Stripe en **modo prueba** y guardar las claves en `.env.local` (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`). Nunca en el repo.
2. `POST /api/checkout/pedidos/[id]/pago`: valida que el pedido sea del usuario y esté `pending_payment` con reserva vigente. Crea una *Checkout Session* en PEN con el importe del pedido **leído de la BD** y registra la fila en `payment_attempts`.
3. `POST /api/webhooks/stripe`: verifica la firma, ignora eventos repetidos (`payment_events.stripe_event_id` es clave primaria) y, solo con `checkout.session.completed`, marca el pedido `paid` y escribe `order_status_history`.
4. Expiración o cancelación → `payment_attempts.status = expired/failed`; el pedido **no** pasa a pagado.
5. Botón «Pagar» en el recibo del checkout (`CheckoutForm.tsx`).

**Riesgo:** Stripe no activa cuentas con sede en Perú. Comprobar que el modo prueba esté disponible con su cuenta. Si no lo está, la alternativa con sandbox es Mercado Pago o Culqi (requiere ajustar las columnas `stripe_*`).

**Pruebas:** `src/features/checkout/payment.test.mjs` con el webhook simulado: firma inválida, evento duplicado e importe distinto.

### TSK-12 · Resultado del pago — Orlando · M (issue abierto)
**Rama:** `feature/resultado-pago` · **Depende de:** TSK-11

- [ ] Ruta `/checkout/resultado?pedido=…` que **consulta el estado real** del pedido (no confía en la URL de éxito).
- [ ] Tres vistas: pagado (siguiente paso: preparación y contacto), pendiente o verificando (actualización automática cada pocos segundos) y cancelado o fallido (reintentar pago o volver al carrito).
- [ ] Enlace a «Ver mi pedido» (TSK-14).

### TSK-13 · Consulta de pedidos del cliente — Evelyn · M (issue abierto)
**Rama:** `feature/consulta-pedidos`

- [ ] `GET /api/cuenta/pedidos` (lista paginada) y `GET /api/cuenta/pedidos/[id]` (detalle con líneas, importes e historial de estados).
- [ ] Ambas requieren sesión. Una cuenta **no puede** ver pedidos de otra aunque conozca el UUID (comprobar la política RLS de `orders` y `order_items`).
- [ ] Pruebas: un usuario A no obtiene el pedido de B.

### TSK-14 · Historial y seguimiento — Evelyn · M (issue abierto)
**Rama:** `feature/historial-pedidos` · **Depende de:** TSK-13

- [ ] Completar `/perfil/historial`: tarjetas con número corto, fecha, total, estado del pedido y estado del pago.
- [ ] Nueva ruta `/perfil/historial/[id]`: líneas, grabados, dirección, importes y una **línea de tiempo** con `order_status_history`.
- [ ] Estado vacío: «Aún no tienes pedidos» y enlace al catálogo.
- [ ] Etiquetas de estado reutilizando `orderStatusLabel` y `paymentStatusLabel` de `checkoutClient.ts`.

---

## Fase 2 — Operación del administrador

### TSK-15 · Operación y estados de pedidos — Orlando · M (issue abierto)
**Rama:** `feature/estados-pedido`

- [ ] Función SQL `admin_change_order_status(order_id, to_status, reason)` con transiciones permitidas:
  `paid → processing → shipped → completed`, cualquiera → `canceled` (con motivo) y `review_required ↔ processing`.
- [ ] `paid` **solo** lo asigna el webhook de pago, nunca el admin.
- [ ] Cada cambio registra autor, fecha y motivo en `order_status_history`.
- [ ] Migración nueva en `supabase/migrations/`.

### TSK-16 · Panel de pedidos — Orlando · L (issue abierto)
**Rama:** `feature/panel-pedidos` · **Depende de:** TSK-15

- [ ] Ruta `/admin/pedidos` dentro de `AdminShell` (añadir la pestaña junto a Productos).
- [ ] Tabla: número, cliente, fecha, total, zona, estado del pedido y estado del pago.
- [ ] Filtros por estado y fecha. Búsqueda por número, nombre o correo.
- [ ] Detalle `/admin/pedidos/[id]` con datos de contacto, líneas, grabados, historial y botones de transición válidos.
- [ ] Mensajes claros para permisos insuficientes y transiciones rechazadas.

### TSK-18 · Almacenamiento de imágenes — Orlando · S (issue abierto, casi hecho)
La subida de **portada** ya funciona (`productImageStorage.ts` y `save_admin_product_with_image`).

- [ ] Verificar los criterios del issue contra el código actual (límite de 5 MB, solo JPG/PNG/WebP, conservación de la imagen anterior si falla).
- [ ] Si se cumplen, cerrar el issue con un comentario de evidencia. Si no, corregir lo que falte.

### TSK-19 · Gestión visual de imágenes (galería múltiple) — Evelyn · M (issue abierto)
**Rama:** `feature/admin-imagenes` · **Depende de:** TSK-18

- [ ] Pasar de «solo portada» a **varias imágenes por producto**: subir, previsualizar, reordenar (subir/bajar o arrastrar), elegir portada y eliminar.
- [ ] La ficha (`ProductGallery.tsx`) muestra las imágenes guardadas en su orden.
- [ ] Texto alternativo editable por imagen (accesibilidad).

### TSK-32 · Resumen del administrador — Evelyn · M (nuevo)
**Rama:** `feature/tsk-32-resumen-admin`

- [ ] Ruta `/admin` con tarjetas: pedidos por atender (`paid` + `processing`), pedidos del día, productos publicados y en borrador, y variantes sin stock.
- [ ] Lista corta de «últimos pedidos» con enlace al panel (TSK-16).
- [ ] Solo lectura, sin gráficos complejos.

---

## Fase 3 — Portada y páginas comerciales

Todas las secciones nuevas van en `src/features/home/` como componentes propios, con su texto en `homeContent.ts`.

### TSK-33 · Nuevas secciones de la portada — Orlando · M (nuevo)
**Rama:** `feature/tsk-33-secciones-portada`

Orden propuesto bajo la rejilla de productos actual:

1. **«Cómo funciona»** — tres pasos con icono: *Explora con calma* → *Elige y personaliza* → *Confirma tu pedido*. Texto breve, sin plazos.
2. **«Te acompañamos»** (confianza) — tres o cuatro puntos verificables: precios en soles visibles, opción de grabado (si está activa), atención por WhatsApp **en el horario real** y entrega a Arequipa y al resto del Perú **según tarifa**.
3. **Banda de categorías destacadas** — cuatro tarjetas grandes con las imágenes de `public/assets/catalogo/backgrounds/*.webp`, enlazadas al catálogo filtrado.
4. **Preguntas frecuentes** — acordeón accesible (`<details>` o shadcn Accordion): cómo se calcula el envío, qué es la reserva del pedido, cómo funciona el grabado, cómo contactar y medios de pago.
5. **Cierre de contacto** — «¿Prefieres conversar antes de elegir?» con botón a WhatsApp y correo.

**Aceptación:** responsive a 375 px, contraste AA y ninguna promesa no verificada.

### TSK-34 · Banner informativo de la portada — Orlando · S (nuevo)
**Rama:** `feature/tsk-34-banner-portada` · **Depende de:** TSK-40 si se usan imágenes nuevas

- [ ] Componente `HomeBanner` con imagen, título, texto y botón, configurable desde `homeContent.ts` (sin código para cambiar el mensaje).
- [ ] Mensajes sobrios, por ejemplo: «Personaliza con un grabado», «Conoce nuestros relicarios», «Entregas en la provincia de Arequipa».
- [ ] Una sola franja, no carrusel automático (respeta el tono sin presión).

### TSK-35 · Botón flotante de contacto — Evelyn · S (nuevo)
**Rama:** `feature/tsk-35-contacto-flotante`

- [ ] Botón discreto de WhatsApp abajo a la derecha, que no tape el botón del carrito en móvil.
- [ ] Mensaje prellenado con la página actual («Hola, quisiera información sobre…»).
- [ ] Oculto en `/admin` y `/checkout`.

### TSK-20 · Páginas comerciales y contacto — Orlando · M (issue abierto)
**Rama:** `feature/paginas-contacto`

- [ ] `/nosotros`: quiénes son y en qué se diferencian, sin cifras inventadas.
- [ ] `/contacto`: canales, horario, ubicación y formulario (guardar en una tabla `contact_messages` o abrir `mailto:`).
- [ ] `/privacidad` y `/terminos`: convertir los modales actuales del footer en páginas con URL propia (sirven para Stripe y para SEO).
- [ ] `/envios`: zonas y tarifas leídas de `delivery_rates`.
- [ ] Enlaces del header y del footer actualizados.

---

## Fase 4 — Catálogo, ficha y SEO

### TSK-36 · Ordenar y filtrar el catálogo — Evelyn · M (nuevo)
**Rama:** `feature/tsk-36-orden-filtros`

- [ ] Selector «Ordenar por»: relevancia, precio ascendente, precio descendente y nombre.
- [ ] Filtro por rango de precio (mín./máx. en soles).
- [ ] Parámetros en la URL (`?orden=precio-asc&min=…&max=…`) validados en `catalogParams.ts`, igual que `page` y `query`.
- [ ] Contador de resultados («24 productos») y botón «Limpiar filtros».

### TSK-37 · Mejoras de la ficha de producto — Evelyn · M (nuevo)
**Rama:** `feature/tsk-37-ficha-producto`

- [ ] Ruta de navegación: Inicio › Catálogo › Categoría › Producto.
- [ ] «También te puede interesar»: hasta cuatro productos de la misma categoría.
- [ ] Bloque informativo bajo el precio: envío según zona (enlace a `/envios`) y si admite grabado.
- [ ] Aviso visible de «imagen referencial» donde corresponda.

### TSK-38 · Productos destacados — Orlando · S (nuevo)
**Rama:** `feature/tsk-38-destacados`

- [ ] Columna `is_featured boolean` en `products` (migración) y casilla en el editor de admin.
- [ ] La portada prioriza los destacados en la rejilla y en el hero.

### TSK-39 · SEO y vista previa al compartir — Orlando · S (nuevo)
**Rama:** `feature/tsk-39-seo`

- [ ] `generateMetadata` en `/catalogo/[id]` (título, descripción e imagen Open Graph del producto) y en `/catalogo` según la categoría.
- [ ] `src/app/sitemap.ts` y `src/app/robots.ts` (consultar la guía en `node_modules/next/dist/docs/` antes de escribirlos).
- [ ] Imagen Open Graph por defecto con el logo.
- [ ] **Aceptación:** al pegar el enlace de un producto en WhatsApp se ven su nombre e imagen.

---

## Fase 5 — Imágenes publicitarias

### TSK-40 · Banners y piezas visuales — Orlando y Evelyn · M (nuevo)
**Rama:** `feature/tsk-40-imagenes-publicitarias`

Decisión previa del equipo: **¿usamos fotos existentes, compramos o descargamos fotos con licencia libre, o generamos imágenes nuevas?** Las imágenes nuevas solo se generan con aprobación expresa.

Piezas necesarias:

| Pieza | Tamaño | Uso |
| --- | --- | --- |
| Banner de portada (escritorio) | 1600 × 600, WebP | TSK-34 |
| Banner de portada (móvil) | 800 × 1000, WebP | TSK-34 |
| Cabecera por categoría (×4) | 1600 × 500, WebP | catálogo filtrado |
| Imagen Open Graph | 1200 × 630, JPG | TSK-39 |
| Imagen «Cómo funciona» o contacto | 800 × 800, WebP | TSK-33 |

Lineamientos: paleta clay/paper/stucco de `DESIGN.md`, luz natural cálida, sin personas en duelo explícito, sin texto incrustado en la imagen (el texto va en HTML para accesibilidad y traducción) y menos de 250 KB por archivo. Guardar en `public/assets/banners/`.

---

## Fase 6 — Calidad y cierre

### TSK-41 · Revisión de accesibilidad y responsive — Evelyn · S (nuevo)
- [ ] Recorrer portada, catálogo, ficha, carrito, checkout, perfil y admin a 375, 768 y 1280 px.
- [ ] Navegación solo con teclado, foco visible y contraste AA.
- [ ] Registrar cada hallazgo como issue `bug` con etiqueta `accessibility`, como se hizo en TSK-23.

### TSK-42 · Pruebas en CI de lo nuevo — Orlando · S (nuevo)
- [ ] Añadir a `.github/workflows/ci.yml` las pruebas nuevas (pagos, consulta de pedidos, estados) y las que ya existen pero no se ejecutan en CI (`test:checkout`, `test:checkout-engraving`, `test:cart-order`, `test:cart-sync`).
- [ ] Pruebas con `node --test` de la lógica del recorrido completo: catálogo → carrito → checkout → resultado.

---

## 4. Reparto por persona

| Orlando | Evelyn |
| --- | --- |
| TSK-30, 31 (limpieza y datos) | TSK-13, 14 (pedidos del cliente) |
| TSK-11, 12 (pago y resultado) | TSK-19 (galería de imágenes) |
| TSK-15, 16 (estados y panel de pedidos) | TSK-32 (resumen admin) |
| TSK-18 (verificar y cerrar) | TSK-35 (contacto flotante) |
| TSK-33, 34 (portada y banner) | TSK-36, 37 (filtros y ficha) |
| TSK-20 (páginas comerciales) | TSK-41 (accesibilidad) |
| TSK-38, 39 (destacados y SEO) | TSK-40 (imágenes, compartido) |
| TSK-42 (pruebas en CI) | |

## 5. Orden sugerido de ejecución

1. TSK-30 y TSK-31 (rápidas, desbloquean contenido real).
2. En paralelo: **Orlando** TSK-11 → TSK-12 y **Evelyn** TSK-13 → TSK-14.
3. En paralelo: **Orlando** TSK-15 → TSK-16 y **Evelyn** TSK-19 → TSK-32.
4. En paralelo: **Orlando** TSK-33 → TSK-34 → TSK-20 y **Evelyn** TSK-36 → TSK-37 → TSK-35.
5. TSK-40 (imágenes), TSK-38 y TSK-39.
6. TSK-41 y TSK-42, y PR de release `develop → main`, que conecta con el plan de la Parte 1.

## 6. Seguimiento en GitHub

- Crear los issues nuevos (TSK-30 a TSK-42) con el mismo formato: título `[TSK-xx] …`, responsable, etiquetas `Frontend`/`Backend`/`CI` y criterios de aceptación como lista de casillas.
- Añadirlos al tablero Kanban de GitHub Projects y a un milestone nuevo, por ejemplo «Tienda completa».
- Cada PR menciona `Closes #<número>` para cerrar el issue al hacer merge.
