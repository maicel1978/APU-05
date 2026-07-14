# 📑 GUÍA DE TRASPASO TÉCNICO Y MAPA OPERATIVO PARA AGENTES (HANDOVER)

**Proyecto:** APU-05 // Analysis & Protocol Utilities  
**Versión Actual:** v9.5.1 (Release Candidate 2 / Prototipo Analítico Completo)  
**Metodología:** PRISMA+ v5.3 / Estándar Workbench local-first  
**Objetivo del Documento:** Orientar a cualquier Agente de IA o Desarrollador que tome el mantenimiento del prototipo durante su uso intensivo o en su transición hacia la Fase Beta Comercial y la conexión con **APU-06**.

---

## 🏛️ 1. Arquitectura del Sistema (Micro-Kernel Desacoplado)

APU-05 opera bajo un patrón de **Micro-Kernel con separación estricta entre Lógica Científica Pura (`science`), Gestión de Estado (`core`) y Vistas Metodológicas (`modules` / `ui`)**.

### Stack Tecnológico e Inmutabilidad
- **Persistencia Local-First (`R8`)**: `Dexie.js` (IndexedDB V8 `APU05_Vault_Final_v8`). Prohibido enviar datos clínicos del paciente a servidores cloud o APIs externas.
- **Runtime Nativo ES2022+ (`R1`)**: Prohibido usar frameworks de UI (React, Vue, Svelte) o herramientas de transpilación pesadas. Todo funciona ejecutando directamente `index.html`.
- **Límite de Extensión (`R10`)**: **Ningún archivo de código de producción puede superar las 350 líneas de código**. Si un módulo o motor crece por encima de este umbral, el agente **debe fragmentarlo en submódulos o clases auxiliares**. La suite de pruebas verifica esta condición.

### Mapeo de Directorios y Responsabilidades
```text
src/
 ├── core/         # Cerebro del Workbench (Persistencia, Sesión y Contratos)
 │    ├── Database.js      # Singleton IndexedDB Dexie (tablas: sessions, speakers, segments, audit, glossaries)
 │    ├── Parser.js        # Validador R13 estricto del contrato APU-04 versión 5.x
 │    ├── Session.js       # SessionManager (transacciones atómicas e identidad de cohorte)
 │    ├── State.js         # Estado reactivo central (Proxy observador por App.js)
 │    ├── StudyDesign.js   # Traductor de métodos a topologías canónicas (single-case, cohort, comparative, etc.)
 │    └── Traceability.js  # Procesadores forenses y resúmenes de auditoría
 │
 ├── science/      # Motores Matemáticos y Científicos Puros (Aislados de la UI)
 │    ├── AuditEngine.js          # Compilador de reportes académicos y memorias técnicas (.md)
 │    ├── GlossaryManager.js      # Gestión, importación y validación de glosarios analíticos
 │    ├── Keyness.js              # Contraste léxico exploratorio Log-Likelihood (G²) y Frecuencia Normalizada (PMW)
 │    ├── LongitudinalEngine.js   # Cuantificador de Concept Drift (persistencia léxica, innovación y Δ WPM)
 │    ├── NarrativeSalience.js    # Detección de saliencias ENA mediante referencia leave-one-out
 │    ├── NER.js                  # Extractor híbrido de entidades clínicas (síntomas, medicamentos, contextos)
 │    ├── Semantic.js             # IA Semántica local experimental (Transformers.js pipeline)
 │    ├── Sentiment.js            # Análisis de polaridad discursiva léxica (ABSA)
 │    └── StatsEngine.js          # Orquestador estadístico general y matrices de adyacencia
 │
 ├── modules/      # Vistas Metodológicas y Herramientas del Workbench
 │    ├── IndividualModule.js     # [UNIDAD] 5 pasos sellados (Ingesta, Caracterización, Estructura, Síntesis, Impacto)
 │    ├── ExploratoryModule.js    # [COHORTE] 5 pasos ENA (Ingesta, Pulso, Vínculos con Grafo SVG, Hallazgos, Hipótesis)
 │    ├── TransversalModule.js    # [DISEÑO] 3 pasos (Ingesta, Variables/Grupos, Contraste G²)
 │    ├── IntegrityModule.js      # [META] 2 pasos forenses (Ingesta y Calidad con filtros e historial de edición)
 │    ├── LongitudinalModule.js   # [TIEMPO] 2 pasos (Ingesta temporal y Evolución con protecciones no causales D-038/R7)
 │    ├── ReaderModule.js         # [HERRAMIENTA 1] Transcripción Original con virtualización de scroll (#corpus-viewer)
 │    ├── GlossaryModule.js       # [HERRAMIENTA 2] Gestor de Glosario de Términos
 │    ├── ExportModule.js         # [HERRAMIENTA 3] Generador y descargador de reportes Markdown (.md)
 │    └── HelpModule.js           # [HERRAMIENTA 4] Ayuda metodológica y advertencias de rigor
 │
 └── ui/           # Componentes DOM Atómicos y Orquestación de Pantalla
      ├── App.js           # [PROTEGIDO] Controlador principal Event-driven (Entry Gate y Navigation)
      ├── Renderer.js      # Manipulación DOM, tostadas, modales provisionales y virtualización con IntersectionObserver
      └── Charts.js        # Wrappers de Chart.js para radiografías de diálogo
```

