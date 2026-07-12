# 📏 ESTÁNDARES DE CÓDIGO Y DISEÑO (HANDOVER)

Para el agente que continúe el desarrollo de APU-05:

## 1. Patrones de Diseño
- **State Management**: Se utiliza un objeto `Proxy` en `src/core/State.js`. No use variables globales dispersas. Cualquier cambio en el estado debe notificar a la UI mediante `onStateChange`.
- **Plugin System**: Los módulos en `src/modules/` deben exportar un objeto con `id`, `label`, `steps` y `renderStep`. Siga el modelo de `IndividualModule.js`.
- **Worker Isolation**: Las tareas pesadas (>200ms) DEBEN ir en un Web Worker. Use el patrón de `SearchEngine.js` para evitar errores de interpolación.

## 2. Calidad de Software
- **Defensividad**: Siempre use `try-catch-finally` en operaciones de entrada/salida. Use `Renderer.getHumanErrorMessage` para el feedback.
- **Sanitización**: Todo texto proveniente del JSON debe pasar por `Renderer.sanitize()` antes de tocar el DOM.
- **Asincronía**: Respete el flujo `async/await` en la base de datos Dexie para evitar bloqueos del hilo principal.

## 3. Interfaz Visual
- Estética: **Swiss/Minimalist Blueprint**.
- Colores: Escala de grises técnica. Acentos en negro puro (#000).
- Tipografía: Inter para texto, JetBrains Mono para datos.
- Visualización: Utilice el motor de `src/ui/Charts.js` para mantener la coherencia de los gráficos.
