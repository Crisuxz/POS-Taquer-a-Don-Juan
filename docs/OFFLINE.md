# Modo offline tolerante

**Estado: no implementado** (Fases 13, 14 y 15 de ROADMAP.md). Este documento fija
la estrategia acordada en SPEC.md §24–§27 para que las fases previas no la
contradigan.

## Alcance

- **Offline tolerante**, no sistema distribuido totalmente offline.
- Tecnologías: PWA, Service Worker, **IndexedDB**. `localStorage` **no** se usa como
  base transaccional.
- El servidor es la fuente de verdad; WebSocket nunca es fuente primaria (el estado
  se recupera por HTTP).

## Permitido / bloqueado sin conexión

| Permitido offline             | Bloqueado offline                               |
| ----------------------------- | ----------------------------------------------- |
| Consultar catálogo            | Cambiar precios                                 |
| Crear pedido                  | Crear usuarios / cambiar roles                  |
| Agregar Items y modificadores | Modificar PIN                                   |
| Guardar Comanda (local)       | Configuración crítica                           |
| Registrar pago local          | Cerrar caja con pagos pendientes de sincronizar |

Una Comanda creada offline se muestra como _"Pedido guardado localmente. Aún no ha
sido recibido por cocina."_ y **no** se marca como enviada hasta la confirmación
del servidor.

## Cola de operaciones

`OperacionOffline` con `operation_uuid`, `device_id`, `user_id`, `type`, `payload`,
`status` (`PENDING`, `SYNCING`, `SYNCED`, `FAILED`, `CONFLICT`), `retry_count` y
`last_error`. El backend procesa cada `operation_uuid` **una sola vez**
(idempotencia: pagos, pedidos, cancelaciones y movimientos de caja).

## Implicaciones para fases anteriores a la 13

- Los endpoints de creación crítica (pedidos, pagos, cancelaciones, movimientos de
  caja) deben aceptar un `operation_uuid` y ser idempotentes desde su fase.
- Los IDs UUID permiten generar identificadores en el cliente cuando sea necesario.
