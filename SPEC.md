# SPEC.md — Especificación Maestra del POS para Taquería

## 1. Objetivo

Construir un sistema POS moderno para una taquería que está comenzando operaciones.

El sistema debe permitir operar desde PC, laptop, tablet o celular, priorizando:

1. rapidez operativa;
2. simplicidad;
3. confiabilidad;
4. buena experiencia de usuario;
5. escalabilidad razonable sin sobreingeniería.

El MVP debe cubrir el ciclo completo de operación diaria sin convertirse en un ERP.

---

## 2. Alcance del MVP

El sistema debe cubrir:

- autenticación;
- roles;
- mesas;
- pedidos para mesa;
- pedidos para llevar;
- productos;
- categorías;
- modificadores;
- comandas;
- cocina;
- cobros;
- apertura y cierre de caja;
- movimientos de caja;
- cancelaciones;
- historial;
- reportes básicos;
- auditoría;
- modo offline tolerante;
- sincronización posterior.

Flujo principal:

```text
Login
→ Abrir caja
→ Abrir mesa / pedido para llevar
→ Tomar pedido
→ Enviar comanda
→ Preparar
→ Marcar lista
→ Entregar
→ Cobrar
→ Cerrar pedido
→ Cerrar caja
```

---

## 3. Fuera del MVP

No implementar inicialmente:

- repartidor;
- delivery;
- Uber Eats / Didi;
- facturación CFDI;
- inventario por ingredientes;
- recetas;
- proveedores;
- compras;
- nómina;
- contabilidad;
- clientes frecuentes;
- puntos;
- reservaciones;
- múltiples sucursales;
- múltiples cajas;
- división de cuentas;
- pagos mixtos;
- promociones complejas;
- descuentos libres;
- integración directa con terminal bancaria;
- inteligencia artificial.

---

## 4. Roles

Solo existirán tres roles:

- MESERO
- TAQUERO
- CAJA

### 4.1 Mesero

Puede:

- iniciar sesión;
- consultar mesas;
- abrir una mesa;
- crear pedido para llevar;
- agregar productos;
- modificar cantidades;
- agregar modificadores;
- agregar extras;
- agregar notas;
- enviar comandas;
- consultar estado;
- agregar nuevas comandas;
- marcar una comanda entregada.

No puede:

- cobrar;
- cambiar precios;
- administrar usuarios;
- cerrar caja;
- acceder a reportes financieros;
- cancelar ventas ya pagadas.

### 4.2 Taquero

Puede:

- consultar comandas;
- ver productos, cantidades, modificadores y notas;
- cambiar estado a PREPARANDO;
- cambiar estado a LISTA;
- marcar productos agotados;
- consultar comandas recientes.

No puede:

- cobrar;
- modificar precios;
- cambiar usuarios;
- hacer movimientos de caja;
- modificar cuentas;
- consultar reportes financieros.

### 4.3 Caja

Caja puede operar normalmente sin PIN adicional.

Funciones normales:

- abrir caja;
- crear pedidos;
- consultar mesas;
- consultar cuentas;
- cobrar;
- registrar efectivo;
- registrar tarjeta;
- registrar transferencia;
- calcular cambio;
- consultar historial;
- registrar entradas y salidas;
- cerrar caja.

Funciones administrativas protegidas con PIN:

- cambiar precios;
- crear productos;
- desactivar productos;
- crear usuarios;
- desactivar usuarios;
- cambiar roles;
- modificar configuración sensible;
- cancelar ventas pagadas;
- ejecutar acciones financieras excepcionales.

El PIN nunca debe almacenarse en texto plano.

---

## 5. Caja única

El MVP tendrá:

- una sola sucursal;
- una sola caja activa;
- un único dispositivo actuando como caja en un momento dado.

Ese dispositivo puede ser PC, tablet o celular.

Se mantiene la entidad `Dispositivo` para:

- auditoría;
- identificación;
- sincronización;
- funcionamiento offline.

---

## 6. Mesas

Cada mesa tendrá:

- id;
- número;
- nombre opcional;
- activa;
- orden.

