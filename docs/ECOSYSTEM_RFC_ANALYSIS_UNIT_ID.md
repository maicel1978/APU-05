# RFC — `analysisUnitId` pseudónimo en hablantes APU

**Estado:** propuesta aprobada en APU-05; pendiente de implementación coordinada en APU-03/APU-04

## 1. Problema

`speakerId` identifica un hablante dentro de una entrevista, pero puede repetirse en otros archivos (`spk-1`, `spk-2`). `sourceSession` identifica un archivo/caso, no necesariamente a la misma unidad a través del tiempo.

Los análisis longitudinales pareados necesitan reconocer la misma unidad en varias sesiones.

## 2. Campo propuesto

```json
{
  "id": "spk-2",
  "label": "Participante",
  "analysisUnitId": "AU-0042",
  "covariates": {}
}
```

Reglas:

- opcional;
- string no vacío cuando existe;
- pseudónimo, nunca nombre, historia clínica o identificador institucional real;
- estable entre visitas del mismo protocolo;
- puede quedar `null`/ausente en entrevistadores y hablantes fuera de la unidad analítica;
- no es una variable estadística ni una categoría de Clinical VarOps.

## 3. Por qué es general

`analysisUnitId` puede identificar, según el protocolo:

- persona;
- hogar;
- institución;
- comunidad;
- grupo focal;
- otra unidad definida por el investigador.

## 4. APU-03

Cambio mínimo propuesto:

- permitir asignar opcionalmente `analysisUnitId` al hablante;
- conservarlo en sesión y exportaciones;
- validar formato no vacío;
- explicar que debe ser pseudónimo;
- no exigirlo en estudios Individual, Exploratorio o Transversal.

## 5. APU-04

Cambio mínimo propuesto:

- `ingest-adapter.mapSpeaker()` debe preservar `analysisUnitId`;
- `buildCleanedPackage()` ya copia `speakers`, por lo que viajará a APU-05;
- el campo no participa en limpieza, PII ni normalización;
- pruebas de passthrough deben verificarlo.

Observación: la documentación actual dice “speakers passthrough intacto”, pero el adaptador reconstruye cada speaker con solo `id`, `label` y `covariates`. El RFC corrige esa discrepancia para este campo explícito.

## 6. APU-05

Uso:

- agrupar sesiones de la misma unidad;
- verificar momentos disponibles;
- construir pares/trayectorias;
- excluir entrevistadores sin `analysisUnitId`;
- reportar unidades incompletas o duplicadas;
- nunca mostrarlo como dato identificable.

## 7. Tiempo y grupo

`analysisUnitId` solo resuelve identidad.

Las variables temporales, brazos, grupos, resultados y covariables continúan definidas en Clinical VarOps y asignadas en APU-03:

```text
momento
visita
brazo
estado_caso
adherencia
```

El módulo Longitudinal permite elegir las variables pertinentes para la capacidad solicitada.

## 8. Compatibilidad

La ausencia del campo no rompe archivos actuales. Solo deshabilita capacidades que requieren emparejamiento longitudinal y muestra una explicación.

No se requiere cambio de versión mayor si los contratos permiten campos opcionales; cada repositorio debe decidir y documentar su versión conforme a sus reglas.

## 9. Pruebas mínimas coordinadas

- APU-03 exporta el valor sin alterarlo.
- APU-04 lo importa y exporta idéntico.
- APU-05 vincula dos visitas con el mismo valor.
- IDs locales de speaker repetidos no interfieren.
- entrevistador sin valor queda excluido.
- ausencia del campo deshabilita pareamiento, no otros análisis.
