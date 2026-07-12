# APU-05 — Checklist Beta / Release Candidate

**Estado:** RC listo para revisión
**Destino:** Pull Request #1 hacia `main`

## Capacidades operativas

- [x] Ingesta APU-04 5.x estricta.
- [x] Rechazo explicado de contrato histórico 4.x.
- [x] Confirmación y señalización provisional.
- [x] Trazabilidad opcional y store `audit`.
- [x] Identidad compuesta de hablantes en cohortes.
- [x] Individual con pasos sellados conservados.
- [x] Exploratorio con ENA leave-one-out conservador.
- [x] Transversal con G² exploratorio opcional.
- [x] Glosario v7.7/v8.5 compatible.
- [x] Reporte consolidado/provisional.
- [x] QA Node y R10 automatizados.

## Capacidades no certificadas como estables

- [ ] Longitudinal: placeholder; requiere `analysisUnitId` y capacidades temporales.
- [ ] Integridad: UI placeholder aunque la trazabilidad ya se persiste.
- [ ] Transversal G²: motor probado; validación humana final con salidas APU-04 pendiente.
- [ ] Transacción global de cohorte: actualmente atómica por caso.
- [ ] Capa semántica: límites de memoria/rendimiento pendientes.

## Privacidad y despliegue

- [x] Sin backend propio.
- [x] Datos procesados en navegador.
- [x] Sin telemetría de aplicación.
- [x] Headers básicos Netlify.
- [ ] Dependencias runtime empaquetadas localmente: Dexie y Chart.js aún usan CDN.
- [ ] Auditoría externa de privacidad.

## QA requerida antes del merge

- [ ] CI verde en Node 18, 20 y 22. Plantilla lista en `docs/templates/apu05-ci.yml`; requiere permiso workflows para instalar.
- [x] Deploy preview Netlify operativo.
- [ ] Consola limpia en Chrome/Edge.
- [ ] Individual finalizado y provisional.
- [ ] Exploratorio con 2 y 4 entrevistas.
- [ ] Trazabilidad con/sin complemento.
- [ ] Transversal simulado.
- [ ] Reporte descargable.
- [ ] Hard reset solo con datos sintéticos.

## Política de publicación

Este PR puede fusionarse como **Beta / Release Candidate**. No debe anunciarse como versión científica final ni como sustituto de validación metodológica humana.

Los módulos no terminados deben permanecer identificados como tales en interfaz y documentación.
