# APU-05 | Analysis & Protocol Utilities (Rigor Edition)

## 🩺 El Proyecto
**APU (Analysis & Protocol Utilities)** es un ecosistema diseñado para la excelencia en la investigación científica. El módulo **APU-05** es la estación de trabajo analítica local-first diseñada para epidemiología clínica y salud pública.

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
5. Para pruebas actuales use `uploads/barreras_cleaned.json` o `uploads/gasto_cleaned.json`; consulte `docs/TEST_DATA_BENCHMARKS.md`.

---
*Desarrollado bajo estándares de rigor científico para la toma de decisiones en salud pública.*
