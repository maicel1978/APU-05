# APU-05 | Analysis & Protocol Utilities (Rigor Edition)

[![Metodología: PRISMA+ v5.3](https://img.shields.io/badge/Metodolog%C3%ADa-PRISMA%2B_v5.3-black.svg)](docs/METHODOLOGY_ROADMAP.md)
[![Estado: Release Candidate 2](https://img.shields.io/badge/Estado-Prototipo_Completo_%2F_RC2-10b981.svg)](docs/CURRENT-STATUS.md)
[![Tests: 104 Pasados](https://img.shields.io/badge/Tests-104_PASS-success.svg)](tests/)
[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-blue.svg)](LICENSE)

## 🩺 El Proyecto

**APU (Analysis & Protocol Utilities)** es un ecosistema de grado investigación diseñado para la excelencia en el análisis cualitativo y cuantitativo mixto de datos narrativos. El módulo **APU-05** constituye la estación de trabajo analítica (*Workbench*) local-first orientada a epidemiólogos clínicos, investigadores en salud pública y ciencias sociales.

El prototipo analítico actual (**v9.5.1 / RC2**) cuenta con los **5 diseños metodológicos plenamente operativos y certificados por 104 pruebas unitarias**:

- **🧬 Módulo Individual (`single-case`)**: Radiografía discursiva (WPM/TTR%), dominancia temática, síntesis analítica y matriz de impacto M-R-A.
- **🌐 Módulo Exploratorio (`cohort`)**: Pulso de cohorte y descubrimiento inductivo ENA mediante **Grafo de Red Léxica en SVG puro** e hipótesis candidatas.
- **⚖️ Módulo Transversal (`comparative`)**: Contraste léxico log-likelihood ($G^2$) y Frecuencia Normalizada (*Per Million Words - PMW*) entre Grupos A vs. B.
- **🛡️ Módulo de Auditoría e Integridad (`integrity`)**: Inspección forense de calidad del corpus, detección de anomalías y visualización del historial de revisión humana/IA (`_trazabilidad.json`).
- **⏳ Módulo Longitudinal (`longitudinal`)**: Cuantificador de Deriva Léxica / *Concept Drift* (tasas de persistencia e innovación entre cortes T1 $\to$ T2 $\to$ T3) con protección inmutable contra inferencias causales automáticas (*Regla R7 / D-038*).

## 🏗️ Arquitectura de Máximo Rigor (Micro-Kernel)

Basada en los estándares **PRISMA+ v5.3**, la aplicación sigue un patrón **Micro-Kernel desacoplado sin pasos de compilación (*No-Build ES2022+*)**:

- **Core (`src/core/`)**: Persistencia transaccional local (`Dexie.js` / IndexedDB V8), validación R13 estricta para esquemas APU-04 5.x (`Parser.js`) y orquestador de sesiones de cohorte multi-caso.
- **Science (`src/science/`)**: Motores matemáticos y científicos puros aislados del DOM (Extractor Híbrido NER, ABSA Sentimiento, Motor Estadístico $G^2$/PMW, Saliencia ENA *leave-one-out*, Deriva Léxica *Concept Drift* y generador de memorias técnicas forenses `AuditEngine.js`).
- **Modules (`src/modules/`) & UI (`src/ui/`)**: Vistas metodológicas independientes, visor virtualizado sagrado de transcripción (`#corpus-viewer` / `IntersectionObserver`) y herramientas transversales (*Glosario, Reportes Markdown `.md`, Ayuda*).

## 🛡️ Estándares Inquebrantables del Ecosistema

Cualquier intervención de un humano o agente de IA debe respetar el escudo analítico del proyecto (`docs/AI_RIGOR_SHIELD.md`):
1. **Vanilla Runtime (`R1`)**: Prohibido el uso de frameworks pesados de UI (React, Vue, D3.js). Solo JavaScript ES2022+ nativo de ejecución directa.
2. **Límite de Extensión (`R10`)**: **Ningún archivo de código de producción supera las 350 líneas de código**. La modularidad atómica está verificada por auditoría automática.
3. **Local-First Permanente (`R8`)**: Privacidad absoluta del paciente. Los datos clínicos se procesan al 100% en el hardware del investigador sin llamadas a servidores externos en la nube.
4. **Inmutabilidad del Corpus (`R5`)**: La evidencia primaria (`cleanedText`) de APU-04 no se modifica ni se renumeran sus IDs tras la ingesta.
5. **No-Inferencia Causal Automática (`R7 / D-038`)**: Prohibido generar afirmaciones o inferencias causales automáticas. Los análisis temporales describen fluctuaciones discursivas (*Concept Drift*).

## 🚀 Inicio Rápido y Pruebas Locales

1. Clone el repositorio y ejecute `INICIAME.bat` o inicie un servidor estático (`python serve.py`).
2. Abra `http://localhost:8000` en cualquier navegador web moderno.
3. Seleccione un diseño metodológico en el *Entry Gate*.
4. Cargue los archivos de materia prima 5.x generados por APU-04 (`_cleaned.json` y/o `_trazabilidad.json`).
5. **Archivos de prueba incluidos**: Explore la carpeta `assets/test_data/README.md`, donde encontrará benchmarks clasificados (`benchmarks_v5/barreras/`, `benchmarks_v5/gasto_bolsillo/`, `provisional_v5/`, entre otros).

### Ejecución de Suite de Rigor Analítico (ES2022+ Node Runner)
Para verificar la integridad matemática y estructural del sistema en cualquier momento:
```bash
npm test
```
*(Ejecuta las 104 pruebas unitarias en `tests/node/*.test.mjs` bajo Node LTS >= 18 sin requerir dependencias de transpilación).*

## 🌐 Despliegue en la Nube (Netlify & Deploy Previews)

La aplicación está preparada para despliegue estático continuo mediante `netlify.toml`, publicando la raíz y aplicando cabeceras de seguridad HTTP (*nosniff, DENY X-Frame, Cache-Control*). Cada *Pull Request* en GitHub genera automáticamente un **Deploy Preview** interactivo para validación en línea antes de la fusión a la rama `main`.

*(Nota técnica sobre Deuda RC: La aplicación carga en runtime `Dexie.js` y `Chart.js` desde CDN por diseño estático flexible en navegador; su empaquetamiento estático local en `assets/vendor/` para operación 100% air-gapped aislada sin red queda planificado para el salto hacia APU-06).*

## 📑 Documentación y Traspaso Científico

Para profundizar en las decisiones teóricas, matemáticas y de ingeniería del repositorio:
- [Guía Maestra Operativa para Agentes y Desarrolladores (Handover)](docs/DEVELOPER_HANDOVER.md)
- [Estrategia de Recuperación y Reglas del Ecosistema](docs/RECOVERY_STRATEGY.md)
- [Hoja de Ruta Metodológica PRISMA+ v5.3](docs/METHODOLOGY_ROADMAP.md)
- [Bitácora de Decisiones Científicas (Decision Log D-001 a D-044)](docs/DECISION_LOG.md)
- [Estado Actual del Prototipo Analítico (v9.5.1)](docs/CURRENT-STATUS.md)

## 📄 Licencia

Este proyecto está bajo la [Licencia MIT](LICENSE) — Copyright &copy; 2026 APU Scientific Ecosystem Contributors.

---
*Desarrollado bajo estrictos estándares de rigor científico para la investigación cualitativo-cuantitativa en salud pública.*
