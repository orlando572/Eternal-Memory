# Guía del repositorio

## Estructura del proyecto y organización de módulos

Este proyecto es una tienda con Next.js App Router. Las rutas, los layouts y los estilos globales están en `src/app/`; el código de productos, catálogo y carrito está en `src/features/`. La configuración de Supabase está en `src/lib/`, las llamadas de autenticación en `src/services/` y los recursos estáticos en `public/`. Los productos actuales se definen en `src/features/products/data/productsData.ts`. Coloca el código nuevo junto a su funcionalidad y usa el alias `@/*` para importar desde `src/`.

## Comandos de desarrollo y compilación

- `npm ci` instala las dependencias indicadas en el archivo de bloqueo.
- `npm run dev` inicia el servidor local de Next.js.
- `npm run lint` revisa el código con ESLint y las reglas de Next.js.
- `npm run build` genera la versión de producción; `npm run start` la ejecuta.

No existe `npm test`. Antes de proponer cambios, ejecuta lint y build.

## Estilo de código y nombres

Usa TypeScript para el código nuevo, sangría de dos espacios y el estilo de los archivos cercanos. Nombra los componentes React en PascalCase, por ejemplo `ProductGallery.tsx`; las carpetas de rutas, en minúsculas, como `src/app/catalogo/`; y las funciones y variables, en camelCase. Marca con `"use client"` los componentes que usan estado o API del navegador. ESLint se configura en `eslint.config.mjs`; no hay un formateador independiente.

## Pruebas

El repositorio todavía no tiene framework de pruebas, pruebas automatizadas ni umbral de cobertura. Si una tarea autorizada requiere pruebas, colócalas junto a la funcionalidad correspondiente, usa nombres como `ProductGallery.test.tsx` y documenta el comando para ejecutarlas en `package.json`. No informes que las pruebas o la integración continua pasaron si no se ejecutaron.

## Commits y pull requests

El historial contiene mensajes descriptivos y breves en español. Usa títulos de commit normales y generales, sin dos puntos ni prefijos técnicos, por ejemplo `Actualización de la documentación del proyecto`. Mantén cada pull request enfocado y explica el cambio, cómo se verificó y qué issue relacionado tiene. Incluye capturas para cambios visibles en la interfaz. Confirma la rama de destino antes de abrir un pull request.

## Configuración y alcance

Si necesitas Supabase, define `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en un archivo `.env` local. No subas credenciales; Git ignora los archivos `.env*`. `GESTION_PROYECTO.md` es un plan: verifica el código antes de afirmar que una función está implementada. Implementa solo el trabajo solicitado expresamente para la tarea actual.
