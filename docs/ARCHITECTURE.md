# Arquitectura APU-05 // PRISMA+ v5.3

Este documento detalla las decisiones técnicas y la estructura del ecosistema **APU-05** para el análisis cualitativo mixto.

## 🏗️ Estructura del Proyecto

La aplicación sigue una **Arquitectura Limpia Modular** (Clean Architecture) desacoplada:

- **src/core/**: Lógica de negocio e integridad de datos.
  - `Database.js`: Singleton de persistencia (Dexie.js).
  - `Parser.js`: Implementación del Contrato APU-04 (R13).
  - `SearchEngine.js`: Minería textual (KWIC) mediante Workers.
  - `StatsEngine.js`: Análisis estadístico de Log-Likelihood (G2).
  - `SemanticEngine.js`: IA Semántica local (Transformers.js).
- **src/ui/**: Capa de presentación.
  - `App.js`: Controlador principal (Event-driven).
  - `Renderer.js`: Manipulación atómica del DOM.

## 🛡️ Principios de Rigor

Este proyecto se rige por la filosofía definida en el documento de [Principios Metodológicos y Hoja de Ruta](METHODOLOGY_ROADMAP.md).

1. **Local-First (R8)**: Privacidad absoluta. Los datos nunca salen del hardware del investigador.
2. **Inmutabilidad (R5)**: El corpus (`cleanedText`) es sagrado y no se modifica tras la ingesta.
3. **Escalabilidad (R14)**: Uso de transacciones masivas y procesamiento en segundo plano (Workers) para manejar hasta 10,000 segmentos.
4. **Validación R13**: Verificación estricta de 9 puntos (V1-V9) en cada carga de archivo.

## 🧪 Estrategia de Pruebas

Se utiliza una suite de pruebas **Vanilla ES2022** que se ejecuta directamente en el navegador (`tests/runner.html`), asegurando que la lógica del `core` sea verificable sin herramientas de construcción externas.
