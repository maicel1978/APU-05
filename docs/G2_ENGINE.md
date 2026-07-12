# Motor puro de contraste léxico G²

**Estado:** motor, adaptador y UI conectados; validación provisional pendiente

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

## Adaptador de grupos

`KeynessGroups.js` ya:

- descubre valores de una covariable;
- une segmentos con hablantes mediante identidad compuesta;
- exige Grupo A y Grupo B diferentes;
- excluye y cuenta segmentos de hablantes sin esos valores;
- cuenta participantes por grupo;
- pasa corpus explícitos al motor G².

Las pruebas con las cuatro entradas QA producen 2 participantes por grupo, 8 segmentos incluidos y 4 segmentos de entrevistador excluidos.

## Pendiente para certificar

- recibir los cuatro paquetes 5.0.0 revisados en APU-04;
- validar manualmente la UI con simulaciones provisionales;
- añadir evidencia textual navegable por término.
