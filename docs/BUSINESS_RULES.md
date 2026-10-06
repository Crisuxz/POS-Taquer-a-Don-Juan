# Reglas de negocio

La definición completa está en [SPEC.md](../SPEC.md). Este documento registra
**dónde y cuándo** se hace cumplir cada regla definitiva (SPEC §37). Se actualiza
al cerrar cada fase.

Estado al cierre de la **Fase 0**: ninguna regla de negocio implementada todavía
(la fase es solo base técnica). Las reglas técnicas transversales ya preparadas se
marcan como "Base lista".

| #   | Regla (SPEC §37)                                             | Fase  | Estado                                      |
| --- | ------------------------------------------------------------ | ----- | ------------------------------------------- |
| 1   | Una Mesa solo puede tener un Pedido abierto                  | 4     | Pendiente                                   |
| 2   | Un Pedido puede tener múltiples Comandas                     | 6     | Pendiente                                   |
| 3   | Una Comanda puede tener múltiples Items                      | 6     | Pendiente                                   |
| 4   | Un Item pertenece a una sola Comanda                         | 6     | Pendiente                                   |
| 5   | Una Comanda enviada no se modifica destructivamente          | 6/11  | Pendiente                                   |
| 6   | Las ventas pagadas nunca se eliminan                         | 9/11  | Pendiente                                   |
| 7   | Precios históricos mediante snapshots                        | 5     | Pendiente                                   |
| 8   | Mesero no cobra                                              | 1/9   | Pendiente                                   |
| 9   | Taquero no cobra                                             | 1/9   | Pendiente                                   |
| 10  | Caja es el único rol que cobra                               | 1/9   | Pendiente                                   |
| 11  | Caja opera normalmente sin PIN                               | 1     | Pendiente                                   |
| 12  | Funciones administrativas de Caja requieren PIN              | 1     | Pendiente                                   |
| 13  | Solo existe una caja activa                                  | 10    | Pendiente                                   |
| 14  | Producto agotado no equivale a producto desactivado          | 3     | Pendiente                                   |
| 15  | MVP admite un método de pago por Pedido                      | 9     | Pendiente                                   |
| 16  | Pago y Cocina son procesos independientes                    | 9     | Pendiente                                   |
| 17  | IDs internos son UUID                                        | 1+    | Base lista (convención en DATABASE.md)      |
| 18  | Folios visibles no son claves primarias                      | 5     | Base lista (convención en DATABASE.md)      |
| 19  | Valores monetarios usan Decimal                              | 3+    | Base lista (convención en DATABASE.md)      |
| 20  | Fechas internas usan UTC                                     | 0     | Base lista (BD en UTC, API responde en UTC) |
| 21  | Operaciones offline críticas son idempotentes                | 9/15  | Pendiente                                   |
| 22  | No cerrar Caja con pagos pendientes de sincronización        | 10/15 | Pendiente                                   |
| 23  | Operaciones administrativas críticas requieren conexión      | 13    | Pendiente                                   |
| 24  | El usuario siempre debe conocer el estado de conectividad    | 13    | Pendiente                                   |
| 25  | Comanda offline puede no llegar a Cocina hasta reconectar    | 14/15 | Pendiente                                   |
| 26  | No se promete operación multi-dispositivo totalmente offline | 13–15 | Pendiente                                   |
