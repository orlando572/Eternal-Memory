# Entorno local con Docker — TSK-44

`docker-compose.yml` (en la raíz) levanta la tienda y una base de datos local.

| Servicio | Qué es |
| --- | --- |
| `app` | La tienda, construida con el `Dockerfile` (TSK-43). Habla con Supabase por su API, con los valores de `NEXT_PUBLIC_SUPABASE_*` y `SUPABASE_SECRET_KEY` del `.env`. **No** usa la base de datos local. |
| `db` | PostgreSQL con los esquemas de Supabase (`auth`, `storage`), imagen `supabase/postgres`. Sirve para probar las migraciones y los datos de prueba en local. En producción se usa Supabase gestionado. |
| `db-migrate` | Aplica las migraciones y los datos de prueba y termina. Aparece como `Exited (0)` en `docker compose ps -a`: es lo esperado. |

## Uso

```bash
cp .env.example .env        # en PowerShell: Copy-Item .env.example .env
docker compose up -d --build
docker compose ps
```

Con los valores de ejemplo de `.env.example`, la tienda abre en http://localhost:3000 pero no se conecta a ningún Supabase. Para trabajar con el proyecto real, pon en `.env` los valores de Supabase. El `.env` no se sube al repositorio.

## Qué debe verse

- `docker compose ps`: `app` y `db` en estado `healthy`.
- `docker compose logs db-migrate`: una línea `Aplicando: <archivo>` por migración y, al final, `Base de datos lista.`
- La tienda responde en http://localhost:3000.
- Las tablas existen:

```bash
docker compose exec db psql -U postgres -c "select count(*) from public.products;"
```

## Datos de prueba

Cualquier archivo `docker/db/NN-nombre.sql` (empieza por un número) se aplica después de las migraciones, en orden. Lo usarán los seeders de TSK-45 y TSK-49.

## Si algo falla

- **`db-migrate` termina con error:** `docker compose logs db-migrate` muestra la migración y la línea que falló. Cada archivo se ejecuta en una transacción, así que no queda a medias. Corrige y repite `docker compose up -d`: lo ya aplicado se omite.
- **Empezar de cero:** `docker compose down -v` borra también el volumen `db-data`.
- **El puerto está ocupado:** cambia `APP_PORT` o `DB_PORT` en `.env`.
- **El script falla con `\r: command not found`:** el archivo `docker/db/apply-migrations.sh` debe tener saltos de línea LF. `.gitattributes` lo fuerza al clonar; si lo editaste en Windows, vuelve a guardarlo con LF.

## Pendiente de verificar

Este entorno se escribió sin poder ejecutarlo. Lo más incierto es que las migraciones, que usan `auth.users`, `auth.uid()`, `storage` y `pg_cron`, se apliquen sin errores sobre la imagen `supabase/postgres`.
