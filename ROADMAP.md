# ROADMAP.md — Plan de Desarrollo por Fases

## Regla general

Cada fase debe completar este ciclo:

```text
Analizar estado actual
→ Implementar únicamente la fase
→ Ejecutar pruebas
→ Corregir errores
→ Repetir pruebas
→ Ejecutar regresión
→ Actualizar documentación
→ Emitir reporte PASS/FAIL
→ DETENERSE
```

No avanzar si existe cualquiera de estos problemas:

- tests fallando;
- build roto;
- errores TypeScript;
- migraciones fallidas;
- errores críticos;
- criterios de aceptación incompletos;
- regresiones.

---

# Fase 0 — Base técnica

## Objetivo
Crear una base estable y reproducible.

## Implementar
- monorepo;
- apps/web;
- apps/api;
- packages/shared;
- docs;
- Next.js;
- NestJS;
- TypeScript strict;
- PostgreSQL;
- Prisma;
- Docker;
- Docker Compose;
- `.env.example`;
- lint;
- formatter;
- test runner;
- manejo global de errores;
- logging;
- health check;
- GitHub Actions;
- documentación inicial.

## No implementar aún
- autenticación;
- catálogo;
- mesas;
- pedidos;
- caja;
- cocina;
- offline.

## Pruebas
- frontend build;
- backend build;
- typecheck;
- lint;
- PostgreSQL levanta;
- Prisma conecta;
- migraciones funcionan;
- health check responde;
- Docker levanta dependencias;
- README permite levantar el proyecto desde cero.

## Gate
Todo en PASS.

---

# Fase 1 — Autenticación, roles y PIN

## Objetivo
Implementar acceso seguro.

## Implementar
- Rol;
- Usuario;
- login;
- logout;
- sesión;
- hash de contraseña;
- usuario activo/inactivo;
- autorización backend;
- rutas protegidas;
- MESERO;
- TAQUERO;
- CAJA;
- PIN administrativo;
- expiración corta de autorización administrativa.

## Pruebas
- login correcto;
- login incorrecto;
- usuario desactivado;
- Mesero no accede a Caja;
- Taquero no accede a Caja;
- Caja opera sin PIN;
- Caja no puede cambiar precio sin PIN;
- PIN incorrecto rechazado;
- PIN correcto habilita acción sensible.

## Gate
Autenticación y autorización sin fallos críticos.

---

# Fase 2 — Usuarios y dispositivos

## Objetivo
Administrar usuarios y registrar dispositivos.

## Implementar
- crear usuario;
- editar datos básicos;
- cambiar rol;
- activar/desactivar;
- restablecer contraseña;
- registrar dispositivo;
- device UUID;
- último acceso.

## Pruebas
- Caja con PIN crea Mesero;
- Caja con PIN crea Taquero;
- Caja sin PIN no crea usuarios;
- username duplicado rechazado;
- usuario desactivado pierde acceso;
- mismo dispositivo no se duplica.

## Gate
CRUD y registro de dispositivos funcionando.

---

# Fase 3 — Catálogo

## Objetivo
Administrar menú y modificadores.

## Implementar
- categorías;
- productos;
- precio;
- activo;
- agotado;
- orden;
- grupos de modificadores;
- modificadores;
- extras;
- relación producto/grupo.

## Pruebas
Crear:
- Taco Asada $25;
- Tipo de tortilla: Maíz/Harina;
- Extras: Queso +$10, Aguacate +$15.

Verificar:
- Decimal;
- producto inactivo no aparece;
- agotado aparece pero no se selecciona;
- cambiar precio exige PIN;
- mínimo/máximo funcionan;
- modificadores obligatorios funcionan.

## Gate
El menú real puede modelarse sin hacks.

---

# Fase 4 — Mesas y pedidos para llevar

## Objetivo
Gestionar mesas y tipo de pedido.

## Implementar
- crear mesas;
- activar/desactivar;
- orden;
- estado derivado;
- PARA_LLEVAR.

## Pruebas
- mesa sin pedido → LIBRE;
- crear pedido → OCUPADA;
- segundo pedido abierto en misma mesa → rechazado;
- cerrar pedido → LIBRE;
- PARA_LLEVAR funciona sin mesa.

