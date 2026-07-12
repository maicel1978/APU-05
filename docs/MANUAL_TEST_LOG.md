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

**Estado:** fallo reproducido; corrección pendiente de validación
**Fecha:** 2026-07-12
**Commit observado:** `246efc2`
**Entorno:** Visual Studio Code + Live Server + consola de Chrome

### Escenario

1. Abrir Glosario.
2. Seleccionar Portabilidad.
3. Cargar `assets/test_data/APU05_Glosario_Maestro_1783541182585.json`.

### Resultado observado

El gestor lanzó `Formato de glosario no compatible` porque la plantilla v7.7 usa `terms`, mientras el formato actual usa `custom_glossary`.

### Validación pendiente

La misma plantilla debe ser reconocida como biblioteca compatible vacía, sin excepción no controlada.
