# Implementación Transversal — contraste léxico G²

**Estado:** conectado con datos simulados; pendiente de prueba manual y validación humana final

## Flujo

1. Cargar varios corpus 5.x.
2. Descubrir covariables observadas en todas las sesiones.
3. Elegir variable del protocolo.
4. Elegir explícitamente Grupo A y Grupo B.
5. Calcular keyness exploratoria.
6. Mostrar participantes, tokens, segmentos incluidos/excluidos, G² y PMW.

## Fuentes de metadatos

- Significado/tipo/categorías: `covariateSchema`, heredado de Clinical VarOps.
- Valor observado: `speakers[].covariates`, asignado en APU-03.
- Texto: `segments[].cleanedText`, finalizado en APU-04 o marcado provisional.

## Salvaguardas

- No infiere grupos desde texto o nombres.
- No selecciona categorías automáticamente.
- A y B deben diferir.
- Excluye hablantes sin valor A/B.
- No usa “significancia estadística” ni “efecto clínico”.
- No genera p-valores.
- Advierte menos de dos participantes.
- PMW acompaña conteos para corpus de distinto tamaño.

## Datos simulados

```text
assets/test_data/transversal_simulated_v5/
```

Son corpus técnicos con `finalizedByHuman:false`, generados desde las salidas APU-03 alineadas con VarOps. La app debe pedir confirmación y marcar todo como provisional.

## Validación humana pendiente

La certificación final requiere procesar los cuatro `speakers-v3.json` en APU-04 y reemplazar la simulación por paquetes 5.0.0 revisados.
