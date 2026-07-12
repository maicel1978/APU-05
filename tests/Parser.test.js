import { APUParser } from '../src/core/Parser.js';

/** Suite compartida de contrato APU-04 5.x. */
export async function runTests(logger) {
    const tests = [
        testAcceptsFinalizedV5,
        testRejectsLegacyV4,
        testRejectsWrongEcosystem,
        testRejectsWrongUnit,
        testRejectsWrongStage,
        testRejectsDuplicateSegment,
        testRejectsMissingSpeakerReference,
        testRejectsReversedTimes,
        testAcceptsZeroDurationWithWarning,
        testRejectsEmptyText,
        testRejectsMissingFinalization,
        testRequestsConfirmationForProvisional,
        testAllowsMissingCovariates,
        testAcceptsMatchingTraceability,
        testRejectsTraceabilitySessionMismatch,
        testRejectsTraceabilityIdMismatch
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
        schemaVersion: '5.0.0', ecosystem: 'APU', unit: 'APU-04',
        stage: 'cleaned-text', sourceSession: 'qa-case', finalizedByHuman: true,
        speakers: [{ id: 'S1', label: 'Participante', covariates: {} }],
        covariateProject: null, covariateSchema: [],
        segments: [
            { segmentId: 'seg-1', speakerId: 'S1', start: 0, end: 1, cleanedText: 'Texto válido' }
        ],
        ...overrides
    };
}

function validTrace(overrides = {}) {
    return {
        schemaVersion: '5.0.0', ecosystem: 'APU', unit: 'APU-04',
        stage: 'trazabilidad', sourceSession: 'qa-case',
        auditLog: { finalizedByHuman: true },
        segments: [{ segmentId: 'seg-1', originalText: 'Texto original' }],
        ...overrides
    };
}

async function expectRejected(input, expectedText, trace = null) {
    let error = null;
    try {
        await APUParser.validate(input, 'individual', trace);
    } catch (caught) {
        error = caught;
    }
    if (!error) throw new Error(`Se esperaba rechazo con: ${expectedText}`);
    if (!error.message.includes(expectedText)) throw new Error(`Mensaje inesperado: ${error.message}`);
}

async function testAcceptsFinalizedV5() {
    const result = await APUParser.validate(validInput());
    if (result.requiresConfirmation) throw new Error('Un corpus finalizado no requiere confirmación');
}

async function testRejectsLegacyV4() {
    await expectRejected(validInput({ schemaVersion: '4.0.0', finalizedByHuman: undefined }), 'VERSIÓN NO COMPATIBLE');
}

async function testRejectsWrongEcosystem() {
    await expectRejected(validInput({ ecosystem: 'OTRO' }), 'ORIGEN INVÁLIDO');
}

async function testRejectsWrongUnit() {
    await expectRejected(validInput({ unit: 'APU-03' }), 'UNIDAD INVÁLIDA');
}

async function testRejectsWrongStage() {
    await expectRejected(validInput({ stage: 'trazabilidad' }), 'ETAPA INVÁLIDA');
}

async function testRejectsDuplicateSegment() {
    const segment = validInput().segments[0];
    await expectRejected(validInput({ segments: [segment, { ...segment }] }), 'SEGMENTO DUPLICADO');
}

async function testRejectsMissingSpeakerReference() {
    await expectRejected(validInput({
        segments: [{ segmentId: 'seg-1', speakerId: 'NO-EXISTE', start: 0, end: 1, cleanedText: 'Texto' }]
    }), 'HABLANTE DESCONOCIDO');
}

async function testRejectsReversedTimes() {
    await expectRejected(validInput({
        segments: [{ segmentId: 'seg-1', speakerId: 'S1', start: 2, end: 1, cleanedText: 'Texto' }]
    }), 'TIEMPO INVERTIDO');
}

async function testAcceptsZeroDurationWithWarning() {
    const result = await APUParser.validate(validInput({
        segments: [{ segmentId: 'seg-1', speakerId: 'S1', start: 2, end: 2, cleanedText: 'Texto' }]
    }));
    if (!result.warnings.some((warning) => warning.includes('DURACIÓN NO CALCULABLE'))) {
        throw new Error('Falta advertencia de duración cero');
    }
}

async function testRejectsEmptyText() {
    await expectRejected(validInput({
        segments: [{ segmentId: 'seg-1', speakerId: 'S1', start: 0, end: 1, cleanedText: '' }]
    }), 'TEXTO AUSENTE');
}

async function testRejectsMissingFinalization() {
    await expectRejected(validInput({ finalizedByHuman: undefined }), 'REVISIÓN INDETERMINADA');
}

async function testRequestsConfirmationForProvisional() {
    const result = await APUParser.validate(validInput({ finalizedByHuman: false }));
    if (!result.requiresConfirmation) throw new Error('Debe requerir confirmación');
    if (!result.warnings.some((warning) => warning.includes('REVISIÓN PENDIENTE'))) {
        throw new Error('Falta advertencia provisional');
    }
}

async function testAllowsMissingCovariates() {
    await APUParser.validate(validInput({ covariateProject: undefined, covariateSchema: undefined }));
}

async function testAcceptsMatchingTraceability() {
    const result = await APUParser.validate(validInput(), 'individual', validTrace());
    if (!result.traceability) throw new Error('No devolvió la trazabilidad validada');
}

async function testRejectsTraceabilitySessionMismatch() {
    await expectRejected(validInput(), 'sourceSession no coincide', validTrace({ sourceSession: 'otro' }));
}

async function testRejectsTraceabilityIdMismatch() {
    await expectRejected(validInput(), 'IDs faltantes=1', validTrace({
        segments: [{ segmentId: 'otro', originalText: 'Texto' }]
    }));
}
