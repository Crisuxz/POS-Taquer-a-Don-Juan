# POS Taquería Don Juan

Punto de venta para Taquería Don Juan: operación desde PC, laptop, tablet o celular
con mesas, pedidos, comandas, cocina, cobros y caja.

| Documento                          | Contenido                                   |
| ---------------------------------- | ------------------------------------------- |
| [SPEC.md](SPEC.md)                 | Especificación maestra (fuente de verdad)   |
| [ROADMAP.md](ROADMAP.md)           | Fases de desarrollo y criterios de salida   |
| [PHASE_PROMPT.md](PHASE_PROMPT.md) | Protocolo de trabajo por fase               |
| [docs/](docs)                      | Arquitectura, base de datos, API, seguridad |

## Estado

**Fase 0 — Base técnica: completa.** Aún no hay funcionalidad de negocio
(autenticación, catálogo, mesas, pedidos, caja, cocina, offline); cada una llega en
su fase según [ROADMAP.md](ROADMAP.md).

Hoy el sistema incluye: monorepo, API NestJS con health check, manejo global de
errores y logging; Web Next.js con página de estado; PostgreSQL + Prisma con
migraciones; Docker; CI en GitHub Actions; pruebas unitarias, de integración y E2E.

## Requisitos

- **Node.js ≥ 24.15** (ver `.nvmrc`) y npm 11
- **Docker Desktop** (o Docker Engine + Compose v2)

## Levantar el proyecto desde cero

```bash
# 1. Dependencias (también compila packages/shared y genera el cliente Prisma)
npm install

# 2. Archivos de entorno locales a partir de los .env.example (no sobrescribe)
npm run setup:env

# 3. PostgreSQL en Docker (crea también la base de pruebas)
npm run db:up

# 4. Migraciones
npm run db:migrate

# 5. Servidores de desarrollo, cada uno en su propia terminal
npm run dev:api     # http://localhost:3001/api/health
npm run dev:web     # http://localhost:3000
```

La página http://localhost:3000 debe mostrar **API conectada** y **Base de datos
conectada**.

Para detener PostgreSQL: `npm run db:down` (los datos se conservan en el volumen
`pos-taqueria_postgres-data`).

## Scripts principales (raíz)

| Script                            | Qué hace                                                  |
| --------------------------------- | --------------------------------------------------------- |
| `npm run lint`                    | ESLint en todos los paquetes                              |
| `npm run format` / `format:check` | Prettier (escribe / verifica)                             |
| `npm run typecheck`               | TypeScript estricto en todos los paquetes                 |
| `npm run test`                    | Pruebas unitarias (Vitest)                                |
| `npm run test:integration`        | API completa contra PostgreSQL real (base `*_test`)       |
| `npm run build`                   | Build de producción: shared → api → web                   |
| `npm run test:e2e`                | Playwright (requiere `npm run build` y PostgreSQL arriba) |
| `npm run db:up` / `db:down`       | Inicia / detiene PostgreSQL                               |
| `npm run db:migrate`              | Aplica migraciones pendientes (`prisma migrate deploy`)   |

Crear una migración nueva (fases futuras):
`npm run prisma:migrate:dev -w @pos/api -- --name <nombre>`.

### Pruebas E2E

```bash
npm exec -w @pos/web -- playwright install chromium   # solo la primera vez
npm run build
npm run test:e2e
```

Playwright levanta la API y la Web compiladas (o reutiliza las que ya estén
corriendo) y valida la página en perfiles **tablet** y **escritorio**.

## Stack completo en Docker

```bash
docker compose --profile full up -d --build --wait
```

Levanta PostgreSQL, aplica migraciones (servicio `migrate`), API en `:3001` y Web en
`:3000`. Ver [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Estructura

```text
apps/
  api/            NestJS 12 (ESM) + Prisma 7 — API REST
  web/            Next.js 16 + React 19 + Tailwind CSS 4
packages/
  shared/         Contratos compartidos (health, formato de error, headers)
docs/             Documentación técnica
docker/           Scripts de inicialización de PostgreSQL
.github/workflows CI: lint → typecheck → tests → build → E2E + imágenes Docker
```

## Documentación técnica

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — monorepo, stack, decisiones técnicas
- [DATABASE.md](docs/DATABASE.md) — PostgreSQL, Prisma, convenciones y migraciones
- [API.md](docs/API.md) — endpoints y formato de errores
- [SECURITY.md](docs/SECURITY.md) — controles implementados y pendientes
- [BUSINESS_RULES.md](docs/BUSINESS_RULES.md) — reglas de negocio y fase en que se aplican
- [OFFLINE.md](docs/OFFLINE.md) — estrategia offline tolerante
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) — Docker, variables y despliegue
