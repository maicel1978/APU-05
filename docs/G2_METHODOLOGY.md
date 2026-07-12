# Contraste léxico G² — contrato metodológico

**Estado:** metodología aprobada; motor puro implementado. Ver `G2_ENGINE.md`.

## 1. Nombre correcto

La función se presentará como:

> **Contraste léxico exploratorio G²**

No se denominará “diferencia clínica”, “efecto de grupo” ni “significancia entre participantes”.

## 2. Qué responde

Pregunta válida:

> ¿Qué términos aparecen de forma desproporcionada en el corpus textual del Grupo A frente al Grupo B?

No responde:

- si la intervención causó cambios;
- si los participantes difieren estadísticamente;
- si existe un efecto clínico;
- si las menciones son observaciones independientes.

## 3. Selección soberana

El investigador elegirá explícitamente:

1. covariable;
2. valor de Grupo A;
3. valor de Grupo B.

El sistema no seleccionará automáticamente los primeros valores ni comparará cada categoría contra el resto.

## 4. Unidad analítica

Los segmentos se asignan al grupo mediante el hablante y sus covariables. Segmentos de hablantes sin valor para la covariable quedan excluidos y se reportan.

Las palabras son unidades del contraste de corpus, pero están agrupadas dentro de participantes. Por esa dependencia, G² se usa como medida de **keyness exploratoria**, no como prueba epidemiológica de sujetos independientes.

## 5. Cálculo por término

Tabla 2×2:

```text
                 término   otras palabras
Grupo A              a            b
Grupo B              c            d
```

```text
G² = 2 × Σ O × ln(O/E)
```

Las celdas con observación cero aportan cero a la suma. Se informan además:

- conteo bruto;
- frecuencia por millón de palabras (PMW);
- dirección del enriquecimiento;
- razón de frecuencias suavizada como tamaño descriptivo;
- número de participantes y tokens por grupo.

## 6. Filtros

- tokenización Unicode para español;
- exclusión documentada de stopwords;
- frecuencia total mínima configurable;
- ningún término aparece como resultado si no supera el mínimo;
- no se generan p-valores en el prototipo.

## 7. Salida

Cada término debe conservar evidencia y metadatos suficientes para interpretar:

```text
word, g2, groupACount, groupBCount,
groupAPmw, groupBPmw, direction, logRatio
```

La UI explicará que un G² alto indica desproporción léxica, no importancia clínica.

## 8. Muestra insuficiente

La interfaz mostrará advertencia cuando:

- falte uno de los grupos;
- un grupo tenga menos de dos participantes;
- un grupo no tenga tokens analizables;
- haya demasiados datos faltantes en la covariable.

El motor puede calcular datos sintéticos pequeños para QA, pero la UI no debe ocultar la limitación.

## 9. Datos QA

Se preparan cuatro entrevistas sintéticas:

- 2 Intervención;
- 2 Control;
- un participante analítico por entrevista;
- entrevistadores sin valor de grupo, excluidos del contraste.

Deben revisarse y finalizarse en APU-04 antes de conectar la UI Transversal.
