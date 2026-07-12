import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
    getCovariateValues,
    prepareKeynessComparison
} from '../../src/science/KeynessGroups.js';

const paths = [
    '../../assets/test_data/apu04_inputs/transversal/qa-transversal-control-01-speakers-v3.json',
    '../../assets/test_data/apu04_inputs/transversal/qa-transversal-control-02-speakers-v3.json',
    '../../assets/test_data/apu04_inputs/transversal/qa-transversal-intervencion-01-speakers-v3.json',
    '../../assets/test_data/apu04_inputs/transversal/qa-transversal-intervencion-02-speakers-v3.json'
];

async function loadCohort() {
    const speakers = [];
    const segments = [];
    for (const [index, path] of paths.entries()) {
        const data = JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
        const sessionId = index + 1;
        speakers.push(...data.speakers.map((speaker) => ({ ...speaker, sessionId })));
        segments.push(...data.segments.map((segment) => ({
            sessionId,
            segmentId: segment.id,
            speakerId: segment.speakerId,
            cleanedText: segment.text
        })));
    }
    return { speakers, segments };
}

test('descubre valores disponibles de una covariable', async () => {
    const { speakers } = await loadCohort();

    assert.deepEqual(getCovariateValues(speakers, 'grupo_estudio'), ['Control', 'Intervención']);
    assert.deepEqual(getCovariateValues(speakers, 'no_existe'), []);
});

test('construye dos grupos explícitos y excluye entrevistadores sin grupo', async () => {
    const cohort = await loadCohort();
    const result = prepareKeynessComparison({
        ...cohort,
        covariateKey: 'grupo_estudio',
        groupA: 'Intervención',
        groupB: 'Control'
    }, { minTotal: 2 });

    assert.equal(result.groupA.participantCount, 2);
    assert.equal(result.groupB.participantCount, 2);
    assert.equal(result.includedSegments, 8);
    assert.equal(result.excludedSegments, 4);
    assert.deepEqual(result.warnings, []);
});

test('detecta vocabulario diseñado para cada grupo', async () => {
    const cohort = await loadCohort();
    const result = prepareKeynessComparison({
        ...cohort,
        covariateKey: 'grupo_estudio',
        groupA: 'Intervención',
        groupB: 'Control'
    }, { minTotal: 2, limit: 30 });

    assert.equal(result.terms.find((term) => term.word === 'acompañamiento')?.direction, 'Intervención');
    assert.equal(result.terms.find((term) => term.word === 'contraseña')?.direction, 'Control');
});

test('la selección A/B es obligatoria y diferente', async () => {
    const cohort = await loadCohort();

    assert.throws(
        () => prepareKeynessComparison({ ...cohort, covariateKey: 'grupo_estudio', groupA: 'Control', groupB: 'Control' }),
        /deben ser diferentes/
    );
    assert.throws(
        () => prepareKeynessComparison({ ...cohort, covariateKey: 'grupo_estudio', groupA: '', groupB: 'Control' }),
        /Seleccione Grupo A y Grupo B/
    );
});

test('rechaza un valor de grupo sin participantes', async () => {
    const cohort = await loadCohort();

    assert.throws(
        () => prepareKeynessComparison({
            ...cohort,
            covariateKey: 'grupo_estudio',
            groupA: 'Intervención',
            groupB: 'Placebo'
        }),
        /No hay participantes para Grupo B: Placebo/
    );
});
