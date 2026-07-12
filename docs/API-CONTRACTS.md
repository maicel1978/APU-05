# 📜 CONTRATOS DE API Y FLUJO DE DATOS (v9.4.0)

## 1. UI ↔️ CORE (State.js)
El estado es un **Proxy Reactivo**. Cualquier cambio en `State.segments` o `State.sessionId` dispara el re-renderizado del módulo activo.
- **Entrada**: Objetos de estado plano.
- **Salida**: Notificación vía `window.onStateChange`.

## 2. CORE ↔️ MOTORES (/science)
- **NER**: `extract(text)` -> Retorna objeto de categorías con términos y conteos.
- **Stats**: `getCorpusStats(segments)` -> Retorna `{production, participation, complexity}`.
- **Sentiment**: `analyze(text)` -> Retorna `{score, label, intensity}`.

## 3. CORE ↔️ MÓDULOS (/modules)
Cada módulo metodológico debe cumplir con:
- `steps`: Array de objetos `{id, label}`.
- `renderStep(stepId, container, state)`: Función asíncrona de dibujo.

## 4. BASE DE DATOS (Dexie.js)
- **Store Principal**: `segments`.
- **Clave Primaria**: `++_pk` (Privada Autoincremental).
- **Índice de Búsqueda**: `sessionId` (Obligatorio para filtrado).
