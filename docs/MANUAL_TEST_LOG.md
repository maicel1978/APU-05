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
