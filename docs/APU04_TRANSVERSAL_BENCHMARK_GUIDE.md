# Preparar benchmarks Transversales mediante APU-04

## Archivos de entrada

Ubicación:

```text
assets/test_data/apu04_inputs/transversal/
```

Archivos:

```text
qa-transversal-control-01-speakers-v3.json
qa-transversal-control-02-speakers-v3.json
qa-transversal-intervencion-01-speakers-v3.json
qa-transversal-intervencion-02-speakers-v3.json
```

Todos fueron normalizados contra el maestro real:

```text
assets/test_data/transversal_simulated_v5/qa-transversal.clinical
```

y validados con el cargador de Clinical VarOps de APU-03, el contrato APU-03 3.0.0 y el adaptador/validador actual de APU-04.

El `.clinical` documenta el protocolo; no se carga en APU-04. Los cuatro `speakers-v3.json` ya representan la salida APU-03 después de asignar los valores por hablante.

## Contenido

- Datos totalmente sintéticos.
- 3 segmentos por entrevista.
- Un entrevistador sin grupo.
- Un participante con `grupo_estudio`.
- Dos participantes Control.
- Dos participantes Intervención.

No representan eficacia clínica. Los textos se diseñaron exclusivamente para comprobar contraste léxico.

## Procedimiento

1. Abrir APU-04 actual.
2. Cargar los cuatro JSON como lote.
3. Mantener PII apagado; no hay datos reales.
4. Revisar cada caso.
5. Finalizar cada caso por separado.
6. Descargar, como mínimo, `_cleaned.json` y `_trazabilidad.json`.
7. Conservar también `quality_report.json` y `edit_log.csv` para auditoría.

## Nombres sugeridos al subir a APU-05

```text
transversal_control_01_cleaned.json
transversal_control_01_trazabilidad.json
transversal_control_02_cleaned.json
transversal_control_02_trazabilidad.json
transversal_intervencion_01_cleaned.json
transversal_intervencion_01_trazabilidad.json
transversal_intervencion_02_cleaned.json
transversal_intervencion_02_trazabilidad.json
```

Los reportes y CSV pueden seguir el mismo prefijo.

## Verificación posterior

APU-05 comprobará:

- contrato 5.0.0;
- revisión humana final;
- hash de procedencia;
- conservación de `grupo_estudio` en `speakers[].covariates`;
- dos participantes por grupo;
- emparejamiento de trazabilidad;
- ausencia de IDs/timestamps inválidos.
