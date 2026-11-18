# Carrito persistente con validación de servidor

Estado: especificación; implementación no autorizada todavía.

Alcance y puntos de prueba confirmados por el usuario el 21 de octubre de 2026.
Publicación pendiente de configurar el tracker del proyecto. Etiqueta prevista: `ready-for-agent`.

## Problem Statement

El cliente necesita guardar una selección de variantes, revisar cantidades e importes y volver a la ficha de cada producto sin perder su carrito al recargar.

El carrito actual permite agregar, modificar y eliminar líneas, pero calcula importes con datos del navegador. La lectura del contenido guardado no valida su estructura ni sus cantidades. Los controles del carrito tampoco comprueban existencias vigentes. Una modificación del almacenamiento local puede alterar los importes mostrados.

Aunque el catálogo ya consulta productos, variantes, precios y existencias persistidos, el carrito no los revalida. Cada línea muestra precio unitario, pero carece de subtotal y enlaces al producto. Algunas selecciones antiguas no incluyen identificadores de variante que permitan verificarlas directamente.

## Solution

Mantener un carrito disponible sin cuenta y persistido en este navegador. El cliente podrá agregar variantes, cambiar cantidades, eliminar líneas y abrir la ficha desde el nombre o la imagen del artículo.

El servidor comprobará cada selección contra el catálogo persistido y calculará precios, subtotales y total. Las líneas inválidas permanecerán visibles con su motivo, pero no participarán en el total validado. Los cambios de precio se aplicarán con aviso; las cantidades superiores al stock requerirán un ajuste del cliente.

La selección se revalidará al recuperarla, abrir el carrito, modificar su contenido y volver a la pestaña. Si falla la validación, se conservará la selección, se ocultarán los importes y se permitirá reintentar o eliminar artículos. Agregar al carrito no reservará unidades. El total incluirá únicamente artículos.

## User Stories

1. Como cliente, quiero usar el carrito sin iniciar sesión para preparar mi selección sin crear una cuenta.
2. Como cliente, quiero agregar una variante concreta para conservar la opción que elegí.
3. Como cliente, quiero agregar varias variantes del mismo producto para compararlas y administrarlas por separado.
4. Como cliente, quiero que agregar nuevamente una variante actualice su cantidad para evitar líneas duplicadas.
5. Como cliente, quiero cambiar la cantidad de una línea para ajustar mi selección.
6. Como cliente, quiero eliminar una línea para retirar un artículo que ya no necesito.
7. Como cliente, quiero conservar la opción de vaciar el carrito para retirar toda mi selección.
8. Como cliente, quiero ver nombre, variante y cantidad para reconocer cada artículo guardado.
9. Como cliente, quiero ver el precio unitario vigente para conocer el importe aplicado a cada unidad.
10. Como cliente, quiero ver el subtotal de cada línea para comprender el efecto de su cantidad.
11. Como cliente, quiero ver un total que corresponda a las líneas válidas y cantidades actuales para revisar mi selección.
12. Como cliente, quiero saber qué líneas quedaron fuera del total para no confundir un total parcial con toda mi selección.
13. Como cliente, quiero conservar el carrito después de recargar para continuar sin repetir mi selección.
14. Como cliente, quiero que se valide el contenido recuperado para no confiar en datos antiguos o alterados.
15. Como cliente, quiero que abrir el carrito actualice precios y disponibilidad para revisar información vigente.
16. Como cliente, quiero que modificar el carrito actualice su validación para mantener coherentes cantidades e importes.
17. Como cliente, quiero que volver a la pestaña revalide mi selección para detectar cambios durante mi ausencia.
18. Como cliente, quiero recibir un aviso cuando cambie un precio para entender la actualización de los importes.
19. Como cliente, quiero saber cuándo una cantidad supera el stock disponible para ajustarla conscientemente.
20. Como cliente, quiero que una cantidad insuficientemente cubierta por stock no se reduzca automáticamente para conservar el control de mi selección.
21. Como cliente, quiero ver cuándo un producto o variante dejó de estar disponible para corregir o eliminar esa línea.
22. Como cliente, quiero conservar las líneas inválidas con su motivo para decidir qué hacer con ellas.
23. Como cliente, quiero que se rechacen cantidades nulas, negativas, fraccionarias o mal formadas para evitar selecciones incoherentes.
24. Como cliente, quiero que se respete un máximo de 50 unidades por variante y 50 líneas distintas para mantener el carrito dentro de los límites acordados.
25. Como cliente, quiero que se comprueben las existencias aunque la cantidad esté dentro del máximo para evitar cantidades no disponibles.
26. Como cliente, quiero conservar mi selección cuando falle el servidor para no perder lo que había elegido.
27. Como cliente, quiero que los importes no se muestren como válidos cuando falle la validación para evitar información engañosa.
28. Como cliente, quiero reintentar la validación para recuperar los importes sin reconstruir el carrito.
29. Como cliente, quiero poder eliminar artículos durante un fallo de conexión para seguir organizando mi selección.
30. Como cliente, quiero recuperar las líneas antiguas que puedan identificarse con certeza para conservar selecciones anteriores.
31. Como cliente, quiero que las líneas antiguas ambiguas permanezcan pendientes y fuera del total para evitar sustituciones equivocadas.
32. Como cliente, quiero abrir la ficha desde el nombre o imagen del artículo para consultar sus detalles.
33. Como cliente, quiero que el panel se cierre al navegar a la ficha para poder ver el producto.
34. Como cliente, quiero acceder al producto identificable de una línea antigua pendiente para volver a elegir una variante.
35. Como cliente, quiero saber que el carrito no reserva unidades para comprender que las existencias pueden cambiar.
36. Como cliente, quiero que el total incluya solo artículos para distinguirlo de una compra con envío u otros cargos.
37. Como cliente, quiero que alterar un precio desde el navegador no cambie el importe validado para que los precios dependan del catálogo persistido.
38. Como cliente, quiero distinguir un carrito vacío de uno pendiente de validación para comprender el estado de mi selección.

