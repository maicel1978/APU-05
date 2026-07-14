import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { buildInputPackages, readInputPackages } from '../../src/core/InputPackage.js';

const readJson = async (relativePath) => JSON.parse(
    await readFile(new URL(relativePath, import.meta.url), 'utf8')
);

async function expensePair() {
    return [
        { name: 'gasto_trace.json', data: await readJson('../../assets/test_data/benchmarks_v5/gasto_bolsillo/gasto_trazabilidad.json') },
        { name: 'nombre-libre.json', data: await readJson('../../assets/test_data/benchmarks_v5/gasto_bolsillo/gasto_cleaned.json') }
    ];
}

test('empareja corpus y trazabilidad por contenido, sin depender de nombre u orden', async () => {
    const packages = buildInputPackages(await expensePair());

    assert.equal(packages.length, 1);
    assert.equal(packages[0].sourceSession, 'qa-gasto-bolsillo-speakers-v3');
    assert.equal(packages[0].cleaned.stage, 'cleaned-text');
    assert.equal(packages[0].traceability.stage, 'trazabilidad');
    assert.equal(packages[0].cleanedFileName, 'nombre-libre.json');
});

test('acepta un corpus limpio sin trazabilidad', async () => {
    const cleaned = await readJson('../../assets/test_data/benchmarks_v5/barreras/barreras_cleaned.json');
    const packages = buildInputPackages([{ name: 'barreras.json', data: cleaned }]);

    assert.equal(packages.length, 1);
    assert.equal(packages[0].traceability, null);
});

test('construye una cohorte de dos paquetes completos', async () => {
    const documents = [
        ...(await expensePair()),
        { name: 'b-clean.json', data: await readJson('../../assets/test_data/benchmarks_v5/barreras/barreras_cleaned.json') },
        { name: 'b-trace.json', data: await readJson('../../assets/test_data/benchmarks_v5/barreras/barreras_trazabilidad.json') }
    ];
    const packages = buildInputPackages(documents);

    assert.equal(packages.length, 2);
    assert.ok(packages.every((item) => item.cleaned && item.traceability));
});

test('rechaza trazabilidad huérfana', async () => {
    const traceability = await readJson('../../assets/test_data/benchmarks_v5/gasto_bolsillo/gasto_trazabilidad.json');

    assert.throws(
        () => buildInputPackages([{ name: 'trace.json', data: traceability }]),
        /hay trazabilidad, pero falta el corpus/
    );
});

test('rechaza dos corpus para el mismo sourceSession', async () => {
    const cleaned = await readJson('../../assets/test_data/benchmarks_v5/gasto_bolsillo/gasto_cleaned.json');

    assert.throws(
        () => buildInputPackages([
            { name: 'uno.json', data: cleaned },
            { name: 'dos.json', data: structuredClone(cleaned) }
        ]),
        /dos corpus principales/
    );
});

test('rechaza dos trazabilidades para el mismo sourceSession', async () => {
    const pair = await expensePair();
    pair.push({ name: 'otra-trace.json', data: structuredClone(pair[0].data) });

    assert.throws(() => buildInputPackages(pair), /dos archivos de trazabilidad/);
});

test('rechaza reportes de calidad en el selector de corpus', async () => {
    const quality = await readJson('../../assets/test_data/benchmarks_v5/gasto_bolsillo/gasto_quality_report.json');

    assert.throws(
        () => buildInputPackages([{ name: 'quality.json', data: quality }]),
        /etapa "quality-report" no admitida/
    );
});

test('rechaza documentos sin sourceSession identificable', async () => {
    assert.throws(
        () => buildInputPackages([{
            name: 'sin-sesion.json',
            data: { stage: 'cleaned-text', sourceSession: null }
        }]),
        /falta sourceSession/
    );
});

test('no modifica los documentos recibidos', async () => {
    const documents = await expensePair();
    const before = JSON.stringify(documents);

    buildInputPackages(documents);
    assert.equal(JSON.stringify(documents), before);
});

test('lee archivos del navegador antes de clasificarlos', async () => {
    const cleaned = await readJson('../../assets/test_data/benchmarks_v5/gasto_bolsillo/gasto_cleaned.json');
    const packages = await readInputPackages([{
        name: 'gasto.json',
        async text() { return JSON.stringify(cleaned); }
    }]);

    assert.equal(packages.length, 1);
    assert.equal(packages[0].sourceSession, cleaned.sourceSession);
    assert.equal(packages[0].cleanedFileName, 'gasto.json');
});

test('informa qué archivo no contiene JSON válido', async () => {
    await assert.rejects(
        () => readInputPackages([{
            name: 'dañado.json',
            async text() { return '{'; }
        }]),
        /dañado\.json.*JSON válido/
    );
});
