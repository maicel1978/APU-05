# Continuidad de trabajo — leer primero

**Proyecto:** APU-05  
**Rama de trabajo:** `arena/019f5692-apu-05`  
**Línea base:** commit `a2fb799`

## 1. Misión

Preparar y terminar un prototipo analítico local-first para investigadores clínicos y epidemiólogos.

Principio de producto:

> **Rigor por dentro, intuitiva por fuera.**

No realizar una reescritura general. APU-05 es un laboratorio modular destinado a validar componentes para una aplicación final.

## 2. Orden obligatorio de lectura

1. `docs/RECOVERY_STRATEGY.md`
2. `docs/INTERACTION_PROTOCOL.md`
3. `docs/ECOSYSTEM_INHERITANCE.md`
4. `docs/DECISION_LOG.md`
5. `docs/AI_RIGOR_SHIELD.md`
6. `docs/AUDIT_DOUBT_MANIFEST.md`
7. `docs/CURRENT-STATUS.md`
8. `docs/METHODOLOGY_ROADMAP.md`

Para descargar, actualizar y probar la rama en local:

- `docs/LOCAL_TESTING_GUIDE.md`

Para cambios de ingesta, consultar también el repositorio productor APU-04:

- `docs/AGENT-GUIDE.md`
- `docs/CONTRACTS.md`
- `docs/DECISIONS.md`
- `src/core/export-package.js`
- pruebas relacionadas con el contrato afectado.

## 3. Estado actual

- **Fase 0 aceptada por el investigador.**
- **Fase 1A aceptada por el investigador:** runner Node, caracterización del Parser y auditoría R10.
- Prueba manual MT-001 aprobada: apertura con Live Server y carga de `entrevista01.json` en Individual.
- MT-002 aprobada en `26518a5`: Transcripción Original y Reporte funcionan sin topología nula.
- `npm test`: 15 pruebas Node aprobadas, 0 fallidas; incluye 13 casos compartidos del Parser.
- Cambio validado: conexión diseño → topología en `App.js`.
- MT-003 aprobada en `5e1dbf8`: la plantilla v7.7 vacía se reconoce sin errores.
- La portabilidad real del glosario sigue sin certificar porque el fixture contiene `terms: []`.
- `GLOSSARY_SCOPE.md` separa el diccionario de corrección APU-04 del glosario analítico APU-05.
- **Fase 1B aceptada:** MT-004 confirmó el flujo Individual con APU-04 5.0.0, 49 segmentos y duración cero sin errores de consola.
- Política de Parser acordada en `PARSER_POLICY.md`: bloquear 4.0.0, confirmar 5.x no finalizado y trazabilidad opcional.
- La implementación estricta queda bloqueada hasta disponer de dos benchmarks 5.0.0 revisados.
- Dos entradas APU-03 válidas están listas en `assets/test_data/apu04_inputs/` para revisión manual mediante APU-04.
- Se realizó un diagnóstico estático de Database, State y StatsEngine.
- Se confirmó que `StatsEngine.calculateKeyness()` no existe aunque la UI lo invoca.
- El motor actual de “Sorpresa” puede presentar distribuciones idénticas como hallazgos.
- Longitudinal e Integridad son placeholders.
- Las pruebas del Parser de APU-05 contienen falsos positivos.
- Todos los archivos de código cumplen el límite de 350 líneas.

## 4. Contexto recuperado de unidades anteriores

Repositorios reales:

```text
APU-0   Hub y estándares
APU-01  Preparación acústica
APU-2   APU-02, transcripción
APU-3   APU-03, hablantes y covariables
APU-04  Limpieza, PII, revisión y calidad
```

Hallazgos clave:

- APU-04 produce `_cleaned.json` 5.0.0 como materia prima.
- `_trazabilidad.json` es complementario y se une por `segmentId`.
- `finalizedByHuman` no debe ignorarse.
- Las covariables son dinámicas y opcionales.
- Los IDs de hablante y segmento requieren contexto de caso en cohortes.
- Los placeholders PII no identifican personas entre archivos diferentes.
- `start === end` puede ocurrir en datos heredados y no invalida todo el archivo.
- APU-05 no debe corregir timestamps de origen.

## 5. Pruebas de referencia ejecutadas

- APU-02: 27 aprobadas.
- APU-03: suites y auditoría aprobadas.
- APU-04: 289 aprobadas al invocar explícitamente `tests/*.test.mjs`.
- El script `npm test` de APU-04 falla bajo Node 22 al pasar el directorio `tests/`; esto es un problema del comando, no de las 289 pruebas.

## 6. Alarmas

No hacer sin autorización y pruebas:

- migrar o borrar IndexedDB;
- modificar `index.html`;
- realizar cambios amplios en `App.js`;
- reescribir el módulo Individual sellado;
- cambiar contratos de APU-04 desde APU-05;
- afirmar causalidad o diagnóstico clínico;
- activar UI estadística sin motor certificado.

## 7. Próximo trabajo recomendado

**Fase 1: QA confiable, sin cambiar comportamiento de producción.**

1. Crear un runner de pruebas reproducible para APU-05.
2. Reparar las pruebas del Parser que se autoaprueban.
3. Añadir auditoría automática de 350 líneas.
4. Añadir pruebas de caracterización para entrada 4.0.0 y 5.0.0.
5. Añadir caso `start === end` como no fatal.
6. Añadir prueba nula para Sorpresa, inicialmente esperada como fallo conocido.
7. Generar un ZIP estable para prueba manual.

No corregir todavía Parser o StatsEngine en el mismo cambio que repara el arnés de QA.

## 8. Protocolo con el investigador

- Explicar primero en lenguaje sencillo.
- Distinguir observado, confirmado, inferido y desconocido.
- No asumir intención cuando falte contexto.
- Pedir validación manual en cada punto estable.
- Registrar decisiones importantes en `DECISION_LOG.md`.
- El investigador conoce la intención clínica y funcional; el agente no debe sustituirla.

## 9. Copia original

```text
APU-05-baseline-a2fb799-2026-07-12.zip
SHA-256: 468f35eeda6127bcff9fb74bda159700641e8ee1a59072f37964ed6c9e8229b5
```

Esta copia es la referencia previa a la fase documental.