## Implementation Decisions

- Mantener la persistencia en `localStorage`, sin cuenta obligatoria, tabla de carritos ni sincronización entre dispositivos.
- Adaptar el estado compartido del carrito, su almacenamiento, las filas del panel, el resumen y la integración de agregar desde el catálogo y la ficha.
- Incorporar una frontera HTTP de validación de carrito, disponible también para visitantes sin sesión. Su consulta no creará pedidos ni reservará existencias.
- Reutilizar el acceso público al catálogo desde el servidor. No heredar permisos de una sesión administrativa ni exponer credenciales privilegiadas al navegador.
- Consultar productos, variantes, precios y existencias persistidos. Un producto debe ser visible en el catálogo público y su variante debe estar activa y pertenecer a él.
- Calcular la disponibilidad con las existencias menos las unidades ya reservadas. La consulta del carrito no modificará ninguno de esos valores.
- No utilizar la operación existente de creación de pedidos para validar el carrito, porque tiene efectos de reserva y creación de pedidos.
- No se prevén cambios de esquema: las entidades persistidas necesarias ya existen.
- Identificar las líneas actuales por variante persistida. Agregar otra vez la misma variante acumulará cantidad; distintas variantes permanecerán separadas. Aplicar los límites a la cantidad acumulada, incluso ante entradas duplicadas manipuladas.
- Aceptar como datos de selección la identidad del artículo o variante y la cantidad. La información heredada solo servirá para intentar resolver una identidad inequívoca.
- Tratar todos los datos del navegador como no confiables. Los precios enviados o guardados no serán autoridad ni podrán alterar el resultado. Rechazar intentos de establecer precios mediante el contrato de validación; calcular siempre desde los precios persistidos.
- Validar estructura, identificadores, relación producto-variante y cantidades en el servidor, aunque existan restricciones en la interfaz.
- Admitir cantidades enteras de 1 a 50 por variante y un máximo de 50 líneas distintas. Una cantidad también deberá estar cubierta por las existencias vigentes.
- Rechazar solicitudes estructuralmente inválidas o que excedan los límites. Para líneas identificables con problemas de disponibilidad o cantidad, devolver un resultado que permita conservarlas, explicar el motivo y excluirlas del total.
- La respuesta de validación distinguirá líneas válidas, inválidas y pendientes de identificación. Incluirá los datos vigentes necesarios para mostrar el producto, el precio unitario, el subtotal de las líneas válidas y el total de artículos válidos.
- El servidor calculará el subtotal como precio unitario vigente por cantidad válida, y el total como suma de esos subtotales. Mantener precisión monetaria en soles, con dos decimales, sin errores acumulados de coma flotante.
- Mostrar el motivo de exclusión junto a cada línea inválida o pendiente. Indicar expresamente cuando el total solo incluya parte de la selección. No asignar un subtotal validado a una línea excluida.
- Cuando cambie el precio respecto al último importe conocido, mostrar el nuevo precio validado y un aviso. La referencia anterior podrá ayudar a detectar cambios, pero nunca determinar el importe autorizado.
- Si falta stock, conservar la cantidad solicitada y pedir al cliente que la ajuste. No reducirla automáticamente ni reservar unidades.
- Revalidar al recuperar la selección guardada, abrir el panel, agregar artículos, modificar cantidades, eliminar líneas y volver a la pestaña. El carrito vacío tendrá un total de artículos de cero sin necesitar consultar productos.
- Los importes visibles deberán corresponder a la versión actual de la selección. Mientras una modificación espere validación, no presentar como vigentes los importes de la selección anterior. Una respuesta atrasada no podrá restaurar líneas eliminadas ni sobrescribir cantidades posteriores.
- Ante un fallo de red o servidor, conservar la selección, ocultar los importes, mostrar el motivo general y ofrecer «Reintentar». Mantener disponible la eliminación de artículos.
- Validar la estructura del almacenamiento al recuperarlo para evitar que contenido corrupto rompa la interfaz. No interpretar datos ilegibles como importes o selecciones verificadas.
- Intentar resolver líneas antiguas mediante su información disponible y el catálogo persistido. Solo migrarlas automáticamente cuando la correspondencia sea inequívoca; conservar las ambiguas como pendientes, fuera del total.
- Si puede identificarse el producto de una línea pendiente, permitir abrir su ficha. No inventar un destino cuando no pueda identificarse.
- Convertir nombre e imagen en enlaces a la ficha identificada con datos del catálogo. Cerrar el panel al navegar, sin convertir los controles de cantidad o eliminación en enlaces.
- Mantener el panel lateral y la identidad «Patio de luz», con componentes base existentes, controles accesibles, estados comprensibles e imágenes actuales señaladas como referenciales.
- El resumen incluirá únicamente artículos. No incorporará envío, cargos adicionales ni una acción que presente el proceso como una compra en línea implementada.

