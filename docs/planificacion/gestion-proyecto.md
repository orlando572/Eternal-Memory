# Gestión del proyecto — Eternal Memory

**Fecha de corte:** 20 de octubre de 2026  
**Equipo:** Orlando (líder y desarrollador) y Evelyn (desarrolladora)  
**Método:** Kanban, sin Scrum  
**Repositorio:** https://github.com/orlando572/Eternal-Memory

## 1. Punto de partida comprobado

El repositorio está en `main` (`105d9a9`). Hay ramas remotas `feature/*` históricas, pero no existe `develop`. El trabajo anterior se integró por pull requests a `main`. No hay workflow de GitHub Actions, pruebas ni esquema de base de datos versionado. El catálogo es estático (`src/features/products/data/productsData.ts`), el carrito se guarda en `localStorage`, el registro llama a Supabase Auth, el login es simulado y el botón de pago solo muestra una alerta. El README menciona Stripe, checkout, perfiles y almacenamiento multimedia, pero esas funciones aún no están implementadas.

**Objetivo de este avance:** una tienda demostrable con catálogo administrable, autenticación, carrito, checkout, pedidos, pago de prueba y operación básica. La disponibilidad real de productos, tiempos de entrega y atención 24/7 deberán corresponder a procesos reales antes de ofrecerse a clientes.

## 2. GitHub Projects: tablero de trabajo

### Configuración recomendada

