#!/bin/sh
# Aplica a la base de datos local, una sola vez cada uno y en orden:
#   1. las migraciones de /migrations (supabase/migrations), por nombre;
#   2. los datos de prueba de /seeds que empiezan por un número (p. ej. 10-catalogo.sql).
# Cada archivo se ejecuta en una sola transacción: si falla, no deja cambios a medias y el
# error se ve en `docker compose logs db-migrate`. Al repetir `docker compose up`, lo que ya
# se aplicó se omite.
set -eu

run() { psql -X -q -v ON_ERROR_STOP=1 "$@"; }

run -c "create schema if not exists local_dev"
run -c "create table if not exists local_dev.applied_scripts (name text primary key, applied_at timestamptz not null default now())"

apply() {
  file="$1"
  name="$(basename "$file")"
  if [ -n "$(run -tA -c "select 1 from local_dev.applied_scripts where name = '$name'")" ]; then
    echo "Ya aplicado: $name"
    return
  fi
  echo "Aplicando: $name"
  run --single-transaction -f "$file"
  run -c "insert into local_dev.applied_scripts (name) values ('$name')"
}

for file in $(ls /migrations/*.sql | sort); do apply "$file"; done
for file in $(ls /seeds/[0-9]*.sql 2>/dev/null | sort); do apply "$file"; done

echo "Base de datos lista."
