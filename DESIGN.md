---
name: Eternal Memory
description: Un patio de luz para elegir productos funerarios con calma.
colors:
  clay: "#a6533b"
  paper: "#f6ece9"
  stucco: "#e6d4c3"
  product-ground: "#f7f0eb"
  feature-panel: "#f8f0ed"
  card: "#fffdfb"
  ink: "#171717"
  copy: "#5c5651"
  quiet-copy: "#655e5a"
  category-border: "#ded1c9"
typography:
  display:
    fontFamily: "Eternal Display, serif"
    fontSize: "76px"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  section-heading:
    fontFamily: "Eternal Display, serif"
    fontSize: "44px"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  product-title:
    fontFamily: "Eternal Serif, serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  product-copy:
    fontFamily: "Eternal Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
  price:
    fontFamily: "Eternal Serif, serif"
    fontSize: "33px"
    fontWeight: 400
    lineHeight: 1
rounded:
  action: "4px"
  card: "6px"
  count: "9999px"
spacing:
  page-edge-mobile: "20px"
  category-gap-desktop: "14px"
  product-gap-mobile: "22px"
components:
  category-selected:
    backgroundColor: "{colors.clay}"
    textColor: "#ffffff"
    rounded: "{rounded.card}"
    height: "58px"
    padding: "0 28px"
  category-outline:
    backgroundColor: "#f7efebd9"
    textColor: "#2d2926"
    rounded: "{rounded.card}"
    height: "58px"
    padding: "0 28px"
  button-primary:
    backgroundColor: "{colors.clay}"
    textColor: "#ffffff"
    rounded: "{rounded.action}"
  product-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
---

# Design System: Eternal Memory

## Overview

**Creative North Star: "Patio de luz"**

La identidad «Patio de luz» se extiende desde la portada al catálogo, las fichas de producto, el carrito y las páginas de acceso y registro. Un umbral oscuro con el logo blanco abre a superficies de estuco y piedra cálida, fotografías de objetos y planos claros de consulta. La arcilla marca acciones, selección y precio; la lectura se mantiene serena y directa para familias que exploran opciones en un momento delicado.

El lenguaje visual adapta su amplitud editorial a cada tarea: la portada orienta, el catálogo facilita comparar, la ficha permite examinar y elegir, y los formularios concentran la entrada de datos. La fotografía aporta material y luz, pero las imágenes actuales de productos son referenciales y pueden diferir del producto. El carrito conserva la selección en `localStorage` de este navegador; su subtotal es referencial y no existe compra en línea.

**Key Characteristics:**

- Superficies claras cálidas junto a una barra superior oscura.
- Serif expresiva para orientación y nombres; sans sobria para descripciones y controles.
- Arcilla concentrada en selección, acciones y precios.
- Fotografía del producto como apoyo visual referencial, acompañada de información escrita.

## Colors

La base combina estuco y papel cálidos con tinta casi negra en todas las rutas. El patio azul verdoso pertenece a la fotografía, no a un color de interfaz definido.

### Primary

- **Arcilla:** selección de categoría y variante, botones, enlaces de acción y precios. El valor normativo es `colors.clay`.

### Neutral

- **Papel y estuco:** fondo cálido y plano mineral de apertura (`colors.paper`, `colors.stucco`).
- **Suelo de producto y panel destacado:** dos tonos próximos que separan la galería del panel informativo (`colors.product-ground`, `colors.feature-panel`).
- **Tarjeta:** blanco cálido para cada producto (`colors.card`).
- **Tinta y copia:** texto principal y descripciones (`colors.ink`, `colors.copy`, `colors.quiet-copy`).
- **Umbral oscuro:** barra de navegación en tinta (`colors.ink`).
- **Trazo suave:** borde de categorías sin seleccionar (`colors.category-border`).

**The Arcilla de Acción Rule.** Reserve la arcilla para destinos, selección y precio; las superficies grandes se mantienen claras.

