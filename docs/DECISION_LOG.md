# Registro de decisiones de recuperación

Este documento conserva decisiones que no deben depender de la memoria del chat.

## Formato

Cada decisión incluye estado, motivo, consecuencias y evidencia. Una decisión puede ser sustituida, pero no se borra: se marca como reemplazada.

---

## D-001 — Conservar una línea base descargable

**Estado:** aceptada  
**Fecha:** 2026-07-12

Se conserva el estado original del commit `a2fb799` como referencia funcional.

Archivo generado fuera del repositorio:

```text
APU-05-baseline-a2fb799-2026-07-12.zip
```

SHA-256:

```text
468f35eeda6127bcff9fb74bda159700641e8ee1a59072f37964ed6c9e8229b5
```

Consecuencia: toda fase estable tendrá una copia descargable y verificable.

---

## D-002 — Preservar datos existentes por defecto

**Estado:** aceptada

No sabemos si existen bóvedas `APU05_Vault_Final_v8` con datos importantes. Se asume preservación obligatoria.

Consecuencias:

- no ejecutar reset como estrategia de migración;
- no cambiar esquema Dexie sin preflight, copia y reversión;
- no imponer índices únicos antes de detectar duplicados existentes.

---

## D-003 — APU-05 es laboratorio modular y capa analítica

**Estado:** confirmada por el investigador

No se hará una reescritura general para convertir el prototipo en producto final. Se conservará su capacidad de conectar y desconectar módulos mientras se certifican alternativas.

---

## D-004 — Prioridad de fuentes

**Estado:** aceptada

Las pruebas actuales, el código ejecutado y las decisiones del productor tienen prioridad sobre documentación histórica o supuestos del agente. Ver `RECOVERY_STRATEGY.md`.

---

## D-005 — Duración cero no invalida todo el archivo

**Estado:** confirmada

`start === end` es un caso heredado conocido. El segmento se conserva y se señala; APU-05 no corrige timestamps ni divide por cero.

Pendiente: pruebas de ingesta y métricas que definan el comportamiento exacto.

---

## D-006 — Longitudinal será un MVP real

**Estado:** aceptada

Se implementará comparación temporal descriptiva, con identidad de sujeto, orden temporal, evidencia y pruebas. No se presentará causalidad ni efecto terapéutico.

---

## D-007 — Cambios en App.js requieren puerta de control

**Estado:** autorizada con condiciones

Se permiten cambios pequeños en `src/ui/App.js` únicamente después de presentar:

1. fallo reproducible;
2. pruebas previas;
3. diff mínimo;
4. impacto esperado;
5. plan de reversión.

`index.html` requiere autorización independiente.

---

## D-008 — APU-04 no se modifica desde esta fase

**Estado:** aceptada provisionalmente

APU-04 se usa como productor y referencia. Si se descubre un defecto que debe corregirse allí:

- se documentará como incidencia de interoperabilidad;
- se preparará un caso mínimo reproducible;
- no se compensará silenciosamente alterando el significado en APU-05;
- su implementación se coordinará como trabajo separado.

---

## D-009 — Lenguaje del producto

**Estado:** confirmada por el investigador

Principio:

> Rigor por dentro, intuitiva por fuera.

La UI y las explicaciones se dirigen a investigadores clínicos y epidemiólogos, no exclusivamente a programadores. Los términos técnicos deben acompañarse de una explicación útil.

---

## D-010 — Primera intervención solo documental

**Estado:** ejecutada

Antes de cambiar comportamiento se crean:

- `RECOVERY_STRATEGY.md`
- `ECOSYSTEM_INHERITANCE.md`
- `DECISION_LOG.md`
- `CONTINUITY_HANDOFF.md`

No se modifica código de producción en esta intervención.

---

## D-011 — Ciclo agente implementa, investigador valida

**Estado:** aceptada
**Fecha:** 2026-07-12

