import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { getTopologyForMethod } from '../../src/core/StudyDesign.js';

const expectedMappings = {
    individual: 'single-case',
    exploratory: 'cohort',
    transversal: 'comparative',
    longitudinal: 'longitudinal',
    integrity: 'integrity'
};

test('cada módulo metodológico define una topología no nula', () => {
    for (const [methodId, expectedTopology] of Object.entries(expectedMappings)) {
        assert.equal(getTopologyForMethod(methodId), expectedTopology);
    }
});

test('un módulo desconocido no inventa una topología', () => {
    assert.equal(getTopologyForMethod('desconocido'), null);
    assert.equal(getTopologyForMethod(null), null);
});

test('App conecta la selección metodológica con State.topology', async () => {
    const appSource = await readFile(
        new URL('../../src/ui/App.js', import.meta.url),
        'utf8'
    );

    assert.match(appSource, /State\.topology\s*=\s*getTopologyForMethod\(id\)/);
});
