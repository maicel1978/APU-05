import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = async (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('StatsEngine delega saliencia al motor leave-one-out', async () => {
    const source = await readSource('../../src/science/StatsEngine.js');

    assert.match(source, /detectNarrativeSalience\(segments, options\)/);
    assert.match(source, /getNarrativeSalience\(segments, options/);
    assert.doesNotMatch(source, /cohorteFreq/);
});

test('la UI acepta explícitamente que no existan saliencias', async () => {
    const source = await readSource('../../src/modules/ExploratoryModule.js');

    assert.match(source, /No se detectaron saliencias relativas/);
    assert.match(source, /no obliga a generar un hallazgo/);
    assert.doesNotMatch(source, /HALLAZGO ATÍPICO/);
});

test('la UI explica leave-one-out y conserva evidencia', async () => {
    const source = await readSource('../../src/modules/ExploratoryModule.js');

    assert.match(source, /referencia leave-one-out/);
    assert.match(source, /finding\.evidence/);
    assert.match(source, /Renderer\.sanitize\(item\.text\)/);
});

test('las hipótesis usan lenguaje exploratorio no normativo', async () => {
    const source = await readSource('../../src/science/StatsEngine.js');

    assert.match(source, /saliencia relativa/);
    assert.match(source, /podrían explicar esta saliencia exploratoria/);
    assert.doesNotMatch(source, /superior al promedio/);
    assert.doesNotMatch(source, /norma de la cohorte/);
});
