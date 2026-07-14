# Incidencia: topología nula tras seleccionar un diseño

**Estado:** corrección autorizada, pendiente de validación manual  
**Prueba manual de origen:** MT-002

## Síntoma

Después de cargar una entrevista en Individual:

- Transcripción Original falla en `ReaderModule.js`.
- Reporte falla en `AuditEngine.js`.

Ambos intentan llamar `toUpperCase()` sobre `state.topology`, cuyo valor es `null`.

## Causa

`App.activateWorkbench()` guardaba el módulo en `activeMethodId`, pero no trasladaba esa selección al estado analítico compartido.

## Corrección

Se añade una traducción explícita:

```text
individual   → single-case
exploratory  → cohort
transversal  → comparative
longitudinal → longitudinal
integrity    → integrity
```

`App.js` asigna el resultado a `State.topology` al activar el diseño.

## Alcance

No se modifican Reader, Export, AuditEngine, Database, Parser, StatsEngine, IndexedDB ni `index.html`.

El 404 de `favicon.ico` es una incidencia cosmética distinta y no forma parte de esta corrección.

## Prueba manual requerida

1. Seleccionar Individual.
2. Cargar `assets/test_data/benchmarks_v5/barreras/barreras_cleaned.json` (o históricamente `assets/test_data/historicos_v4/entrevista01.json`).
3. Abrir Transcripción Original.
4. Abrir Reporte.
5. Confirmar que ambos muestran contenido y no aparece el error `toUpperCase`.