No guardar un estado persistente LIBRE/OCUPADA.

El estado se deriva:

```text
si existe un pedido abierto → OCUPADA
si no existe un pedido abierto → LIBRE
```

Regla MVP:

```text
1 mesa = máximo 1 pedido abierto
```

No habrá división de cuentas.

---

## 7. Tipo de pedido

Tipos:

- MESA
- PARA_LLEVAR

Reglas:

- MESA requiere una mesa asociada;
- PARA_LLEVAR no debe tener mesa.

---

## 8. Pedido y Comanda

### Pedido

Representa la cuenta completa del cliente.

Ejemplo:

```text
Pedido #145
Mesa 4
Total: $470
```

### Comanda

Representa cada envío a cocina.

Ejemplo:

```text
Comanda 1 → 3 tacos
Comanda 2 → 2 refrescos
Comanda 3 → 2 quesadillas
```

Todas pueden pertenecer al mismo Pedido.

Una nueva ronda de consumo crea una nueva Comanda, no un nuevo Pedido.

---

## 9. Estados

### Pedido

- ABIERTO
- PENDIENTE_PAGO
- PAGADO
- CERRADO
- CANCELADO

### Comanda

- BORRADOR
- ENVIADA
- PREPARANDO
- LISTA
- ENTREGADA
- CANCELADA

### Item

- ACTIVO
- CANCELADO

### Pago

- PENDIENTE
- CONFIRMADO
- CANCELADO
- REEMBOLSADO

### CajaSesion

- ABIERTA
- CERRADA

---

## 10. Productos

Campos principales:

- id;
- categoria_id;
- nombre;
- descripción;
- precio_actual;
- activo;
- agotado;
- orden;
- created_at;
- updated_at.

Diferencia:

- `activo = false`: ya no forma parte del menú;
- `agotado = true`: sigue en el menú, pero temporalmente no puede venderse.

---

## 11. Categorías

Ejemplos:

- Tacos
- Quesadillas
- Bebidas
- Extras

Cada producto pertenece a una categoría.

---

## 12. Modificadores

No crear columnas específicas como:

- con_cebolla;
- con_cilantro;
- con_queso.

Usar grupos reutilizables.

Ejemplo:

```text
Grupo: Tipo de tortilla
mínimo: 1
máximo: 1
obligatorio: sí

Opciones:
- Maíz
- Harina
```

Otro:

```text
Grupo: Extras
mínimo: 0
máximo: 5

- Queso +$10
- Aguacate +$15
- Doble carne +$25
```

---

## 13. Historial de precios

Los Items deben guardar snapshot histórico.

PedidoItem:

- producto_id;
- nombre_snapshot;
- precio_unitario_snapshot.

PedidoItemModificador:

- modificador_id;
- nombre_snapshot;
- precio_snapshot.

Cambiar el precio actual de un producto no debe modificar ventas anteriores.

---

## 14. Dinero

No usar `float` para dinero.

Usar Decimal con precisión definida para:

- precios;
- pagos;
- totales;
- caja;
- reportes.

El backend es la autoridad final del cálculo.

---

## 15. Pagos

Métodos MVP:

- EFECTIVO
- TARJETA
- TRANSFERENCIA

Regla MVP:

```text
1 Pedido = 1 método de pago
```

La base puede conservar relación 1:N entre Pedido y Pago para permitir pagos mixtos en una futura versión.

### Efectivo

Debe cumplirse:

```text
recibido >= total
cambio = recibido - total
```

### Tarjeta

El sistema solo registra que el pago fue realizado mediante tarjeta.

No valida la operación bancaria.

### Transferencia

Puede incluir una referencia opcional.

---

## 16. Pago y cocina

Pago y preparación son independientes.

Debe permitirse:

```text
ordenar → pagar → preparar → entregar
```

y también:

```text
ordenar → preparar → entregar → pagar
```

---

## 17. Caja

Antes de cobrar debe existir una sesión de caja abierta.

Apertura:

- usuario;
- fecha/hora;
- fondo inicial.

Solo puede existir una sesión abierta simultáneamente.

