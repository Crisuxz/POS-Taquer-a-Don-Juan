# Base de datos

## Motor y acceso

- **PostgreSQL 17** (Docker: `postgres:17-alpine`).
- **Prisma 7** con `prisma.config.ts` (Prisma 7 no lee `.env` por sí mismo: el config
  lo carga si existe; las variables del entorno real tienen prioridad).
- Cliente generado en `apps/api/src/generated/prisma` (no versionado; se regenera en
  `postinstall` o con `npm run prisma:generate -w @pos/api`).
- Conexión mediante `@prisma/adapter-pg` (driver `pg`), timeout de conexión 5 s.

| Base                | Uso                              | Variable            |
| ------------------- | -------------------------------- | ------------------- |
| `pos_taqueria`      | Desarrollo local / E2E           | `DATABASE_URL`      |
| `pos_taqueria_test` | Pruebas de integración (aislada) | `DATABASE_URL_TEST` |

La base de pruebas la crea `docker/postgres/init/01-create-test-database.sh` la
primera vez que se inicializa el volumen. Las pruebas de integración se niegan a
correr si `DATABASE_URL_TEST` falta o coincide con `DATABASE_URL`.

## Convenciones obligatorias para los modelos

Derivadas de SPEC.md §14, §20, §22 y §23. Aplican a todas las fases.

| Aspecto      | Regla                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| IDs internos | UUID: `id String @id @default(uuid()) @db.Uuid`                                                                                             |
| Folios       | Columna independiente (`folio Int`), nunca clave primaria                                                                                   |
| Dinero       | `Decimal @db.Decimal(12, 2)`. Nunca `Float`. El backend calcula totales.                                                                    |
| Fechas       | `DateTime @db.Timestamptz(3)`, siempre en UTC                                                                                               |
| Nombres      | Modelos en PascalCase como en SPEC (`Pedido`, `PedidoItem`); campos en camelCase con `@map("snake_case")`; tablas con `@@map("snake_case")` |
| Estados      | `enum` de Prisma con los valores exactos de SPEC §9                                                                                         |
| Borrado      | Nada con valor histórico/auditoría se borra físicamente (SPEC §18)                                                                          |
| Snapshots    | `PedidoItem` y `PedidoItemModificador` guardan nombre y precio al momento de la venta (SPEC §13)                                            |

## Migraciones

- Todo cambio de esquema se hace con migración (`prisma/migrations`). Nunca editar
  tablas a mano ni modificar una migración ya aplicada.
- Desarrollo: `npm run prisma:migrate:dev -w @pos/api -- --name <nombre>`.
- Aplicar pendientes: `npm run db:migrate` (`prisma migrate deploy`).
- Estado: `npm run prisma:migrate:status -w @pos/api`.
- Las pruebas de integración aplican las migraciones a la base de pruebas en cada corrida.

| Migración                          | Fase | Descripción                                                                   |
| ---------------------------------- | ---- | ----------------------------------------------------------------------------- |
| `20261006000000_init_utc_timezone` | 0    | Sin tablas. Fija `timezone = UTC` por defecto en la base de datos (SPEC §23). |

## Modelo de datos (SPEC §20)

| Entidad                                                                      | Estado    | Fase prevista |
| ---------------------------------------------------------------------------- | --------- | ------------- |
| Rol, Usuario                                                                 | Pendiente | 1             |
| Dispositivo                                                                  | Pendiente | 2             |
| Categoria, Producto, GrupoModificador, Modificador, ProductoGrupoModificador | Pendiente | 3             |
| Mesa                                                                         | Pendiente | 4             |
| Pedido, PedidoItem, PedidoItemModificador                                    | Pendiente | 5             |
| Comanda                                                                      | Pendiente | 6             |
| Pago                                                                         | Pendiente | 9             |
| CajaSesion, MovimientoCaja                                                   | Pendiente | 10            |
| Cancelacion                                                                  | Pendiente | 11            |
| Auditoria                                                                    | Pendiente | 12            |
| OperacionOffline                                                             | Pendiente | 14            |
