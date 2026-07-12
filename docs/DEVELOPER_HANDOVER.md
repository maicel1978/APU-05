# 📑 GUÍA DE TRASPASO TÉCNICO (HANDOVER)

## 🎯 Objetivo de la Fase Siguiente
Transformar el prototipo APU-05 en una aplicación de grado comercial/investigación profesional.

## 🛠️ Stack Actual
- **Persistencia**: Dexie.js (IndexedDB).
- **IA**: Transformers.js (Pipeline: feature-extraction).
- **Estadística**: Log-Likelihood (G2) implementado en `StatsEngine.js`.
- **Arquitectura**: Módulos ES2022 desacoplados.

## 📋 Tareas Pendientes Prioritarias

### 1. Robustez de Datos
- Implementar un `SchemaRegistry` en el `Parser.js`. El sistema debe poder "autocorregir" o "mapear" archivos de versiones APU-01 a APU-04.
- Añadir `ExportController` para descargar no solo resultados, sino la "Sesión Analítica" completa (Base de datos + Análisis).

### 2. Optimización de Rendimiento
- Implementar **Intersection Observer** en el `Renderer.js` para virtualizar el scroll del corpus derecho.
- Mover el cálculo de similitud de coseno del hilo principal al `SemanticWorker`.

### 3. Rigor Científico
- Añadir **Cálculo de Frecuencia Normalizada** (PMW: Per Million Words) para que las comparaciones entre grupos de distinto tamaño sean aún más precisas.
- Implementar la visualización de **Trazabilidad**. El sistema debe mostrar visualmente si un segmento fue editado en fases previas.

## 🛑 Reglas Inquebrantables para el Sucesor
- **Local-First Permanente**: No intentar mover el procesamiento a la nube por comodidad. La privacidad es el valor principal.
- **Sin Build Steps**: Mantener la capacidad de "Doble Clic" en el `index.html`.
- **Límite de 350 líneas**: Si un módulo crece más allá, fragmentar en submódulos.
