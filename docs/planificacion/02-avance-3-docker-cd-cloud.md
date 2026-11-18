# Planificación — Avance 3: Docker, CD y nube (Parte 1)

> Se ejecuta **después** de las mejoras de la tienda (`01-mejoras-tienda.md`).
>
> ⚠️ **Fecha límite del curso:** jueves 19/11/2026, 08:45, vía UTP+CLASS (un solo
> intento, lo entrega un integrante). Si la tienda no está lista a tiempo, este
> plan debe adelantarse: es lo que se evalúa en el Avance 3.
>
> Fuente: «Avance de Proyecto Final 03 (Semana 15)», Herramientas de Desarrollo,
> UTP. Equipo de dos: Orlando (líder) y Evelyn.

## 1. Qué pide el profesor y estado actual

| Exigencia | Estado | Evidencia o falta |
| --- | --- | --- |
| A. Dockerfile optimizado | ❌ | No existe |
| A. `docker-compose.yml` app + BD | ❌ | No existe |
| A. Variables de entorno (`.env`) | ⚠️ | `.env.local` ignorado por Git; falta `.env.example` |
| A. Script de datos de prueba | ⚠️ | Las migraciones de `supabase/migrations/` cargan 48 productos; falta usarlas en el contenedor |
| B. Imagen construida y publicada al hacer merge a `main` | ❌ | `ci.yml` solo se ejecuta en `pull_request` |
| B. Registry (Docker Hub o GHCR) | ❌ | — |
| C. Servidor cloud preparado | ⚠️ | BD y Auth ya en la nube (Supabase); falta alojar la app |
| D. Ramas, PRs y conflictos | ✅ | GitFlow `main`/`develop`/`feature`/`bugfix`/`docs`, 27 PRs |
| D. Colaboración, actividades e incidencias | ✅ | Issues TSK con responsables, etiquetas, milestone y Projects |
| D. CI | ✅ | GitHub Actions: lint, pruebas, typecheck, build y validación TSK |

## 2. Problemas a corregir antes de entregar

1. **`develop` va 35 commits por delante de `main`.** El último merge a `main` es del 20/10. Hace falta un PR de release `develop → main` (dispara el CD y es evidencia del flujo).
2. ~~`/docs/` en `.gitignore`~~ y ~~README que prometía Stripe~~: resueltos en TSK-30 (rama `chore/tsk-30-orden-documentacion`), pendiente de PR hacia `develop`.
3. **`main` sin protección.** Activar en *Settings → Branches* «Require a pull request» y «Require status checks: quality-and-build».
4. **`cloudflared.deb` (20 MB)** en la raíz: no subirlo.

## 3. Decisiones técnicas

### 3.1 Imagen de la aplicación
- `next.config.ts` → `output: "standalone"`.
- Dockerfile *multi-stage* sobre `node:24-alpine` (la misma versión que el CI):
  1. `deps`: `npm ci` con caché.
  2. `builder`: `npm run build`, con `ARG NEXT_PUBLIC_SUPABASE_URL` y `ARG NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  3. `runner`: solo `.next/standalone`, `.next/static` y `public`; usuario sin privilegios; `EXPOSE 3000`; `HEALTHCHECK`.
- `.dockerignore`: `node_modules`, `.next`, `.next-cart-test`, `test-results`, `.git`, `.env*`, `*.deb`, `docs`, `supabase/.temp`.

> **Clave:** Next.js incrusta las variables `NEXT_PUBLIC_*` **al compilar**. En
> el CD deben pasarse como `build-args` desde *Variables* de GitHub. Si no, la
> imagen publicada no podrá conectarse a Supabase. La anon key es pública, pero
> `SUPABASE_SECRET_KEY` **nunca** va en la imagen: solo en el entorno del
> servidor cloud.

### 3.2 Base de datos en `docker-compose`
La app usa Supabase (API + Auth) y no se conecta a Postgres directamente. Para cumplir el requisito sin reescribir la arquitectura:

- Servicio `db` con la imagen `supabase/postgres`, que trae los esquemas `auth` y `storage` de los que dependen las migraciones.
- Las migraciones de `supabase/migrations/` y un seed adicional se montan en `/docker-entrypoint-initdb.d/` y se aplican al primer arranque. Comprobar el orden y que no fallen.
- Volumen persistente `db-data`, `healthcheck` con `pg_isready` y `depends_on: condition: service_healthy` para la app.
- Explicación en el informe: **Postgres local en contenedor para desarrollo y pruebas del esquema; Supabase gestionado en producción.**
- Alternativa más completa (si sobra tiempo): `npx supabase start`, que levanta el stack completo de Supabase en Docker.

### 3.3 Registry y nube
- **Registry:** GitHub Container Registry (`ghcr.io/orlando572/eternal-memory`). Usa el `GITHUB_TOKEN`, sin cuentas extra, y queda visible en el repo.
- **Nube:** **Render**, Web Service con «Deploy an existing image» desde GHCR, en plan gratuito.
  - Variables en Render: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SECRET_KEY`.
  - *Deploy Hook* de Render guardado como secret `RENDER_DEPLOY_HOOK_URL` en GitHub.
  - En Supabase → Auth → URL Configuration: añadir la URL de Render (`https://<servicio>.onrender.com`) y `/auth/callback`.
  - Limitación: el plan gratuito se suspende tras inactividad (unos 50 s en despertar). Abrir la app antes de exponer.
