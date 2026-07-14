# Catálogo de Datos de Prueba y Benchmarks (APU-05)

Este directorio constituye el repositorio único y dedicado de datos de prueba, benchmarks y casos históricos del prototipo analítico **APU-05**.

Toda la información contenida en estos archivos es sintética o ha sido rigurosamente anonimizada para validar técnica y metodológicamente los motores analíticos, el analizador sintáctico (*Parser*), el enrutador metodológico y las interfaces de usuario.

---

## 1. Estructura del Catálogo

### 📁 `benchmarks_v5/` — Benchmarks APU-04 (v5.0.0) finalizados
Corpus procesados, limpios y finalizados por revisión humana (`finalizedByHuman: true`) exportados desde APU-04 bajo el contrato v5.0.0. Son las materias primas principales para certificar los módulos **Individual** y **Exploratorio**.

- **`barreras/` (Barreras Geriátricas)**
  - Archivos: `barreras_cleaned.json`, `barreras_trazabilidad.json`, `barreras_quality_report.json`, `barreras_edit_log.csv`
  - Características: 9 segmentos, 2 hablantes. Sin anomalías temporales ni alertas críticas de calidad.
  - Uso metodológico: Caso estándar de referencia para flujo Individual completo (Caracterización, Estructura, Síntesis, Impacto, Lector y Reporte).

- **`gasto_bolsillo/` (Gasto de Bolsillo en Salud)**
  - Archivos: `gasto_cleaned.json`, `gasto_trazabilidad.json`, `gasto_quality_report.json`, `gasto_edit_log.csv`
  - Características: 10 segmentos, 2 hablantes. Incluye 4 segmentos señalados por pausas largas y auditoría de calidad.
  - Uso metodológico: Certificación de visualización de alertas forenses de calidad y análisis exploratorio de cohorte en conjunto con `barreras`.

- **`duracion_cero/` (Estudio de 5 Hablantes con Duración Cero)**
  - Archivos: `speakers-5_cleaned.json`, `speakers-5_trazabilidad.json`, `speakers-5_quality_report.json`, `speakers-5_edit_log.csv`, `speakers-5_cleaned.csv`, `speakers-5_cleaned.txt`
  - Características: 49 segmentos, 5 hablantes. Contiene segmentos históricos donde `start === end` (duración cero).
  - Uso metodológico: Certifica que el Parser estricto v5.x procesa segmentos con duración cero emitiendo una advertencia informativa y continuando el análisis sin dividir por cero ni interrumpir el flujo del usuario.

### 📁 `provisional_v5/` — Casos no finalizados (`finalizedByHuman: false`)
- **Archivos:** `provisional_v5.json`
- **Características:** Archivo sintético en formato v5.0.0 donde el indicador de revisión final humana está en `false`.
- **Uso metodológico:** Valida que el Parser no finge la finalización del documento, presentando una advertencia explícita en la UI y exigiendo confirmación del investigador para iniciar una sesión provisional.

### 📁 `transversal_simulated_v5/` — Simulación para Analítica Transversal y Contraste Léxico ($G^2$)
- **Archivos:** `qa-transversal.clinical`, `qa-transversal-control-01-simulated-v5.json`, `qa-transversal-control-02-simulated-v5.json`, `qa-transversal-intervencion-01-simulated-v5.json`, `qa-transversal-intervencion-02-simulated-v5.json`
- **Características:** Cuatro sesiones simuladas (dos del grupo *Control* y dos del grupo *Intervención*) en v5.0.0 con `finalizedByHuman: false`, asociadas al esquema de covariables clínicas e identidades en `qa-transversal.clinical`.
- **Uso metodológico:** Certifica la capacidad opcional de Contraste Léxico / Keyness ($G^2$ de Dunning) en el módulo **Transversal**, asegurando la correcta asignación de participantes por covariables explícitas (Grupo A vs. Grupo B) y la exclusión de entrevistadores.

### 📁 `apu04_inputs/` — Entradas previas de reprocesamiento (v3.0.0)
- **Archivos:** `qa-geriatria-barreras-speakers-v3.json`, `qa-gasto-bolsillo-speakers-v3.json` y subcarpeta `transversal/` (`qa-transversal-*.json`).
- **Características:** Archivos en formato v3.0.0 (`stage: speaker-refinement`) emitidos por APU-03 antes de pasar por la limpieza y auditoría en APU-04.
- **Uso metodológico:** Sirven como fixtures del ecosistema para pruebas automáticas de interoperabilidad entre unidades APU-03, APU-04 y APU-05.

### 📁 `historicos_v4/` — Archivos obsoletos para pruebas de rechazo (v4.0.0)
- **Archivos:** `entrevista01.json`, `entrevista02.json`, `entrevista03.json`
- **Características:** Archivos heredados bajo el esquema v4.0.0 (`schemaVersion: "4.0.0"` o sin marca v5.0.0 moderna). Nota: `entrevista01.json` y `entrevista02.json` son idénticos byte por byte.
- **Uso metodológico:** Pruebas de rechazo del Parser estricto. Certifican que APU-05 bloquea la carga de versiones 4.0.0 o anteriores con un mensaje pedagógico que explica la incompatibilidad e indica que el archivo debe reprocesarse previamente en APU-04.

### 📁 `glosarios/` — Plantillas y diccionarios de concepto
- **Archivos:** `APU05_Glosario_Maestro_1783541182585.json`
- **Características:** Plantilla histórica vacía en envoltorio v7.7 (`terms: []`).
- **Uso metodológico:** Comprobación de compatibilidad y normalización del formato de glosario analítico entre versiones v7.7 y v8.5 (`custom_glossary`), separando el alcance del glosario analítico conceptual en APU-05 del diccionario de corrección léxica de APU-04.

---

## 2. Advertencia Metodológica Fundamental

> **La comparabilidad de entrevistas y corpus depende estrictamente del diseño del estudio, la población seleccionada, el instrumento de recolección y el procedimiento metodológico.**
> 
> Las herramientas computacionales, los cálculos cuantitativos y la señalización de saliencias del software APU-05 **no sustituyen bajo ninguna circunstancia el entrenamiento metodológico, el rigor epidemiológico ni el juicio científico del investigador**. Un software analítico procesa datos según reglas y algoritmos de soporte asistido, pero la validez externa, la coherencia hermenéutica y la interpretación clínica real corresponden únicamente al investigador.
