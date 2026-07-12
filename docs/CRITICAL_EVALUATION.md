# 🔍 EVALUACIÓN CRÍTICA APU-05 (ESTADO ACTUAL)

## ⚠️ Diagnóstico de Riesgos
El prototipo actual es una prueba de concepto exitosa, pero presenta "deuda técnica por diseño" que debe ser resuelta antes de pasar a Fase de Producto:

1. **Gestión de Estado (State Management)**:
   - *Problema*: Actualmente no hay un "Store" centralizado. El estado está disperso en `App.js` y el DOM.
   - *Impacto*: Dificulta la implementación de funciones como "Deshacer/Rehacer" y el seguimiento de cambios complejos en el corpus.

2. **Arquitectura de Workers**:
   - *Problema*: Los Blob Workers inline son excelentes para la portabilidad (monolito), pero son un infierno para el debugging y el testing automatizado fuera del navegador.
   - *Recomendación*: Migrar a archivos de Worker dedicados con un sistema de `WorkerPool` para manejar concurrencia real.

3. **Interfaz de Usuario (Vanilla DOM)**:
   - *Problema*: La R1 (Vanilla JS) es una restricción de rigor, pero sin un sistema de *Templating* o *Web Components*, el código de la UI se volverá inmanejable al añadir funciones como "Árbol de Códigos" o "Redes Semánticas".

4. **Escalabilidad de Memoria**:
   - *Problema*: La indexación semántica carga todos los embeddings en memoria para el cálculo de similitud.
   - *Impacto*: Con >20,000 segmentos, la pestaña de "Conceptos" provocará un crash en dispositivos móviles o laptops con 8GB RAM.

## 📈 Lo que falta para el 10/10 en Producto
- **Sistema de Migraciones**: Dexie.js necesita un esquema de versiones robusto si el formato APU-04 evoluciona.
- **Capa de Abstracción de IA**: No depender solo de un modelo; permitir al usuario elegir entre modelos locales o API externas seguras.
- **Filtrado Avanzado**: La matriz de contraste es estática. Falta un motor de filtrado booleano cruzado (ej. "Mujeres" + "Zona Rural" + "Mención de Dolor").
