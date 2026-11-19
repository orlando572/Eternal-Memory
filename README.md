# Eternal Memory 🕊️

Plataforma de comercio electrónico diseñada para la venta y gestión de productos funerarios (ataúdes, urnas, arreglos florales y relicarios).
---

## 🛠️ Stack Tecnológico

- **Framework principal:** [Next.js](https://nextjs.org/)
- **Biblioteca de interfaz:** [React](https://react.dev/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) y [shadcn/ui](https://ui.shadcn.com/)
- **Base de datos, autenticación y almacenamiento:** [Supabase](https://supabase.com/)
- **Integración continua:** GitHub Actions

---

## ✨ Características principales

- **Catálogo:** navegación por categorías, búsqueda y paginación con datos de Supabase.
- **Ficha de producto:** selección de variante y cantidad.
- **Carrito persistente:** se guarda en el navegador y valida precios y existencias en el servidor.
- **Autenticación y perfiles:** registro, inicio de sesión, recuperación de contraseña y perfil del cliente.
- **Checkout:** datos de entrega, personalización con grabado y creación de pedidos con reserva.
- **Administración:** gestión de productos, variantes, imagen de portada y ajustes de grabado.

### En desarrollo

- Pago de prueba en línea, historial de pedidos del cliente y panel de pedidos del administrador.
- Planificación detallada en [`docs/planificacion/`](docs/planificacion/).

## Comandos principales

- `npm ci`: instala las dependencias.
- `npm run dev`: inicia el servidor de desarrollo.
- `npm run lint`: revisa el código con ESLint.
- `npm run typecheck`: comprueba TypeScript.
- `npm run build`: compila la aplicación para producción.
- `npm run start`: ejecuta la versión compilada.

## Documentación

| Carpeta | Contenido |
| --- | --- |
| [`docs/diagramas/`](docs/diagramas/) | Arquitectura general y diagramas de clases |
| [`docs/planificacion/`](docs/planificacion/) | Gestión del proyecto, mejoras de la tienda y Avance 3 |
| [`docs/specs/`](docs/specs/) | Especificaciones funcionales |
| [`docs/recursos/`](docs/recursos/) | Material de apoyo de los recursos visuales |
| [`supabase/`](supabase/) | Migraciones y guía de la base de datos |
| `DESIGN.md` · `PRODUCT.md` | Guía visual y contexto de producto |
