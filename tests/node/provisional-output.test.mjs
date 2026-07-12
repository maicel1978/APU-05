import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { AuditEngine } from '../../src/science/AuditEngine.js';

const stats = {
    production: { words: 12, segments: 2, duration: '1.00' },
    complexity: { lexicalDiversity: '50.0' }
};

test('el reporte finalizado conserva estado consolidado', () => {
    const report = AuditEngine.generateFullProjectReport(
        { topology: 'single-case', isProvisional: false },
        stats
    );

    assert.match(report, /Estado: Consolidado/);
    assert.doesNotMatch(report, /ADVERTENCIA.*exploratorio/);
});

test('el reporte provisional muestra advertencia explícita', () => {
    const report = AuditEngine.generateFullProjectReport(
        { topology: 'single-case', isProvisional: true },
        stats
    );

    assert.match(report, /Estado: PROVISIONAL/);
    assert.match(report, /ADVERTENCIA: Este documento es exploratorio/);
    assert.match(report, /corpus puede cambiar/);
});

test('todos los módulos de ingesta exigen decisión antes de persistir un provisional', async () => {
    const modules = [
        '../../src/modules/IndividualModule.js',
        '../../src/modules/ExploratoryModule.js',
        '../../src/modules/TransversalModule.js'
    ];

    for (const relativePath of modules) {
        const source = await readFile(new URL(relativePath, import.meta.url), 'utf8');
        const confirmationIndex = source.indexOf('Renderer.confirmProvisional');
        const persistenceIndex = source.indexOf('SessionManager.createSession');
        assert.ok(confirmationIndex >= 0, `${relativePath} no pide confirmación`);
        assert.ok(persistenceIndex > confirmationIndex, `${relativePath} persiste antes de confirmar`);
        assert.match(source, /e\.target\.value\s*=\s*['"]{2}/, `${relativePath} no permite reintentar el mismo archivo tras cancelar`);
        assert.match(source, /State\.isProvisional\s*=/);
    }
});

test('lector y módulos metodológicos muestran la marca provisional', async () => {
    const modules = [
        '../../src/modules/IndividualModule.js',
        '../../src/modules/ExploratoryModule.js',
        '../../src/modules/TransversalModule.js',
        '../../src/modules/ReaderModule.js'
    ];

    for (const relativePath of modules) {
        const source = await readFile(new URL(relativePath, import.meta.url), 'utf8');
        assert.match(source, /Renderer\.renderProvisionalBanner/);
    }
});
