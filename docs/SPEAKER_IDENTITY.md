# Identidad de hablantes en cohortes

**Estado:** corrección implementada; pendiente de validación manual

## Problema

Los archivos APU reutilizan IDs locales como `spk-1` y `spk-2`. Esos IDs son únicos dentro de una entrevista, no en toda una cohorte.

El prototipo construía el mapa usando solo la última sesión, por lo que un segmento de barreras podía mostrar la etiqueta del caso gasto. La participación también combinaba palabras de personas diferentes bajo el mismo ID.

## Solución

La identidad interna ahora es:

```text
sessionId::speakerId
```

Ejemplos:

```text
10::spk-2
11::spk-2
```

La aplicación:

- conserva `speakerId` original;
- no modifica archivos APU-04;
- guarda todas las sesiones activas en `State.sessionIds`;
- construye un mapa conjunto desde IndexedDB;
- agrupa participación por identidad compuesta;
- muestra la entrevista junto a la etiqueta en cohortes;
- mantiene alias simple en sesiones donde no existe ambigüedad.

## Pruebas

La suite comprueba:

- claves estables;
- separación de IDs repetidos;
- resolución correcta de etiquetas;
- compatibilidad individual;
- uso en StatsEngine;
- conexión de todas las sesiones en Exploratorio y Transversal.

## Límite restante

Transversal todavía obtiene covariables únicamente de la última sesión mediante `state.sessionId`. La corrección de etiquetas no certifica aún comparación de grupos ni G².