---

## 🗺️ 2. Mapa Operativo para Resolución de Incidencias (Dónde Tocar)

Cuando el investigador reporte un error o solicite un ajuste durante el uso intensivo del prototipo, el agente debe guiarse estrictamente por esta tabla de enrutamiento técnico:

| Tipo de Incidencia / Solicitud | Archivo(s) a Modificar | Puntos Clave de Atención y Pruebas Asociadas |
| :--- | :--- | :--- |
| **Error en cálculos de contraste entre grupos (G² o PMW)** | `src/science/Keyness.js`<br>`src/science/KeynessGroups.js` | Verificar que no se divida por cero y que el *Per Million Words* conserve precisión. Correr `tests/node/keyness.test.mjs`. |
| **Ajustes en el Grafo de Red Léxica o en la selección de vocabulario ENA** | `src/modules/ExploratoryModule.js`<br>*(métodos `_drawNetworkSvg` y `_getTopVocabularyTerms`)* | Mantener el dibujo en **SVG nativo puro** (prohibido importar D3.js). Verificar la sanitización (`Renderer.sanitize`) al hacer clic en nodos o enlaces. Correr `tests/node/exploratory-graph.test.mjs`. |
| **Fallo al importar o rechazar un archivo JSON de APU-04** | `src/core/Parser.js`<br>`src/core/InputPackage.js` | Mantener el bloqueo explícito a esquemas obsoletos (`4.0.0`) y la advertencia si `finalizedByHuman === false`. Correr `tests/node/parser-current.test.mjs` y `input-package.test.mjs`. |
| **Mejoras en el cálculo de Deriva Temporal o Concept Drift** | `src/science/LongitudinalEngine.js`<br>`src/modules/LongitudinalModule.js` | **Mantener estrictamente el lenguaje descriptivo y no causal (Regla R7 / D-038)**. Toda adición matemática debe certificarse primero en `tests/node/longitudinal-engine.test.mjs`. |
| **Ajustes en la tabla de Auditoría Forense y Log de Edición (`_trazabilidad.json`)** | `src/modules/IntegrityModule.js`<br>`src/science/AuditEngine.js`<br>`src/modules/ExportModule.js` | Garantizar la diferenciación visual entre original (`✔️`), edición humana (`✍️`), sugerencia IA (`🤖`) y anomalía (`⚠️`). Correr `tests/node/integrity.test.mjs`. |
| **Lentitud o congelamiento al desplazar el mouse por miles de segmentos** | `src/ui/Renderer.js`<br>*(método `renderCorpus` y centinela virtual)* | Ajustar el tamaño del bloque (`chunkSize = 50`) o el margen (`rootMargin`) del `IntersectionObserver`. Verificar degradación segura si el navegador no soporta la API. |
| **Problemas al agregar o categorizar términos en el glosario** | `src/science/GlossaryManager.js`<br>`src/science/GlossaryFormat.js` | Respetar la compatibilidad dual histórica (`v7.7` y `v8.5`). Correr `tests/node/glossary-format.test.mjs`. |

