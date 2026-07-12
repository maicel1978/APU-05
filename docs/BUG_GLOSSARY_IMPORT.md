# Incidencia: la plantilla de glosario no se puede importar

**Estado:** corrección preparada; pendiente de validación manual  
**Prueba de origen:** MT-003

## Síntoma

En Glosario → Portabilidad, cargar el archivo de prueba integrado produce:

```text
Formato de glosario no compatible.
```

## Causa

La plantilla histórica usa:

```json
{
  "appName": "APU-05",
  "version": "7.7.0",
  "terms": []
}
```

El gestor actual exporta y acepta únicamente:

```json
{
  "apu_version": "8.5.0",
  "custom_glossary": []
}
```

La documentación de benchmarks identifica la plantilla v7.7 como archivo válido para probar la importación, por lo que productor, consumidor y fixture estaban desalineados.

## Corrección

- Normalizar el formato actual y el formato histórico APU-05.
- Exigir `term` y `category` para cada entrada no vacía.
- Validar el archivo completo antes de escribir términos.
- Informar de forma comprensible cuando la biblioteca es compatible pero está vacía.
- Capturar errores de lectura/importación en la interfaz.

## Fuera de alcance

No se cambia el formato exportado actualmente ni los contratos APU-03/APU-04.
