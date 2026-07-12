# ENA — Saliencias narrativas exploratorias

**Estado:** motor y UI implementados y validados manualmente

## Problema corregido

El algoritmo anterior devolvía obligatoriamente un término por entrevista y usaba la cohorte completa, incluyendo el propio caso, como referencia. Una distribución idéntica podía terminar presentada como “hallazgo atípico”.

## Método actual

- mínimo 3 entrevistas;
- referencia leave-one-out: cada caso se compara contra las demás;
- mínimo 2 menciones en el caso;
- mínimo 2 menciones y presencia en 2 sesiones de referencia;
- razón relativa mínima 2×;
- máximo 3 saliencias por caso;
- tokenización Unicode;
- evidencia por `segmentId`.

## Resultados posibles

```text
saliencia relativa
sin saliencias
candidato nuevo sin referencia suficiente
muestra insuficiente
```

“No se detectaron saliencias” es un resultado válido.

Los candidatos sin referencia se mantienen separados y no se promueven automáticamente como sorpresa cuantificada.

## Interpretación

Una saliencia indica frecuencia relativa desproporcionada frente a otras entrevistas. No demuestra:

- importancia clínica;
- anomalía del participante;
- causalidad;
- significancia estadística.

## Pruebas críticas

- 2 entrevistas → advertencia y cero hallazgos;
- distribuciones idénticas → cero hallazgos;
- distribuciones proporcionales de distinto tamaño → cero hallazgos;
- mención aislada → no promovida;
- término sin referencia → candidato separado;
- enriquecimiento conocido → detectado;
- evidencia trazable.
