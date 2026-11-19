# Entorno local con Docker — TSK-44

`docker-compose.yml` (en la raíz) levanta la tienda y una base de datos local.

| Servicio | Qué es |
| --- | --- |
| `app` | La tienda, construida con el `Dockerfile` (TSK-43). Habla con Supabase por su API, con los valores de `NEXT_PUBLIC_SUPABASE_*` y `SUPABASE_SECRET_KEY` del `.env`. **No** usa la base de datos local. |
| `db` | PostgreSQL con los esquemas de Supabase (`auth`, `storage`), imagen `supabase/postgres`. Sirve para probar las migraciones y los datos de prueba en local. En producción se usa Supabase gestionado. |
| `db-migrate` | Prepara la base de datos y termina: primero crea las tablas de Storage que la imagen no trae (`docker/db/bootstrap/`), luego aplica las migraciones y por último los datos de prueba. Aparece como `Exited (0)` en `docker compose ps -a`: es lo esperado. |

## Uso

```bash
cp .env.example .env        # en PowerShell: Copy-Item .env.example .env
docker compose up -d --build
docker compose ps
```

Con los valores de ejemplo de `.env.example`, la tienda abre en http://localhost:3000 pero no se conecta a ningún Supabase. Para trabajar con el proyecto real, pon en `.env` los valores de Supabase. El `.env` no se sube al repositorio.

## Qué debe verse

- `docker compose ps`: `app` y `db` en estado `healthy`.
- `docker compose logs db-migrate`: primero `Aplicando: bootstrap/10-storage.sql (como supabase_admin)`, luego una línea `Aplicando: <archivo> (como postgres)` por migración y, al final, `Base de datos lista.`
- La tienda responde en http://localhost:3000.
- Las tablas existen:

```bash
docker compose exec db psql -U postgres -c "select count(*) from public.products;"
```

## Por qué hay un paso previo

En Supabase, las tablas `storage.buckets` y `storage.objects` las crea el servicio Storage, que este compose no incluye, y la imagen `supabase/postgres` no las trae. Las migraciones las usan (el bucket `product-images` y sus políticas), así que `docker/db/bootstrap/10-storage.sql` crea solo esas dos tablas, con las columnas que las migraciones necesitan, antes de aplicarlas. Lo detectó la primera prueba en un equipo con Docker.

## Datos de prueba

Cualquier archivo `docker/db/NN-nombre.sql` (empieza por un número) se aplica después de las migraciones, en orden. Lo usarán los seeders de TSK-45 y TSK-49.

### Catálogo y administración — `10-catalogo.sql` (TSK-45)

- **Publica los 48 productos de muestra** que crean las migraciones (urnas, ataúdes, relicarios y arreglos florales), sin cambiar sus nombres, opciones, precios ni imágenes. Las imágenes son referenciales: varias no representan el producto nombrado.
- **Existencias de prueba:** 10 unidades por variante activa, para poder probar la ficha y el checkout en local. No son inventario real.
- **Destacados:** dos productos por categoría (8 en total).
- **Administrador de prueba** con rol `admin` en `staff_roles` y su perfil:

| Correo | Contraseña |
| --- | --- |
| `admin@eternal-memory.local` | `EternalAdmin2026!` |

Estas credenciales son solo de prueba y solo existen en la base de datos local. La contraseña se guarda cifrada con bcrypt. La tienda (`app`) no inicia sesión contra esta base, sino contra el Supabase del `.env`, así que este usuario sirve para probar en SQL las funciones de administración y como referencia para los pedidos de TSK-49.

Comprobación:

```bash
docker compose exec db psql -U postgres -c "select count(*) from public.products where status = 'published';"
```

Debe devolver 48. El script se puede repetir sin duplicar nada.

## Si algo falla

- **`db-migrate` termina con error:** `docker compose logs db-migrate` muestra la migración y la línea que falló. Cada archivo se ejecuta en una transacción, así que no queda a medias. Corrige y repite `docker compose up -d`: lo ya aplicado se omite.
- **Empezar de cero:** `docker compose down -v` borra también el volumen `db-data`.
- **El puerto está ocupado:** cambia `APP_PORT` o `DB_PORT` en `.env`.
- **El script falla con `\r: command not found`:** el archivo `docker/db/apply-migrations.sh` debe tener saltos de línea LF. `.gitattributes` lo fuerza al clonar; si lo editaste en Windows, vuelve a guardarlo con LF.
