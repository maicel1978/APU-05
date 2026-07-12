# Crear benchmarks 5.0.0 mediante APU-04

## Objetivo

Obtener dos paquetes actuales y honestos para reemplazar como entradas aceptadas a las entrevistas históricas 4.0.0.

## Archivos preparados

```text
assets/test_data/apu04_inputs/qa-geriatria-barreras-speakers-v3.json
assets/test_data/apu04_inputs/qa-gasto-bolsillo-speakers-v3.json
```

Son datos sintéticos derivados de los casos históricos. Usan el contrato real APU-03 `3.0.0` y fueron comprobados con el adaptador, guard de versión y validador actuales de APU-04.

No deben cargarse directamente en APU-05.

## Procedimiento

1. Abrir la versión actual de APU-04.
2. Cargar ambos archivos como lote.
3. Mantener el modo confidencial según el objetivo de la prueba; los datos son sintéticos.
4. Revisar el Panel de calidad.
5. Abrir cada entrevista.
6. Revisar los segmentos y aceptar o editar según corresponda.
7. Finalizar cada entrevista explícitamente.
8. Descargar el paquete de cada caso.

## Archivos que deben regresar a APU-05

Por cada caso:

```text
[base]_cleaned.json
[base]_trazabilidad.json
[base]_quality_report.json
[base]_edit_log.csv
```

No incluir:

```text
pii-buffer.local.json
```

## Verificación antes de incorporarlos

El archivo principal debe incluir:

```text
schemaVersion: 5.0.0
ecosystem: APU
unit: APU-04
stage: cleaned-text
finalizedByHuman: true
```

También se verificará:

- IDs únicos;
- hablantes existentes;
- correspondencia de `segmentId` con trazabilidad;
- texto no vacío;
- tiempos coherentes, permitiendo duración cero documentada;
- covariables conservadas;
- ausencia de PII buffer.

## Nota metodológica

Que los textos sean sintéticos no elimina la revisión humana. `finalizedByHuman` describe una acción real dentro de APU-04, no la procedencia humana o artificial del contenido original.
