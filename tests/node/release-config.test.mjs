import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = async (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('la propuesta CI ejecuta npm test en versiones LTS y actual', async () => {
    const workflow = await read('../../docs/templates/apu05-ci.yml');

    assert.match(workflow, /node-version: \[18, 20, 22\]/);
    assert.match(workflow, /run: npm test/);
    assert.match(workflow, /permissions:\s+contents: read/);
});

test('Netlify publica la raíz con headers defensivos básicos', async () => {
    const config = await read('../../netlify.toml');

    assert.match(config, /publish = "\."/);
    assert.match(config, /X-Content-Type-Options = "nosniff"/);
    assert.match(config, /X-Frame-Options = "DENY"/);
    assert.match(config, /Cache-Control = "no-cache, no-store, must-revalidate"/);
});

test('index declara un favicon local existente', async () => {
    const index = await read('../../index.html');
    const favicon = await read('../../assets/favicon.svg');

    assert.match(index, /rel="icon" href="assets\/favicon\.svg"/);
    assert.match(favicon, /<svg/);
    assert.match(favicon, /viewBox="0 0 64 64"/);
});

test('el RC declara módulos pendientes y deuda CDN', async () => {
    const checklist = await read('../../docs/RELEASE_CANDIDATE.md');

    assert.match(checklist, /Longitudinal: placeholder/);
    assert.match(checklist, /Integridad: UI placeholder/);
    assert.match(checklist, /Dexie y Chart\.js aún usan CDN/);
});
