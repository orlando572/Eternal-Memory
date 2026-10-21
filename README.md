# Eternal Memory 🕊️

Plataforma de comercio electrónico diseñada para la venta y gestión de productos funerarios (ataúdes, urnas, arreglos florales, recordatorios y lápidas conmemorativas).
---

## 🛠️ Stack Tecnológico

- **Framework principal:** [Next.js](https://nextjs.org/)
- **Biblioteca de interfaz:** [React](https://react.dev/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Base de datos:** [Supabase](https://supabase.com/)
- **Pasarela de pagos:** [Stripe](https://stripe.com/)

---

## ✨ Características principales

- **Catálogo interactivo:** Navegación por categorías (féretros, urnas, flores, accesorios, etc).
- **Carrito de compras persistente:** Mantenimiento de productos seleccionados localmente.
- **Autenticación y perfiles:** Registro, inicio de sesión y gestión de clientes.
- **Formularios de checkout:** Captura y validación de datos de entrega y personalización.
- **Simulación de pagos:** Flujo de pago seguro.
- **Almacenamiento multimedia:** Carga y gestión de imágenes de catálogo.

## Carrito y verificación

El carrito guarda la selección en `localStorage` de este navegador y funciona sin iniciar sesión. El servidor consulta el catálogo público persistido para validar productos, variantes, cantidades y existencias, y recalcula los importes en soles. Las líneas inválidas se conservan con un aviso y quedan fuera del total. Agregar o validar artículos no reserva unidades ni crea pedidos.

La selección se revalida al recuperarla, abrir el panel, cambiar su contenido y volver a la pestaña. Si falla el servidor, se ocultan los importes hasta reintentar. El total incluye solo artículos, sin envío ni cargos adicionales; no hay checkout conectado al carrito.

- `npm run typecheck`: comprueba TypeScript.
- `npm run test:roles`: ejecuta las pruebas existentes de acceso y navegación.
- `npm run test:cart`: ejecuta pruebas HTTP y de navegador con Playwright.
- `npm test`: ejecuta ambas suites.
- `npm run lint` y `npm run build`: revisan el código y la compilación de producción.

Las pruebas del carrito requieren Node.js 22.18 o superior para ejecutar la fixture TypeScript. Para las pruebas de navegador, instala Chromium con `npx playwright install chromium`. También puedes usar un ejecutable instalado mediante `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/ruta/al/navegador npm run test:cart`.

Las pruebas del carrito inician una aplicación aislada en el puerto 3100 y un servidor de prueba de la API de datos en el puerto 3101. Este último usa un archivo temporal de catálogo controlado por los tests y rechaza mutaciones; no se conecta al proyecto Supabase real. El servidor habitual de desarrollo y la configuración local de Supabase permanecen independientes. Para comprobar políticas RLS y el despliegue real hace falta una verificación adicional en un entorno Supabase de prueba.
