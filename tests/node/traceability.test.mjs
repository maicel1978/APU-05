import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
    buildAuditRecords,
    buildCompactAuditMap,
    buildTraceabilityMetadata,
    summarizeTraceabilities
} from '../../src/core/Traceability.js';

const readJson = async (relativePath) => JSON.parse(
    await readFile(new URL(relativePath, import.meta.url), 'utf8')
);

test('resume revisión y cambio real como métricas diferentes', async () => {
    const gasto = await readJson('../../assets/test_data/benchmarks_v5/gasto_bolsillo/gasto_trazabilidad.json');
    const barreras = await readJson('../../assets/test_data/benchmarks_v5/barreras/barreras_trazabilidad.json');

    assert.deepEqual(summarizeTraceabilities([gasto]), {
        total: 10, edited: 5, reviewed: 5, changed: 2, anomalous: 4, traceabilityCases: 1
    });
    assert.deepEqual(summarizeTraceabilities([barreras]), {
        total: 9, edited: 9, reviewed: 9, changed: 1, anomalous: 0, traceabilityCases: 1
    });
    assert.deepEqual(summarizeTraceabilities([gasto, barreras]), {
        total: 19, edited: 14, reviewed: 14, changed: 3, anomalous: 4, traceabilityCases: 2
    });
});

test('genera registros forenses completos asociados a la sesión', async () => {
    const traceability = await readJson('../../assets/test_data/benchmarks_v5/gasto_bolsillo/gasto_trazabilidad.json');
    const records = buildAuditRecords(traceability, 42);

    assert.equal(records.length, 10);
    assert.ok(records.every((record) => record.sessionId === 42));
    assert.equal(records[6].segmentId, 'seg-007');
    assert.equal(records[6].originalText.includes('recortar drásticamente gastos'), true);
    assert.equal(records[6].modificationsLog.length, 2);
    assert.equal('_pk' in records[6], false);
});

test('conserva metadatos raíz de procedencia', async () => {
    const traceability = await readJson('../../assets/test_data/benchmarks_v5/barreras/barreras_trazabilidad.json');
    const metadata = buildTraceabilityMetadata(traceability);

    assert.equal(metadata.sourceHash, traceability.source_hash);
    assert.equal(metadata.auditLog.finalizedByHuman, true);
    assert.equal(metadata.segmentCount, 9);
    assert.deepEqual(metadata.sourceRefs, traceability.sourceRefs);
});

test('mantiene mapa compacto para compatibilidad del lector', async () => {
    const traceability = await readJson('../../assets/test_data/benchmarks_v5/gasto_bolsillo/gasto_trazabilidad.json');
    const compact = buildCompactAuditMap(traceability);

    assert.deepEqual(compact.get('seg-003'), {
        h: true,
        a: true,
        r: 'Pausa larga respecto al segmento anterior (más de 5 segundos).'
    });
});

test('ausencia de trazabilidad produce estructuras vacías', () => {
    assert.equal(buildTraceabilityMetadata(null), null);
    assert.deepEqual(buildAuditRecords(null, 1), []);
    assert.equal(buildCompactAuditMap(null).size, 0);
    assert.deepEqual(summarizeTraceabilities([]), {
        total: 0, edited: 0, reviewed: 0, changed: 0, anomalous: 0, traceabilityCases: 0
    });
});
