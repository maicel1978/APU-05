import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
    buildSpeakerMap,
    resolveSpeakerLabel,
    speakerKey
} from '../../src/core/SpeakerIdentity.js';

const speakers = [
    { sessionId: 10, id: 'spk-1', label: 'Dra. A' },
    { sessionId: 10, id: 'spk-2', label: 'Paciente A' },
    { sessionId: 11, id: 'spk-1', label: 'Dr. B' },
    { sessionId: 11, id: 'spk-2', label: 'Paciente B' }
];

test('construye una clave compuesta estable', () => {
    assert.equal(speakerKey(10, 'spk-2'), '10::spk-2');
    assert.equal(speakerKey(null, 'spk-2'), 'spk-2');
});

test('separa hablantes con el mismo ID en sesiones diferentes', () => {
    const map = buildSpeakerMap(speakers, true);

    assert.equal(map.get('10::spk-2'), 'Paciente A · Entrevista #10');
    assert.equal(map.get('11::spk-2'), 'Paciente B · Entrevista #11');
    assert.equal(map.has('spk-2'), false, 'un ID repetido no debe tener alias ambiguo');
});

test('resuelve la etiqueta usando sessionId + speakerId', () => {
    const map = buildSpeakerMap(speakers, true);

    assert.equal(resolveSpeakerLabel(map, { sessionId: 10, speakerId: 'spk-1' }), 'Dra. A · Entrevista #10');
    assert.equal(resolveSpeakerLabel(map, { sessionId: 11, speakerId: 'spk-1' }), 'Dr. B · Entrevista #11');
});

test('mantiene compatibilidad por ID simple cuando no existe colisión', () => {
    const map = buildSpeakerMap([{ sessionId: 7, id: 'S1', label: 'Único' }]);

    assert.equal(map.get('7::S1'), 'Único');
    assert.equal(map.get('S1'), 'Único');
});

test('StatsEngine agrupa participación por identidad compuesta', async () => {
    const source = await readFile(new URL('../../src/science/StatsEngine.js', import.meta.url), 'utf8');

    assert.match(source, /speakerKey\(s\.sessionId, s\.speakerId\)/);
    assert.doesNotMatch(source, /speakerStats\[s\.speakerId\]/);
});

test('las cohortes guardan todas las sesiones y construyen un mapa conjunto', async () => {
    for (const relativePath of [
        '../../src/modules/ExploratoryModule.js',
        '../../src/modules/TransversalModule.js'
    ]) {
        const source = await readFile(new URL(relativePath, import.meta.url), 'utf8');
        assert.match(source, /State\.sessionIds\s*=\s*sessionIds/);
        assert.match(source, /getSpeakerMapForSessions\(sessionIds\)/);
    }
});