## Typography

**Display Font:** Eternal Display, archivo Noto Serif Display, con serif de respaldo.  
**Body Font:** Eternal Sans, archivo Noto Sans, con sans-serif de respaldo.  
**Product Font:** Eternal Serif, archivo Noto Serif, con serif de respaldo.

La serif de alto contraste da calidez a titulares y nombres de producto. La sans mantiene legibles filtros, descripciones, avisos, formularios y datos del carrito.

### Hierarchy

- **Display:** titular de portada; en escritorio usa `clamp(46px, 5vw, 76px)` y en móvil 47px.
- **Section heading:** entrada a la galería; en escritorio usa `clamp(32px, 2.9vw, 44px)` y en móvil 34px.
- **Product title:** título de la urna destacada; `clamp(17px, 1.3vw, 20px)` en escritorio y 18px en móvil.
- **Product copy:** descripción del panel destacado; `clamp(11px, .91vw, 14px)` en escritorio y 12px en móvil.
- **Price:** importe destacado en portada; `clamp(25px, 2.15vw, 33px)` en escritorio y 25px en móvil. El catálogo, la ficha y el carrito ajustan el tamaño al contexto.

En las rutas interiores, los titulares editoriales del catálogo y el acceso usan `clamp(42px, 4.5vw, 68px)` en escritorio; la ficha usa `clamp(36px, 3.2vw, 52px)`. Las etiquetas y avisos operativos usan Eternal Sans, mientras nombres y precios de producto usan Eternal Serif.

## Layout

En escritorio, el hero ocupa un plano ancho. La introducción comienza a 4.5% del borde, la fotografía del patio entra desde la derecha y el panel de la urna destacada se superpone al plano mineral. La sección siguiente divide una introducción a la izquierda y tres tarjetas en columnas a la derecha. La distancia entre tarjetas es `1.56vw`.

A 900px o menos, el patio, la introducción y el producto destacado se apilan; las categorías conservan desplazamiento horizontal. A 600px o menos, las tarjetas pasan a una columna, el margen lateral es 20px y la separación vertical es 22px. La barra de navegación reduce logo, texto y espacios para caber en el ancho pequeño.

Las rutas interiores comparten un contenedor de hasta 1398px con márgenes laterales del 4%. El catálogo abre con un encabezado de estuco, una fila de filtros y una cuadrícula de cuatro columnas; pasa a dos columnas a 1000px y mantiene los filtros desplazables horizontalmente a 740px. La ficha usa dos columnas para galería e información, que se apilan a 740px; en ese ancho aparece una acción de añadir al carrito fija al borde inferior. El carrito ocupa un panel lateral de hasta 480px, a ancho completo cuando el espacio es menor. Acceso y registro presentan introducción y formulario lado a lado; se apilan a 740px.

## Elevation & Depth

La profundidad nace principalmente de fotografías con luz lateral y superficies de distinto tono. Las tarjetas de producto añaden una sombra ambiental tenue; el panel destacado se diferencia por su superficie clara, sin sombra propia. El formulario de acceso y registro se eleva levemente sobre el estuco; el carrito usa un velo oscuro y una sombra lateral, y la acción móvil de la ficha una sombra superior.

### Shadow Vocabulary

- **Tarjeta de producto:** `0 12px 25px rgba(76,48,35,.05)`; separación suave del fondo de galería.
- **Panel de acceso y registro:** `0 18px 45px rgba(76,48,35,.08)`; separación del fondo de estuco.
- **Carrito lateral:** `-14px 0 34px rgba(23,23,23,.16)`; profundidad del panel sobre la página.
- **Acción fija de ficha móvil:** `0 -8px 24px rgba(76,48,35,.08)`; separación de la ficha al pie de pantalla.

## Shapes

