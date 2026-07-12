# Política acordada para la ingesta de APU-05

**Estado:** decisiones aprobadas; implementación pendiente

## 1. Versión de corpus

APU-05 aceptará como corpus normal únicamente salidas actuales:

```text
schemaVersion 5.x.x
unit APU-04
stage cleaned-text
```

Los archivos 4.0.0 serán rechazados con un mensaje que explique que pertenecen a un contrato histórico y deben reprocesarse en APU-04.

Esta es una decisión deliberada de rigor. Los fixtures 4.0.0 se conservarán para probar el rechazo y documentar la evolución, no como entradas aceptadas.

## 2. Revisión humana no finalizada

Si un archivo 5.x.x trae:

```json
"finalizedByHuman": false
```

APU-05 preguntará al investigador si desea continuar.

Comportamiento seguro previsto:

- opción predeterminada: cancelar;
- si continúa, marcar la sesión y sus resultados como provisionales;
- no describir el reporte como consolidado;
- conservar una advertencia visible;
- no alterar el archivo fuente.

La confirmación no convierte el archivo en finalizado: solo autoriza una exploración provisional.

## 3. Trazabilidad

`_trazabilidad.json` será complementario y opcional.

- `_cleaned.json` continúa siendo la materia prima.
- La ausencia de trazabilidad no impide análisis descriptivo.
- Su presencia añade auditoría, calidad y procedencia.
- Se empareja por caso y `segmentId`, nunca por posición.
- Una discrepancia entre ambos archivos debe explicarse y no combinarse silenciosamente.

## 4. Tiempos

- `end < start`: error de integridad, se rechaza.
- `end === start`: se conserva como caso heredado conocido y se marca como duración no calculable.
- `end > start`: segmento temporal ordinario.

APU-05 no corrige timestamps.

## 5. Covariables

Las covariables son opcionales y dinámicas:

- su ausencia no bloquea Individual ni Exploratorio;
- Transversal y Longitudinal deben comprobar requisitos propios;
- no se asumen nombres fijos;
- su significado se toma del esquema cuando existe.

## 6. Condición para implementar

Antes de activar el bloqueo de 4.0.0 se necesitan al menos dos salidas 5.0.0 revisadas manualmente para no perder el banco de pruebas de cohortes.

Las entradas preparadas para ese proceso viven en:

```text
assets/test_data/apu04_inputs/
```

No son entradas directas de APU-05. Deben pasar por APU-04 y ser finalizadas por el investigador.