### Movimientos

Tipos:

- ENTRADA
- SALIDA

Campos:

- monto;
- concepto;
- usuario;
- fecha/hora.

### Efectivo esperado

```text
Fondo inicial
+ Ventas en efectivo
+ Entradas
- Salidas
= Efectivo esperado
```

### Corte

```text
diferencia = efectivo contado - efectivo esperado
```

La diferencia se almacena permanentemente.

No permitir cierre de caja si existen pagos offline pendientes de sincronización.

---

## 18. Cancelaciones

### Antes de enviar a cocina

Si la Comanda está en BORRADOR:

- se puede modificar;
- se puede eliminar un Item.

### Después de enviar

No borrar físicamente.

Registrar una cancelación con:

- usuario;
- motivo;
- fecha;
- entidad afectada.

La cocina debe recibir el cambio cuando exista conexión.

### Venta pagada

Requiere:

- PIN administrativo;
- motivo obligatorio.

La venta nunca se elimina.

---

## 19. Auditoría

Auditar al menos:

- LOGIN;
- CREAR_USUARIO;
- DESACTIVAR_USUARIO;
- CAMBIAR_ROL;
- CREAR_PRODUCTO;
- MODIFICAR_PRODUCTO;
- CAMBIAR_PRECIO;
- MARCAR_AGOTADO;
- CANCELAR_ITEM;
- CANCELAR_COMANDA;
- CANCELAR_VENTA;
- ABRIR_CAJA;
- MOVIMIENTO_CAJA;
- CERRAR_CAJA;
- REGISTRAR_PAGO;
- CANCELAR_PAGO;
- RESOLVER_CONFLICTO.

---

## 20. Modelo de datos

### Rol

- id
- nombre
- descripcion

### Usuario

- id
- rol_id
- nombre
- username
- password_hash
- activo
- ultimo_login
- created_at
- updated_at

### Dispositivo

- id
- device_uuid
- nombre
- tipo
- activo
- ultimo_acceso
- created_at

### Mesa

- id
- numero
- nombre
- activa
- orden
- created_at
- updated_at

### Categoria

- id
- nombre
- orden
- activa
- created_at
- updated_at

### Producto

- id
- categoria_id
- nombre
- descripcion
- precio_actual
- activo
- agotado
- orden
- created_at
- updated_at

### GrupoModificador

- id
- nombre
- minimo
- maximo
- obligatorio
- activo
- created_at
- updated_at

### Modificador

- id
- grupo_id
- nombre
- precio_extra
- activo
- orden
- created_at
- updated_at

### ProductoGrupoModificador

- id
- producto_id
- grupo_id
- orden

### Pedido

- id
- folio
- mesa_id nullable
- tipo
- estado
- usuario_creador_id
- subtotal
- total
- created_at
- paid_at nullable
- closed_at nullable

### Comanda

- id
- pedido_id
- numero_secuencia
- estado
- enviado_por
- enviado_at
- preparacion_at nullable
- listo_at nullable
- entregado_at nullable
- cancelado_at nullable

### PedidoItem

- id
- pedido_id
- comanda_id
- producto_id
- nombre_snapshot
- precio_unitario_snapshot
- cantidad
- subtotal
- notas
- estado
- created_at
- cancelled_at nullable

### PedidoItemModificador

- id
- pedido_item_id
- modificador_id
- nombre_snapshot
- precio_snapshot
- cantidad
- subtotal

### Pago

- id
- pedido_id
- cash_session_id
- metodo
- monto
- recibido nullable
- cambio nullable
- referencia nullable
- estado
- usuario_id
- operation_uuid
- created_at
- cancelled_at nullable

### CajaSesion

- id
- usuario_apertura_id
- usuario_cierre_id nullable
- fondo_inicial
- abierta_at
- cerrada_at nullable
- efectivo_esperado nullable
- efectivo_contado nullable
- diferencia nullable
- estado

### MovimientoCaja

- id
- caja_sesion_id
- tipo
- monto
- concepto
- usuario_id
- created_at

### Cancelacion

