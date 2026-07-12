# 🧪 BANCO DE PRUEBAS Y DATOS DE BENCHMARK (TEST DATA)

Este documento describe los archivos de prueba integrados en la carpeta `assets/test_data/` para validar el rigor de los módulos de APU-05.

## 📁 Archivos Disponibles
Ubicación: `/assets/test_data/`

1. **`entrevista01.json`**
   - **Diseño**: Individual (Single-Case).
   - **Contenido**: Entrevista focalizada en barreras de salud en geriatría.
   - **Hablantes**: Dr. Monzón y Sr. González.
   - **Utilidad**: Validar el flujo de INGESTA e INDIVIDUAL con diálogos médicos reales.

2. **`entrevista02.json`**
   - **Diseño**: Individual / Evolutivo.
   - **Nota**: Comparte el mismo `sourceSession` que la 01.
   - **Utilidad**: Probar el comportamiento del sistema ante archivos con metadatos idénticos o versiones del mismo caso.

3. **`entrevista03.json`**
   - **Diseño**: Exploratorio / Transversal.
   - **Contenido**: Gasto de bolsillo y toxicidad financiera.
   - **Utilidad**: Al cargarlo junto con `entrevista01.json`, permite probar el **Módulo Exploratorio** (Carga de Cohorte) y detectar patrones cruzados entre diferentes temas de geriatría.

4. **`APU05_Glosario_Maestro_1783541182585.json`**
   - **Estado**: Plantilla base (vacía).
   - **Utilidad**: Probar el motor de IMPORTACIÓN del Módulo de Glosario.

## 🚀 Escenarios de Prueba Recomendados

### Escenario A: Validación de Diseño Individual
1. Seleccionar **INDIVIDUAL**.
2. Cargar `entrevista01.json`.
3. Verificar que el "Certificado de Rigor" reconoce correctamente a los dos hablantes y las variables de geriatría heredadas.

### Escenario B: Stress Test de Cohorte (Exploratorio)
1. Seleccionar **EXPLORATORIO**.
2. Cargar simultáneamente `entrevista01.json` y `entrevista03.json`.
3. Ir al paso **VÍNCULOS** para observar cómo el sistema conecta términos de "Barreras" con "Gasto de Bolsillo".

### Escenario C: Integridad de Versión
1. Intentar cargar `entrevista01.json` (Versión 4.0.0).
2. El sistema debe mostrar una **Advertencia de Versión (V3)** indicando que el archivo no es 5.x.x, pero permitir el análisis manteniendo la compatibilidad hacia atrás.

---
*Nota: Estos datos son sintéticos/anonimizados con fines de desarrollo técnico.*
