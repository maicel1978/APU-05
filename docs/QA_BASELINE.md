# Línea base de QA de APU-05

**Fase:** 1A — caracterización sin cambio productivo  
**Estado:** listo para prueba manual

## 1. Propósito

Crear pruebas que digan la verdad sobre el prototipo actual antes de corregirlo.

Una prueba de caracterización puede confirmar una carencia actual. Eso no convierte la carencia en comportamiento correcto: permite cambiarla después de forma controlada.

## 2. Ejecución

Requisito: Node.js 18 o posterior.

```bash
npm test
```

No requiere instalar dependencias.

La prueba manual de navegador continúa disponible en:

```text
tests/runner.html
```

## 3. Comportamiento actual confirmado del Parser

### Controles presentes

- Rechaza una unidad distinta de `APU-04`.
- Rechaza ausencia del array `segments`.
- Rechaza `segmentId` duplicado dentro del archivo.
- Rechaza `cleanedText` vacío.
- Advierte cuando falta `covariateSchema`.
- No modifica el objeto cargado.

### Compatibilidad observada

- Acepta el fixture histórico `4.0.0`.
- Acepta el fixture actual `5.0.0`.
- Acepta `start === end`, necesario para el caso heredado conocido.
- Rechaza la trazabilidad como corpus principal porque no contiene `cleanedText`.

### Brechas documentadas, todavía no corregidas

- No verifica `ecosystem`.
- No verifica `stage`.
- No comprueba que `speakerId` exista en `speakers`.
- No rechaza `end < start`.
- No aplica una regla a `finalizedByHuman: false`.
- No verifica realmente `schemaVersion`.
- El argumento de diseño no cambia la validación.
- No empareja archivo limpio y trazabilidad.

Estas brechas no deben describirse como R13 completado.

## 4. Corrección del falso positivo anterior

La suite antigua lanzaba manualmente un error como “Debería haber fallado por V7” dentro de un `try`, lo capturaba inmediatamente y lo interpretaba como si el Parser hubiera rechazado el archivo.

La nueva suite usa una función que distingue:

- error realmente lanzado por el Parser;
- ausencia de error cuando se esperaba rechazo.

Las brechas actuales se nombran `Gap` y se caracterizan explícitamente, sin fingir que están implementadas.

## 5. Auditoría estática inicial

La suite Node comprueba:

- que existen archivos JavaScript de producción;
- que ninguno supera 350 líneas;
- que los archivos protegidos principales siguen presentes.

Esto es una base mínima. Privacidad, red, DOM y contratos se ampliarán en fases posteriores.

## 6. Fuera de alcance de Fase 1A

No se modifica todavía:

- Parser de producción;
- Database;
- State;
- StatsEngine;
- App.js;
- index.html;
- interfaz;
- esquema IndexedDB.

## 7. Resultado automático

Ejecución del 2026-07-12:

```text
npm test
7 pruebas aprobadas
0 fallidas
```

La suite compartida del Parser ejecuta internamente 13 casos de caracterización. Las 7 pruebas Node incluyen esa suite, fixtures reales y auditoría estática.

## 8. Próxima puerta

Fase 1A queda aceptada cuando:

- el investigador abre `tests/runner.html` mediante Live Server y no observa fallos del Parser;
- el flujo Individual continúa abriendo y cargando `entrevista01.json`;
- el investigador confirma que el prototipo conserva su comportamiento.
