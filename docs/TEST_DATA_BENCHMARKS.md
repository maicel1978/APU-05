# Banco de pruebas y datos de benchmark

Para un catálogo completo de todos los archivos y subdirectorios de prueba, consulte [`assets/test_data/README.md`](../assets/test_data/README.md).

## 1. Benchmarks actuales APU-04 5.0.0

### Barreras geriátricas

```text
assets/test_data/benchmarks_v5/barreras/barreras_cleaned.json
assets/test_data/benchmarks_v5/barreras/barreras_trazabilidad.json
assets/test_data/benchmarks_v5/barreras/barreras_quality_report.json
assets/test_data/benchmarks_v5/barreras/barreras_edit_log.csv
```

- 9 segmentos.
- 2 hablantes.
- Finalizado por humano.
- Sin anomalías temporales.
- Útil para Individual, Exploratorio y auditoría.

### Gasto de bolsillo

```text
assets/test_data/benchmarks_v5/gasto_bolsillo/gasto_cleaned.json
assets/test_data/benchmarks_v5/gasto_bolsillo/gasto_trazabilidad.json
assets/test_data/benchmarks_v5/gasto_bolsillo/gasto_quality_report.json
assets/test_data/benchmarks_v5/gasto_bolsillo/gasto_edit_log.csv
```

- 10 segmentos.
- 2 hablantes.
- Finalizado por humano.
- 4 segmentos señalados por pausas largas.
- Útil para Individual, Exploratorio y auditoría.

La auditoría y hashes están en `V5_BENCHMARK_AUDIT.md`.

### Caso con duración cero

```text
assets/test_data/benchmarks_v5/duracion_cero/speakers-5_cleaned.json
assets/test_data/benchmarks_v5/duracion_cero/speakers-5_trazabilidad.json
assets/test_data/benchmarks_v5/duracion_cero/speakers-5_quality_report.json
```

- 49 segmentos.
- Incluye `start === end`.
- Debe cargar con advertencia, sin bloquear el texto ni dividir por cero.

## 2. Caso provisional

```text
assets/test_data/provisional_v5/provisional_v5.json
```

- Sintético.
- `finalizedByHuman: false`.
- Sirve únicamente para probar confirmación, cancelación y señalización provisional.

## 3. Archivos históricos 4.0.0

```text
assets/test_data/historicos_v4/entrevista01.json
assets/test_data/historicos_v4/entrevista02.json
assets/test_data/historicos_v4/entrevista03.json
```

Se conservan como evidencia histórica y pruebas de rechazo. El Parser estricto debe indicar que necesitan reprocesarse mediante APU-04 actual.

`entrevista01.json` y `entrevista02.json` son idénticos byte por byte; no representan dos observaciones independientes.

## 4. Glosario histórico

```text
assets/test_data/glosarios/APU05_Glosario_Maestro_1783541182585.json
```

Es una plantilla v7.7 vacía. Solo prueba compatibilidad del envoltorio, no términos analíticos reales. Ver `GLOSSARY_SCOPE.md`.

## 5. Escenarios manuales

### A. Individual finalizado

1. Seleccionar Individual.
2. Cargar `assets/test_data/benchmarks_v5/barreras/barreras_cleaned.json`.
3. Recorrer Caracterización, Estructura, Síntesis, Impacto, Lector y Reporte.
4. Confirmar ausencia de marca provisional.

### B. Exploratorio de cohorte

1. Seleccionar Exploratorio.
2. Cargar simultáneamente `barreras_cleaned.json` y `gasto_cleaned.json` desde `assets/test_data/benchmarks_v5/`.
3. Confirmar 19 segmentos agregados.
4. Explorar Pulso, Vínculos y Hallazgos con cautela metodológica.

### C. Rechazo histórico

1. Intentar cargar `assets/test_data/historicos_v4/entrevista01.json`.
2. Confirmar el mensaje de versión no compatible.
3. Confirmar que no se crea una sesión.

### D. Provisional

1. Cargar `assets/test_data/provisional_v5/provisional_v5.json`.
2. Cancelar en el primer intento.
3. Repetir y aceptar.
4. Confirmar banner y reporte provisional.

## 6. Simulación Transversal

```text
assets/test_data/transversal_simulated_v5/qa-transversal.clinical
assets/test_data/transversal_simulated_v5/
```

Los cuatro corpus simulados contienen dos participantes Control y dos Intervención. Tienen `finalizedByHuman:false`; solo sirven para probar confirmación provisional, selección dinámica de grupos y UI G².

## 7. Limitación transversal

Los benchmarks gasto y barreras conservan `covariateSchema`, pero sus hablantes tienen `covariates: {}`. No deben usarse para certificar comparación de grupos. La simulación Transversal tampoco sustituye la revisión humana final en APU-04.
