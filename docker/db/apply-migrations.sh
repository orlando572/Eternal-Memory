#!/bin/sh
# Prepara y aplica la base de datos local, una sola vez cada archivo y en este orden:
#   1. /seeds/bootstrap/*.sql, como supabase_admin: piezas de Supabase que la imagen no trae
#      (las tablas de Storage);
#   2. /migrations/*.sql (supabase/migrations), como postgres, por nombre;
#   3. los datos de prueba de /seeds que empiezan por un número (p. ej. 10-catalogo.sql), como postgres.
# Cada archivo se ejecuta en una sola transacción: si falla, no deja cambios a medias y el
# error se ve en `docker compose logs db-migrate`. Al repetir `docker compose up`, lo que ya
# se aplicó se omite.
set -eu

# $1 es el usuario de la base de datos; el resto son argumentos de psql.
run() { user="$1"; shift; PGUSER="$user" psql -X -q -v ON_ERROR_STOP=1 "$@"; }

run postgres -c "create schema if not exists local_dev"
run postgres -c "create table if not exists local_dev.applied_scripts (name text primary key, applied_at timestamptz not null default now())"

# $1 usuario, $2 archivo, $3 prefijo con el que se registra (vacío para migraciones y datos de prueba).
apply() {
  user="$1"
  file="$2"
  name="$3$(basename "$file")"
  if [ -n "$(run postgres -tA -c "select 1 from local_dev.applied_scripts where name = '$name'")" ]; then
    echo "Ya aplicado: $name"
    return
  fi
  echo "Aplicando: $name (como $user)"
  run "$user" --single-transaction -f "$file"
  run postgres -c "insert into local_dev.applied_scripts (name) values ('$name')"
}

for file in $(ls /seeds/bootstrap/*.sql 2>/dev/null | sort); do apply supabase_admin "$file" "bootstrap/"; done
for file in $(ls /migrations/*.sql | sort); do apply postgres "$file" ""; done
for file in $(ls /seeds/[0-9]*.sql 2>/dev/null | sort); do apply postgres "$file" ""; done

echo "Base de datos lista."
