# APU-05: Analysis & Protocol Utilities — Arquitectura, principios y hoja de ruta

## 🎯 Propósito del Documento
Este documento define la filosofía y orientación científica del módulo **APU-05**. Forma parte de un ecosistema que transforma transcripciones estructuradas provenientes de audio en evidencia narrativa útil para investigación científica.

La orientación del sistema **NO** es crear un software tradicional de análisis cualitativo puro ni reemplazar herramientas especializadas como Atlas.ti o NVivo.

La orientación es:
> "Una plataforma de análisis asistido de datos narrativos orientada a investigadores científicos, especialmente en salud pública, epidemiología, investigación clínica y áreas cuantitativas."

El objetivo es ayudar a investigadores que poseen información textual pero necesitan transformarla en:
- Evidencia organizada.
- Resúmenes científicos.
- Patrones narrativos.
- Hipótesis exploratorias.
- Informes reproducibles.

## 🛡️ Principios Metodológicos Fundamentales
1. **Fuente Primaria**: La transcripción (salida de APU-04) constituye la fuente primaria de información.
2. **Trazabilidad**: Todo resultado generado debe mantener trazabilidad hacia segmentos originales del texto.
3. **Interpretación Humana**: Los algoritmos ayudan a organizar, resumir y explorar información, pero no sustituyen la interpretación científica.
4. **Utilidad sobre Estética**: Se priorizan resultados interpretables y útiles para investigación sobre visualizaciones llamativas sin utilidad científica.
5. **Categorización de Salidas**: La aplicación debe diferenciar claramente entre:
   - **Evidencia directa**: Información explícita presente en la transcripción.
   - **Interpretación asistida**: Patrones o significados sugeridos mediante modelos computacionales o IA.
   - **Hipótesis exploratoria**: Posibles líneas de investigación derivadas del análisis.
   - **Conclusión científica**: Requiere validación mediante diseño de estudio y metodología apropiada.
6. **No-Factualidad de la IA**: APU-05 puede generar análisis asistidos por IA, pero nunca debe presentar interpretaciones exploratorias como hechos demostrados.
7. **No-Inferencia Causal Automática**: Las relaciones causales no deben inferirse automáticamente desde el texto.
   - *Incorrecto*: "El desempleo causa abandono del tratamiento."
   - *Correcto*: "El desempleo aparece mencionado como posible barrera relacionada con dificultades de tratamiento. Este patrón puede generar una hipótesis para investigación posterior."
8. **Transparencia**: La reproducibilidad, auditoría y transparencia son elementos centrales.

## 👤 Diseño Orientado al Usuario
APU-05 está dirigido también a usuarios que no son especialistas en análisis cualitativo ni procesamiento de lenguaje natural. La aplicación debe ser: **intuitiva, explicativa, educativa y metodológicamente responsable.**

La interfaz debe acompañar los resultados con:
- Explicaciones simples.
- Ejemplos de interpretación.
- Advertencias metodológicas.
- Casos de uso.
- *Ejemplo*: En lugar de mostrar solo "Densidad léxica = 0.45", debe incluir: "Representa la diversidad del vocabulario utilizado. No indica por sí sola calidad del discurso."

## 🏗️ Arquitectura General de APU-05
La estructura se divide en módulos que responden a diferentes preguntas científicas:
- **Módulo Individual**
- **Módulo Exploratorio**
- **Módulo Transversal**
- **Módulo Longitudinal**
- **Módulo Auditoría y Calidad**

---

### 🧪 MÓDULO INDIVIDUAL
**Estado**: Primera implementación / Prototipo.
**Objetivo**: Analizar una única transcripción estructurada (entrevista, conferencia, exposición científica, etc.).
**Entrada**: JSON estructurado (metadata, speakers, segments con timestamps y cleanedText).

**Componentes Iniciales**:
1. **Radiografía de entrevista**: Métricas de segmentos, palabras, duración, velocidad y participación.
2. **Estructura narrativa**: Identificación de elementos relevantes (frecuencias, términos distintivos, TF-IDF, n-gramas). Evita presentar frecuencia simple como descubrimiento.
3. **Línea temporal narrativa**: Evolución del discurso, alternancia de hablantes y momentos relevantes.
4. **Síntesis asistida por IA**: Resumen ejecutivo, ideas centrales, conclusiones, limitaciones y recomendaciones, conservando siempre evidencia textual.

---

### 🚀 FASE DE CONSOLIDACIÓN: MÓDULO EXPLORATORIO (v9.1.0)
**Estado**: Operativo con motor ENA (Exploratory Narrative Analysis).

**Componentes**:
1. **Pulso de Cohorte**: Caracterización estadística agregada de múltiples entrevistas (N, volumen léxico, diversidad).
2. **Vínculos Narrativos**: Motor de co-ocurrencia léxica por proximidad para detectar asociaciones críticas (Nodo A ↔ Nodo B).
3. **Hallazgos Sorpresa (Outliers)**: Detección de desviaciones temáticas mediante Factor de Sorpresa (Frecuencia Relativa Normalizada).
4. **Guía ENA**: Manual integrado sobre descubrimiento inductivo de patrones.

#### Módulo Transversal
**Objetivo**: Relacionar información narrativa con variables estructuradas (edad, sexo, grupo, exposición).
**Análisis**: Descripción de participantes, comparación entre grupos, frecuencia de temas por características. Representa la conexión más directa con la epidemiología.

#### Módulo Longitudinal
**Objetivo**: Analizar cambios narrativos a través del tiempo (Pre vs Post intervención, seguimiento clínico).
**Funciones**: Evolución temática, aparición de nuevos problemas, persistencia de barreras.

#### Módulo Auditoría y Calidad
**Propósito**: Registro de versión del análisis, archivos, fecha, parámetros, modelos empleados y trazabilidad de resultados.

---

## 🔮 Funciones Futuras (Baja Prioridad Inicial)
- Modelos de tópicos complejos.
- Clustering avanzado.
- Análisis semántico profundo.
- Redes de conceptos dinámicas.
- Análisis afectivo avanzado.

## ⚠️ Funcionalidades con Cautela
1. **Nubes de palabras**: Solo como elemento visual opcional, no como resultado principal.
2. **Análisis emocional**: No debe denominarse diagnóstico emocional ni inferir estados psicológicos clínicos.
3. **Sentimiento automático**: Considerar experimental debido a limitaciones del lenguaje clínico.

## 📑 Casos de Uso
1. **Entrevista a experto**: Extraer conocimiento estructurado y recomendaciones.
2. **Entrevista a pacientes**: Identificar barreras percibidas y necesidades.
3. **Grupo focal**: Comparar opiniones y patrones colectivos.
4. **Conferencia científica**: Generar relatoría y resumen estructurado.

## 🛑 Regla General para Implementaciones
Antes de agregar una nueva métrica o visualización, responder:
1. ¿Qué pregunta científica responde?
2. ¿Qué decisión ayuda a tomar?
3. ¿Es interpretable por el usuario?
4. ¿Aporta información adicional frente a una tabla o texto?
5. ¿Mantiene trazabilidad?
