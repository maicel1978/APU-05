# Auditoría de benchmarks APU-04 5.0.0

**Estado:** dos paquetes aceptados  
**Fecha:** 2026-07-12

## 1. Caso gasto de bolsillo

Archivos:

```text
uploads/gasto_cleaned.json
uploads/gasto_trazabilidad.json
uploads/gasto_quality_report.json
uploads/gasto_edit_log.csv
```

Hashes SHA-256:

```text
cleaned:       ccf067d25a79392bde3255245a129cce063e7c0525d8535ccf43abea36699941
trazabilidad:  bb0ce8377ef0f825322769b7c3807e39061a0e88939d7174b680bd2246097c66
quality:       82fae997cb8f9858b14d335c55442b4627ff717fc708d15f9531efbfc0d396f4
edit log:      9a942bc48e0638215aa04a424fb531d3b788171290609e63e3074b9afd0ff769
```

Integridad:

- contrato APU-04 5.0.0;
- finalizado por humano;
- 10 segmentos y 2 hablantes;
- IDs únicos y referencias válidas;
- corpus y trazabilidad con el mismo conjunto y orden de IDs;
- reporte de calidad consistente;
- `source_hash` coincide con la entrada canónica APU-03;
- 4 segmentos anómalos, coincidentes en traza y reporte;
- 8 eventos humanos: 6 sin cambio textual y 2 con cambio real.

## 2. Caso barreras geriátricas

Archivos:

```text
uploads/barreras_cleaned.json
uploads/barreras_trazabilidad.json
uploads/barreras_quality_report.json
uploads/barreras_edit_log.csv
```

Hashes SHA-256:

```text
cleaned:       4588d6de429ec8fca8378e23e9cdd7efd2aa3792619a857bb8f127fc6b6fadc0
trazabilidad:  265e39a2260e9720d77d34af3e4e5e401e6b867559ef3f92a913959113c92075
quality:       f970cda9e794847a7f8f055d8c55e3081de29c48a3832239522d3c21930d9c4d
edit log:      393c5a6c43ea77ff272474e0074ab809f7a68efd53201f6280e1e7149b6f7e9c
```

Integridad:

- contrato APU-04 5.0.0;
- finalizado por humano;
- 9 segmentos y 2 hablantes;
- IDs únicos y referencias válidas;
- corpus y trazabilidad con el mismo conjunto y orden de IDs;
- reporte de calidad consistente;
- `source_hash` coincide con la entrada canónica APU-03;
- 0 segmentos anómalos;
- 9 eventos humanos: 8 sin cambio textual y 1 con cambio real.

## 3. Regla de interpretación de auditoría

`editedByHuman: true` significa que existió una interacción o revisión registrada. No demuestra por sí solo que el contenido cambió.

Para distinguir revisión de modificación real:

```text
before === after  → interacción sin cambio textual
before !== after  → modificación textual real
```

APU-05 debe mantener separadas estas métricas en cualquier resumen de integridad.

## 4. Alcance de estos datos

Los dos casos sirven para:

- Individual;
- Exploratorio con dos entrevistas;
- emparejamiento opcional de trazabilidad;
- pruebas de auditoría y calidad.

No sirven todavía para comparación Transversal porque `speakers[].covariates` está vacío, aunque exista `covariateSchema`.

Tampoco constituyen validación científica de las narrativas: son datos sintéticos revisados para QA técnico.
