import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const fixturePaths = [
    '../../assets/test_data/apu04_inputs/qa-geriatria-barreras-speakers-v3.json',
    '../../assets/test_data/apu04_inputs/qa-gasto-bolsillo-speakers-v3.json',
    '../../assets/test_data/apu04_inputs/transversal/qa-transversal-control-01-speakers-v3.json',
    '../../assets/test_data/apu04_inputs/transversal/qa-transversal-control-02-speakers-v3.json',
    '../../assets/test_data/apu04_inputs/transversal/qa-transversal-intervencion-01-speakers-v3.json',
    '../../assets/test_data/apu04_inputs/transversal/qa-transversal-intervencion-02-speakers-v3.json'
];

const readJson = async (relativePath) => JSON.parse(
    await readFile(new URL(relativePath, import.meta.url), 'utf8')
);

for (const fixturePath of fixturePaths) {
    test(`entrada de reprocesamiento válida: ${fixturePath.split('/').pop()}`, async () => {
        const fixture = await readJson(fixturePath);

        assert.equal(fixture.schemaVersion, '3.0.0');
        assert.equal(fixture.ecosystem, 'APU');
        assert.equal(fixture.unit, 'APU-03');
        assert.equal(fixture.stage, 'speaker-refinement');
        assert.ok(Array.isArray(fixture.speakers) && fixture.speakers.length > 0);
        assert.ok(Array.isArray(fixture.segments) && fixture.segments.length > 0);
        assert.equal('finalizedByHuman' in fixture, false);

        const speakerIds = new Set(fixture.speakers.map((speaker) => speaker.id));
        const segmentIds = new Set();
        for (const segment of fixture.segments) {
            assert.equal(typeof segment.id, 'string');
            assert.equal(segmentIds.has(segment.id), false, `ID duplicado: ${segment.id}`);
            segmentIds.add(segment.id);
            assert.equal(speakerIds.has(segment.speakerId), true, `Hablante ausente: ${segment.speakerId}`);
            assert.equal(typeof segment.text, 'string');
            assert.notEqual(segment.text.trim(), '');
            assert.equal('cleanedText' in segment, false);
            assert.equal(Number.isFinite(segment.start), true);
            assert.equal(Number.isFinite(segment.end), true);
            assert.ok(segment.end >= segment.start);
        }
    });
}
