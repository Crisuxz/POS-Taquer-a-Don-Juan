# Seguridad

Principio general (SPEC §30): **nunca confiar únicamente en el frontend**; toda
autorización y validación se hace en el backend.

## Controles implementados (Fase 0)

| Control                   | Implementación                                                                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Secretos fuera del código | Variables de entorno; solo se versionan `*.env.example`; `.env*` en `.gitignore` y `.dockerignore`.                                       |
| Configuración validada    | `apps/api/src/config/env.ts` (Zod): la API no arranca con configuración inválida; el error nombra la variable, nunca su valor.            |
| Errores sin fugas         | Filtro global: errores no controlados → 500 genérico; 404 de rutas no refleja la URL ni la query string. Stack solo en logs del servidor. |
| Logging seguro            | Log de acceso: método, ruta **sin query string**, status, duración, request id. No se registran cuerpos, headers, cookies ni tokens.      |
| Request id seguro         | Un `x-request-id` entrante solo se acepta si cumple `[A-Za-z0-9._-]{1,128}` (evita inyección en logs).                                    |
| Headers HTTP              | `helmet` (CSP, `nosniff`, `frame-ancestors`, HSTS…); sin `x-powered-by` en API ni Web.                                                    |
| CORS                      | Lista blanca explícita (`CORS_ORIGINS`).                                                                                                  |
| Contenedores              | API y Web corren como usuario `node` (no root). La imagen runtime de la API no incluye dependencias de desarrollo ni el CLI de Prisma.    |
| Variables públicas        | Solo `NEXT_PUBLIC_API_URL` llega al navegador; nunca secretos con prefijo `NEXT_PUBLIC_`.                                                 |

## Pendiente por fase

| Control                                                                  | Fase |
| ------------------------------------------------------------------------ | ---- |
| Hash seguro de contraseñas y PIN administrativo (nunca texto plano)      | 1    |
| Autenticación, sesión, autorización por rol en backend, rutas protegidas | 1    |
| Expiración corta de autorización administrativa (PIN)                    | 1    |
| Rate limiting (login, PIN)                                               | 1    |
| Auditoría de acciones sensibles                                          | 12   |
| HTTPS, secretos de producción, backups                                   | 18   |

## Auditoría de dependencias

`npm audit` debe reportar **0 vulnerabilidades** al cierre de cada fase.

Algunas dependencias transitivas fijan versiones vulnerables sin que exista una
versión del paquete padre que las corrija. Se fuerzan versiones seguras con
`overrides` en el `package.json` raíz:

| Override                                                        | Vía                                | Aviso corregido                                       | Verificación de compatibilidad                                                                                   |
| --------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `mysql2` → 3.24.5                                               | CLI `prisma` 7.10 (fija 3.15.3)    | GHSA-3f6p-5ww8-9rcr, GHSA-rgwj-5xj2-c3m3              | Misma versión mayor; Prisma solo lo usa en Studio para MySQL.                                                    |
| `deepmerge-ts` → 8.0.2                                          | `@prisma/config` 7.10 (fija 7.1.5) | GHSA-ggr8-5vv4-36mx                                   | Prisma solo usa `deepmerge()`, presente en v8; `generate` y `migrate` verificados.                               |
| `fast-glob` → `tinyglobby` (solo en `@next/eslint-plugin-next`) | `eslint-config-next` 16.4          | GHSA-vfj7-8cjw-p6xm (`braces`, sin versión corregida) | El plugin solo llama `globSync(patrón, { onlyDirectories: true })`, API idéntica en `tinyglobby` (sin `braces`). |

`npm ls` marca estos paquetes como "invalid" porque difieren de la versión exacta
que pide su paquete padre; es el comportamiento esperado de `overrides`.
Cuando Prisma o Next publiquen versiones con las dependencias corregidas, se debe
eliminar el override correspondiente.
