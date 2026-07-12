# 📄 CONTRATO DE DATOS Y HERENCIA (APU-03/04)

Este documento define la estructura de datos que APU-05 debe ser capaz de procesar para garantizar el rigor científico.

## 1. Fuente Primaria (`_cleaned.json`)
Producido por APU-04. Es el "Corpus Sagrado".
- **schemaVersion**: Mínimo 5.0.0.
- **speakers**: Lista de participantes con metadatos heredados de APU-03.
- **covariateSchema**: Definición de microdatos clínicos (esencial para análisis Transversal y Longitudinal).
- **segments**: Array de textos limpios con marcas de tiempo (`start`, `end`) e IDs inmutables.

## 2. Fuente de Auditoría (`_trazabilidad.json`)
Opcional pero recomendada para rigor cualitativo.
- **auditLog**: Registro de intervenciones humanas.
- **segments**: Metadatos de calidad (wpm, anomalous, editedByHuman).

## 3. Reglas de Validación (R13)
El `Parser.js` ejecuta 9 checks obligatorios:
1. `ecosystem === "APU"`
2. `unit === "APU-04"`
3. Consistencia de `speakerId` en cada segmento.
4. Unicidad de `segmentId`.
5. Integridad de marcas de tiempo (end > start).

## 4. Herencia de Microdatos (APU-03)
APU-05 extrae el valor analítico de las **Covariables** definidas en el paso 03. Sin estas variables, los módulos de diseño avanzado (Comparar, Evolución) degradan a análisis descriptivo simple.
