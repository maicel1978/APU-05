import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { LongitudinalEngine } from '../../src/science/LongitudinalEngine.js';

test('LongitudinalEngine.calculateLexicalDrift calcula exactamente las tasas de persistencia e innovación y delta wpm', () => {
    const segmentsA = [
        { start: 0, end: 60, cleanedText: 'el paciente refiere dolor persistente en la consulta inicial del hospital' },
        { start: 60, end: 120, cleanedText: 'también comenta dificultades económicas para pagar tratamiento médico' }
    ];
    const segmentsB = [
        { start: 0, end: 60, cleanedText: 'en esta segunda visita el paciente refiere menos dolor tras iniciar tratamiento médico' },
        { start: 60, end: 120, cleanedText: 'sin embargo ahora presenta insomnio nocturno moderado en casa' }
    ];

    const drift = LongitudinalEngine.calculateLexicalDrift(segmentsA, segmentsB);
    assert.ok(drift.persistenceRate > 0, 'debe detectar vocabulario persistente');
    assert.ok(drift.innovationRate > 0, 'debe detectar vocabulario emergente');
    assert.ok(drift.persistentTerms.includes('dolor') || drift.persistentTerms.includes('tratamiento'), 'dolor/tratamiento deben persistir');
    assert.ok(drift.emergentTerms.includes('insomnio') || drift.emergentTerms.includes('nocturno'), 'insomnio/nocturno deben ser emergentes');
    assert.ok(Number.isFinite(drift.deltaWpm), 'deltaWpm debe ser numérico finito');
});

test('LongitudinalEngine.generateDescriptiveSummary incluye obligatoriamente la advertencia metodológica contra causalidad automática R7', () => {
    const drift = {
        persistenceRate: 65.2,
        innovationRate: 34.8,
        persistentCount: 15,
        emergentCount: 8,
        deltaWpm: 5.4,
        persistentTerms: ['dolor', 'tratamiento'],
        emergentTerms: ['insomnio']
    };

    const summary = LongitudinalEngine.generateDescriptiveSummary(drift, 'Corte 1', 'Corte 2');
    assert.match(summary.statement, /persistencia léxica del 65\.2%/);
    assert.match(summary.statement, /innovación léxica del 34\.8%/);
    assert.match(summary.methodologicalWarning, /PROHIBIDO inferir o declarar relaciones de causalidad/i);
    assert.match(summary.methodologicalWarning, /Regla R7/);
});

test('LongitudinalModule define correctamente id, pasos y protecciones no causales D-038 / R7', async () => {
    const source = await readFile(
        new URL('../../src/modules/LongitudinalModule.js', import.meta.url),
        'utf8'
    );
    assert.match(source, /id:\s*'longitudinal'/);
    assert.match(source, /\{\s*id:\s*1,\s*label:\s*'INGESTA'\s*\}/);
    assert.match(source, /\{\s*id:\s*2,\s*label:\s*'EVOLUCIÓN'\s*\}/);
    assert.match(source, /REGLA PRISMA\+ R7 \/ D-038/);
    assert.match(source, /LongitudinalEngine\.calculateLexicalDrift/);
    assert.match(source, /LongitudinalEngine\.generateDescriptiveSummary/);
});
