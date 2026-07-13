# Implementación del Parser estricto APU-04 5.x

**Estado:** listo para prueba manual  
**Fase:** 2A

## Reglas implementadas

- Acepta `schemaVersion` 5.x.x.
- Exige `ecosystem: APU`, `unit: APU-04` y `stage: cleaned-text`.
- Rechaza corpus 4.x con instrucción de reprocesar en APU-04.
- Exige `finalizedByHuman` booleano.
- Si es falso, requiere confirmación antes de persistir.
- Marca estado, vistas, lector y reporte como provisionales.
- Rechaza IDs duplicados, hablantes ausentes, texto vacío y tiempos invertidos.
- Conserva `start === end` con advertencia.
- Mantiene covariables opcionales y dinámicas.
- No modifica el documento cargado.

## Trazabilidad

El Parser ya valida de forma pura una trazabilidad opcional:

- contrato 5.x;
- etapa `trazabilidad`;
- mismo `sourceSession`;
- mismo conjunto de `segmentId`;
- coherencia de `finalizedByHuman`.

La selección conjunta desde la interfaz se implementará en Fase 2B. En 2A la UI continúa cargando el corpus principal solamente.

## Comportamiento provisional

Antes de guardar un archivo no finalizado:

1. se muestra una confirmación;
2. cancelar detiene la ingesta;
3. continuar marca `State.isProvisional`;
4. las vistas metodológicas y el lector muestran una advertencia;
5. el reporte indica estado PROVISIONAL;
6. el archivo descargado incluye `_PROVISIONAL` en el nombre.

## Archivos protegidos

No se modificaron:

- `src/ui/App.js`;
- `index.html`;
- Database ni esquema IndexedDB.

## QA automática

La suite cubre:

- contrato estricto;
- rechazo 4.0.0;
- benchmarks gasto y barreras;
- duración cero real;
- trazabilidad compatible e incompatible;
- corpus provisional sin mutación;
- reportes consolidados y provisionales;
- orden confirmación antes de persistencia;
- señalización provisional;
- R10.

## Prueba manual requerida

1. Rechazar `assets/test_data/historicos_v4/entrevista01.json` con explicación de versión.
2. Cargar `assets/test_data/benchmarks_v5/barreras/barreras_cleaned.json` normalmente.
3. Cargar `assets/test_data/provisional_v5/provisional_v5.json`, primero cancelar y luego continuar.
4. Confirmar advertencia visible y reporte provisional.
5. Cargar `assets/test_data/benchmarks_v5/duracion_cero/speakers-5_cleaned.json` y confirmar que duración cero no bloquea.