## Gate
Estado de mesas siempre coherente.

---

# Fase 5 — Pedidos e Items

## Objetivo
Crear correctamente la cuenta del cliente.

## Implementar
- Pedido;
- PedidoItem;
- creación por Mesero;
- creación por Caja;
- productos;
- cantidades;
- notas;
- modificadores;
- subtotal;
- total;
- UUID;
- folio independiente;
- snapshots históricos.

## Pruebas
- cálculo correcto;
- backend recalcula total;
- cambiar precio actual no altera venta histórica;
- producto agotado rechazado;
- cantidad inválida rechazada;
- modificador obligatorio validado.

## Gate
Cálculos y snapshots correctos.

---

# Fase 6 — Comandas

## Objetivo
Permitir múltiples envíos a cocina dentro del mismo Pedido.

## Implementar
- Comanda;
- secuencia;
- estados;
- envío;
- varias Comandas por Pedido.

## Pruebas
Pedido Mesa 3:
- Comanda 1: 3 tacos;
- Comanda 2: 2 bebidas.

Debe existir:
- 1 Pedido;
- 2 Comandas.

Validar transiciones de estado.

## Gate
Comandas múltiples sin crear Pedidos duplicados.

---

# Fase 7 — KDS Cocina

## Objetivo
Crear interfaz funcional para Taquero.

## Implementar
- pendientes;
- preparando;
- listas;
- entregadas;
- antigüedad;
- temporizador;
- modificadores;
- notas;
- marcar PREPARANDO;
- marcar LISTA;
- marcar agotado.

## Pruebas
- Taquero recibe Comanda;
- transición ENVIADA → PREPARANDO → LISTA;
- producto agotado bloquea nuevas selecciones.

## Gate
Taquero puede operar sin funciones administrativas.

---

# Fase 8 — Tiempo real

## Objetivo
Actualizar dispositivos sin refrescar manualmente.

## Implementar
WebSockets para:
- nueva Comanda;
- estado;
- lista;
- cancelación;
- agotado.

## Reglas
HTTP sigue siendo fuente de verdad.

## Pruebas
- Mesero envía → Taquero recibe sin refrescar;
- desconectar WebSocket;
- reconectar;
- refetch HTTP recupera estado.

## Gate
No se pierde información por caída de socket.

---

# Fase 9 — Pagos

## Objetivo
Cobrar Pedidos.

## Implementar
- EFECTIVO;
- TARJETA;
- TRANSFERENCIA;
- cambio;
- referencia opcional;
- idempotencia;
- estados de pago.

## Pruebas
Total $350, recibido $500 → cambio $150.

Verificar:
- recibido menor al total rechazado;
- doble clic en cobrar genera un solo Pago;
- Mesero no cobra;
- Taquero no cobra.

## Gate
Pagos idempotentes.

---

# Fase 10 — Caja

## Objetivo
Controlar jornada financiera.

## Implementar
- apertura;
- fondo inicial;
- una sola sesión abierta;
- entradas;
- salidas;
- efectivo esperado;
- efectivo contado;
- diferencia;
- cierre.

## Pruebas
Ejemplo:
- fondo: 1000;
- ventas efectivo: 5000;
- entrada: 200;
- salida: 300;
- esperado: 5900.

Contado 5880 → diferencia -20.

## Gate
Cálculos financieros exactos.

---

# Fase 11 — Cancelaciones

## Objetivo
Corregir operaciones sin borrar historial.

## Implementar
- eliminación en BORRADOR;
- cancelación después de enviar;
- motivo obligatorio;
- cancelación de venta pagada con PIN;
- persistencia histórica.

## Pruebas
- cancelar Item borrador;
- cancelar Item enviado;
- cocina recibe cancelación;
- venta pagada sin PIN → rechazo;
- con PIN → permitido;
- historial permanece.

## Gate
Trazabilidad intacta.

---

# Fase 12 — Auditoría

## Objetivo
Registrar acciones sensibles.

## Implementar
Eventos críticos definidos en SPEC.md.