- id
- entidad_tipo
- entidad_id
- motivo
- usuario_id
- monto_afectado nullable
- created_at

### Auditoria

- id
- usuario_id nullable
- device_id nullable
- accion
- entidad_tipo
- entidad_id nullable
- datos_antes nullable
- datos_despues nullable
- created_at

### OperacionOffline

- id
- operation_uuid
- device_id
- usuario_id
- tipo
- payload
- estado
- retry_count
- last_error nullable
- created_at
- synced_at nullable

---

## 21. Relaciones principales

```text
Rol 1:N Usuario

Mesa 1:N Pedido

Pedido 1:N Comanda
Pedido 1:N PedidoItem
Pedido 1:N Pago

Comanda 1:N PedidoItem

PedidoItem 1:N PedidoItemModificador

Categoria 1:N Producto

Producto N:M GrupoModificador

GrupoModificador 1:N Modificador

CajaSesion 1:N Pago
CajaSesion 1:N MovimientoCaja

Dispositivo 1:N OperacionOffline

Usuario 1:N Auditoria
```

---

## 22. Identificadores

Usar UUID para IDs internos.

El folio visible del pedido es independiente.

Ejemplo:

```text
id = UUID
folio = 154
```

El folio nunca debe usarse como clave primaria.

---

## 23. Fechas

Guardar internamente en UTC.

Mostrar usando la zona horaria configurada del negocio.

Aplicar a:

- pedidos;
- comandas;
- pagos;
- caja;
- auditoría;
- sincronización.

---

## 24. Offline

El sistema será offline tolerant, no totalmente distribuido offline.

Tecnologías:

- PWA;
- Service Worker;
- IndexedDB.

No usar localStorage como base transaccional.

### Datos locales

- sesión válida;
- catálogo;
- categorías;
- modificadores;
- mesas;
- pedidos recientes;
- operaciones pendientes.

### Permitido offline

- consultar catálogo;
- crear pedido;
- agregar Items;
- agregar modificadores;
- guardar Comanda;
- registrar pago local.

### Bloqueado offline

- cambiar precios;
- crear usuarios;
- cambiar roles;
- modificar PIN;
- configuración crítica;
- cerrar caja con pagos pendientes.

---

## 25. Limitación de cocina offline

Si un Mesero crea una Comanda sin Internet, se guarda localmente, pero Taquero puede no recibirla hasta recuperar conexión.

La interfaz debe mostrar algo equivalente a:

```text
Pedido guardado localmente.
Aún no ha sido recibido por cocina.
```

No debe marcarse como enviado hasta recibir confirmación del servidor.

---

## 26. Operaciones offline

Campos:

- operation_uuid;
- device_id;
- user_id;
- type;
- payload;
- created_at;
- status;
- retry_count;
- last_error.

Estados:

- PENDING
- SYNCING
- SYNCED
- FAILED
- CONFLICT

Tipos posibles:

- CREATE_ORDER
- CREATE_COMMAND
- ADD_ITEM
- CANCEL_ITEM
- REGISTER_PAYMENT
- MARK_COMMAND_READY

---

## 27. Idempotencia

Operaciones críticas deben ser idempotentes.

Especialmente:

- pagos;
- creación de pedidos;
- cancelaciones;
- movimientos de caja.

Si una operación con el mismo `operation_uuid` llega dos veces, solo debe procesarse una vez.

---

## 28. Arquitectura técnica

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod
- PWA
- IndexedDB

### Backend

- NestJS
- TypeScript
- REST API
- WebSockets

### Datos

- PostgreSQL
- Prisma ORM

### Infraestructura

- Docker
- Docker Compose
- GitHub
- GitHub Actions

No usar microservicios.

No agregar Redis hasta que exista una necesidad real.

Arquitectura:

```text
Monolito modular
```

---

## 29. Módulos del backend

```text
Auth
Users
Devices

Catalog
  Categories
  Products
  Modifiers

Tables

Orders
  Orders
  Commands
  Items

Kitchen
Payments
Cash
Audit
Reports
Sync
```

---

## 30. Seguridad

