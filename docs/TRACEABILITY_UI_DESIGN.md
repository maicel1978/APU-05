# Diseño Fase 2B — carga opcional de trazabilidad

**Estado:** implementado en Fase 2B; pendiente de validación manual. Ver `TRACEABILITY_IMPLEMENTATION.md`.

## 1. Objetivo de usuario

Permitir dos formas de carga:

```text
Solo [caso]_cleaned.json
```

o:

```text
[caso]_cleaned.json + [caso]_trazabilidad.json
```

El orden de selección y el nombre visible no determinan el emparejamiento. Se usan `stage` y `sourceSession`.

## 2. Clasificación

Un clasificador puro recibirá los JSON leídos y los agrupará así:

- `stage: cleaned-text` → corpus principal;
- `stage: trazabilidad` → complemento forense;
- cualquier otra etapa → mensaje de archivo no admitido en esta pantalla.

Reglas:

- exactamente un corpus por `sourceSession`;
- como máximo una trazabilidad por `sourceSession`;
- trazabilidad sin corpus correspondiente → rechazo;
- dos corpus con el mismo `sourceSession` → rechazo de duplicado;
- nombres de archivo libres, sin depender de sufijos.

## 3. Clasificador implementado

`src/core/InputPackage.js` ya implementa y prueba, sin conectarse a la interfaz:

- emparejamiento por `stage` + `sourceSession`;
- independencia del nombre y orden de archivos;
- corpus sin trazabilidad;
- cohortes con varios pares;
- rechazo de trazabilidad huérfana;
- rechazo de corpus/trazas duplicados;
- rechazo de `quality-report` en este selector;
- inmutabilidad de los documentos recibidos.

## 4. Flujos

### Individual

El selector permitirá uno o dos JSON:

- un corpus limpio;
- opcionalmente su trazabilidad.

No permitirá dos casos distintos.

### Exploratorio y Transversal

El selector permitirá varios paquetes. Todos los archivos se clasifican y validan antes de escribir la primera sesión, evitando una cohorte parcialmente persistida por un error tardío.

## 5. Validación

Cada paquete pasa por `APUParser.validate(cleaned, design, traceability)`.

Si no hay trazabilidad:

- análisis permitido;
- auditoría marcada como no disponible.

Si existe:

- mismo contrato 5.x;
- mismo `sourceSession`;
- mismos `segmentId`;
- finalización coherente.

## 6. Persistencia existente

`SessionManager.createSession(data, trazabilidadData)` ya acepta trazabilidad y crea un mapa por `segmentId`. Actualmente solo conserva en cada segmento una versión compacta:

```text
h = editedByHuman
a = anomalous
r = anomalyReason
```

La tabla IndexedDB `audit` existe en el esquema, pero no se utiliza.

## 7. Riesgo de pérdida forense

Si Fase 2B se limita al comportamiento actual, se perderían al persistir:

- `originalText`;
- `wpm`;
- `aiSuggested`;
- `modificationsLog`;
- `source_hash`;
- `sourceRefs`;
- `auditLog` raíz.

Por tanto, no se describirá como “trazabilidad completa” hasta decidir la persistencia.

## 8. Estrategia recomendada sin migración de esquema

La bóveda ya tiene un store `audit`. Se puede activarlo sin cambiar la versión Dexie:

1. incluir `db.audit` en la transacción de creación;
2. guardar cada segmento forense con `sessionId`;
3. guardar `source_hash`, `sourceRefs` y `auditLog` en el registro de sesión;
4. mantener temporalmente `segment.audit` compacto para compatibilidad del lector;
5. añadir consultas explícitas en `SessionManager`.

Esto evita una migración destructiva, pero requiere pruebas de transacción y restauración antes de aplicarse.

## 9. Resumen de auditoría

No se mezclará revisión con cambio real.

Métricas propuestas:

```text
total             segmentos con trazabilidad
reviewed          editedByHuman === true
changed           existe before !== after
anomalous         anomalous === true
traceabilityCases casos con complemento cargado
```

## 10. Mensajes de interfaz

Ejemplos:

```text
Corpus cargado sin trazabilidad. El análisis está disponible; los detalles forenses no se mostrarán.
```

```text
Trazabilidad verificada: 10 de 10 segmentos emparejados.
```

```text
La trazabilidad pertenece a otro caso (sourceSession diferente). No se combinó ningún archivo.
```

## 11. Puertas antes de implementar

- Fase 2A aprobada manualmente.
- Pruebas puras del clasificador de paquetes.
- Pruebas de rollback: ningún registro parcial si un paquete falla.
- Confirmación de que activar `db.audit` no requiere migración.
- Prueba manual con gasto y barreras, con y sin trazabilidad.

## 12. Fuera de alcance

- importar `quality_report.json`;
- importar `edit_log.csv`;
- mostrar una interfaz completa de auditoría;
- migrar el esquema IndexedDB;
- inferir pares por parecido de nombres.