Cada intervención termina en un commit y una copia descargable. El agente ejecuta QA técnico y el investigador prueba el flujo real en local antes de aceptar la fase.

La rama compartida es `arena/019f5692-apu-05`. Las instrucciones operativas viven en `INTERACTION_PROTOCOL.md` y `LOCAL_TESTING_GUIDE.md`.

---

## D-012 — Live Server como entorno principal de prueba manual

**Estado:** aceptada y validada
**Fecha:** 2026-07-12

El investigador confirmó que APU-05 abre mediante **Open with Live Server** y que `assets/test_data/entrevista01.json` carga en el módulo Individual.

Durante una serie de pruebas se mantendrá el mismo origen y puerto para no confundir bóvedas IndexedDB distintas. Ver `MANUAL_TEST_LOG.md`.

---

## D-013 — Fase 0 aceptada

**Estado:** aceptada por el investigador
**Fecha:** 2026-07-12

La estrategia, el protocolo de interacción, la guía local y el mecanismo de continuidad quedan establecidos. El siguiente trabajo autorizado por la hoja de ruta es preparar QA confiable sin cambiar todavía el comportamiento productivo.

---

## D-014 — Corregir topología nula en el punto de selección

**Estado:** implementado y aceptado
**Fecha:** 2026-07-12
**Commit validado:** `26518a5`

Los fallos de Transcripción Original y Reporte comparten una causa: seleccionar un diseño no actualizaba `State.topology`.

Se autorizó un cambio mínimo en el archivo protegido `App.js`: traducir el módulo seleccionado a su topología mediante una función pura probada. No se aplican valores de reserva independientes en los consumidores porque ocultarían la desconexión de estado.

El error de favicon se mantiene como incidencia separada.

---

## D-015 — Compatibilidad explícita de glosarios v7.7 y v8.5

**Estado:** implementado y validado para biblioteca vacía
**Fecha:** 2026-07-12
**Commit validado:** `5e1dbf8`

La plantilla integrada usa `terms` (v7.7), mientras el gestor actual usa `custom_glossary` (v8.5). Se normalizan ambos envoltorios antes de escribir en IndexedDB.

No se aceptan archivos ajenos que solo tengan una propiedad `terms`, y toda entrada no vacía debe declarar `term` y `category`.

La prueba manual actual solo certifica el envoltorio vacío. La portabilidad con términos reales requiere un fixture sintético no vacío.

---

## D-016 — Separar glosario de limpieza y glosario analítico

**Estado:** aceptado como regla provisional de arquitectura
**Fecha:** 2026-07-12

El glosario APU-04 (`wrong/correct`) corrige el corpus y deja trazabilidad. El glosario APU-05 (`term/category`) clasifica conceptos sin modificar el corpus. No son automáticamente intercambiables.

La interoperabilidad obligatoria APU-04 → APU-05 corresponde al corpus y su procedencia, no a convertir silenciosamente diccionarios con semánticas distintas. Ver `GLOSSARY_SCOPE.md`.

---

## D-017 — Línea base Individual compatible con APU-04 5.0.0

**Estado:** validada manualmente
**Fecha:** 2026-07-12
**Commit validado:** `afb6a2b`

El fixture actual de APU-04 carga y recorre el flujo Individual sin errores, incluido un segmento con duración cero. Esta conducta se protegerá al endurecer el Parser.

La validación funcional no certifica todavía la exactitud estadística ni la carga complementaria de trazabilidad.

---

## Decisiones pendientes

1. ¿Bloqueo absoluto o modo de laboratorio para `finalizedByHuman: false`?
2. ¿Cuál será la identidad canónica de proyecto, cohorte y caso en IndexedDB?
3. ¿Qué versiones históricas 4.x deben seguir siendo compatibles?
4. ¿La trazabilidad será cargada automáticamente en pareja o mediante acción opcional?
5. ¿Qué umbral científico definirá una saliencia como hallazgo candidato?
