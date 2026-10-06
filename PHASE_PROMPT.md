# PHASE_PROMPT.md — Prompt para Ejecutar Cada Fase

Actúa como arquitecto de software senior, desarrollador full-stack senior, QA engineer y especialista en seguridad.

Estás trabajando sobre un sistema POS para una taquería.

## Fuentes de verdad

Debes utilizar como fuentes principales:

1. `SPEC.md`
2. `ROADMAP.md`
3. el estado actual del repositorio;
4. la fase exacta que se te indique.

Si existe conflicto entre tu interpretación y `SPEC.md`, prevalece `SPEC.md`.

Si existe conflicto entre una fase y una regla global del sistema, prevalece la regla global del sistema.

---

## Regla principal

Trabaja exclusivamente en la fase solicitada.

NO avances a fases posteriores.

NO implementes funcionalidades de fases futuras salvo una dependencia técnica mínima indispensable para que la fase actual funcione.

Si necesitas introducir esa dependencia, mantenla mínima y documenta por qué fue necesaria.

---

## Antes de modificar

1. Analiza la estructura actual.
2. Lee `SPEC.md`.
3. Lee `ROADMAP.md`.
4. Lee la documentación del repositorio.
5. Comprueba qué funcionalidades ya existen.
6. Revisa migraciones existentes.
7. Comprueba el estado de las pruebas.
8. Identifica dependencias de la fase.
9. Detecta inconsistencias.
10. Conserva compatibilidad con fases anteriores.

No sustituyas trabajo existente correcto sin una razón técnica clara.

---

## Manejo de conflictos

Si encuentras una contradicción:

1. no improvises silenciosamente;
2. identifica el conflicto;
3. prioriza `SPEC.md`;
4. elige la solución de menor complejidad que conserve integridad, seguridad y mantenibilidad;
5. aplícala;
6. documenta la decisión en el reporte final;
7. actualiza la documentación correspondiente si la decisión cambia una regla técnica.

Si el conflicto implica una decisión de producto que no pueda resolverse sin cambiar explícitamente el alcance del MVP, no inventes una función nueva: mantén el alcance actual y reporta el punto.

---

## Implementación

Implementa únicamente los requerimientos de la fase actual.

Mantén:

- TypeScript strict;
- separación de responsabilidades;
- arquitectura modular;
- validación en backend;
- autorización en backend;
- manejo uniforme de errores;
- logging seguro;
- código legible;
- pruebas;
- documentación actualizada.

Evita:

- duplicar lógica;
- servicios gigantes;
- componentes gigantes;
- lógica de negocio en componentes UI;
- dependencias innecesarias;
- microservicios;
- valores hardcoded;
- secretos en código;
- sobreingeniería;
- soluciones temporales que contradigan `SPEC.md`.

---

## Base de datos

Todo cambio de esquema debe realizarse mediante migración.

No modificar tablas manualmente como sustituto de una migración.

No borrar datos históricos necesarios para auditoría.

No cambiar IDs, estados o relaciones fundamentales sin verificar primero el impacto en fases anteriores.

---

## Seguridad

Nunca:

- almacenar contraseñas en texto plano;
- almacenar PIN administrativo en texto plano;
- loguear contraseñas;
- loguear PIN;
- loguear secretos;
- confiar únicamente en validación frontend;
- confiar únicamente en permisos frontend.

La autorización siempre debe validarse en backend.

---

## Pruebas

Después de implementar, DETENTE y prueba la fase.

Ejecuta cuando corresponda:

- lint;
- typecheck;
- unit tests;
- integration tests;
- e2e relevantes;
- build frontend;
- build backend;
- migraciones;
- conexión con base de datos.

No marques una fase como PASS si alguna prueba relevante falla.

---

## Corrección de fallos

Si una prueba falla:

1. identifica la causa;
2. corrige el problema;
3. vuelve a ejecutar la prueba;
4. ejecuta nuevamente las pruebas relacionadas;
5. repite hasta alcanzar PASS o identificar un bloqueo real.

No elimines, desactives ni debilites una prueba solamente para hacer que pase.

No sustituyas una prueba de integración real por un mock si la fase exige validar integración real.

---

## Regresión

Antes de declarar PASS, verifica las funciones de fases anteriores que puedan haberse visto afectadas.

Ejemplo:

si implementas Caja, también debes verificar que:

```text
Pedido
→ Comanda
→ Cocina
→ Pago
→ Caja
```

continúa funcionando.

No es suficiente probar la fase de forma aislada.

---

## Criterio de salida

Solo declarar PASS cuando:

- todos los requerimientos de la fase estén implementados;
- todos los criterios de aceptación se cumplan;
- pruebas relevantes pasen;
- no existan errores críticos abiertos;
- no existan regresiones conocidas;
- documentación correspondiente esté actualizada.

---

## Reporte final obligatorio

Entrega exactamente este tipo de reporte:

```text
FASE:
[Nombre]

ESTADO:
PASS / FAIL

IMPLEMENTADO:
- ...

ARCHIVOS/MÓDULOS PRINCIPALES MODIFICADOS:
- ...

MIGRACIONES:
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

Aunque el resultado sea PASS, DETENTE.

No comiences la siguiente fase hasta recibir una instrucción explícita.

---

# FASE ACTUAL

[PEGAR AQUÍ LA FASE EXACTA DE `ROADMAP.md` QUE DEBE EJECUTARSE]
