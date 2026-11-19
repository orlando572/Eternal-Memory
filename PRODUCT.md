# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

El público principal son familias y personas que buscan productos funerarios para honrar a un ser querido. Las funerarias son un público adicional previsto.

## Product Purpose

Eternal Memory busca facilitar la elección de productos funerarios en un momento delicado. Una experiencia exitosa permite conocer las opciones y tomar una decisión clara, serena y respetuosa, sin presión comercial.

## Positioning

La propuesta central es ofrecer una elección tranquila y comprensible de productos funerarios. La personalización y la rapidez de entrega no están confirmadas como ventajas operativas.

## Operating Context

La cobertura prevista es todo el Perú; la capacidad de atención y entrega por localidad aún debe validarse. Los precios del catálogo se muestran en soles. Las personas exploran categorías y fichas de producto, eligen opciones y guardan productos en un carrito.

## Capabilities and Constraints

- Implementado: catálogo leído de Supabase con categorías, búsqueda y paginación; fichas de producto; carrito persistido en `localStorage` con validación de precios y existencias en el servidor; registro, inicio de sesión, recuperación de contraseña y perfil con Supabase Auth; checkout que crea pedidos pendientes de pago con reserva y grabado opcional; administración de productos, variantes, imagen de portada y ajustes de grabado.
- Parcial: el pedido queda pendiente de pago porque el pago en línea no está implementado; el historial de pedidos del perfil aún no muestra pedidos.
- Planificado, sin implementación comprobada: pago de prueba, consulta de pedidos, panel de pedidos y galería de varias imágenes. Los documentos de `docs/planificacion/` son planes de trabajo, no evidencia de estas capacidades.
- Pendiente de validar antes de ofrecerlo como servicio real: disponibilidad y stock, entrega en 24 horas, grabado incluido, cobertura efectiva en todo el Perú y atención por WhatsApp 24/7.

## Brand Commitments

El nombre del producto es Eternal Memory y el repositorio incluye su logo en `public/logo.png`. La comunicación con familias debe ser clara y respetuosa, coherente con la elección sin presión comercial confirmada.

## Evidence on Hand

- `supabase/migrations/20261020220720_sample_catalog_drafts.sql` carga el catálogo de muestra con precios en soles; no demuestra inventario, precios vigentes ni disponibilidad real.
- `src/app/` contiene las rutas y el contenido actuales; algunas promesas visibles en sus textos siguen pendientes de validación operativa.
- No hay en el repositorio testimonios, cifras de servicio ni pruebas de cobertura nacional que deban tratarse como evidencia comercial.

## Product Principles

1. Ayudar a decidir con calma y sin presión.
2. Explicar productos, opciones y precios con claridad.
3. Tratar a familias, personas y funerarias con respeto.
4. Publicar compromisos de entrega, disponibilidad y atención solo después de verificarlos.