- Alternativas válidas según el PDF: Railway (sin plan gratuito permanente), Azure for Students y AWS EC2 (más configuración).

## 4. Tareas y reparto

Con dos personas, Evelyn asume también la tarea del «Alumno 3».

### TSK-43 · Dockerfile optimizado — Orlando (Alumno 1)
**Rama:** `feature/tsk-43-dockerfile`
- [ ] `output: "standalone"` en `next.config.ts`.
- [ ] `Dockerfile` multi-stage y `.dockerignore`.
- [ ] Verificar: `docker build` y `docker run -p 3000:3000` abre la tienda. Anotar el tamaño final de la imagen (`docker images`) para el informe.

### TSK-44 · Servicio de BD y variables de entorno — Evelyn (Alumno 2)
**Rama:** `feature/tsk-44-docker-compose`
- [ ] `docker-compose.yml` con `app` y `db`, red, volumen, healthcheck y `depends_on`.
- [ ] `.env.example` con todas las variables y valores de ejemplo (sin secretos reales).
- [ ] Verificar: `docker compose up -d --build` levanta ambos servicios y `docker compose ps` los muestra *healthy*.

### TSK-45 · Script de datos de prueba — Evelyn (Alumno 3)
**Rama:** `feature/tsk-45-seeders`
- [ ] `docker/db/seed.sql`: datos que no estén en las migraciones (un usuario de prueba con rol admin, tarifas de envío activas y algunos productos `published`).
- [ ] Montaje en `docker-entrypoint-initdb.d` después de las migraciones (prefijo numérico para el orden).
- [ ] Verificar: `docker compose exec db psql -U postgres -c "select count(*) from public.products;"`.

### TSK-46 · Pipeline de CD hacia GHCR — Orlando
**Rama:** `feature/tsk-46-cd`
- [ ] `.github/workflows/cd.yml` con disparador `push` a `main` (incluye merges) y `workflow_dispatch`.
- [ ] `permissions: packages: write, contents: read`.
- [ ] Pasos: `docker/login-action` (GHCR) → `docker/metadata-action` (tags `latest` y `sha-<commit>`) → `docker/build-push-action` con los `build-args` → `curl` al `RENDER_DEPLOY_HOOK_URL`.
- [ ] Hacer público el paquete en GHCR para que el profesor lo vea.

### TSK-47 · Infraestructura en Render — Orlando
- [ ] Crear el Web Service apuntando a `ghcr.io/orlando572/eternal-memory:latest`.
- [ ] Configurar las variables de entorno y el health check path `/`.
- [ ] Ajustar las URLs permitidas en Supabase Auth.
- [ ] Capturas: panel de Render, logs del deploy y la tienda funcionando en la URL pública.

### TSK-48 · Release y evidencias — Orlando y Evelyn
- [x] Versionar `docs/` con los diagramas (hecho en TSK-30).
- [ ] Protección de la rama `main`.
- [ ] PR `develop → main` → CI en verde → merge → CD publica la imagen → Render despliega.
- [ ] Tag `v0.3.0` y *Release* de GitHub que describa el avance.

## 5. Informe de Avance 3 (estructura)

1. **Carátula:** curso, docente, integrantes y rol de cada uno (Orlando líder).
2. **Descripción del proyecto:** Eternal Memory, e-commerce de productos funerarios.
3. **Ruta del ambiente de versionamiento:** `https://github.com/orlando572/Eternal-Memory`, estrategia de ramas (diagrama GitFlow), convención de commits y PRs con `TSK-xx`, y ejemplos de conflictos resueltos (commits «Actualización desde develop»).
4. **Herramienta de colaboración:** GitHub (PRs con revisión cruzada y comentarios) y el canal de comunicación del equipo.
5. **Herramienta de actividades:** GitHub Projects, tablero Kanban (captura con columnas y tarjetas TSK).
6. **Herramienta de gestión de proyectos:** GitHub Projects, milestones y `docs/planificacion/gestion-proyecto.md` (reparto y prioridades).
7. **Herramientas de gestión de incidencias:** GitHub Issues, etiquetas `bug`/`Frontend`/`Backend`/`accessibility`/`CI` y ciclo issue → rama → PR → cierre (ejemplos TSK-23 a TSK-28).
8. **Integración continua:** `ci.yml` paso a paso, capturas de ejecuciones exitosas y de las fallidas corregidas.
9. **Contenerización:** Dockerfile explicado por etapas, `docker-compose.yml`, `.env.example`, seeders y tamaño de la imagen.
10. **Entrega continua:** `cd.yml`, captura del paquete en GHCR con sus tags.
11. **Plataformas cloud:** Supabase (BD, Auth y Storage), GHCR y Render, con un diagrama de arquitectura de despliegue.
12. **Distribución del trabajo por alumno:** tabla con TSK-43 a TSK-48.
13. **Diagramas:** clases/ER (`docs/diagramas/diagrama-clases-general.png`) y arquitectura.
14. **Conclusiones y siguientes pasos.**

## 6. Checklist final antes de subir a UTP+CLASS

- [ ] `docker compose up -d --build` funciona en una máquina limpia.
- [ ] La imagen aparece en GHCR con `latest` y `sha-…`.
- [ ] La última ejecución de CD en Actions está en verde.
- [ ] La URL de Render abre la tienda y permite iniciar sesión.
- [ ] `main` contiene todo lo de `develop`.
- [ ] Diagramas y planes visibles en GitHub.
- [ ] Informe en PDF con todas las capturas y enlaces.
