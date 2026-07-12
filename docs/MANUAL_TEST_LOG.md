# Registro de pruebas manuales

Este documento conserva las validaciones realizadas por el investigador en su equipo local.

## MT-001 — Acceso local e ingesta Individual

**Estado:** aprobada  
**Fecha:** 2026-07-12  
**Commit de referencia:** `2b2fcb7`  
**Entorno:** Visual Studio Code + Live Server

### Escenario

1. Abrir `index.html` mediante **Open with Live Server**.
2. Entrar al módulo Individual.
3. Cargar `assets/test_data/entrevista01.json`.

### Resultado confirmado

- La aplicación fue accesible en local.
- El archivo se cargó en Entrevista Individual.

### Alcance de la validación

Esta prueba confirma arranque e ingesta básica. Todavía no certifica los resultados de Caracterización, Estructura, Síntesis, Impacto, persistencia ni otros diseños.

### Validado por

Investigador principal, confirmación durante la sesión de recuperación.

---

## MT-002 — Herramientas fallan por topología nula

**Estado:** corregida y aprobada por el investigador
**Fecha de detección:** 2026-07-12
**Commit con fallo:** `663054f`
**Commit validado:** `26518a5`
**Entorno:** Visual Studio Code + Live Server + consola de Chrome

### Escenario

1. Abrir Individual.
2. Cargar `assets/test_data/entrevista01.json`.
3. Explorar Transcripción Original y Reporte.

### Resultado observado

- ReaderModule lanzó `TypeError` al ejecutar `state.topology.toUpperCase()`.
- AuditEngine lanzó el mismo tipo de error al generar el reporte.
- La selección Individual estaba guardada en `App.activeMethodId`, pero `State.topology` seguía en `null`.

### Incidencia separada

Chrome informó `favicon.ico 404`. Es cosmética y no causó los fallos funcionales.

### Resultado posterior a la corrección

El investigador confirmó que todo el escenario funciona correctamente en `26518a5`. Transcripción Original y Reporte muestran contenido y los errores de topología nula desaparecieron.

---

## MT-003 — La plantilla histórica de glosario es rechazada

**Estado:** corrección aprobada con alcance limitado
**Fecha:** 2026-07-12
**Commit con fallo:** `246efc2`
**Commit validado:** `5e1dbf8`
**Entorno:** Visual Studio Code + Live Server + consola de Chrome

### Escenario

1. Abrir Glosario.
2. Seleccionar Portabilidad.
3. Cargar `assets/test_data/APU05_Glosario_Maestro_1783541182585.json`.

### Resultado observado

El gestor lanzó `Formato de glosario no compatible` porque la plantilla v7.7 usa `terms`, mientras el formato actual usa `custom_glossary`.

### Resultado posterior a la corrección

La plantilla fue reconocida como biblioteca compatible vacía y la consola no mostró errores.

### Límite de esta prueba

El fixture contiene `terms: []`. La prueba valida compatibilidad del envoltorio histórico, pero no valida importación real, categorías, persistencia ni efecto analítico. Ver `GLOSSARY_SCOPE.md`.

---

## MT-004 — Flujo Individual con salida APU-04 5.0.0

**Estado:** aprobada por el investigador
**Fecha:** 2026-07-12
**Commit validado:** `afb6a2b`
**Entorno:** Visual Studio Code + Live Server + consola de Chrome

### Archivo

```text
uploads/speakers-5_cleaned (1).json
```

### Características relevantes

- `schemaVersion: 5.0.0`.
- `finalizedByHuman: true`.
- 49 segmentos.
- Incluye un segmento heredado con `start === end`.

### Resultado confirmado

El investigador confirmó que el flujo completo indicado funcionó correctamente y que la consola quedó sin errores. El segmento de duración cero no bloqueó la carga ni los módulos analíticos.

### Alcance

Esta prueba certifica el comportamiento actual del flujo Individual con el fixture 5.0.0. Todavía no certifica carga conjunta de trazabilidad, exactitud matemática de métricas ni validez científica de las interpretaciones.

---

## MT-005 — Creación manual de cohorte QA 5.0.0

**Estado:** aprobada
**Fecha:** 2026-07-12
**Commits de carga:** `0c13354`, `90a8e8f`, `0a87cac`

### Procedimiento

El investigador cargó dos entradas APU-03 sintéticas en APU-04, revisó los segmentos, finalizó ambos casos y exportó sus paquetes completos.

### Resultado

Los paquetes de gasto de bolsillo y barreras geriátricas superaron controles de contrato, integridad referencial, emparejamiento por `segmentId`, calidad y procedencia criptográfica.

### Hallazgo

Los registros distinguen interacción humana de cambio textual real. Ver `V5_BENCHMARK_AUDIT.md`.

---

## MT-006 — Parser estricto y estado provisional

**Estado:** aprobado por el investigador
**Fecha de preparación:** 2026-07-12
**Commit validado:** `a6991d0`

### Escenarios

- Rechazar `entrevista01.json` 4.0.0.
- Aceptar `barreras_cleaned.json` 5.0.0 finalizado.
- Cancelar y luego aceptar `provisional_v5.json`.
- Mostrar banner y reporte provisional.
- Aceptar `speakers-5_cleaned (1).json` con duración cero.

### Resultado

El investigador confirmó 18/18 en navegador, rechazo 4.0, carga de barreras 5.0, comportamiento provisional y consola limpia. Se autorizó avanzar.

---

## MT-007 — Trazabilidad opcional y persistencia forense

**Estado:** aprobada por el investigador
**Fecha de preparación:** 2026-07-12
**Commit validado:** `27af8d5`

### Escenarios

- Individual con `barreras_cleaned` + `barreras_trazabilidad`.
- Individual solo con `gasto_cleaned`.
- Rechazo de un par cruzado barreras/gasto.
- Exploratorio con los cuatro JSON de corpus y trazabilidad.
- Verificación del store IndexedDB `audit`.

### Resultado

El investigador confirmó que todos los escenarios pasaron: carga con/sin trazabilidad, nueve registros en `audit`, rechazo de par incorrecto, cohorte completa y consola sin errores.

---

## MT-008 — Identidad compuesta de hablantes

**Estado:** aprobada por el investigador
**Fecha de preparación:** 2026-07-12
**Commit validado:** `d5bc648`

### Escenario

Cargar en Exploratorio los corpus y trazabilidades de barreras y gasto. Revisar Caracterización y Transcripción Original.

### Resultado

El investigador confirmó que todo funciona: identidades separadas, etiquetas correctas, trazabilidad conservada y consola sin errores.

---

## MT-009 — Transversal G² con simulación VarOps

**Estado:** pendiente de validación manual
**Fecha de preparación:** 2026-07-12

### Escenario

Cargar los cuatro corpus de `transversal_simulated_v5`, aceptar su estado provisional y abrir Contraste Léxico.

### Criterio

- Covariable `grupo_estudio` disponible.
- Valores Control e Intervención.
- Selección A/B obligatoria y diferente.
- 2 participantes por grupo.
- 8 segmentos incluidos y 4 excluidos.
- “acompañamiento” orientado a Intervención y “contraseña” a Control.
- G²/PMW visibles; sin lenguaje de efecto clínico.
- Consola limpia.