## Testing Decisions

- Los puntos de prueba acordados son el flujo del carrito en navegador y la frontera HTTP de validación. Se priorizarán esos límites externos sobre pruebas de funciones internas, estado privado o detalles de renderizado.
- Las pruebas de navegador cubrirán la integración observable entre catálogo, ficha, estado del carrito, persistencia, validación y panel. No dependerán de la estructura interna del contexto React.
- Las pruebas HTTP ejercitarán solicitudes y respuestas del servidor contra datos persistidos de prueba controlados. No se limitarán a sustituir el cálculo por un mock que devuelva el resultado esperado.
- Existe como precedente una suite con `node:test`, aserciones, sustitución de dependencias y comprobaciones de comportamiento de navegación y acceso. No se ha encontrado una suite de navegador. La implementación deberá elegir la herramienta necesaria y añadir comandos reproducibles, sin presentar esa elección como ya realizada.
- Verificar agregar dos variantes distintas y agregar de nuevo una ya presente: las primeras permanecen separadas y la repetida acumula su cantidad sin eludir límites.
- Verificar cambios de cantidad, eliminación, vaciado, estado vacío y recuperación tras recargar, incluyendo el acceso sin sesión.
- Con datos de prueba de S/ 10.50 por dos unidades y S/ 3.25 por tres, comprobar subtotales de S/ 21.00 y S/ 9.75, y total de S/ 30.75. Estos importes son fixtures, no cambios de precios del catálogo.
- Alterar precios en almacenamiento y solicitudes: comprobar que nunca producen importes autorizados por el cliente y que el servidor obtiene los precios persistidos.
- Probar productos inexistentes o no publicados, categorías no visibles, variantes inexistentes o inactivas y variantes asociadas a otro producto. Ninguna línea inválida contribuirá al total.
- Probar cero, negativos, fracciones, cadenas, valores ausentes y cantidades superiores a 50. Probar 50 y 51 líneas distintas, así como variantes duplicadas que intenten superar el límite acumulado.
- Probar disponibilidad de cero, menor que la cantidad solicitada e igual a ella, considerando unidades reservadas. La cantidad insuficiente permanecerá visible con motivo y fuera del total, sin ajuste automático.
- Cambiar precio y stock persistidos entre validaciones: comprobar avisos, nuevos importes y estados al abrir el carrito, modificarlo y volver a la pestaña.
- Comprobar que validar no crea pedidos, no aumenta reservas y no descuenta existencias.
- Interrumpir la conexión y provocar un fallo de servidor: comprobar conservación de la selección, importes ocultos, eliminación operativa y recuperación mediante «Reintentar».
- Simular respuestas fuera de orden durante cambios rápidos o eliminación: solo la selección vigente podrá determinar las líneas e importes visibles.
- Probar almacenamiento mal formado y líneas antiguas con correspondencia única, ambigua o inexistente. Ninguna selección ambigua se migrará a una variante arbitraria.
- Comprobar que nombre e imagen abren la ficha correcta y cierran el panel. Comprobar también el enlace de una línea antigua cuyo producto pueda identificarse.
- Revisar estados y controles con teclado y en ancho móvil, manteniendo avisos de imágenes referenciales y de persistencia local.
- Antes de entregar una futura implementación, ejecutar lint, compilación y las pruebas añadidas. Informar únicamente los resultados realmente ejecutados; una compilación no demuestra conectividad ni validación correcta contra Supabase.

