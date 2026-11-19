# Imágenes publicitarias — TSK-40

Piezas visuales de la portada y del catálogo, en `public/assets/banners/`. Este documento registra de dónde sale cada una. Los documentos de `docs/` son planes y registros: una licencia que aquí figure como «pendiente» **no está confirmada**.

## Decisión sobre el origen

**Se reutilizan fotografías que ya estaban en el repositorio.** Ninguna imagen nueva se generó ni se descargó para esta tarea; solo se recortaron, redimensionaron y convirtieron a WebP. Si el equipo decide sustituirlas por fotos con licencia libre o imágenes generadas, la generación de imágenes nuevas requiere la aprobación expresa de Orlando.

## Piezas

Todas son WebP, sin texto incrustado y por debajo de 250 KB.

| Archivo | Medida | Peso | Imagen base | Uso |
| --- | --- | --- | --- | --- |
| `banner-escritorio.webp` | 1600 × 600 | 152 KB | `public/assets/plates/patio-view.png` (recortada; se amplía un 28 %) | Foto del mensaje «Te orientamos en nuestro horario» de la franja de la portada |
| `categoria-urnas.webp` | 1600 × 500 | 34 KB | `public/assets/catalogo/backgrounds/urnas.webp` | Cabecera del catálogo y tarjeta de la portada |
| `categoria-ataudes.webp` | 1600 × 500 | 36 KB | `public/assets/catalogo/backgrounds/ataudes.webp` | Ídem |
| `categoria-relicarios.webp` | 1600 × 500 | 9 KB | `public/assets/catalogo/backgrounds/relicarios.webp` | Ídem |
| `categoria-arreglos-florales.webp` | 1600 × 500 | 17 KB | `public/assets/catalogo/backgrounds/arreglos-florales.webp` | Ídem |
| `como-funciona.webp` | 800 × 800 | 39 KB | `public/assets/plates/product-marble-photo.png` (recorte cuadrado) | Sección «Cómo funciona» de la portada; se muestra como imagen referencial |

La imagen para compartir (1200 × 630) **no cambia**: sigue siendo la que dibuja `src/app/opengraph-image.tsx` a partir del logo.

## Origen y licencia de cada imagen base

| Imagen base | Origen | Licencia |
| --- | --- | --- |
| `catalogo/backgrounds/*.webp` (urnas, ataúdes, relicarios, arreglos florales) | Generadas con la herramienta de imágenes integrada (`image_gen`), con los textos de `catalogo-fondos-prompts.json`. Añadidas por Orlando en `74248b1` (21/10/2026). | Imágenes generadas para el proyecto; no hay una licencia de terceros que citar. |
| `plates/patio-view.png` | El repositorio no registra su origen. Añadida por Orlando en `b10b6df` (20/10/2026). | **Pendiente de confirmar con Orlando** (propia, generada o con licencia de terceros). |
| `plates/product-marble-photo.png` | El repositorio no registra su origen. Añadida por Orlando en `b10b6df`. Se usa como imagen referencial: no representa un producto concreto del catálogo. | **Pendiente de confirmar con Orlando.** |

Antes de publicar el sitio, Orlando debe confirmar el origen y la licencia de `patio-view.png` y `product-marble-photo.png`, y anotarlos aquí.

## No incluido

La imagen vertical de portada para móvil (800 × 1000) quedó fuera: el diseño actual de la franja usa una foto horizontal también en móvil, así que no se usaría.

## Cómo regenerarlas

Con `sharp` (ya instalado por Next.js), recortando la imagen base a la proporción de la tabla, redimensionando a la medida indicada y convirtiendo a WebP con calidad 85 (se baja la calidad solo si un archivo supera 250 KB). No hay un script en el repositorio: el procedimiento queda documentado aquí.
