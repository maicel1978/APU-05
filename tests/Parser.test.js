import { APUParser } from '../src/core/Parser.js';

/**
 * Suite de caracterización del Parser actual.
 *
 * Estas pruebas describen lo que el prototipo hace hoy. Los nombres
 * GAP_DOCUMENTADO señalan controles todavía ausentes; no certifican R13.
 */
export async function runTests(logger) {
    const tests = [
        testRejectsWrongUnit,
        testRejectsMissingSegments,
        testRejectsDuplicateSegmentId,
        testRejectsEmptyText,
        testWarnsMissingCovariateSchema,
        testAcceptsVersion4FixtureShape,
        testAcceptsVersion5FixtureShape,
        testAcceptsZeroDurationForInheritedCompatibility,
        testGapEcosystemIsNotChecked,
        testGapStageIsNotChecked,
        testGapSpeakerReferenceIsNotChecked,
        testGapReversedTimesAreNotChecked,
        testGapFinalizationIsNotChecked
    ];

    let passed = 0;
    for (const test of tests) {
        try {
            await test();
            logger.log(`PARSER: ${test.name}`, true);
            passed++;
        } catch (error) {
            logger.log(`PARSER: ${test.name}`, false, error.message);
        }
    }
    return { total: tests.length, passed };
}

function validInput(overrides = {}) {
    return {
        schemaVersion: '5.0.0',
        ecosystem: 'APU',
        unit: 'APU-04',
        stage: 'cleaned-text',
        finalizedByHuman: true,
        covariateSchema: [],
        speakers: [{ id: 'S1', label: 'Participante', covariates: {} }],
        segments: [
            { segmentId: 'seg-1', speakerId: 'S1', start: 0, end: 1, cleanedText: 'Texto válido' }
        ],
        ...overrides
    };
}

async function expectRejected(input, expectedText) {
    let error = null;
    try {
        await APUParser.validate(input, 'individual');
    } catch (caught) {
        error = caught;
    }
    if (!error) throw new Error(`Se esperaba rechazo con: ${expectedText}`);
    if (!error.message.includes(expectedText)) {
        throw new Error(`Mensaje inesperado: ${error.message}`);
    }
}

async function testRejectsWrongUnit() {
    await expectRejected(validInput({ unit: 'APU-03' }), 'UNIDAD INVÁLIDA');
}

async function testRejectsMissingSegments() {
    await expectRejected(validInput({ segments: undefined }), 'FALLO ESTRUCTURAL');
}

async function testRejectsDuplicateSegmentId() {
    const segment = validInput().segments[0];
    await expectRejected(validInput({ segments: [segment, { ...segment }] }), 'SEGMENTO DUPLICADO');
}

async function testRejectsEmptyText() {
    await expectRejected(validInput({
        segments: [{ segmentId: 'seg-1', speakerId: 'S1', start: 0, end: 1, cleanedText: '' }]
    }), 'TEXTO AUSENTE');
}

async function testWarnsMissingCovariateSchema() {
    const { warnings } = await APUParser.validate(validInput({ covariateSchema: undefined }));
    if (!warnings.some((warning) => warning.includes('HERENCIA DÉBIL'))) {
        throw new Error('Falta la advertencia de covariables ausentes');
    }
}

async function testAcceptsVersion4FixtureShape() {
    await APUParser.validate(validInput({ schemaVersion: '4.0.0', finalizedByHuman: undefined }));
}

async function testAcceptsVersion5FixtureShape() {
    await APUParser.validate(validInput({ schemaVersion: '5.0.0', finalizedByHuman: true }));
}

async function testAcceptsZeroDurationForInheritedCompatibility() {
    await APUParser.validate(validInput({
        segments: [{ segmentId: 'seg-1', speakerId: 'S1', start: 4, end: 4, cleanedText: 'Último fragmento' }]
    }));
}

async function testGapEcosystemIsNotChecked() {
    await APUParser.validate(validInput({ ecosystem: 'OTRO' }));
}

async function testGapStageIsNotChecked() {
    await APUParser.validate(validInput({ stage: 'raw' }));
}

async function testGapSpeakerReferenceIsNotChecked() {
    await APUParser.validate(validInput({
        segments: [{ segmentId: 'seg-1', speakerId: 'NO-EXISTE', start: 0, end: 1, cleanedText: 'Texto' }]
    }));
}

async function testGapReversedTimesAreNotChecked() {
    await APUParser.validate(validInput({
        segments: [{ segmentId: 'seg-1', speakerId: 'S1', start: 10, end: 5, cleanedText: 'Texto' }]
    }));
}

async function testGapFinalizationIsNotChecked() {
    const { warnings } = await APUParser.validate(validInput({ finalizedByHuman: false }));
    if (warnings.some((warning) => warning.includes('finaliz'))) {
        throw new Error('La caracterización esperaba que la finalización aún no fuera comprobada');
    }
}
