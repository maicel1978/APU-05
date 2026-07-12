# Motor puro de contraste léxico G²

**Estado:** implementado y probado; no conectado a UI

## Capacidades

`src/science/Keyness.js` implementa:

- tabla 2×2 y fórmula Log-Likelihood G²;
- manejo finito de celdas cero;
- tokenización Unicode para español;
- stopwords documentadas;
- frecuencia mínima configurable;
- PMW para cada grupo;
- dirección del enriquecimiento;
- log-ratio suavizado descriptivo;
- límite de resultados;
- advertencia por menos de dos participantes;
- rechazo de grupos sin palabras analizables.

## Pruebas críticas

- valor G² conocido;
- celdas cero sin `NaN`/infinito;
- rechazo de conteos negativos;
- distribuciones proporcionales sin falsos hallazgos;
- simetría al intercambiar grupos;
- dirección y PMW;
- español con tildes;
- filtros y muestra pequeña.

## Salida

```text
word
g2
groupACount / groupBCount
groupAPmw / groupBPmw
direction
logRatio
```

No genera p-valores ni usa la palabra “significativo”.

## Pendiente para conectar

- recibir los cuatro paquetes 5.0.0 revisados en APU-04;
- construir el adaptador segmentos + hablantes + covariable;
- excluir hablantes sin grupo y reportarlos;
- reemplazar la UI de selección única por covariable + Grupo A + Grupo B;
- mostrar tablas interpretables en vez de una nube de tamaño;
- mantener evidencia textual por término.
