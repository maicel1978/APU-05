# 🚩 PRISMA+ v5.2 | AUDIT & DOUBT MANIFEST (Handoff)
**Status**: Critical Review for v9.5.1 -> v9.6.0
**Target**: Next Agent Session

## ⚠️ ALARMA DE ESCEPTICISMO METODOLÓGICO
Este documento es una barrera contra la complacencia. El próximo agente **DEBE** validar los siguientes puntos antes de añadir código nuevo:

### 1. El Espejismo de la "Sorpresa" (ENA)
- **Duda**: El cálculo en `DiscoveryEngine.js` usa Frecuencia Relativa Normalizada.
- **Riesgo**: Sin un corpus de referencia (ej. lenguaje estándar vs. lenguaje clínico), el "Factor de Sorpresa" es arbitrario.
- **Acción Obligatoria**: Revisar la función `calculateSurprise()` y exigir una prueba con datos sintéticos que demuestre que no detecta falsos positivos.

### 2. La Fragilidad del State Proxy
- **Duda**: El objeto `App.state` en `State.js` es reactivo, pero ¿están todos los módulos suscritos correctamente?
- **Riesgo**: Si un módulo escribe directamente en `App.state` sin pasar por el `Registry.js`, se rompe la trazabilidad (Auditoría).
- **Acción Obligatoria**: Verificar que `TransversalModule.js` no use variables globales ocultas.

### 3. El Vacío Longitudinal
- **Duda**: Se ha prometido "Concept Drift" basado en entropía.
- **Riesgo**: No hay código que calcule distancias vectoriales o cambios de frecuencia temporal reales. Es solo un placeholder visual.
- **Acción Obligatoria**: NO implementar la UI del módulo Longitudinal hasta que la lógica matemática esté verificada en un `test/`.

### 4. Errores Recurrentes (Caja de Pandora)
- **UpgradeError**: Si cambias el esquema de IndexedDB sin subir el `v=8`, la app morirá silenciosamente en el próximo agente.
- **Import Hell**: Si un archivo en `/src/modules/` excede las 350 líneas, la fragmentación actual NO tiene un gestor de dependencias claro.

## 📝 REGISTRO DE FRACASOS PASADOS (No repetir)
1. **Intento de usar D3.js**: Falló por la restricción de Vanilla JS sin dependencias externas pesadas. Se debe usar SVG puro.
2. **Carga masiva de JSON**: Bloqueó el hilo principal. Se requiere `requestIdleCallback` para el procesamiento de grandes corpus.
3. **Estilos redundantes**: Se intentó usar Bootstrap; se eliminó para volver al "Pencil-style" (Swiss monochromatic).

---
*Firmado: Auditor QA (Sección previa)*