---

## 🛑 3. Reglas de Protección y "Zona Roja" (Prohibido Alterar)

Cualquier intervención de un agente de IA en este repositorio está regulada por las normas de defensa del proyecto (`AI_RIGOR_SHIELD.md` y `AUDIT_DOUBT_MANIFEST.md`):

### 1. Zona Roja Protegida (`App.js` e `index.html`)
- **Prohibido refactorizar `src/ui/App.js` o rediseñar la estructura de `index.html`** sin una autorización previa y separada del investigador principal.
- `App.js` gestiona el *Entry Gate*, la variable global `window.APU`, y el ciclo reactivo de `activeMethodId`. Modificar su lógica de enrutamiento puede romper en cadena la navegación de las 4 herramientas globales (`Reader`, `Glossary`, `Export`, `Help`).

### 2. Inmutabilidad de la Evidencia Primaria (`Regla R5`)
- Los objetos ingeridos desde el archivo `_cleaned.json` de APU-04 son **sagrados e inmutables**.
- Prohibido modificar dentro de APU-05 el contenido de `cleanedText`, renumerar el `segmentId`, o "corregir" automáticamente timestamps anómalos donde `start === end` (estos casos se conservan, advierten y excluyen únicamente del divisor de velocidad WPM).

### 3. Prohibición de Inferencia Causal Automática (`Regla R7` / `D-038`)
- El software es un asistente de exploración cualitativa, **no un motor de diagnóstico o inferencia epidemiológica/causal**.
- Al desarrollar o ajustar componentes longitudinales o estadísticos, **está estrictamente prohibido emitir conclusiones causales** (ej. *"El tratamiento causó la reducción de barreras"*). Los resultados deben redactarse en lenguaje exploratorio y descriptivo (ej. *"Se observa una variación temporal en la persistencia del término X entre los cortes T1 y T2"*), adjuntando siempre la nota metodológica de advertencia.

### 4. Límite de 350 Líneas de Código (`Regla R10`)
- Antes de publicar cualquier cambio, el agente debe ejecutar `npm test` y verificar que la prueba `ok 84 - R10: ningún archivo JavaScript de producción supera 350 líneas` pase exitosamente.
- **Acción obligatoria si se supera el límite**: Crear un archivo especializado en `src/science/` o `src/core/` para encapsular la lógica excedente y exportar funciones puras o clases.

---

## 🧪 4. Protocolo de Pruebas y Certificación Antes del Commit

Antes de subir un *commit* a la rama de trabajo de la sesión (`arena/019f5fbd-apu-05` o la rama activa), el agente debe ejecutar obligatoriamente:

```bash
npm test
```

### Suite de 104 Pruebas Node (`tests/node/*.test.mjs`)
La suite de pruebas no requiere compilación y se ejecuta en Node ES2022+ (`node --test`). Certifica:
1. **Contratos e Ingesta**: Rechazo a versiones `4.0.0`, aceptación estricta de `5.0.0`, manejo de duraciones cero (`start === end`) y bloqueo/advertencia en corpus provisionales (`finalizedByHuman === false`).
2. **Identidad Compuesta**: Sesiones multi-archivo (`sessionId::speakerId`) en transacciones masivas de Dexie (`SessionManager`).
3. **Estadística y Motores**: Cálculo exacto de $G^2$, Frecuencia Normalizada WPM/PMW, Saliencia *leave-one-out* ENA inmune a falsos positivos, y Deriva Léxica Longitudinal (`calculateLexicalDrift`).
4. **Auditoría Estática**: Regla R10 (< 350 líneas) y presencia física de archivos protegidos.

---

## 🔮 5. Hoja de Ruta e Horizontes de Revisión Científica (Iteración y Transición Beta)

Durante el uso intensivo del prototipo analítico y en su maduración hacia la **Fase Beta y la articulación con APU-06**, el equipo (Investigador $\leftrightarrow$ Agente) explorará, verificará y desarrollará los siguientes frentes de innovación y rigor científico:

