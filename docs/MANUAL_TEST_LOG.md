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

**Estado:** fallo reproducido; corrección pendiente de validación
**Fecha:** 2026-07-12
**Commit observado:** `663054f`
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

### Validación pendiente

Repetir el escenario después de la corrección y confirmar que Transcripción Original y Reporte muestran contenido sin los dos errores.
