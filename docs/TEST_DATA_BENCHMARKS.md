# Banco de pruebas y datos de benchmark

## 1. Benchmarks actuales APU-04 5.0.0

### Barreras geriátricas

```text
uploads/barreras_cleaned.json
uploads/barreras_trazabilidad.json
uploads/barreras_quality_report.json
uploads/barreras_edit_log.csv
```

- 9 segmentos.
- 2 hablantes.
- Finalizado por humano.
- Sin anomalías temporales.
- Útil para Individual, Exploratorio y auditoría.

### Gasto de bolsillo

```text
uploads/gasto_cleaned.json
uploads/gasto_trazabilidad.json
uploads/gasto_quality_report.json
uploads/gasto_edit_log.csv
```

- 10 segmentos.
- 2 hablantes.
- Finalizado por humano.
- 4 segmentos señalados por pausas largas.
- Útil para Individual, Exploratorio y auditoría.

La auditoría y hashes están en `V5_BENCHMARK_AUDIT.md`.

### Caso con duración cero

```text
uploads/speakers-5_cleaned (1).json
uploads/speakers-5_trazabilidad.json
uploads/speakers-5_quality_report.json
```

- 49 segmentos.
- Incluye `start === end`.
- Debe cargar con advertencia, sin bloquear el texto ni dividir por cero.

## 2. Caso provisional

```text
assets/test_data/provisional_v5.json
```

- Sintético.
- `finalizedByHuman: false`.
- Sirve únicamente para probar confirmación, cancelación y señalización provisional.

## 3. Archivos históricos 4.0.0

```text
assets/test_data/entrevista01.json
assets/test_data/entrevista02.json
assets/test_data/entrevista03.json
```

Se conservan como evidencia histórica y pruebas de rechazo. El Parser estricto debe indicar que necesitan reprocesarse mediante APU-04 actual.

`entrevista01.json` y `entrevista02.json` son idénticos byte por byte; no representan dos observaciones independientes.

## 4. Glosario histórico

```text
assets/test_data/APU05_Glosario_Maestro_1783541182585.json
```

Es una plantilla v7.7 vacía. Solo prueba compatibilidad del envoltorio, no términos analíticos reales. Ver `GLOSSARY_SCOPE.md`.

## 5. Escenarios manuales

### A. Individual finalizado

1. Seleccionar Individual.
2. Cargar `uploads/barreras_cleaned.json`.
3. Recorrer Caracterización, Estructura, Síntesis, Impacto, Lector y Reporte.
4. Confirmar ausencia de marca provisional.

### B. Exploratorio de cohorte

1. Seleccionar Exploratorio.
2. Cargar simultáneamente `barreras_cleaned.json` y `gasto_cleaned.json`.
3. Confirmar 19 segmentos agregados.
4. Explorar Pulso, Vínculos y Hallazgos con cautela metodológica.

### C. Rechazo histórico

1. Intentar cargar `assets/test_data/entrevista01.json`.
2. Confirmar el mensaje de versión no compatible.
3. Confirmar que no se crea una sesión.

### D. Provisional

1. Cargar `assets/test_data/provisional_v5.json`.
2. Cancelar en el primer intento.
3. Repetir y aceptar.
4. Confirmar banner y reporte provisional.

## 6. Limitación transversal

Los benchmarks gasto y barreras conservan `covariateSchema`, pero sus hablantes tienen `covariates: {}`. No deben usarse para certificar comparación de grupos.
