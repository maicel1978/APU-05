# Implementación Fase 2B — trazabilidad opcional

**Estado:** listo para validación manual

## Funciones implementadas

- Selección conjunta de corpus y trazabilidad en Individual.
- Selección de varios corpus/pares en Exploratorio y Transversal.
- Clasificación por `stage` + `sourceSession`, independiente del nombre y orden.
- Validación completa antes de persistir.
- Corpus sin trazabilidad permitido.
- Rechazo de trazabilidad huérfana, pares cruzados, duplicados y etapas no admitidas.
- Persistencia de segmentos forenses completos en el store `audit` existente.
- Persistencia de `source_hash`, `sourceRefs` y `auditLog` en la sesión.
- Conservación del resumen compacto en segmentos para el lector existente.
- Resumen separado de revisados, cambios reales y anomalías.
- Mensajes de estado con/sin trazabilidad.

## Sin migración

No se cambió `Database.js` ni la versión Dexie. El store `audit` ya existía; ahora se incluye en la misma transacción que sesión, hablantes y segmentos.

## Métricas

```text
total              segmentos con traza
reviewed / edited  interacción humana
changed            before !== after
anomalous          anomalía APU-04
traceabilityCases  casos con complemento
```

## Pruebas automáticas

44 pruebas Node cubren clasificación, Parser, metadatos, registros forenses, resumen, conexión de módulos, orden de confirmación y R10.

La ejecución real de IndexedDB se valida manualmente en navegador porque Dexie se importa como módulo web.

## Límites conocidos

1. Cada caso se guarda en una transacción completa, pero una cohorte de varios casos no usa una única transacción global. Un fallo físico de IndexedDB en un caso posterior podría dejar casos anteriores persistidos aunque no queden activos en la UI.
2. `speakerMap` continúa usando solo `speakerId` y la última sesión. En cohortes donde se repiten `spk-1/spk-2`, las etiquetas pueden confundirse. Debe resolverse mediante identidad compuesta antes de certificar el lector de cohortes.
3. `quality_report.json` y `edit_log.csv` todavía no se cargan desde la interfaz.
4. El módulo visual de Integridad sigue siendo placeholder.

## Archivos protegidos

No se modificaron `App.js`, `index.html` ni el esquema de Database.