- hash seguro de contraseñas;
- hash seguro del PIN administrativo;
- autorización en backend;
- validación backend;
- protección de rutas;
- secretos mediante variables de entorno;
- HTTPS en producción;
- rate limiting donde corresponda;
- logging sin información sensible;
- auditoría de acciones sensibles.

Nunca confiar únicamente en controles del frontend.

---

## 31. UX

Diseño prioritario:

1. tablet;
2. escritorio;
3. móvil.

### Mesero

Navegación:

- Mesas
- Pedidos
- Perfil

### Taquero

- Cocina
- Recientes
- Perfil

### Caja

- POS
- Mesas
- Ventas
- Caja
- Productos
- Reportes
- Usuarios
- Configuración

Las funciones administrativas solicitan PIN cuando corresponda.

---

## 32. KDS Cocina

Mostrar:

- pedidos nuevos;
- mesa o tipo;
- productos;
- cantidades;
- modificadores;
- notas;
- tiempo transcurrido;
- estado.

Ordenar por antigüedad.

Referencia inicial:

- 0–10 min: normal;
- 10–15 min: atención;
- 15+ min: retrasado.

Estos tiempos deben poder configurarse posteriormente.

---

## 33. WebSockets

Usar para:

- nueva Comanda;
- cambio de estado;
- Comanda lista;
- cancelación;
- producto agotado.

WebSocket no es fuente primaria.

Si falla, el cliente debe poder recuperar el estado vía HTTP.

---

## 34. Reportes MVP

- ventas del día;
- número de pedidos;
- ticket promedio;
- ventas por método de pago;
- productos más vendidos;
- cancelaciones;
- diferencia de caja.

No implementar BI avanzado.

---

## 35. Calidad

Configurar desde el inicio:

- TypeScript strict;
- lint;
- formatter;
- typecheck;
- unit tests;
- integration tests;
- e2e;
- build.

CI debe ejecutar:

```text
install
→ lint
→ typecheck
→ tests
→ build
```

---

## 36. Documentación obligatoria

Mantener:

- README.md
- ARCHITECTURE.md
- DATABASE.md
- BUSINESS_RULES.md
- OFFLINE.md
- SECURITY.md
- API.md
- DEPLOYMENT.md

---

## 37. Reglas definitivas

1. Una Mesa solo puede tener un Pedido abierto.
2. Un Pedido puede tener múltiples Comandas.
3. Una Comanda puede tener múltiples Items.
4. Un Item pertenece a una sola Comanda.
5. Una Comanda enviada no se modifica destructivamente.
6. Las ventas pagadas nunca se eliminan.
7. Los precios históricos se guardan mediante snapshots.
8. Mesero no cobra.
9. Taquero no cobra.
10. Caja es el único rol que cobra.
11. Caja opera normalmente sin PIN.
12. Funciones administrativas de Caja requieren PIN.
13. Solo existe una caja activa.
14. Producto agotado no equivale a producto desactivado.
15. MVP admite un método de pago por Pedido.
16. Pago y Cocina son procesos independientes.
17. IDs internos son UUID.
18. Folios visibles no son claves primarias.
19. Valores monetarios usan Decimal.
20. Fechas internas usan UTC.
21. Operaciones offline críticas son idempotentes.
22. No cerrar Caja con pagos pendientes de sincronización.
23. Operaciones administrativas críticas requieren conexión.
24. El usuario siempre debe conocer el estado de conectividad.
25. Una Comanda creada offline puede no llegar a Cocina hasta recuperar conexión.
26. No se promete operación multi-dispositivo totalmente offline.

---

## 38. Definición de MVP terminado

El MVP está terminado cuando puede ejecutarse una jornada completa:

```text
Abrir negocio
→ Iniciar Caja
→ Abrir mesas
→ Tomar pedidos
→ Enviar comandas
→ Preparar
→ Entregar
→ Cobrar
→ Registrar movimientos
→ Consultar ventas
→ Cerrar Caja
→ Comparar efectivo físico contra sistema
```

sin depender de Excel, calculadora externa o libreta para completar la operación básica.
