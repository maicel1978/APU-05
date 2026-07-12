# Herencia de datos APU-04 → APU-05

**Estado:** contrato de trabajo inicial  
**Productor:** APU-04  
**Consumidor:** APU-05

## 1. Principio

APU-05 consume archivos descargados por el usuario. No llama a APU-04 por red y no modifica sus archivos de origen.

Archivo principal:

```text
[base]_cleaned.json
```

Archivos complementarios:

```text
[base]_trazabilidad.json
[base]_quality_report.json
[base]_edit_log.csv
```

Archivo prohibido como entrada analítica:

```text
pii-buffer.local.json
```

## 2. Archivo principal

El esquema actual producido por APU-04 es `5.0.0`:

```json
{
  "schemaVersion": "5.0.0",
  "ecosystem": "APU",
  "unit": "APU-04",
  "stage": "cleaned-text",
  "sourceSession": "string|null",
  "speakers": [],
  "covariateProject": "object|null",
  "covariateSchema": "array|null",
  "finalizedByHuman": true,
  "segments": []
}
```

Cada segmento principal contiene:

```text
segmentId, speakerId, speaker, start, end, cleanedText, confidence
```

## 3. Reglas heredadas obligatorias

1. `cleanedText` es la materia prima analítica.
2. `segmentId` se conserva sin renumerar.
3. `originalText` no se usa como materia prima analítica.
4. `speakers`, `covariateProject` y `covariateSchema` son passthrough de APU-03/VarOps.
5. Las covariables pueden faltar, ser `null`, estar vacías o variar por archivo.
6. APU-05 no asume nombres fijos de covariables.
7. Los placeholders PII tienen identidad solo dentro de su propio caso.
8. La trazabilidad se une por `segmentId`, nunca por posición en el array.
9. Todo resultado debe conservar referencia a caso/sesión y `segmentId`.
10. APU-05 no edita ni sobrescribe los archivos cargados.

## 4. Revisión humana

`finalizedByHuman` informa si el texto quedó congelado tras la revisión.

Regla de producto pendiente de validación final:

- modo normal: no analizar archivos con `finalizedByHuman: false`;
- posible modo de laboratorio: permitir exploración únicamente tras una confirmación explícita y mostrar que los resultados son provisionales.

Nunca debe ignorarse silenciosamente.

## 5. Duración cero

**CONFIRMADO por el investigador y por las pruebas de APU-04:** APU-02 puede producir segmentos, especialmente el último, con `start === end`.

APU-04 decidió conservarlos y marcarlos para revisión en vez de rechazar el archivo completo.

Regla provisional para APU-05:

- conservar el segmento y su texto;
- permitir análisis temático del texto;
- no usar duración cero como tiempo hablado válido;
- no dividir por cero al calcular WPM;
- contabilizar y explicar cuántos segmentos no tienen duración calculable;
- si existe trazabilidad, mostrar `anomalous` y `anomalyReason`;
- no corregir timestamps dentro de APU-05.

Esta regla debe convertirse en pruebas antes de modificar el Parser o StatsEngine.

## 6. Identidad compuesta

Los IDs pueden repetirse entre archivos. Internamente se necesita contexto:

```text
case/session identity + segmentId
case/session identity + speakerId
```

No es seguro usar un único `speakerMap` global por `speakerId` para una cohorte.

La identidad exacta de caso/proyecto se definirá antes de migrar IndexedDB. No debe inventarse a partir de una sola propiedad sin revisar `sourceSession`, nombre de archivo y procedencia.

## 7. Covariables

Uso correcto:

- Individual y Exploratorio deben funcionar sin covariables.
- Transversal requiere una variable adecuada elegida explícitamente.
- Longitudinal requiere identidad de sujeto y variable temporal adecuadas.
- La ausencia de variables avanzadas degrada el análisis; no invalida el texto.

APU-05 debe leer tipos y categorías desde `covariateSchema` cuando estén disponibles, y no deducir significado clínico solo por el nombre de una clave.

## 8. Trazabilidad complementaria

`[base]_trazabilidad.json` contiene, entre otros:

```text
source_hash, sourceRefs, auditLog
segmentId, originalText, wpm, anomalous, anomalyReason,
aiSuggested, editedByHuman, modificationsLog
```

Uso en APU-05:

- auditoría;
- indicadores de calidad;
- evidencia de revisión;
- apéndice metodológico.

No debe sustituir a `cleanedText` ni mezclarse irreversiblemente con el corpus principal.

## 9. Versiones heredadas

El repositorio APU-05 incluye fixtures históricos `4.0.0` y archivos actuales `5.0.0`.

Antes de aceptar ambos se debe crear una tabla de compatibilidad que indique:

- campos presentes;
- campos ausentes;
- adaptación permitida;
- advertencia necesaria;
- pérdida de información;
- pruebas asociadas.

Compatibilidad no significa autocorrección silenciosa.

## 10. Fuentes revisadas

Referencias externas estudiadas:

- `APU-0/docs/APU-HANDOFF.md`
- `APU-0/docs/DATA-CONTRACTS.md`
- `APU-0/docs/APU-COMMON-STANDARDS.md`
- `APU-3/docs/APU-03-DATA-CONTRACTS.md`
- `APU-3/docs/AGENT-GUIDE.md`
- `APU-04/docs/AGENT-GUIDE.md`
- `APU-04/docs/CONTRACTS.md`
- `APU-04/docs/DECISIONS.md`
- `APU-04/src/core/export-package.js`
- pruebas actuales de APU-04

Los repositorios externos son referencias de lectura y no forman parte de este checkout.
