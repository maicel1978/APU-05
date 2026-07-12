# Estrategia de recuperación segura de APU-05

**Estado:** activa  
**Metodología:** PRISMA+ v5.2  
**Propósito:** terminar un prototipo analítico estable sin perder las decisiones útiles de iteraciones anteriores.

## 1. Idea rectora

> **Rigor por dentro, intuitiva por fuera.**

APU-05 está dirigida a investigadores clínicos y epidemiólogos. La aplicación debe ocultar la complejidad técnica sin ocultar las limitaciones científicas.

Esto significa:

- fórmulas, contratos, pruebas y trazabilidad rigurosos internamente;
- lenguaje sencillo, flujos guiados y resultados interpretables externamente;
- ninguna inferencia automática presentada como hecho;
- toda evidencia debe regresar a sus segmentos de origen.

## 2. Qué es APU-05

APU-05 es la capa analítica del ecosistema de archivos:

```text
APU-01 → APU-02 → APU-03 → APU-04 → APU-05 → APU-06
```

No reemplaza a las otras unidades ni debe duplicar sus responsabilidades. Consume texto finalizado por APU-04 y ayuda a producir caracterización, patrones, comparaciones, evolución temporal, hipótesis y reportes trazables.

El prototipo es además un laboratorio modular. Sus módulos pueden conectarse y desconectarse para validar qué debe llegar a la aplicación final.

## 3. Fuentes de verdad

Cuando dos fuentes se contradigan, usar este orden:

1. Comportamiento confirmado por el investigador con datos reales.
2. Pruebas de regresión actuales.
3. Código ejecutado actualmente.
4. Documento de decisiones del productor del dato.
5. Contrato de datos actual.
6. Estado actual y changelog.
7. Documentación histórica.
8. Hub o página pública.
9. Suposición de un agente.

Una contradicción no se resuelve silenciosamente: se registra en `docs/DECISION_LOG.md`.

## 4. Etiquetas para evitar suposiciones

Todo diagnóstico importante debe indicar su nivel:

- **OBSERVADO:** comprobado en código o ejecución.
- **CONFIRMADO:** validado por el investigador.
- **INFERIDO:** explicación probable aún no certificada.
- **DESCONOCIDO:** falta información.
- **HIPÓTESIS DE FALLO:** requiere reproducción antes de corregir.

## 5. Reglas de protección

1. Caracterizar antes de corregir.
2. No refactorizar por estética.
3. Resolver un problema por intervención.
4. Añadir una prueba del fallo y otra de conservación.
5. No modificar datos fuente silenciosamente.
6. No realizar migraciones destructivas.
7. Tratar bases existentes como datos que deben preservarse.
8. No presentar placeholders como funciones terminadas.
9. Ningún archivo de código puede superar 350 líneas.
10. Antes de cambiar un contrato, revisar la unidad que produce el dato.

## 6. Archivos protegidos

Según `AI_RIGOR_SHIELD.md`:

- Cambios en `src/ui/App.js` requieren alarma, pruebas previas, diff pequeño y autorización.
- `index.html` no se modifica sin autorización separada.
- Los logros sellados del módulo Individual requieren pruebas de conservación.

## 7. Ciclo de trabajo

Cada problema se aborda así:

```text
Observar → Reproducir → Entender procedencia → Documentar decisión
→ Escribir prueba → Cambio mínimo → Probar regresiones
→ Prueba manual del investigador → Punto estable descargable
```

Cada punto estable debe incluir:

- commit identificable;
- archivo ZIP descargable;
- hash SHA-256;
- resumen en lenguaje sencillo;
- pruebas ejecutadas;
- riesgos pendientes;
- instrucciones para volver atrás.

## 8. Fases

### Fase 0 — Memoria y contratos

- Documentar estrategia y continuidad.
- Mapear APU-04 → APU-05.
- Separar realidad, promesa y placeholder.
- No cambiar comportamiento.

### Fase 1 — QA confiable

- Reparar pruebas que pueden autoaprobarse.
- Incorporar un runner reproducible.
- Añadir auditoría estática de R10 y privacidad.
- Describir primero el comportamiento actual.

### Fase 2 — Ingesta compatible

- Alinear Parser con el contrato real de APU-04.
- Aceptar versiones soportadas de forma explícita.
- Verificar `finalizedByHuman`.
- Unir trazabilidad por `segmentId`, nunca por posición.
- Mantener covariables opcionales y dinámicas.

### Fase 3 — Persistencia segura

- Diagnosticar la bóveda antes de migrar.
- Detectar duplicados y registros huérfanos.
- Implementar exportación de seguridad.
- Ensayar migraciones con copias sintéticas.

### Fase 4 — Estado coherente

- Representar proyectos, cohortes y sesiones por separado.
- Actualizar contexto de manera atómica.
- Evitar mezcla de datos al cambiar de diseño.
- Hidratar el estado desde almacenamiento.

### Fase 5 — Motores científicos

- Certificar métricas descriptivas.
- Corregir vínculos por límites de palabra y proximidad.
- Sustituir la falsa atipicidad por saliencia validada.
- Implementar G² como función pura y probada.

### Fase 6 — Módulos metodológicos

- Conectar Transversal solo después de certificar G².
- Construir un MVP Longitudinal descriptivo y validado.
- Mantener lenguaje no causal.

### Fase 7 — Auditoría y cierre

- Procedencia, parámetros, versiones y evidencia.
- Prueba integral con archivos reales y sintéticos.
- Manual para investigador.
- Paquete transferible al agente de la versión final.

## 9. Comunicación con el investigador

Los mensajes deben:

1. comenzar con una conclusión breve;
2. explicar qué significa para el usuario;
3. separar hechos de dudas;
4. evitar tecnicismos innecesarios;
5. usar ejemplos clínicos o de flujo cuando ayuden;
6. pedir una decisión solamente cuando cambie el riesgo o el significado científico.

Cuando sea necesario un término técnico, debe explicarse en lenguaje cotidiano.

## 10. Criterio de terminado

Una fase termina solamente cuando:

- las pruebas automáticas relevantes pasan;
- el comportamiento anterior importante se conserva;
- el investigador completa la prueba manual acordada;
- la documentación coincide con el código;
- existe una copia descargable estable;
- el siguiente agente puede continuar leyendo `docs/CONTINUITY_HANDOFF.md`.
