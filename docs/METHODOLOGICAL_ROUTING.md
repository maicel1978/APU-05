# Enrutamiento metodológico de APU-05

## 1. Principio

APU-05 organiza capacidades según grandes familias clásicas de investigación:

```text
Individual
Exploratoria
Analítica transversal
Longitudinal
```

El investigador conoce su protocolo y consulta el manual. La interfaz acompaña y verifica requisitos, pero no sustituye su criterio ni intenta rediseñar el estudio.

## 2. Módulo no significa técnica obligatoria

Un módulo reúne operaciones compatibles con una familia metodológica. Ninguna operación individual debe convertirse en puerta obligatoria para utilizar todo el módulo.

Ejemplo:

- Transversal puede describir distribución, comparar categorías, estratificar o explorar asociaciones.
- G² es una capacidad opcional de contraste léxico.
- Solo al ejecutar G² se requieren dos corpus A/B explícitos.
- El módulo Transversal no exige siempre una variable binaria ni G².

## 3. Individual

Trabaja con una unidad narrativa. Puede usar metadatos para contextualizar, pero no exige agrupación, tiempo ni comparación.

Capacidades posibles:

- caracterización;
- estructura;
- síntesis;
- evidencia;
- impacto.

## 4. Exploratoria

Busca patrones e hipótesis sin imponer un modelo analítico previo.

Capacidades posibles:

- pulso de cohorte;
- coocurrencias;
- saliencias;
- atípicos;
- generación prudente de hipótesis.

Las covariables pueden utilizarse como filtros o descriptores, sin convertir el módulo en un diseño comparativo.

## 5. Analítica transversal

Agrupa análisis sin eje temporal analítico. Puede usar cualquier variable pertinente definida en Clinical VarOps:

- nominal dicotómica;
- nominal politómica;
- ordinal;
- cuantitativa categorizada de forma metodológicamente válida;
- variables demográficas o de exposición.

Capacidades opcionales:

- perfil de muestra;
- prevalencias/descripciones;
- tablas cruzadas;
- estratificación;
- contraste léxico A/B;
- análisis de asociaciones compatibles con el diseño.

No se infiere causalidad por ausencia de temporalidad analítica.

## 6. Longitudinal

Reúne diseños con estructura temporal, prospectiva o retrospectiva, según el protocolo definido por el investigador.

Puede soportar configuraciones como:

- pre/post;
- seguimiento observacional;
- casos y controles retrospectivos conforme al protocolo;
- cohortes;
- ensayos con intervención/placebo;
- múltiples visitas.

Cada operación activa únicamente los requisitos que necesita. Ejemplos:

- cambio intraindividual requiere identidad estable + tiempo;
- comparación de trayectorias requiere identidad + tiempo + grupo/brazo;
- seguimiento agregado puede usar tiempo sin pareamiento, dejando clara su limitación;
- un ensayo puede requerir brazo, tiempo y variable de resultado.

La temporalidad no autoriza por sí sola una afirmación causal; la interpretación depende del diseño completo.

## 7. Clinical VarOps y APU-03

Clinical VarOps define las variables del protocolo. APU-03 asigna valores a hablantes/participantes. APU-04 conserva la herencia. APU-05 utiliza esas variables dentro del módulo elegido.

No se necesitan nombres universales. Un protocolo puede usar:

```text
grupo
brazo
condicion
momento
visita
estado_caso
```

y otro utilizar nombres completamente diferentes.

APU-05 descubre el esquema y los valores; el investigador elige cuándo una operación necesita mapearlos.

## 8. Requisitos por capacidad

Cada capacidad analítica debe declarar:

```text
qué pregunta responde
qué metadatos necesita
qué datos excluye
qué cálculo realiza
qué interpretación permite
qué interpretación prohíbe
```

Si faltan datos, se desactiva esa capacidad con una explicación. El resto del módulo permanece disponible.

## 9. Arquitectura hexagonal

Para preservar modularidad:

- los motores científicos son funciones puras siempre que sea posible;
- los módulos metodológicos eligen qué motores ofrecer;
- IndexedDB es un adaptador de persistencia, no la fuente de reglas científicas;
- la UI es un adaptador de interacción;
- contratos de datos conectan APU-03/04 con APU-05;
- una nueva técnica se añade como capacidad, no reescribiendo el módulo completo.

## 10. Regla de cambio

Una modificación de G² no debe alterar Individual, Exploratorio o Longitudinal. Una mejora longitudinal no debe cambiar el contrato de limpieza. Las dependencias compartidas requieren pruebas de conservación.

## 11. Identificadores

Algunas operaciones futuras requieren IDs estables de participante, caso o grupo. Si el ecosistema previo no los entrega de forma suficiente, se propondrán cambios mínimos y compatibles en la unidad responsable. APU-05 no inventará identidades silenciosamente.

## 12. Regla final

> El módulo define el marco metodológico; las capacidades son opcionales; Clinical VarOps aporta variables; el investigador decide qué análisis corresponde a su protocolo.
