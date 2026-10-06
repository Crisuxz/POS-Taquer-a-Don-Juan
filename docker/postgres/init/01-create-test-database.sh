#!/bin/sh
# Crea la base de datos usada por las pruebas de integración.
# Solo se ejecuta la primera vez que se inicializa el volumen de PostgreSQL.
# El entrypoint oficial puede ejecutar o "sourcear" este archivo, por eso no
# se usa `set -eu` (alteraría el shell del entrypoint); psql detiene en error.

if [ -n "${POSTGRES_TEST_DB:-}" ]; then
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
    -c "CREATE DATABASE \"${POSTGRES_TEST_DB}\" OWNER \"${POSTGRES_USER}\";"
fi
