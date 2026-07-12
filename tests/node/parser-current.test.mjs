import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { APUParser } from '../../src/core/Parser.js';
import { runTests as runBrowserParserTests } from '../Parser.test.js';

const readJson = async (relativePath) => JSON.parse(
    await readFile(new URL(relativePath, import.meta.url), 'utf8')
);

test('la suite compartida certifica el contrato estricto sin falsos positivos', async () => {
    const failures = [];
    const result = await runBrowserParserTests({
        log(name, passed, error) {
            if (!passed) failures.push({ name, error });
        }
    });

    assert.equal(result.passed, result.total, JSON.stringify(failures, null, 2));
    assert.equal(result.total, 16);
});

test('rechaza explícitamente el fixture histórico 4.0.0', async () => {
    const fixture = await readJson('../../assets/test_data/entrevista01.json');

    await assert.rejects(
        () => APUParser.validate(fixture, 'individual'),
        /VERSIÓN NO COMPATIBLE.*5\.x\.x.*4\.0\.0/
    );
});

test('acepta los dos benchmarks revisados APU-04 5.0.0 sin mutarlos', async () => {
    for (const relativePath of [
        '../../uploads/barreras_cleaned.json',
        '../../uploads/gasto_cleaned.json'
    ]) {
        const fixture = await readJson(relativePath);
        const before = JSON.stringify(fixture);
        const result = await APUParser.validate(fixture, 'individual');

        assert.equal(result.data.finalizedByHuman, true);
        assert.equal(result.requiresConfirmation, false);
        assert.equal(JSON.stringify(fixture), before);
    }
});

test('acepta y advierte el caso real 5.0.0 con duración cero', async () => {
    const fixture = await readJson('../../uploads/speakers-5_cleaned (1).json');
    const result = await APUParser.validate(fixture, 'individual');

    assert.ok(fixture.segments.some((segment) => segment.start === segment.end));
    assert.match(result.warnings.join('\n'), /DURACIÓN NO CALCULABLE/);
});

test('empareja el paquete gasto por sourceSession y segmentId', async () => {
    const cleaned = await readJson('../../uploads/gasto_cleaned.json');
    const traceability = await readJson('../../uploads/gasto_trazabilidad.json');
    const result = await APUParser.validate(cleaned, 'individual', traceability);

    assert.equal(result.traceability, traceability);
    assert.equal(result.traceability.auditLog.finalizedByHuman, true);
});

test('empareja el paquete barreras por sourceSession y segmentId', async () => {
    const cleaned = await readJson('../../uploads/barreras_cleaned.json');
    const traceability = await readJson('../../uploads/barreras_trazabilidad.json');

    await assert.doesNotReject(() => APUParser.validate(cleaned, 'individual', traceability));
});

test('rechaza usar trazabilidad como corpus principal', async () => {
    const traceability = await readJson('../../uploads/gasto_trazabilidad.json');

    await assert.rejects(
        () => APUParser.validate(traceability, 'individual'),
        /ETAPA INVÁLIDA.*cleaned-text/
    );
});

test('un corpus no finalizado requiere decisión sin ser mutado', async () => {
    const fixture = await readJson('../../assets/test_data/provisional_v5.json');
    const before = JSON.stringify(fixture);
    const result = await APUParser.validate(fixture, 'individual');

    assert.equal(result.requiresConfirmation, true);
    assert.match(result.warnings.join('\n'), /resultados serán provisionales/);
    assert.equal(JSON.stringify(fixture), before);
});
