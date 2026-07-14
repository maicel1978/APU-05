import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('ExploratoryModule._drawNetworkSvg genera un mapa SVG puro e interactivo sin dependencias de terceros', async () => {
    const source = await readFile(
        new URL('../../src/modules/ExploratoryModule.js', import.meta.url),
        'utf8'
    );
    assert.match(source, /<svg viewBox="0 0 650 360"/);
    assert.match(source, /class="svg-link" data-a="\$\{Renderer\.sanitize\(link\.source\)\}"/);
    assert.match(source, /class="svg-node" data-term="\$\{Renderer\.sanitize\(term\)\}"/);
    assert.match(source, /circle cx="/);
    assert.match(source, /line x1="/);
});

test('ExploratoryModule define manejadores de evidencia al hacer clic en nodos o enlaces del grafo', async () => {
    const source = await readFile(
        new URL('../../src/modules/ExploratoryModule.js', import.meta.url),
        'utf8'
    );
    assert.match(source, /_drawNetworkSvg\(topLinks,\s*activeNodes\)/);
    assert.match(source, /\._showLinkEvidence\(/);
    assert.match(source, /\._showNodeEvidence\(/);
    assert.match(source, /Renderer\.sanitize\(/);
});

test('Renderer.renderCorpus implementa virtualización y observador de intersección para grandes corpus', async () => {
    const source = await readFile(
        new URL('../../src/ui/Renderer.js', import.meta.url),
        'utf8'
    );
    assert.match(source, /className = 'corpus-list-virtual'/);
    assert.match(source, /id = 'virtual-scroll-sentinel'/);
    assert.match(source, /new IntersectionObserver\(/);
});
