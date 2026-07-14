import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { AuditEngine } from '../../src/science/AuditEngine.js';

test('IntegrityModule define correctamente id, categoría y pasos', async () => {
    const source = await readFile(
        new URL('../../src/modules/IntegrityModule.js', import.meta.url),
        'utf8'
    );
    assert.match(source, /id:\s*'integrity'/);
    assert.match(source, /category:\s*'methodology'/);
    assert.match(source, /\{\s*id:\s*1,\s*label:\s*'INGESTA'\s*\}/);
    assert.match(source, /\{\s*id:\s*2,\s*label:\s*'CALIDAD'\s*\}/);
    assert.match(source, /_renderIngesta\(wrapper,\s*state\)/);
    assert.match(source, /_renderQuality\(wrapper,\s*state\)/);
});

test('IntegrityModule implementa filtros forenses y visualización detallada en Paso Calidad', async () => {
    const source = await readFile(
        new URL('../../src/modules/IntegrityModule.js', import.meta.url),
        'utf8'
    );
    assert.match(source, /data-filter="all"/);
    assert.match(source, /data-filter="edited"/);
    assert.match(source, /data-filter="ai"/);
    assert.match(source, /data-filter="anomalous"/);
    assert.match(source, /SessionManager\.getAudit\(state\.sessionId\)/);
    assert.match(source, /✍️ EDICIÓN HUMANA/);
    assert.match(source, /🤖 SUGERIDO IA/);
    assert.match(source, /⚠️ ANOMALÍA/);
});

test('AuditEngine.generateIndividualReport no arroja error de referencia y usa ideaCentral', async () => {
    const state = {
        sessionId: 123,
        synthesis: { ideaCentral: 'Evidencia clave detectada en el discurso.' }
    };
    const stats = {
        production: { segments: 10, words: 150, duration: '2.5', wpm: 60 },
        complexity: { lexicalDiversity: '45.0' }
    };
    const diagnosis = {
        weights: [{ label: 'barreras', weight: 60 }],
        distinctive: [{ term: 'costo' }, { term: 'acceso' }]
    };
    const impact = [{ term: 'costo', count: 5 }];

    const report = await AuditEngine.generateIndividualReport(state, stats, diagnosis, impact);
    assert.match(report, /Evidencia clave detectada en el discurso\./);
    assert.match(report, /ID Sesión: 123/);
    assert.match(report, /Velocidad \| 60 wpm/);
});

test('AuditEngine.generateFullProjectReport incluye sección forense detallada si hay trazas', () => {
    const state = {
        topology: 'integrity',
        isProvisional: false,
        auditSummary: {
            traceabilityCases: 1,
            total: 20,
            edited: 15,
            changed: 3,
            anomalous: 2
        }
    };
    const stats = {
        production: { segments: 20, words: 300, duration: '4.0', wpm: 75 },
        complexity: { lexicalDiversity: '52.0' }
    };

    const report = AuditEngine.generateFullProjectReport(state, stats);
    assert.match(report, /ESTADO FORENSE Y TRAZABILIDAD \(APU-04 → APU-05\)/);
    assert.match(report, /Casos con archivo de trazabilidad \(_trazabilidad\.json\): 1/);
    assert.match(report, /Segmentos editados por humano \(editedByHuman\): 15 \(75%\)/);
    assert.match(report, /Segmentos con anomalías \/ duración 0: 2/);
});