## Pruebas
Cambiar precio y verificar:
- usuario;
- dispositivo;
- acción;
- entidad;
- antes;
- después;
- fecha.

## Gate
Acciones administrativas críticas auditables.

---

# Fase 13 — PWA y offline base

## Objetivo
Mantener usable la aplicación ante pérdida de Internet.

## Implementar
- PWA;
- Service Worker;
- IndexedDB;
- detección de conectividad;
- caché de catálogo;
- estado visual;
- sesión offline previamente validada.

## Pruebas
- iniciar online;
- desconectar;
- consultar productos;
- consultar categorías;
- consultar modificadores;
- consultar mesas sincronizadas.

## Gate
La aplicación no queda inutilizable al desconectarse.

---

# Fase 14 — Operaciones offline

## Objetivo
Capturar trabajo localmente.

## Implementar
- OperacionOffline;
- cola;
- PENDING;
- SYNCING;
- SYNCED;
- FAILED;
- CONFLICT.

Permitido:
- crear Pedido;
- agregar Item;
- crear Comanda;
- registrar Pago local.

## Pruebas
Sin Internet:
- crear Pedido;
- agregar 3 tacos;
- recargar aplicación;
- confirmar persistencia.

## Gate
No se pierden operaciones al cerrar/reabrir.

---

# Fase 15 — Sincronización offline

## Objetivo
Sincronizar de forma segura al recuperar conexión.

## Implementar
- reintentos;
- orden;
- idempotencia;
- conflictos;
- recuperación;
- indicador de pendientes.

## Pruebas
- REGISTER_PAYMENT offline;
- reconectar;
- simular envío duplicado;
- verificar un solo Pago.

Comanda offline:
- debe aparecer como no recibida por cocina hasta confirmación del servidor.

## Gate
Sin duplicación de pagos, Pedidos o movimientos.

---

# Fase 16 — Reportes

## Objetivo
Mostrar información útil y confiable.

## Implementar
- ventas del día;
- número de Pedidos;
- ticket promedio;
- método de pago;
- productos más vendidos;
- cancelaciones;
- diferencia de caja.

## Pruebas
Dataset controlado:
- 10 Pedidos;
- $1000 ventas;
- ticket promedio esperado: $100.

Comparar reportes contra transacciones.

## Gate
Reportes exactos.

---

# Fase 17 — Pruebas E2E y regresión completa

## Objetivo
Validar el sistema como producto integrado.

## Flujo principal
```text
Mesero login
→ Mesa 3
→ Agrega productos
→ Envía Comanda
→ Taquero prepara
→ Marca LISTA
→ Mesero entrega
→ Caja cobra
→ Pedido cierra
→ Caja realiza corte
```

## Casos críticos
- mesa ocupada;
- producto agotado;
- pago duplicado;
- PIN incorrecto;
- Mesero intentando cobrar;
- cancelación;
- Internet cae;
- reconexión;
- cierre con pago pendiente;
- sesión expirada.

## Gate
Cero errores críticos abiertos.

---

# Fase 18 — Producción

## Objetivo
Preparar operación real.

## Implementar
- despliegue;
- HTTPS;
- variables de producción;
- backups;
- restauración;
- logs;
- monitoreo;
- política de actualización;
- documentación final.

## Prueba crítica
No basta con crear backup.

Debe probarse:
```text
crear backup
→ restaurar en ambiente limpio
→ verificar datos
```

## Gate
Sistema listo para una jornada real completa.

---

# Formato de cierre de cada fase

```text
FASE:
[Nombre]

ESTADO:
PASS / FAIL

IMPLEMENTADO:
- ...

PRUEBAS EJECUTADAS:
- ...

RESULTADOS:
- ...

REGRESIONES VERIFICADAS:
- ...

PROBLEMAS ENCONTRADOS:
- ...

SOLUCIONES APLICADAS:
- ...

DECISIONES TÉCNICAS:
- ...

DOCUMENTACIÓN ACTUALIZADA:
- ...

DEUDA TÉCNICA DETECTADA:
- ...

PUEDE AVANZAR A LA SIGUIENTE FASE:
SÍ / NO
```

Aunque sea PASS, detenerse.
