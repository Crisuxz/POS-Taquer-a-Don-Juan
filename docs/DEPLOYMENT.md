# Despliegue

**Estado:** imágenes Docker y stack local completo listos (Fase 0). La preparación
para producción real (HTTPS, backups probados con restauración, monitoreo, política
de actualización) corresponde a la **Fase 18**.

## Imágenes

Ambas se construyen con la **raíz del monorepo** como contexto.

| Imagen | Dockerfile            | Etapas                                                                                                                    |
| ------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| API    | `apps/api/Dockerfile` | `build` (dependencias completas, compila, ejecuta migraciones) · `runtime` (solo producción, usuario `node`, healthcheck) |
| Web    | `apps/web/Dockerfile` | `build` (Next.js `standalone`) · `runtime` (`node apps/web/server.js`, usuario `node`, healthcheck)                       |

## Stack completo con Docker Compose

```bash
docker compose --profile full up -d --build --wait
```

Orden de arranque: `postgres` (healthy) → `migrate` (`prisma migrate deploy`,
termina con código 0) → `api` (healthy) → `web`.

Sin el perfil `full` solo se levanta PostgreSQL (`npm run db:up`), que es el modo
habitual de desarrollo.

## Variables

### API (`apps/api/.env.example`)

| Variable            | Obligatoria  | Default                 | Descripción                                                     |
| ------------------- | ------------ | ----------------------- | --------------------------------------------------------------- |
| `DATABASE_URL`      | Sí           | —                       | Cadena `postgresql://`                                          |
| `NODE_ENV`          | No           | `development`           | `development` / `test` / `production` (JSON logs en producción) |
| `PORT`              | No           | `3001`                  | Puerto HTTP                                                     |
| `CORS_ORIGINS`      | No           | `http://localhost:3000` | Orígenes permitidos, separados por coma                         |
| `LOG_LEVEL`         | No           | `log`                   | `fatal` … `verbose`                                             |
| `DATABASE_URL_TEST` | Solo pruebas | —                       | Base para pruebas de integración                                |

### Web (`apps/web/.env.example`)

| Variable              | Momento   | Descripción                                                                                                                                  |
| --------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | **Build** | URL pública de la API (incluye `/api`). Se incrusta en el bundle: cambiarla requiere recompilar. En Docker: build-arg `NEXT_PUBLIC_API_URL`. |
| `NEXT_OUTPUT`         | Build     | `standalone` en Docker.                                                                                                                      |

### Compose (`.env.example` de la raíz)

Credenciales y puertos de PostgreSQL y del perfil `full`. Todos tienen valores
por defecto **solo para desarrollo local**; en cualquier entorno compartido deben
definirse credenciales propias.

## Notas

- La salida `standalone` de Next.js en Windows requiere permisos para crear
  symlinks; por eso solo se activa en el build de Docker.
- Migraciones en producción: siempre `prisma migrate deploy` (servicio `migrate`),
  nunca `migrate dev`.
