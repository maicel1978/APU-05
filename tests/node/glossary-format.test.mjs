import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { normalizeGlossaryImport } from '../../src/science/GlossaryFormat.js';

const readJson = async (relativePath) => JSON.parse(
    await readFile(new URL(relativePath, import.meta.url), 'utf8')
);

test('acepta la plantilla histórica v7.7 incluida en test_data', async () => {
    const fixture = await readJson('../../assets/test_data/APU05_Glosario_Maestro_1783541182585.json');

    assert.equal(fixture.version, '7.7.0');
    assert.deepEqual(normalizeGlossaryImport(fixture), []);
});

test('acepta el formato actual exportado por GlossaryManager', () => {
    const entries = normalizeGlossaryImport({
        apu_version: '8.5.0',
        custom_glossary: [
            { term: ' Ansiedad ', category: ' Síntomas ' },
            { term: 'telemedicina', category: 'contextos' }
        ]
    });

    assert.deepEqual(entries, [
        { term: 'Ansiedad', category: 'Síntomas' },
        { term: 'telemedicina', category: 'contextos' }
    ]);
});

test('acepta términos históricos cuando tienen contrato term/category', () => {
    const entries = normalizeGlossaryImport({
        appName: 'APU-05',
        version: '7.7.0',
        terms: [{ term: 'dolor crónico', category: 'síntomas' }]
    });

    assert.deepEqual(entries, [{ term: 'dolor crónico', category: 'síntomas' }]);
});

test('rechaza archivos ajenos aunque contengan una propiedad terms', () => {
    assert.throws(
        () => normalizeGlossaryImport({ appName: 'OTRA-APP', terms: [] }),
        /no compatible/
    );
});

test('valida todos los términos antes de que el gestor escriba en la bóveda', () => {
    assert.throws(
        () => normalizeGlossaryImport({
            custom_glossary: [
                { term: 'válido', category: 'contexto' },
                { term: 'incompleto' }
            ]
        }),
        /Término 2.*term.*category/
    );
});
