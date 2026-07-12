# Herencia Clinical VarOps → APU-03 → APU-04 → APU-05

## 1. Clinical VarOps es transversal

Clinical VarOps (`oper`) no forma parte del pipeline lineal. Es el puente metodológico entre el diseño del protocolo y las aplicaciones que recogen, limpian o analizan variables.

Su contrato raíz estable es:

```json
{
  "project": {},
  "variables": []
}
```

## 2. Qué contiene `.clinical`

Contiene definiciones:

- nombre técnico;
- tipo estadístico;
- descripción operacional;
- pregunta;
- unidad/rango;
- categorías;
- sinónimos.

No contiene:

- participantes;
- valores observados;
- segmentos;
- asignaciones individuales de grupo.

## 3. Función de APU-03

APU-03 carga el `.clinical` opcionalmente, valida y normaliza sus variables. Después permite asignar valores a cada hablante.

Salida:

```text
covariateProject       proyecto normalizado
covariateSchema        variables normalizadas
speakers[].covariates  observaciones concretas por hablante
```

## 4. Función de APU-04

APU-04 trata proyecto, esquema y covariables como passthrough. No redefine categorías ni asigna grupos.

## 5. Función de APU-05

APU-05 debe:

- usar `covariateSchema` para significado, tipo y categorías permitidas;
- usar `speakers[].covariates` para valores observados;
- excluir y reportar hablantes sin valor;
- no inferir grupos desde texto, nombre de archivo o posición;
- permitir que el investigador elija covariable y valores A/B;
- conservar la denominación definida por el protocolo.

## 6. Benchmark QA

Maestro:

```text
assets/test_data/qa-transversal.clinical
```

Define `grupo_estudio` con categorías Control e Intervención. Los cuatro archivos APU-03 fueron normalizados con el cargador real de APU-03 y luego validados con APU-04.

Los valores concretos viven en el participante `spk-2` de cada caso; el entrevistador no tiene grupo y debe excluirse del contraste.

## 7. Regla futura

APU-05 podría permitir cargar el `.clinical` como referencia metodológica adicional, pero no debe reemplazar el esquema heredado ni crear observaciones ausentes. Si ambos existen, cualquier discrepancia debe mostrarse antes del análisis.