## Out of Scope

- Implementar esta funcionalidad durante la preparación de la especificación.
- Sincronizar el carrito entre dispositivos o asociarlo a una cuenta.
- Reservar unidades al agregar o validar artículos.
- Crear pedidos, checkout, pagos o compra en línea.
- Calcular envío, impuestos adicionales, descuentos o cargos nuevos.
- Garantizar existencias futuras, cobertura o plazos de entrega.
- Reemplazar el catálogo persistido, inventar stock o modificar nombres, opciones y precios de muestra.
- Generar imágenes de productos o rediseñar pantallas ajenas al carrito.
- Añadir actualización continua mediante suscripciones, sondeo periódico o infraestructura no acordada.

## Further Notes

- El usuario confirmó el alcance y pidió expresamente no implementar todavía. Esta especificación no autoriza cambios funcionales, migraciones ni despliegues.
- Los puntos de prueba fueron confirmados después del alcance funcional.
- La fuente de hechos es el código y las migraciones locales inspeccionados; los documentos generales del proyecto contienen descripciones anteriores a la integración actual del catálogo persistido.
- No se encontraron un glosario de dominio ni ADRs en el repositorio inspeccionado. Se usa el vocabulario existente: producto, variante, línea, cantidad, existencias, reservas, subtotal y total.
- La validación expresa disponibilidad en el momento consultado; no constituye una reserva ni una garantía posterior.
- La selección permanece en este navegador. Perder o borrar su almacenamiento puede eliminarla; no existe respaldo de carrito por cuenta dentro del alcance.
- No se han ejecutado pruebas de la funcionalidad descrita porque aún no está implementada. Esta entrega solo añade documentación.
- Falta configurar el tracker y su vocabulario mediante `/setup-matt-pocock-skills`. Tras esa configuración, publicar esta especificación con la etiqueta `ready-for-agent`; no se ha creado ningún issue todavía.