### 1. Desarrollo y Ampliación de Catálogos de Benchmarks Simulados (`assets/test_data/`)
- Crear e integrar nuevos corpora y casos simulados de prueba (`_cleaned.json` y `_trazabilidad.json`) que abarquen diversas topologías (estudios longitudinales de 4+ visitas, cohortes comparativas masivas con desbalance de grupos A vs B, y datos con alta presencia de modismos o ruido acústico heredado).
- Utilizar estos benchmarks para someter a pruebas de regresión y estrés cada nuevo ajuste metodológico antes de aplicarlo con datos clínicos reales del investigador.

### 2. Revisión Empírica y Auditoría Metodológica de Técnicas Científicas (`src/science/`)
- **Estudio detallado del comportamiento de los motores con datos reales**: Evaluar de forma exhaustiva y científica cómo interactúan las técnicas estadísticas e inferenciales actuales (*Contraste Log-Likelihood $G^2$, Frecuencia Normalizada PMW, Factor de Saliencia Narrativa ENA leave-one-out, Matrices de Adyacencia Léxica y Tasas de Deriva Concept Drift*) con las transcripciones reales de salud pública y epidemiología del investigador.
- **Ajuste fundamentado en evidencia**: Refinar o re-calibrar las fórmulas, métodos de tokenización y criterios de exclusión léxica a partir de los hallazgos observados en el testeo clínico.

### 3. Evolución de la Ayuda (`HelpModule.js`) y Enriquecimiento de Reportes (`ExportModule.js`)
- **Ayuda Contextual e Instructiva**: Perfeccionar el módulo de ayuda para que actúe como una verdadera guía pedagógica y metodológica integrada, explicando con ejemplos clínicos sencillos la interpretación correcta de cada métrica (ej. qué representa un $G^2 > 3.84$, cómo interpretar un Delta WPM o qué límites de validez tiene el Grafo de Red ENA).
- **Reportes de Rigor Académico (`AuditEngine.js`)**: Ampliar la profundidad analítica del informe exportable (`.md`) para que compile en un solo documento estructurado por secciones (*Radiografía, Grafo Léxico, Contraste de Cohorte, Saliencias, Trayectoria Longitudinal e Integridad Forense*) con formato listo para anexos de publicaciones científicas o expedientes de auditoría epidemiológica.

### 4. Horizontes Abiertos de Revisión e Innovación Metodológica (Propuestas Exploratorias)
El terreno queda preparado con campo abierto para valorar e implementar, según la necesidad y juicio del investigador, las siguientes capacidades durante la fase Beta:
- **Umbrales Exploratorios Configurables**: Evaluar la conveniencia de permitir al investigador ajustar dinámicamente desde la interfaz (*o en parámetros de proyecto*) los umbrales de co-ocurrencia del Grafo ENA, la frecuencia mínima de palabras en el comparador $G^2$, o el nivel de sensibilidad en la detección de *outliers* discursivos según el diseño de su estudio.
- **Evaluación y Afinamiento de IA Semántica Local (`Semantic.js`)**: Medir el rendimiento y consumo de memoria del *pipeline* de Transformers.js en hardware local, explorando búsquedas de similitud vectorial y agrupamiento temático (*semantic clustering*) bajo estricto cumplimiento local-first sin salida a la nube.
- **Análisis de Sensibilidad Forense**: Estudiar la estabilidad de las hipótesis cualitativas al aislar o excluir segmentos marcados como editados por humanos (`editedByHuman`) o sugeridos por IA (`aiSuggested`).
- **Cierre de Deuda CDN (Portabilidad 100% Air-Gapped / Offline)**: Empaquetar estáticamente `dexie.mjs` y `chart.min.js` en `assets/vendor/` para operar en entornos clínicos aislados de internet sin dependencia de servidores CDN.
- **Conexión Inter-Unidades con APU-06**: Diseñar el contrato de exportación estructurada (`_apu05_evidence.json` / `.apu05`) para alimentar automáticamente la capa de síntesis final e investigación documental de **APU-06**.

---
*Documento sellado y preparado para el testeo científico colaborativo del Ecosistema APU-05.*
