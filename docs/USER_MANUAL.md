# 🩺 MANUAL METODOLÓGICO | APU-05 // PRISMA+

Bienvenido a la estación de trabajo analítica **APU-05**. Este entorno ha sido diseñado para transformar narrativas cualitativas en evidencia epidemiológica de alto impacto mediante el procesamiento local y privado.

---

## 🏗️ 1. EL FLUJO DE RIGOR (WIZARD)
La aplicación opera bajo el principio de **"Diseño antes que Datos"**. 
1.  **Selección de Diseño**: Debe declarar su intención investigativa (Individual, Exploratorio, etc.). Esto configura los motores de búsqueda para buscar variables específicas (ej. grupos o tiempos).
2.  **Carga Dual**: Se recomienda cargar el archivo `_cleaned.json` junto al de `_trazabilidad.json`. El sistema realizará una **Validación de Herencia** para asegurar que los microdatos de APU-03 (hablantes y covariables) sean íntegros.

---

## 🔍 2. ATLAS DE ANÁLISIS (MÓDULOS)

### A. INDIVIDUAL (El Microscopio)
Ideal para estudios de caso o trayectorias de pacientes únicos.
- **Radiografía**: Conteo atómico de síntomas y medicación detectados por el glosario.
- **Diagnóstico (ABSA)**: Analiza el sentimiento no de forma global, sino en torno a conceptos específicos. ¿Es el dolor lo que causa el sentimiento negativo o es el trato recibido?
- **Mapa de Impacto**: Prioriza problemas cruzando la frecuencia de mención con la carga emocional negativa.

### B. EXPLORATORIO (El Radar)
Diseñado para el primer contacto con una cohorte o gran volumen de entrevistas.
- **Pulso Global**: Estadísticas de volumen y distribución de temas en toda la muestra.
- **Asociaciones**: Detecta qué términos "viajan juntos". Si el paciente dice "soledad", ¿qué otros conceptos suelen acompañarlo? Ayuda a generar hipótesis de causalidad percibida.
- **Atípicos**: Localiza las entrevistas "fuera de la norma" (extremadamente negativas o inusualmente largas) para un análisis cualitativo focalizado.

### C. TRANSVERSAL (El Espejo)
Foco en la comparación de grupos (ej. Casos vs. Controles o Género A vs. Género B).
- **Contraste G²**: Utiliza la métrica Dunning's Log-Likelihood para extraer términos que son estadísticamente representativos de un grupo y no del otro.
- **Disparidad Emocional**: Compara la polaridad media entre brazos del estudio para cuantificar el sufrimiento o bienestar diferencial.

### D. LONGITUDINAL (El Mapa del Cambio)
Para estudios Pre-Post o de seguimiento crónico.
- **Timeline Emocional**: Gráfico de tendencia que muestra si la narrativa del sujeto evoluciona hacia la resolución o el agravamiento.
- **Deriva Temática**: Compara la "mochila de palabras" inicial con la final para ver qué preocupaciones han desaparecido y qué nuevos conceptos han emergido.

---

## 🛠️ 3. SOBERANÍA Y CONFIGURACIÓN
En la pestaña **⚙️ CONFIG**, usted es el soberano:
- **Glosarios CSV**: Puede cargar su propio diccionario de términos clínicos. El sistema dejará de usar el genérico y se adaptará a su especialidad médica en tiempo real.
- **Hard Reset**: Si detecta inconsistencias en la base de datos, el botón "Borrar Sesión" ejecuta una purga física y recarga el sistema para un inicio limpio.

---

## 🛡️ 4. NOTAS DE RIGOR CIENTÍFICO
- **Comparabilidad y Juicio Metodológico**: La comparabilidad de entrevistas cualitativas y cuantitativas depende rigurosamente del diseño del estudio, la población seleccionada, el instrumento de recolección y el procedimiento metodológico; el software no sustituye bajo ninguna circunstancia el entrenamiento ni el juicio metodológico del investigador.
- **Inmutabilidad**: APU-05 nunca modifica su texto original. El rigor exige que la fuente sea sagrada.
- **Privacidad Local-First**: Ningún dato viaja a la nube. El análisis de IA y estadística ocurre en su procesador.
- **Trazabilidad**: ✍️ indica validación humana previa; ⚠️ indica una anomalía de ritmo detectada en la transcripción original.

---
*Versión de Software: 5.3.3 | Metodología PRISMA+ v5.3*
