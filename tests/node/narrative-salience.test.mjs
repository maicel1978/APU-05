import assert from 'node:assert/strict';
import test from 'node:test';

import {
    detectNarrativeSalience,
    tokenizeSalience
} from '../../src/science/NarrativeSalience.js';

function segment(sessionId, text, index = 1) {
    return { sessionId, segmentId: `${sessionId}-${index}`, cleanedText: text };
}

test('menos de tres entrevistas no produce supuestas sorpresas', () => {
    const result = detectNarrativeSalience([
        segment(1, 'dolor dolor salud salud'),
        segment(2, 'dolor dolor salud salud')
    ]);

    assert.deepEqual(result.findings, []);
    assert.match(result.warnings.join('\n'), /al menos 3 entrevistas/);
});

test('distribuciones idénticas no producen falsos hallazgos', () => {
    const result = detectNarrativeSalience([
        segment(1, 'dolor dolor salud salud'),
        segment(2, 'dolor dolor salud salud'),
        segment(3, 'dolor dolor salud salud')
    ]);

    assert.deepEqual(result.findings, []);
});

test('distribuciones proporcionales con longitudes distintas no producen hallazgos', () => {
    const result = detectNarrativeSalience([
        segment(1, 'dolor dolor salud salud'),
        segment(2, 'dolor dolor dolor dolor salud salud salud salud'),
        segment(3, 'dolor dolor salud salud')
    ]);

    assert.deepEqual(result.findings, []);
});

test('detecta enriquecimiento leave-one-out con referencia en dos sesiones', () => {
    const result = detectNarrativeSalience([
        segment(1, 'dolor dolor dolor dolor dolor dolor salud salud'),
        segment(2, 'dolor salud salud apoyo apoyo'),
        segment(3, 'dolor salud salud acceso acceso')
    ]);
    const finding = result.findings.find((item) => item.sessionId === 1 && item.term === 'dolor');

    assert.ok(finding);
    assert.equal(finding.referenceCount, 2);
    assert.ok(finding.ratio >= 2);
    assert.equal(finding.status, 'SALIENCIA_RELATIVA');
});

test('una mención aislada no se promueve como saliencia', () => {
    const result = detectNarrativeSalience([
        segment(1, 'dolor salud salud términoaislado'),
        segment(2, 'dolor dolor salud salud'),
        segment(3, 'dolor dolor salud salud')
    ]);

    assert.equal(result.findings.some((item) => item.term === 'términoaislado'), false);
    assert.equal(result.novelCandidates.some((item) => item.term === 'términoaislado'), false);
});

test('un término repetido sin referencia queda separado como candidato nuevo', () => {
    const result = detectNarrativeSalience([
        segment(1, 'teleconsulta teleconsulta teleconsulta salud'),
        segment(2, 'dolor dolor salud salud'),
        segment(3, 'dolor dolor salud salud')
    ]);

    assert.equal(result.findings.some((item) => item.term === 'teleconsulta'), false);
    const candidate = result.novelCandidates.find((item) => item.term === 'teleconsulta');
    assert.ok(candidate);
    assert.equal(candidate.status, 'SIN_REFERENCIA');
    assert.equal(candidate.ratio, null);
});

test('conserva evidencia trazable al segmento original', () => {
    const result = detectNarrativeSalience([
        segment(1, 'dolor dolor dolor dolor dolor dolor salud salud', 7),
        segment(2, 'dolor salud salud apoyo apoyo'),
        segment(3, 'dolor salud salud acceso acceso')
    ]);
    const finding = result.findings.find((item) => item.sessionId === 1 && item.term === 'dolor');

    assert.equal(finding.evidence[0].segmentId, '1-7');
    assert.match(finding.evidence[0].text, /dolor/);
});

test('tokeniza español Unicode y filtra palabras funcionales', () => {
    assert.deepEqual(
        tokenizeSalience('La telemedicina también mejoró la atención clínica.'),
        ['telemedicina', 'mejoró', 'atención', 'clínica']
    );
});
