# Arquitectura

Monolito modular (SPEC.md §28) organizado como monorepo con **npm workspaces**.
Sin microservicios y sin Redis hasta que exista una necesidad real.

## Monorepo

| Paquete       | Ruta              | Rol                                                       |
| ------------- | ----------------- | --------------------------------------------------------- |
| `@pos/shared` | `packages/shared` | Contratos TypeScript compartidos API ↔ Web (ESM, `dist/`) |
| `@pos/api`    | `apps/api`        | API REST NestJS + Prisma                                  |
| `@pos/web`    | `apps/web`        | Interfaz Next.js (App Router)                             |

- Configuración TypeScript común: `tsconfig.base.json` (`strict`,
  `noUncheckedIndexedAccess`, `noImplicitOverride`, `noImplicitReturns`, …).
- ESLint común para paquetes Node: `eslint.base.mjs` (typescript-eslint
  `strictTypeChecked`). La Web usa `eslint-config-next`. Prettier en todo el repo.
- Herramientas compartidas (TypeScript, ESLint, Prettier, Vitest) declaradas en la raíz.
- `postinstall` de la raíz compila `@pos/shared` y genera el cliente Prisma, de modo
  que tras `npm install`/`npm ci` todo queda listo para typecheck, pruebas y build.

## Stack (versiones fijadas)

| Capa     | Tecnología                                                         |
| -------- | ------------------------------------------------------------------ |
| Runtime  | Node.js 24 LTS                                                     |
| Lenguaje | TypeScript 6.0 (strict)                                            |
| Backend  | NestJS 12 (ESM), Express 5, `@nestjs/config` + Zod, helmet         |
| Datos    | PostgreSQL 17, Prisma 7 (`prisma-client` + `@prisma/adapter-pg`)   |
| Frontend | Next.js 16 (Turbopack, Cache Components), React 19, Tailwind CSS 4 |
| Pruebas  | Vitest 4 (unitarias e integración), Testing Library, Playwright    |
| Infra    | Docker, Docker Compose, GitHub Actions                             |

Pendiente por fase (SPEC §28): shadcn/ui, TanStack Query y React Hook Form se
incorporan cuando haya formularios/datos de negocio (Fase 1+); WebSockets en
Fase 8; PWA/Service Worker/IndexedDB en Fases 13–15.

## Backend (`apps/api`)

```text
src/
  main.ts                    Arranque: logger, setup HTTP, puerto
  app.module.ts              Módulo raíz: Config, Prisma, Health, filtro global, middleware
  app.setup.ts               Prefijo /api, helmet, CORS, shutdown hooks (compartido con tests)
  config/env.ts              Esquema Zod de variables de entorno (falla rápido)
  common/
    errors/                  Filtro global de excepciones + mapeo a ApiErrorResponse
    http/                    Request id + log de acceso
    logging/                 Logger (JSON en producción, texto en desarrollo)
  prisma/                    PrismaService (global)
  health/                    GET /api/health
  generated/prisma/          Cliente Prisma generado (no versionado)
```

Ciclo de una petición:

```text
RequestContextMiddleware (request id + log de acceso)
→ helmet / CORS
→ Controller
→ (si hay excepción) AllExceptionsFilter → ApiErrorResponse uniforme
```

Módulos de negocio previstos (SPEC §29), cada uno en su fase: Auth, Users,
Devices, Catalog (Categories, Products, Modifiers), Tables, Orders (Orders,
Commands, Items), Kitchen, Payments, Cash, Audit, Reports, Sync.

## Frontend (`apps/web`)

- App Router en `src/app`. Lógica fuera de los componentes (`src/lib`).
- `NEXT_PUBLIC_API_URL` define la URL de la API y se incrusta al compilar.
- Página inicial: estado técnico (API y base de datos) usando `@pos/shared`.
- Diseño prioritario tablet → escritorio → móvil (SPEC §31): las pruebas E2E corren
  en perfiles tablet y escritorio.

## Estrategia de pruebas

| Tipo        | Herramienta               | Ubicación                             | Requiere           |
| ----------- | ------------------------- | ------------------------------------- | ------------------ |
| Unitarias   | Vitest (+ jsdom en Web)   | `**/src/**/*.spec.ts(x)`              | nada               |
| Integración | Vitest + supertest + Nest | `apps/api/test/*.integration-spec.ts` | PostgreSQL         |
| E2E         | Playwright                | `apps/web/e2e/`                       | build + PostgreSQL |

Las pruebas de integración levantan la aplicación Nest real (mismos módulos y
setup que producción) contra la base `pos_taqueria_test`; su `globalSetup`
aplica las migraciones antes de correr.

## Decisiones técnicas (Fase 0)

| Decisión                                     | Motivo                                                                                                                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **npm workspaces** sin Turborepo/Nx          | Tres paquetes; los scripts `--workspaces` bastan. Menos dependencias.                                                                                              |
| **TypeScript 6.0**, no 7.0                   | TS 7 (port nativo) aún no es soportado por typescript-eslint (`<6.1`). NestJS 12 fija `~6.0`.                                                                      |
| **NestJS 12 en ESM** (`module: nodenext`)    | Nest 12 se publica solo como ESM; se sigue la plantilla oficial (imports con `.js`).                                                                               |
| **Vitest** como único runner                 | Plantilla oficial de Nest 12 y guía oficial de Next 16. Jest no carga ESM de Nest 12 sin modo experimental.                                                        |
| **ESLint 9**, no 10                          | Los plugins de `eslint-config-next` (react, import, jsx-a11y) aún no soportan ESLint 10.                                                                           |
| **Prisma 7.10** (estable), no 8.0            | La etiqueta `latest` de `prisma` apunta a 8.0.0‑rc. Se usa el generador `prisma-client` con `moduleFormat=esm`, `importFileExtension=js` y el driver adapter `pg`. |
| Conexión perezosa a la BD                    | La API arranca aunque PostgreSQL no responda; el health check reporta 503 en lugar de un ciclo de reinicios.                                                       |
| Logger nativo de Nest (`json` en producción) | Evita dependencias extra (pino); suficiente para el MVP.                                                                                                           |
| Zod para variables de entorno                | Zod ya está en el stack (SPEC §28); validación con mensajes sin valores sensibles.                                                                                 |
| Migración inicial técnica (UTC)              | La fase exige migraciones funcionales sin modelos de negocio; fija la zona horaria de la BD en UTC (SPEC §23).                                                     |
| Salida `standalone` de Next solo en Docker   | En Windows requiere symlinks con privilegios; se activa con `NEXT_OUTPUT=standalone`.                                                                              |