Botones de acción y campos tienen esquinas discretas de 4px; filtros y opciones de producto usan 5px; categorías de portada, panel destacado, tarjetas y formulario usan 6px. El contador del carrito es circular. Las fotografías quedan recortadas por el contenedor de la tarjeta, la galería o el panel.

## Components

### Buttons

- **Primary:** arcilla con texto blanco; la acción del panel usa 4px de radio y tamaño propio para mantener su presencia junto al precio. El componente base usa arcilla más profunda al pasar el puntero.
- **Focus:** contorno de arcilla de 3px definido globalmente; el componente base también añade anillo de enfoque.
- **Icon action:** botón de carrito compacto en arcilla y blanco dentro de cada tarjeta de portada.
- **Detail action:** botón de añadir al carrito junto al selector de cantidad en escritorio; en móvil se presenta con el precio en una barra fija inferior.

### Chips

- **Category entries:** controles de 6px con borde suave y fondo translúcido cuando no están seleccionados. La opción activa es arcilla con texto blanco. En móvil forman una fila con desplazamiento horizontal.
- **Catalog filters:** botones compactos de 5px; el seleccionado cambia a arcilla y el recuento de productos queda separado de los filtros. En móvil la fila se desplaza horizontalmente.
- **Product options:** botones de acabado o variante de 5px; la opción elegida recibe borde de arcilla y fondo cálido tenue.

### Cards / Containers

- **Featured product:** imagen y ficha lado a lado en escritorio; imagen sobre ficha en móvil. El panel informativo tiene superficie cálida y acción visible.
- **Product card:** fotografía en la parte superior; nombre, precio y acción de carrito debajo. Fondo blanco cálido, radio de 6px y sombra ambiental tenue. La imagen crece levemente al pasar el puntero.
- **Catalog card:** fotografía referencial arriba; categoría, nombre, precio y flecha hacia la ficha abajo. Conserva el fondo, radio y sombra de las tarjetas de portada. Si falta imagen, muestra un texto de ausencia.
- **Product detail:** galería con imagen principal y miniaturas seleccionables cuando hay varias imágenes; nombre, descripción, precio, opciones y cantidad ocupan la columna de consulta. Incluye aviso de imagen referencial y de selección guardada en el navegador.
- **Cart drawer:** panel claro sobre velo oscuro, con cabecera, lista desplazable y resumen. Cada fila muestra imagen referencial, opción elegida, precio, cantidad y acción para quitarla. El estado vacío conduce al catálogo; el resumen muestra subtotal referencial y explica que la compra en línea aún no está disponible.

### Inputs / Fields

- **Access and registration:** campos blancos con borde suave y radio de 4px dentro de un panel cálido. Etiquetas y texto auxiliar usan Eternal Sans; las respuestas de error y éxito aparecen dentro del panel. El botón principal usa arcilla y muestra un estado de carga.

### Navigation

Una barra oscura de 64px de alto aloja logo blanco, enlaces y carrito. Los enlaces son claros y cambian a un tono cálido al pasar el puntero. En móvil mide 62px y compacta los elementos.

Las rutas interiores añaden enlaces de retorno discretos; la ficha usa una ruta de navegación hacia el catálogo. El carrito se abre desde el contador de la barra superior.

## Do's and Don'ts

### Do:

- **Do** usar superficies cálidas claras para las áreas de elección y arcilla para acciones y precios.
- **Do** mostrar fotografía, nombre y precio juntos cuando se presenta un producto.
- **Do** mantener el acceso a las categorías operable con desplazamiento horizontal en móvil.
- **Do** presentar las imágenes del catálogo, la ficha y el carrito como referenciales, con un aviso visible donde corresponde.
- **Do** explicar que el carrito se guarda en este navegador y que su subtotal es referencial.

### Don't:

- **Don't** convertir el azul verdoso fotográfico en un token de UI sin una implementación que lo respalde.
- **Don't** presentar el carrito o el acceso como un proceso de compra en línea terminado.
