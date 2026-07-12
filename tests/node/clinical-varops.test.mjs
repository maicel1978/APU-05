import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readJson = async (relativePath) => JSON.parse(
    await readFile(new URL(relativePath, import.meta.url), 'utf8')
);

test('el maestro .clinical conserva la raíz estable project + variables', async () => {
    const clinical = await readJson('../../assets/test_data/qa-transversal.clinical');

    assert.deepEqual(Object.keys(clinical).sort(), ['project', 'variables']);
    assert.equal(clinical.project.name, 'QA sintético de acceso digital en salud');
    assert.equal(clinical.variables.length, 1);
    assert.equal(clinical.variables[0].name, 'grupo_estudio');
    assert.equal(clinical.variables[0].type, 'Nominal Dicotómica');
    assert.deepEqual(
        clinical.variables[0].metadata.categories.map((category) => category.label),
        ['Intervención', 'Control']
    );
});

test('el .clinical define variables, no observaciones individuales', async () => {
    const clinical = await readJson('../../assets/test_data/qa-transversal.clinical');
    const serialized = JSON.stringify(clinical);

    assert.equal(serialized.includes('speakers'), false);
    assert.equal(serialized.includes('segments'), false);
    assert.equal(serialized.includes('spk-'), false);
});

test('las salidas APU-03 heredan esquema y asignan valores por hablante', async () => {
    const clinical = await readJson('../../assets/test_data/qa-transversal.clinical');
    const paths = [
        '../../assets/test_data/apu04_inputs/transversal/qa-transversal-control-01-speakers-v3.json',
        '../../assets/test_data/apu04_inputs/transversal/qa-transversal-control-02-speakers-v3.json',
        '../../assets/test_data/apu04_inputs/transversal/qa-transversal-intervencion-01-speakers-v3.json',
        '../../assets/test_data/apu04_inputs/transversal/qa-transversal-intervencion-02-speakers-v3.json'
    ];
    const allowed = new Set(clinical.variables[0].metadata.categories.map((category) => category.label));

    for (const path of paths) {
        const output = await readJson(path);
        assert.deepEqual(output.covariateProject, clinical.project);
        assert.equal(output.covariateSchema[0].name, clinical.variables[0].name);
        assert.deepEqual(output.covariateSchema[0].metadata, clinical.variables[0].metadata);
        assert.deepEqual(output.speakers[0].covariates, {});
        assert.equal(allowed.has(output.speakers[1].covariates.grupo_estudio), true);
    }
});
