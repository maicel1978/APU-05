# APU-05 | Analysis & Protocol Utilities (Rigor Edition)

## 🩺 El Proyecto
**Estado: Beta / Release Candidate.**

**APU (Analysis & Protocol Utilities)** es un ecosistema diseñado para la excelencia en la investigación científica. El módulo **APU-05** es la estación de trabajo analítica local-first diseñada para epidemiología clínica y salud pública.

Individual, Exploratorio y capacidades Transversales están operativos en fase beta. Longitudinal e Integridad todavía no deben considerarse módulos terminados. Consulte `docs/RELEASE_CANDIDATE.md`.

## 🏗️ Arquitectura de Máximo Rigor
Basada en la metodología **PRISMA+ v5.3**, la aplicación sigue un patrón de **Micro-Kernel (Cascarón de Plugins)**. Para más detalles sobre la filosofía científica y el roadmap, consulte [docs/METHODOLOGY_ROADMAP.md](docs/METHODOLOGY_ROADMAP.md).

- **Core (Cerebro)**: Gestión de persistencia (Dexie.js), validación R13 y orquestación de módulos.
- **Science (Motores)**: Lógica pura desacoplada (NER, Estadística G2, Sentimiento ABSA, IA Semántica).
- **Modules (Vistas)**: Capas analíticas independientes y desconectables.

## 🛡️ Estándares para el Desarrollador/Agente
Para mantener la integridad del proyecto, cualquier intervención debe respetar:
1. **Vanilla Runtime**: Prohibido el uso de frameworks (React/Vue). Solo JS ES2022+ nativo.
2. **Límite de Extensión**: Ningún archivo debe superar las **350 líneas de código**.
3. **Local-First**: Cero peticiones a servidor. Privacidad absoluta de los datos clínicos.
4. **Soberanía del Investigador**: El usuario siempre elige el diseño de estudio y carga sus propios glosarios.

## 🚀 Inicio Rápido
1. Ejecute `INICIAME.bat` o `python serve.py`.
2. Abra `http://localhost:8000`.
3. Seleccione un diseño metodológico.
4. Cargue un archivo `_cleaned.json` 5.x finalizado por APU-04 y, opcionalmente, su `_trazabilidad.json`. Puede seleccionar ambos a la vez; se emparejan por contenido.
5. Para pruebas actuales use `assets/test_data/benchmarks_v5/barreras/barreras_cleaned.json` o `assets/test_data/benchmarks_v5/gasto_bolsillo/gasto_cleaned.json`; consulte `docs/TEST_DATA_BENCHMARKS.md`.

## 🌐 Despliegue Beta

El repositorio es una aplicación estática sin build de producción. `netlify.toml` publica la raíz y añade headers básicos. Cada Pull Request puede validarse mediante Deploy Preview antes de fusionar a `main`.

La aplicación todavía descarga Dexie y Chart.js desde CDN; por ello la operación estrictamente offline queda como deuda explícita del RC.

---
*Desarrollado bajo estándares de rigor científico para la toma de decisiones en salud pública.*
