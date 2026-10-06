# API

- Base: `http://localhost:3001/api` (desarrollo). Prefijo global `/api`.
- Formato: JSON. Fechas en UTC, ISO 8601.
- Contratos TypeScript en `@pos/shared` (`packages/shared/src`).

## Request id

Cada respuesta incluye el header `x-request-id`. Si el cliente envía uno válido
(`[A-Za-z0-9._-]`, máx. 128 caracteres) se reutiliza; si no, se genera un UUID. El
mismo id aparece en el log de acceso y en los errores.

## Formato de error (`ApiErrorResponse`)

Toda respuesta de error usa este formato (filtro global de excepciones):

```json
{
  "statusCode": 404,
  "error": "NOT_FOUND",
  "message": "La ruta solicitada no existe.",
  "path": "/api/no-existe",
  "requestId": "2c8e50ab-e745-4a10-a6d5-e0b79c3f716d",
  "timestamp": "2026-10-06T21:27:21.998Z"
}
```

| Campo        | Descripción                                                        |
| ------------ | ------------------------------------------------------------------ |
| `statusCode` | Status HTTP                                                        |
| `error`      | Código estable derivado del status (`BAD_REQUEST`, `NOT_FOUND`, …) |
| `message`    | Mensaje para el usuario; nunca detalles internos                   |
| `details`    | Opcional: lista de errores de validación                           |
| `path`       | Ruta sin query string                                              |
| `requestId`  | Igual al header `x-request-id`                                     |
| `timestamp`  | Momento del error (UTC)                                            |

Errores no controlados → `500 INTERNAL_SERVER_ERROR` con mensaje genérico; el
detalle y stack solo se registran en el log del servidor.

## Endpoints

### `GET /api/health`

Estado de la API y sus dependencias. Sin autenticación (uso de monitoreo).

`200 OK`

```json
{
  "status": "ok",
  "timestamp": "2026-10-06T21:33:28.316Z",
  "uptimeSeconds": 6,
  "checks": { "database": { "status": "up", "latencyMs": 1 } }
}
```

`503 Service Unavailable` — misma forma con `"status": "error"` y
`"database": { "status": "down", … }`.

Los endpoints de negocio se documentarán aquí conforme se implementen sus fases.
