import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = async (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('StatsEngine consulta todas las sesiones para covariables y G²', async () => {
    const source = await readSource('../../src/science/StatsEngine.js');

    assert.match(source, /getAvailableCovariatesForSessions\(sessionIds\)/);
    assert.match(source, /getCovariateValuesForSessions\(sessionIds, covariateKey\)/);
    assert.match(source, /calculateKeyness\(sessionIds, covariateKey, groupA, groupB/);
    assert.match(source, /prepareKeynessComparison/);
});

test('Transversal exige selección explícita de variable, Grupo A y Grupo B', async () => {
    const source = await readSource('../../src/modules/TransversalModule.js');

    assert.match(source, /id="g2-var"/);
    assert.match(source, /id="g2-a"/);
    assert.match(source, /id="g2-b"/);
    assert.match(source, /groupA\.value === groupB\.value/);
    assert.match(source, /state\.sessionIds, variable\.value, groupA\.value, groupB\.value/);
});

test('la UI no denomina significancia estadística al contraste', async () => {
    const source = await readSource('../../src/modules/TransversalModule.js');

    assert.doesNotMatch(source, /Significancia Estadística/i);
    assert.match(source, /Contraste Léxico Exploratorio/);
    assert.match(source, /No demuestra efecto clínico/);
});

test('la salida muestra G², PMW, participantes y segmentos excluidos', async () => {
    const source = await readSource('../../src/modules/TransversalModule.js');

    assert.match(source, /participantCount/);
    assert.match(source, /groupAPmw/);
    assert.match(source, /groupBPmw/);
    assert.match(source, /excludedSegments/);
});
