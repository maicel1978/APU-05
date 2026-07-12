import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = async (relativePath) => readFile(
    new URL(relativePath, import.meta.url),
    'utf8'
);

test('SessionManager incluye audit en la misma transacción', async () => {
    const source = await readSource('../../src/core/Session.js');

    assert.match(source, /db\.transaction\('rw',\s*\[db\.sessions, db\.speakers, db\.segments, db\.audit\]/);
    assert.match(source, /traceability:\s*buildTraceabilityMetadata\(trazabilidadData\)/);
    assert.match(source, /db\.audit\.bulkAdd\(auditRecords\)/);
    assert.match(source, /static async getAudit\(sessionId\)/);
    assert.match(source, /static async getSession\(sessionId\)/);
});

test('los tres módulos pasan la trazabilidad validada a SessionManager', async () => {
    const modules = [
        '../../src/modules/IndividualModule.js',
        '../../src/modules/ExploratoryModule.js',
        '../../src/modules/TransversalModule.js'
    ];

    for (const relativePath of modules) {
        const source = await readSource(relativePath);
        assert.match(source, /readInputPackages\(files\)/, `${relativePath} no clasifica paquetes`);
        assert.match(
            source,
            /SessionManager\.createSession\(validation\.data, validation\.traceability\)/,
            `${relativePath} no persiste trazabilidad`
        );
        assert.match(source, /State\.auditSummary\s*=\s*summarizeTraceabilities/);
    }
});

test('Individual permite seleccionar corpus y trazabilidad juntos', async () => {
    const source = await readSource('../../src/modules/IndividualModule.js');

    assert.match(source, /id="wb-file-upload"[^>]*multiple/);
    assert.match(source, /packages\.length !== 1/);
});

test('el lector diferencia revisión, cambios reales y anomalías', async () => {
    const source = await readSource('../../src/modules/ReaderModule.js');

    assert.match(source, /audit\.reviewed/);
    assert.match(source, /audit\.changed/);
    assert.match(source, /audit\.anomalous/);
    assert.match(source, /TRAZABILIDAD: NO CARGADA/);
});
