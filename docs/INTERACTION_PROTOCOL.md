# Protocolo de interacción investigador ↔ agente

**Objetivo:** trabajar paso a paso, probar en local y conservar el contexto durante toda la recuperación de APU-05.

## 1. Principio

> El agente implementa y verifica técnicamente. El investigador prueba el uso real y valida el sentido científico.

Ninguna fase se considera terminada solo porque el código compile o las pruebas automáticas pasen.

## 2. Roles

### Investigador

- Explica la intención clínica, epidemiológica y de producto.
- Informa comportamientos históricos que deben conservarse.
- Prueba cada punto estable en su computadora.
- Confirma si el flujo es comprensible y útil.
- Aprueba decisiones científicas o cambios en áreas protegidas.

### Agente

- Lee contratos y decisiones antes de cambiar código.
- Distingue hechos, inferencias y dudas.
- Reproduce un problema antes de corregirlo.
- Implementa cambios pequeños y reversibles.
- Añade pruebas automáticas y documentación.
- Publica cada punto estable en la rama acordada.
- Proporciona instrucciones sencillas para la prueba manual.

## 3. Rama compartida

Toda esta sesión trabaja exclusivamente en:

```text
arena/019f5692-apu-05
```

El agente no cambiará a otra rama. El investigador puede descargarla o clonarla para probarla.

La rama `main` representa la referencia original y no se modifica desde esta sesión.

## 4. Ciclo de una intervención

### Paso 1 — Acordar

El agente presenta:

- problema que se abordará;
- significado para el usuario;
- archivos previstos;
- elementos que no se tocarán;
- prueba que demostrará el resultado.

Si hay riesgo científico, pérdida de datos o archivo protegido, se solicita autorización.

### Paso 2 — Caracterizar

Antes del cambio:

- reproducir el comportamiento;
- revisar procedencia en APU-00/APU-04 cuando corresponda;
- registrar comportamiento que debe conservarse;
- escribir o actualizar pruebas.

### Paso 3 — Implementar

- un problema principal por cambio;
- diff pequeño;
- sin refactorización estética paralela;
- sin superar 350 líneas por archivo;
- mensajes de usuario sencillos.

### Paso 4 — Verificar

El agente ejecuta:

- pruebas específicas del cambio;
- pruebas de regresión;
- auditoría estática;
- revisión del diff;
- comprobación de que el repositorio queda limpio.

### Paso 5 — Publicar punto estable

El agente:

1. crea un commit descriptivo;
2. lo sube a la rama compartida;
3. genera un ZIP descargable;
4. informa commit y SHA-256;
5. entrega instrucciones de prueba manual.

### Paso 6 — Prueba local del investigador

El investigador actualiza su copia, ejecuta la app y comunica el resultado usando la plantilla de la sección 7.

### Paso 7 — Cerrar o corregir

- Si el investigador aprueba, se registra la fase como aceptada.
- Si encuentra un problema, no se acumulan cambios nuevos: primero se reproduce y corrige.
- Si existe duda, el punto permanece “en validación”.

## 5. Estados visibles

Cada intervención usará uno de estos estados:

- **PROPUESTO:** todavía no se modifica nada.
- **EN DESARROLLO:** el agente está trabajando.
- **LISTO PARA PRUEBA:** pruebas automáticas aprobadas y copia publicada.
- **EN VALIDACIÓN:** el investigador está probando en local.
- **ACEPTADO:** el investigador confirmó el comportamiento.
- **RECHAZADO:** se detectó una regresión o decisión incorrecta.
- **BLOQUEADO:** falta información o una decisión.

## 6. Formato de entrega del agente

Cada entrega debe decir, en este orden:

1. **Qué cambió.**
2. **Por qué cambió.**
3. **Qué no cambió.**
4. **Cómo actualizar la copia local.**
5. **Cómo probarlo.**
6. **Qué resultado esperar.**
7. **Pruebas automáticas ejecutadas.**
8. **Riesgos o dudas pendientes.**
9. **Commit y archivo descargable.**

## 7. Plantilla de respuesta del investigador

No es obligatorio completar todo; sirve para no perder detalles.

```text
VERSIÓN/COMMIT PROBADO:
SISTEMA OPERATIVO:
NAVEGADOR:
ESCENARIO PROBADO:
ARCHIVOS CARGADOS:

RESULTADO ESPERADO:
RESULTADO OBSERVADO:

¿LA INTERFAZ FUE CLARA? Sí / No / Parcial
¿LOS RESULTADOS TIENEN SENTIDO? Sí / No / No sé
¿APARECIÓ UN ERROR? Sí / No
MENSAJE DE ERROR O CAPTURA:

DECISIÓN: Acepto / Rechazo / Necesito explicación
COMENTARIOS:
```

## 8. Protocolo para dudas

El agente debe preguntar antes de actuar cuando:

- una regla contradiga el comportamiento histórico;
- el significado de una covariable no sea evidente;
- exista riesgo de perder datos;
- sea necesario modificar `App.js` o `index.html`;
- una salida pueda interpretarse como causal o diagnóstica;
- el cambio deba realizarse realmente en APU-04;
- existan varias opciones con consecuencias científicas distintas.

No es necesario preguntar por decisiones técnicas pequeñas, reversibles y cubiertas por pruebas.

## 9. Protección ante pérdida de contexto

Después de cada fase aceptada se actualizan:

- `docs/DECISION_LOG.md`
- `docs/CONTINUITY_HANDOFF.md`
- estado de la hoja de ruta;
- pruebas y comandos relevantes.

Un agente nuevo debe poder continuar sin leer el chat completo.

## 10. Trabajo simultáneo

Para evitar conflictos:

- el investigador usa normalmente su copia para probar, no para editar la misma rama;
- si desea modificar archivos, debe avisar qué archivos tocará;
- no se ejecuta `git push --force`;
- no se reemplazan commits ya publicados;
- los cambios se agregan mediante commits nuevos;
- antes de comenzar una fase se revisa si la otra sección modificó contratos compartidos.

## 11. Regla de pausa

En cualquier momento el investigador puede decir:

```text
PAUSA DE CONTEXTO
```

El agente debe detener cambios, resumir el estado, actualizar el handoff si hace falta y esperar confirmación.
