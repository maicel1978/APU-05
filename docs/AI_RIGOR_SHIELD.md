# 🛡️ APU-05: Analysis & Protocol Utilities (Memory Anchor)
VERSION: 8.2.1 (STABLE WORKBENCH)

## 🏛️ ARQUITECTURA CORE (PROHIBIDO MODIFICAR SIN ALARMA)
- **Base de Datos**: `APU05_Vault_Final_v8` (PK `++_pk`).
- **Orquestador**: `App.js` gestiona `activeMethodId` y `selectStep`.
- **Navegación**: Sidebar con `#workflow-nav` (Pasos) y `#tools-nav` (Herramientas fijas).
- **Lienzo**: `#module-display` para análisis y `#corpus-viewer` para lectura sagrada.

## ❄️ LOGROS SELLADOS (FROZEN)
1. **Paso 1 (INGESTA)**: Gestión de carga por módulo con validación R13.
2. **Paso 2 (CARACTERIZACIÓN)**: Triple tabla (Producción min/wpm, Participación %, Complejidad TTR%).
3. **Paso 3 (ESTRUCTURA)**: Dominancia temática + Evidencia textual bajo barra.
4. **Paso 5 (IMPACTO)**: Tabla M-R-A jerarquizada.

## 🛑 REGLA DE ALARMA ⚠️
Cualquier cambio en la lógica de `App.js` o en el layout de `index.html` requiere aviso previo al investigador.
- Motores de ciencia en `src/science/`.
- Vistas de análisis en `src/modules/`.
- Componentes atómicos en `src/ui/Renderer.js`.