Crear un **Project nuevo en blanco** dentro de la cuenta propietaria del repositorio (`orlando572`), con vista **Board**. La plantilla genérica de Kanban también sirve, pero el proyecto en blanco permite configurar exactamente las cuatro columnas exigidas sin arrastrar campos o estados innecesarios. Dar acceso de edición a Evelyn y vincular el Project al repositorio para que sea visible desde este. Usar **Issues reales**, no solo draft items: cada tarea tendrá número, responsable, PR y trazabilidad. [Crear y configurar Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/quickstart-for-projects), [añadir Issues](https://docs.github.com/en/issues/planning-and-tracking-with-projects/managing-items-in-your-project/adding-items-to-your-project).

**Campos:** `Status` (obligatorio), `Assignees`, `Priority` (P0/P1/P2), `Area` (Frontend/Backend/Full stack/CI), `Task ID` (texto TSK-01, etc.). Vista principal agrupada por `Status`, mostrando responsable, prioridad y área. Vista secundaria tipo tabla, filtrable por persona; no hace falta crear iteraciones ni sprints.

| Columna `Status` | Regla de entrada y salida |
| --- | --- |
| **To Do** | Issue definido, con criterios de aceptación y responsable; aún no iniciado. |
| **In Progress** | Rama de tarea creada desde `develop`; para un `hotfix/*`, desde `main`. Máximo una tarea principal por persona. |
| **In Review** | PR abierto hacia la rama que corresponda, revisión cruzada solicitada y CI ejecutándose o aprobado. |
| **Done** | PR aprobado y CI verde; tarea integrada en `develop`, o versión/corrección integrada en `main` y sincronizada con `develop`. Cerrar manualmente el Issue. |

Configurar automatizaciones: nuevo Issue añadido → `To Do`; Issue cerrado → `Done`; auto-add de Issues del repositorio si se desea. Mover a `In Progress` e `In Review` manualmente para que el estado refleje trabajo real. Evitar incluir PR como tarjeta independiente si ya existe su Issue, para no contar dos veces la misma tarea. Las automatizaciones integradas de Projects permiten establecer el estado al cerrar Issues y añadirlos automáticamente. [Documentación](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-built-in-automations).

**Cómo crearlo:** perfil de Orlando → **Projects** → **New project** → **Blank project** → nombrar `Eternal Memory — Ecommerce` → **Board** → editar el campo `Status` con las opciones exactas `To Do`, `In Progress`, `In Review`, `Done` → añadir campos y compartir con Evelyn → crear los Issues de la sección 3 en el repositorio y agregarlos al Project. La vista Board usa el campo elegido para crear columnas. [Documentación](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/changing-the-layout-of-a-view).

**Estado inicial honesto:** los 20 Issues de abajo se crean abiertos en `To Do`; al comenzar el trabajo, mover solo las tareas realmente iniciadas. Esto cumple el mínimo de 9 tareas activas y deja 10 asignadas a cada integrante, con trabajo de frontend y backend para ambos.

### Convención de cada Issue y trabajo por especificaciones

Cada tarjeta será un Issue de una capacidad concreta y verificable. Su título incluye el código de tarea, por ejemplo: [TSK-01] Acceso y registro: interfaz. El número del Issue lo asigna GitHub; el código TSK se usa en el título del Issue, el PR y los commits. El nombre de la rama describe brevemente su propósito, sin incluir el código TSK.

El flujo es **especificación → revisión del alcance → implementación solicitada por Orlando → verificación**. Cuando una capacidad necesita frontend y backend, se crean Issues separados y vinculados por dependencias. Esto sigue la idea de [Spec-Driven Development de GitHub Spec Kit](https://github.com/github/spec-kit/blob/main/README.md), sin requerir esa herramienta. La presencia de una ficha en el plan no autoriza implementarla.

**Rama propuesta:** cada Issue sugiere un nombre corto y descriptivo, por ejemplo, feature/acceso-registro. Se crea desde develop solo cuando la tarea empieza. Si el nombre debe cambiar, se actualiza el Issue antes de crear la rama. Las ramas release y hotfix se crean según la sección 4.

Al crear cada Issue, copiar título, descripción, criterios, responsable, dependencia, rama y etiqueta de área; agregarlo al Project en To Do. Crear y aplicar las etiquetas exactas `area:frontend`, `area:backend` y `area:ci` indicadas en cada ficha. Si una tarea futura abarca realmente ambas partes, puede llevar `area:frontend` y `area:backend`; las tareas actuales están separadas por resultado. Las etiquetas de prioridad `priority:P0`, `priority:P1` y `priority:P2` son opcionales si ya se usa el campo Priority del Project.

## 3. Especificaciones de trabajo: 20 Issues, 10 por persona

Estas son propuestas de Issues; todavía no están creados en GitHub. Las tareas se separan por el resultado que entregan. Frontend tiene 10, backend 9 y CI/DevOps 1.

### Frontend

| Código | Especificación | Responsable | Prioridad | Etiqueta | Rama propuesta | Depende de |
| --- | --- | --- | --- | --- | --- | --- |
| TSK-01 | Acceso y registro: interfaz | Evelyn | P0 | area:frontend | feature/acceso-registro | TSK-02 |
| TSK-04 | Administración de productos | Orlando | P1 | area:frontend | feature/admin-productos | TSK-03 |
| TSK-06 | Catálogo y ficha de producto | Evelyn | P0 | area:frontend | feature/catalogo | TSK-05 |
| TSK-07 | Carrito de compras | Orlando | P0 | area:frontend | feature/carrito | TSK-06 |
| TSK-09 | Formulario de checkout | Evelyn | P0 | area:frontend | feature/checkout | TSK-07, TSK-10 |
| TSK-12 | Resultado del pago | Orlando | P0 | area:frontend | feature/resultado-pago | TSK-11 |
| TSK-14 | Historial y seguimiento | Evelyn | P1 | area:frontend | feature/historial-pedidos | TSK-13 |
| TSK-16 | Panel de pedidos | Orlando | P1 | area:frontend | feature/panel-pedidos | TSK-15 |
| TSK-19 | Gestión visual de imágenes | Evelyn | P1 | area:frontend | feature/admin-imagenes | TSK-04, TSK-18 |
| TSK-20 | Páginas comerciales y contacto | Orlando | P1 | area:frontend | feature/paginas-contacto | — |

#### TSK-01 — Acceso y registro: interfaz

**Responsable:** Evelyn. **Rama:** feature/acceso-registro. **Etiqueta:** area:frontend.

**Descripción:** Formularios de registro, login, recuperación y perfil con mensajes claros.

## Criterios de aceptación
- [ ] El usuario puede introducir correo y contraseña en los formularios de registro e inicio de sesión.
- [ ] Los formularios validan los datos y muestran errores claros de registro, acceso y recuperación.
- [ ] La interfaz refleja la sesión real y permite acceder al perfil y cerrar sesión sin mostrar contraseñas.

#### TSK-04 — Administración de productos

**Responsable:** Orlando. **Rama:** feature/admin-productos. **Etiqueta:** area:frontend.

**Descripción:** Interfaz para crear y editar productos, variantes, precios y publicación.

## Criterios de aceptación
- [ ] Un administrador puede crear y editar productos, variantes, precios y estado de publicación desde la interfaz.
- [ ] Los cambios válidos se guardan y se reflejan al volver a consultar el producto.
- [ ] La interfaz muestra los errores de validación y los permisos insuficientes.

#### TSK-06 — Catálogo y ficha de producto

**Responsable:** Evelyn. **Rama:** feature/catalogo. **Etiqueta:** area:frontend.

**Descripción:** Mostrar catálogo, filtros, búsqueda y ficha con variantes y disponibilidad.

## Criterios de aceptación
- [ ] El catálogo permite buscar y filtrar productos publicados.
- [ ] La ficha muestra variantes y disponibilidad obtenidas de datos reales.
- [ ] La navegación incluye estados de carga, resultados vacíos y errores.

#### TSK-07 — Carrito de compras

**Responsable:** Orlando. **Rama:** feature/carrito. **Etiqueta:** area:frontend.

**Descripción:** Agregar variantes, ajustar cantidades y mostrar subtotales y total.

## Criterios de aceptación
- [ ] El cliente puede agregar variantes, cambiar cantidades y eliminar líneas del carrito.
- [ ] Los subtotales y el total visibles corresponden a las líneas y cantidades actuales.
- [ ] El carrito conserva su contenido al recargar la página.

#### TSK-09 — Formulario de checkout

**Responsable:** Evelyn. **Rama:** feature/checkout. **Etiqueta:** area:frontend.

**Descripción:** Capturar contacto, entrega y personalización y mostrar el total confirmado.

## Criterios de aceptación
- [ ] El cliente puede introducir contacto, entrega y personalización antes de continuar al pago.
- [ ] El formulario indica los datos inválidos y permite corregirlos.
- [ ] El cliente puede revisar el resumen y el total confirmado antes de continuar.

#### TSK-12 — Resultado del pago

**Responsable:** Orlando. **Rama:** feature/resultado-pago. **Etiqueta:** area:frontend.

**Descripción:** Mostrar resultado y siguiente paso del pedido tras pagar o cancelar.

## Criterios de aceptación
- [ ] La pantalla muestra el resultado y los siguientes pasos después de pagar o cancelar.
- [ ] El estado mostrado se consulta desde el pedido real.
- [ ] Una URL de éxito por sí sola no muestra el pedido como pagado.

#### TSK-14 — Historial y seguimiento

**Responsable:** Evelyn. **Rama:** feature/historial-pedidos. **Etiqueta:** area:frontend.

**Descripción:** Mostrar pedidos, detalles y estados de pago y atención.

## Criterios de aceptación
- [ ] El cliente puede navegar desde su historial hasta el detalle de cada pedido.
- [ ] La interfaz muestra estados de pago y atención obtenidos de datos reales.
- [ ] Una cuenta sin pedidos ve una explicación clara.

#### TSK-16 — Panel de pedidos

**Responsable:** Orlando. **Rama:** feature/panel-pedidos. **Etiqueta:** area:frontend.

**Descripción:** Permitir buscar, filtrar y atender pedidos en una vista interna.

## Criterios de aceptación
- [ ] El administrador puede buscar y filtrar pedidos en la vista interna.
- [ ] Los cambios permitidos se guardan y la vista muestra los datos actualizados.
- [ ] La interfaz informa los errores y los permisos insuficientes.

#### TSK-19 — Gestión visual de imágenes

**Responsable:** Evelyn. **Rama:** feature/admin-imagenes. **Etiqueta:** area:frontend.

**Descripción:** Subir, previsualizar, ordenar y reemplazar imágenes de producto.

## Criterios de aceptación
- [ ] El administrador puede subir, previsualizar, ordenar y reemplazar imágenes de producto.
- [ ] La ficha del producto refleja las imágenes guardadas.
- [ ] Los errores de subida se explican sin perder la imagen anterior.

#### TSK-20 — Páginas comerciales y contacto

**Responsable:** Orlando. **Rama:** feature/paginas-contacto. **Etiqueta:** area:frontend.

**Descripción:** Completar servicios, contacto, términos y privacidad con vías reales de consulta.

## Criterios de aceptación
- [ ] Las páginas de servicios, contacto, términos y privacidad están completas y sus enlaces funcionan.
- [ ] Los canales de contacto permiten una consulta real.
- [ ] La información comercial y legal recibe revisión humana antes de publicarse.

### Backend

Las nueve tareas `area:backend` requieren implementación funcional de extremo a extremo dentro de su alcance: persistencia real en Supabase o integración real con el servicio indicado, validación y permisos en el servidor, manejo de errores y verificación del resultado. Una tabla, un endpoint vacío, datos simulados o una respuesta fija no cumplen los criterios de aceptación. La interfaz correspondiente se conecta mediante los Issues de frontend dependientes; cuando una tarea backend no tiene interfaz propia, se verifica con una prueba o solicitud reproducible.

| Código | Especificación | Responsable | Prioridad | Etiqueta | Rama propuesta | Depende de |
| --- | --- | --- | --- | --- | --- | --- |
| TSK-02 | Identidad, sesión y perfil | Evelyn | P0 | area:backend | feature/identidad-sesion | — |
| TSK-03 | Modelo de productos y stock | Orlando | P0 | area:backend | feature/modelo-productos | — |
| TSK-05 | Consulta del catálogo | Evelyn | P0 | area:backend | feature/catalogo-api | TSK-03 |
| TSK-08 | Validación de precios y stock | Orlando | P0 | area:backend | feature/precios-stock | TSK-03 |
| TSK-10 | Creación de pedidos | Evelyn | P0 | area:backend | feature/crear-pedidos | TSK-02, TSK-08 |
| TSK-11 | Pago de prueba con Stripe | Orlando | P0 | area:backend | feature/pagos | TSK-10 |
| TSK-13 | Consulta de pedidos del cliente | Evelyn | P1 | area:backend | feature/consulta-pedidos | TSK-02, TSK-10 |
| TSK-15 | Operación y estados de pedidos | Orlando | P1 | area:backend | feature/estados-pedido | TSK-10 |
| TSK-18 | Almacenamiento de imágenes | Orlando | P1 | area:backend | feature/almacenamiento-imagenes | TSK-03 |

#### TSK-02 — Identidad, sesión y perfil

**Responsable:** Evelyn. **Rama:** feature/identidad-sesion. **Etiqueta:** area:backend.

**Descripción:** Supabase gestiona registro, login, recuperación, cierre de sesión y datos del perfil.

## Criterios de aceptación
- [ ] El registro, inicio de sesión, recuperación de contraseña y cierre de sesión funcionan con Supabase Auth.
- [ ] La sesión se valida en el servidor y los cambios del perfil persisten.
- [ ] Cada cliente solo puede leer o modificar sus propios datos y los errores no revelan información sensible.

#### TSK-03 — Modelo de productos y stock

**Responsable:** Orlando. **Rama:** feature/modelo-productos. **Etiqueta:** area:backend.

**Descripción:** Persistir productos, categorías, variantes, precios numéricos y existencias.

## Criterios de aceptación
- [ ] Las migraciones crean productos, categorías, variantes, precios numéricos y existencias persistentes.
- [ ] El servidor rechaza relaciones o valores inválidos.
- [ ] Solo los administradores pueden crear, editar o retirar productos; el catálogo público solo recibe los publicados.

#### TSK-05 — Consulta del catálogo

**Responsable:** Evelyn. **Rama:** feature/catalogo-api. **Etiqueta:** area:backend.

**Descripción:** Consultar productos publicados, categorías y fichas por identificador.

## Criterios de aceptación
- [ ] Las consultas devuelven listado, filtros y ficha de producto desde la base de datos.
- [ ] Los filtros y la paginación producen resultados correctos.
- [ ] Los productos no publicados no aparecen y los identificadores inexistentes reciben una respuesta controlada.

#### TSK-08 — Validación de precios y stock

**Responsable:** Orlando. **Rama:** feature/precios-stock. **Etiqueta:** area:backend.

**Descripción:** El servidor verifica variantes, precio vigente y disponibilidad antes del pedido.

## Criterios de aceptación
- [ ] El servidor recalcula precios y totales desde los datos persistidos y verifica variantes y existencias vigentes.
- [ ] Se rechazan artículos inexistentes, cantidades inválidas y precios manipulados desde el navegador.
- [ ] La respuesta explica al cliente qué debe corregir en el carrito.

#### TSK-10 — Creación de pedidos

**Responsable:** Evelyn. **Rama:** feature/crear-pedidos. **Etiqueta:** area:backend.

**Descripción:** Crear pedido pendiente con líneas, importes verificados y entrega.

## Criterios de aceptación
- [ ] Un cliente autenticado puede crear un pedido pendiente con entrega, líneas e importes verificados por el servidor.
- [ ] El pedido y sus líneas se guardan juntos sin registros parciales.
- [ ] Un carrito vacío, datos inválidos o falta de stock impiden la creación del pedido.

#### TSK-11 — Pago de prueba con Stripe

**Responsable:** Orlando. **Rama:** feature/pagos. **Etiqueta:** area:backend.

**Descripción:** Crear la sesión de pago y procesar el webhook verificado.

## Criterios de aceptación
- [ ] Solo se crea una sesión de Stripe en modo de prueba para un pedido válido con importe verificado.
- [ ] El webhook verifica la firma y vincula el evento al pedido correcto.
- [ ] Solo un pago confirmado cambia el estado del pedido y un evento repetido no duplica la operación.
- [ ] Las cancelaciones y los fallos no marcan el pedido como pagado.

#### TSK-13 — Consulta de pedidos del cliente

**Responsable:** Evelyn. **Rama:** feature/consulta-pedidos. **Etiqueta:** area:backend.

**Descripción:** Consultar historial y detalle de pedidos de la cuenta.

## Criterios de aceptación
- [ ] El historial y el detalle muestran pedidos persistidos con estado, líneas e importes.
- [ ] Las consultas requieren una sesión válida.
- [ ] Una cuenta no puede consultar pedidos de otra persona aunque conozca su identificador.

#### TSK-15 — Operación y estados de pedidos

**Responsable:** Orlando. **Rama:** feature/estados-pedido. **Etiqueta:** area:backend.

**Descripción:** Autorizar cambios de estado y registrar responsable y fecha.

## Criterios de aceptación
- [ ] Solo los administradores pueden aplicar cambios de estado permitidos.
- [ ] Cada cambio registra quién lo realizó y cuándo; las transiciones inválidas se rechazan.
- [ ] El estado pagado depende únicamente de la confirmación verificada por Stripe.

#### TSK-18 — Almacenamiento de imágenes

**Responsable:** Orlando. **Rama:** feature/almacenamiento-imagenes. **Etiqueta:** area:backend.

**Descripción:** Guardar imágenes persistentes con límites y permisos de administrador.

## Criterios de aceptación
- [ ] Solo los administradores pueden subir o reemplazar imágenes válidas dentro de los límites definidos.
- [ ] El archivo queda en almacenamiento persistente y su referencia se vincula al producto.
- [ ] Una subida fallida devuelve un error controlado y conserva la imagen anterior.

### CI/DevOps

| Código | Especificación | Responsable | Prioridad | Etiqueta | Rama propuesta | Depende de |
| --- | --- | --- | --- | --- | --- | --- |
| TSK-17 | CI de pull requests | Evelyn | P0 | area:ci | feature/ci | — |

#### TSK-17 — CI de pull requests

**Responsable:** Evelyn. **Rama:** feature/ci. **Etiqueta:** area:ci.

**Descripción:** Ejecutar lint, tres pruebas, build y control de códigos TSK en cada PR.

## Criterios de aceptación
- [ ] El pipeline se ejecuta automáticamente al abrir un pull request.
- [ ] El pipeline ejecuta linter, al menos tres pruebas y build.
- [ ] Un pull request real muestra checks exitosos y se conserva el enlace y una captura del check verde.

**Reparto:** Evelyn tiene 5 tareas frontend, 4 backend y 1 de CI. Orlando tiene 5 frontend y 5 backend. Evelyn conserva login y registro. Cada Issue actual tiene su etiqueta de área explícita; las dependencias conectan las partes de una capacidad.

**Orden práctico:** iniciar TSK-17, TSK-02 y TSK-03; después avanzar por las dependencias. El tablero refleja trabajo real, sin sprints ni ceremonias de Scrum.

## 4. Estrategia de ramas y commits: Git Flow completo

### Estado actual y transición

`main` es la única rama de integración actual. Las ramas `feature/*` remotas ya integradas son historial; no reutilizarlas para nuevas tareas. Crear `develop` desde el `main` actual, **sin reescribir ni renombrar el historial**:

```bash
git fetch origin
git switch main
git pull --ff-only origin main
git switch -c develop
git push -u origin develop
```

### Función de cada rama

| Rama | Origen y destino | Cuándo se crea |
| --- | --- | --- |
| `main` | Contiene únicamente versiones publicadas y estables. Cada publicación recibe una etiqueta de versión, por ejemplo `v0.2.0`. | Permanente. |
| `develop` | Integra el trabajo de la siguiente versión; nace del `main` actual. | Permanente, al adoptar Git Flow. |
| `feature/tema-breve` | Nace de `develop` y vuelve mediante PR a `develop`. | Para cada funcionalidad o tarea de producto. |
| `release/vX.Y.Z` | Nace de `develop`; se integra mediante PR en `main` **y** de vuelta en `develop`. | **Solo cuando se decide preparar una versión concreta** y se congela su alcance. No mantener una rama `release/*` vacía o permanente. |
| `hotfix/tema-breve` | Nace de `main`; se integra mediante PR en `main` y de vuelta en `develop` (o en la `release/*` abierta, si corresponde). | Solo ante un defecto urgente de una versión ya publicada. |

Este es **Git Flow completo**: contempla `main`, `develop`, `feature/*`, `release/*` y `hotfix/*`. La creación tardía de `release/*` es precisamente su uso normal: una rama de estabilización para una versión definida, no una rama permanente. [Descripción del flujo y las ramas de release/hotfix](https://www.atlassian.com/es/git/tutorials/comparing-workflows/gitflow-workflow).

**Flujo diario:** abrir un Issue con código `TSK-xx` → crear `feature/tema-breve` desde `develop` → commits con ese código → PR a `develop` → revisión cruzada y CI verde → integrar y cerrar Issue. Las correcciones ordinarias del avance siguen este mismo flujo desde `develop`; reservar `hotfix/*` para fallos urgentes de lo que esté publicado en `main`.

**Preparación de una versión:** acordar número y contenido de la entrega → crear un Issue de release con código de tarea propio → crear `release/vX.Y.Z` desde `develop` → admitir allí solo correcciones, pruebas y documentación de esa versión → PR `release/*` → `main` con CI y revisión → etiquetar `main` como `vX.Y.Z` → PR `release/*` → `develop` para devolver las correcciones hechas durante la estabilización → borrar `release/*`. Mientras tanto, las funcionalidades de la versión siguiente pueden seguir entrando a `develop`.

**Corrección urgente en producción:** abrir un Issue con código propio → crear `hotfix/tema-breve` desde `main` → probar y revisar → PR a `main` → etiquetar la versión corregida → PR de la misma rama a `develop` o a la `release/*` activa → borrar `hotfix/*`. Verificar que la corrección llegó también a la línea de desarrollo antes de darla por terminada.

No trabajar directamente sobre `main` ni `develop`. Tras integrar una rama temporal, borrarla y actualizar las ramas locales. No reutilizar las ramas `feature/*` históricas ya integradas.

**Regla obligatoria desde la adopción:** *cada commit nuevo*, incluso correcciones, pruebas y documentación, lleva el código de la tarea en el mensaje. Ejemplos:

```bash
git commit -m "feat: #TSK-01 conectar login con Supabase"
git commit -m "test: #TSK-17 cubrir catálogo y carrito"
git commit -m "docs: #TSK-17 documentar CI y tablero"
```

El título del PR y **todo commit creado al integrarlo** deben incluir `#TSK-xx`, incluidos los commits de release, hotfix y merge. Para PR de `feature/*` a `develop`, se puede usar **Squash and merge** con un mensaje personalizado que incluya el código. Para integrar `release/*` y `hotfix/*` en ambas ramas de destino, conservar la ascendencia común mediante **Create a merge commit**, editando su mensaje para incluir el código de la tarea; no usar squash en esos dos flujos porque dificultaría sincronizar sus cambios de vuelta. No modificar commits antiguos que preceden a esta regla. Vincular el Issue real en el cuerpo del PR (`Refs #123`); los cierres automáticos por palabras clave ocurren al integrar en la rama predeterminada, normalmente `main`, así que un PR a `develop` requiere cerrar manualmente el Issue cuando quede en `Done`. [Vinculación de PR e Issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue).

Configurar **Rulesets** para `main` y `develop`: PR obligatorio, una aprobación de la otra persona, conversaciones resueltas, checks CI obligatorios, sin force push ni borrado. Permitir merge commits para `release/*` y `hotfix/*`; **no activar la regla de historial lineal**, incompatible con esos merges. El check de mensajes del workflow debe revisar los commits del PR; antes de confirmar un merge, verificar también el mensaje personalizado del nuevo commit. [Rulesets de GitHub](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets).

## 5. Integración continua y evidencia

**Responsable:** Evelyn (TSK-17); Orlando revisa. El workflow propuesto en `.github/workflows/ci.yml` se dispara con `pull_request` **sin filtro de rama**, por lo que cubre PR hacia `develop` y `main`, incluidos los de `feature/*`, `release/*` y `hotfix/*`. Pasos: `npm ci`, linter, 3 o más pruebas, compilación, y validación de códigos de tarea en cada commit del PR. El job debe llamarse `quality-and-build` para seleccionarlo como check requerido en ambos Rulesets. Los disparadores y filtros de PR están documentados por [GitHub Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax).

**Tres pruebas iniciales concretas:** búsqueda de producto conocido, respuesta ante ID inexistente y contrato del catálogo (IDs únicos, precios válidos y variantes). Al crecer el código, añadir pruebas de totales del carrito, autorización y creación de pedidos; las tres iniciales son el piso, no la cobertura final.

**Evidencia indispensable:** abrir un PR real, esperar que `quality-and-build` termine en verde, y guardar una captura legible de la pestaña **Checks** o del resumen del PR donde se vean repositorio, PR, commit y resultado del build y las pruebas. Anotar en el Issue TSK-17 el enlace al PR, el run de Actions y la ruta de la captura (por ejemplo `docs/evidencia/ci-pr-XX.png`). Una captura no se puede generar de forma válida antes de ejecutar el workflow en GitHub. No marcar TSK-17 como `Done` hasta comprobar esto.

## 6. Herramientas y acuerdos de equipo

- **GitHub Issues + Projects:** fuente de verdad para responsables, estados, criterios y bloqueos.
- **Pull Requests:** revisión cruzada y discusión técnica; cada PR enlaza su Issue, explica cambio y pruebas, y añade captura cuando afecta a la interfaz.
- **GitHub Actions:** evidencia automática del lint, pruebas y build.
- **README:** instrucciones de instalación, variables de entorno y recorrido de desarrollo; actualizarlo al integrar cada servicio nuevo.

**Definición de Done:** criterios de aceptación cumplidos, PR aprobado por la otra persona, CI verde, cambios integrados en la rama de destino y, para releases/hotfixes, sincronizados con `develop`; Issue actualizado y documentación relevante al día. Una tarea sin evidencia de ejecución o sin revisión permanece en `In Review`.

## 7. Estado de implementación y pendientes externos

**Este archivo es únicamente un plan.** No se ha creado `develop`, Project, Issues, Rulesets, workflow, pruebas ni PR. El repositorio sigue en `main` y sin cambios de código. Para ejecutar el plan se necesita una sesión válida de GitHub: la sesión `gh` local devuelve token inválido. También falta conocer la cuenta GitHub de Evelyn para asignarle Issues y acceso al Project. La captura del check verde solo podrá obtenerse después de publicar el workflow y ejecutar un PR real; no debe presentarse como evidencia existente.
