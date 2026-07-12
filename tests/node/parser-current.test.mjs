import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { APUParser } from '../../src/core/Parser.js';
import { runTests as runBrowserParserTests } from '../Parser.test.js';

const readJson = async (relativePath) => JSON.parse(
    await readFile(new URL(relativePath, import.meta.url), 'utf8')
);

test('la suite compartida del Parser termina sin falsos positivos', async () => {
    const failures = [];
    const result = await runBrowserParserTests({
        log(name, passed, error) {
            if (!passed) failures.push({ name, error });
        }
    });

    assert.equal(result.passed, result.total, JSON.stringify(failures, null, 2));
    assert.equal(result.total, 13);
});

test('el fixture histórico 4.0.0 puede caracterizarse sin modificarlo', async () => {
    const fixture = await readJson('../../assets/test_data/entrevista01.json');
    const { data, warnings } = await APUParser.validate(fixture, 'individual');

    assert.equal(data.schemaVersion, '4.0.0');
    assert.equal(data.segments.length, 9);
    assert.deepEqual(warnings, []);
});

test('el fixture actual 5.0.0 puede caracterizarse sin modificarlo', async () => {
    const fixture = await readJson('../../uploads/speakers-5_cleaned (1).json');
    const before = JSON.stringify(fixture);
    const { data, warnings } = await APUParser.validate(fixture, 'individual');

    assert.equal(data.schemaVersion, '5.0.0');
    assert.equal(data.finalizedByHuman, true);
    assert.equal(data.segments.length, 49);
    assert.deepEqual(warnings, []);
    assert.equal(JSON.stringify(fixture), before, 'el Parser no debe mutar el archivo cargado');
});

test('start === end se conserva como compatibilidad heredada', async () => {
    const fixture = await readJson('../../uploads/speakers-5_cleaned (1).json');
    const zeroDuration = fixture.segments.filter((segment) => segment.start === segment.end);

    assert.ok(zeroDuration.length > 0, 'el fixture debe conservar al menos un caso real');
    await assert.doesNotReject(() => APUParser.validate(fixture, 'individual'));
});

test('la trazabilidad 5.0.0 no se acepta como corpus principal', async () => {
    const traceability = await readJson('../../uploads/speakers-5_trazabilidad.json');

    await assert.rejects(
        () => APUParser.validate(traceability, 'individual'),
        /TEXTO AUSENTE/
    );
});
