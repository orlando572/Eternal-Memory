# Guía del repositorio

## Estructura del proyecto

Este proyecto usa Next.js App Router. Las rutas están en `src/app/`: inicio (`/`), catálogo (`/catalogo`), ficha (`/catalogo/[id]`), acceso (`/login`) y registro (`/registro`). Los datos de muestra están en `src/features/products/data/productsData.ts`; las vistas y el carrito, en `src/features/`. Los componentes base de shadcn/ui están en `src/components/ui/`, Supabase en `src/lib/`, la autenticación en `src/services/authService.ts` y los recursos estáticos en `public/`. Coloca el código nuevo junto a su funcionalidad y usa `@/*` para importar desde `src/`.

## Comandos de desarrollo

- `npm ci` instala las dependencias del archivo de bloqueo.
- `npm run dev` inicia el servidor local.
- `npm run lint` revisa el código con ESLint.
- `npm run build` compila para producción; `npm run start` ejecuta esa versión.

No existe `npm test`. Antes de proponer cambios de código, ejecuta lint y build.

## Estilo de código

Usa TypeScript para código nuevo, sangría de dos espacios y el estilo de los archivos cercanos. Nombra componentes React en PascalCase (`ProductGallery.tsx`), rutas en minúsculas (`src/app/catalogo/`) y funciones en camelCase. Marca con `"use client"` los componentes que usan estado o API del navegador. ESLint se configura en `eslint.config.mjs`; no hay formateador independiente.

## Diseño y componentes

La identidad visual vigente es «Patio de luz». Consulta `DESIGN.md` para sus reglas y `src/app/globals.css` para los valores implementados antes de cambiar una pantalla. Para nuevas interfaces, usa shadcn/ui como base de componentes y, cuando esté disponible, Impeccable para orientar y revisar el diseño. shadcn/ui define la implementación y el comportamiento; Impeccable guía la presentación visual. Ubica las personalizaciones propias en `src/features/` o en componentes envoltorio, sin sobrescribir componentes generados innecesariamente. Antes de ejecutar comandos de shadcn que modifiquen `components.json`, `globals.css` o componentes existentes, revisa los cambios propuestos y después verifica el resultado con lint y build. Su instalación es independiente.

Usa las imágenes de prueba existentes para productos y señálalas como referenciales: varias no representan el producto nombrado. No generes nuevas imágenes de productos salvo que el usuario lo pida. Conserva la información de nombres, opciones y precios del catálogo local sin convertirla en una promesa de inventario o entrega.

## Estado funcional

El catálogo filtra por categoría y cada ficha permite elegir variante y cantidad. El carrito se guarda en `localStorage` de este navegador; no se sincroniza con la cuenta. El subtotal es referencial y no hay compra en línea ni checkout implementados. Acceso y registro usan Supabase Auth cuando se configuran las variables de entorno; una compilación con valores de ejemplo no verifica que la autenticación funcione.

## Pruebas

Aún no hay framework de pruebas, pruebas automatizadas ni umbral de cobertura. Si una tarea autorizada requiere pruebas, colócalas junto a la funcionalidad, usa nombres como `ProductGallery.test.tsx` y añade el comando a `package.json`. Informa solo verificaciones realmente ejecutadas.

## Commits y pull requests

Usa mensajes de commit breves y generales en español, sin dos puntos ni prefijos técnicos, por ejemplo `Actualización de la documentación del proyecto`. En cada pull request explica el cambio, su verificación y el issue relacionado. Incluye capturas si cambia la interfaz y confirma la rama de destino.

## Configuración y alcance

Define `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en un `.env` local cuando necesites Supabase. No subas credenciales; Git ignora `.env*`. Distingue `PRODUCT.md` como contexto de producto y `DESIGN.md` como guía visual; comprueba las capacidades reales en el código si esos documentos difieren de él. `GESTION_PROYECTO.md` es un plan, no prueba de implementación. Implementa solo tareas solicitadas expresamente.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
