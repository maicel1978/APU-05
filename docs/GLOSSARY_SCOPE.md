# Alcance de glosarios en el ecosistema APU

**Estado:** decisión de arquitectura para revisión

## 1. No existe un único glosario para todo el pipeline

La palabra “glosario” se usa para dos responsabilidades distintas. Compartir automáticamente ambos formatos sería peligroso porque puede cambiar el significado de los datos.

## 2. Glosario de APU-04: limpiar y normalizar

APU-04 usa entradas como:

```json
{
  "wrong": "redacción logística",
  "correct": "regresión logística"
}
```

También puede usar `exact: true` para equivalencias declaradas por el investigador.

Su función es:

- corregir errores de transcripción;
- normalizar términos de dominio;
- modificar `cleanedText` antes de finalizar el caso;
- registrar cada sustitución en la trazabilidad.

Este glosario participa en la preparación del corpus. No asigna categorías analíticas.

## 3. Glosario de APU-05: identificar y clasificar

APU-05 usa entradas como:

```json
{
  "term": "dolor crónico",
  "category": "síntomas"
}
```

Su función prevista es:

- localizar conceptos dentro de `cleanedText`;
- agruparlos en categorías analíticas;
- recuperar evidencia;
- alimentar exploración y NER basado en diccionario;
- permitir vocabularios específicos de un estudio.

No debe corregir ni reescribir el corpus heredado de APU-04.

## 4. Unidades anteriores

- APU-02 genera transcripción y no entrega un glosario analítico.
- APU-03 refina hablantes/covariables y no entrega un glosario analítico.
- APU-04 mantiene su diccionario de corrección dentro de su propia responsabilidad.
- Los archivos `_cleaned.json` 5.0.0 no incluyen el glosario de APU-04.
- La trazabilidad puede registrar cuántas correcciones se hicieron y cuáles fueron las modificaciones.

## 5. Regla de interoperabilidad

La compatibilidad obligatoria APU-04 → APU-05 se aplica al corpus, hablantes, covariables, IDs y trazabilidad; no implica que ambos glosarios sean intercambiables.

No se convertirá automáticamente:

```text
wrong/correct → term/category
```

La parte `category` requiere una decisión analítica que no existe en el glosario de limpieza.

## 6. Archivo de prueba actual

`APU05_Glosario_Maestro_1783541182585.json` contiene:

```json
{
  "appName": "APU-05",
  "version": "7.7.0",
  "terms": []
}
```

Por tanto, solo permite comprobar:

- lectura JSON;
- reconocimiento del formato histórico;
- comportamiento correcto ante una biblioteca vacía.

No permite comprobar:

- incorporación de términos;
- categorías;
- deduplicación;
- persistencia;
- exportación e importación circular;
- efecto sobre análisis y evidencia.

## 7. Próxima prueba necesaria

Antes de certificar portabilidad se necesita un fixture sintético no vacío con:

- dos o más categorías;
- términos con mayúsculas y tildes;
- un término duplicado;
- una frase de varias palabras;
- un término presente en `entrevista01.json`;
- un término ausente para comprobar que no crea evidencia falsa.

El fixture debe declarar claramente que es sintético y no un vocabulario clínico validado.

## 8. Revisión científica futura

Antes de la aplicación final se deberá definir:

- quién crea las categorías;
- si pertenecen al estudio o a una especialidad;
- versión y procedencia del glosario;
- si una categoría fue definida por humano o sugerida por IA;
- cómo se documentan cambios;
- cómo se evita presentar frecuencia de diccionario como hallazgo científico.

Principio:

> La IA puede sugerir términos; el investigador decide si pertenecen al glosario y qué significado analítico tienen.
