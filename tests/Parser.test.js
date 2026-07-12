import { APUParser } from '../src/core/Parser.js';

/**
 * Suite de Pruebas para APUParser (R13)
 */
export async function runTests(logger) {
    const tests = [
        testV1Ecosystem,
        testV2Unit,
        testV4Stage,
        testV5UniqueSegmentId,
        testV7InvalidTimes,
        testV6MissingSpeaker,
        testV8EmptyText,
        testFinalizedByHumanWarning,
        testTrazabilidadStageMismatch
    ];

    let passed = 0;
    for (const test of tests) {
        try {
            await test();
            logger.log(test.name, true);
            passed++;
        } catch (e) {
            logger.log(test.name, false, e.message);
        }
    }

    return { total: tests.length, passed };
}

async function testV1Ecosystem() {
    const data = { ecosystem: "WRONG", unit: "APU-04" };
    try {
        await APUParser.validate(data);
        throw new Error("Debería haber fallado por V1");
    } catch (e) {
        if (!e.message.includes("V1")) throw e;
    }
}

async function testV2Unit() {
    const data = { ecosystem: "APU", unit: "APU-03" };
    try {
        await APUParser.validate(data);
        throw new Error("Debería haber fallado por V2");
    } catch (e) {
        if (!e.message.includes("V2")) throw e;
    }
}

async function testV4Stage() {
    const data = { ecosystem: "APU", unit: "APU-04", stage: "raw" };
    try {
        await APUParser.validate(data);
        throw new Error("Debería haber fallado por V4");
    } catch (e) {
        if (!e.message.includes("V4")) throw e;
    }
}

async function testV5UniqueSegmentId() {
    const data = {
        ecosystem: "APU", unit: "APU-04", stage: "cleaned-text",
        speakers: [{id: "S1", label: "P1"}],
        segments: [
            { segmentId: "1", speakerId: "S1", start: 0, end: 1, cleanedText: "A" },
            { segmentId: "1", speakerId: "S1", start: 1, end: 2, cleanedText: "B" }
        ]
    };
    try {
        await APUParser.validate(data);
        throw new Error("Debería haber fallado por V5 (Duplicado)");
    } catch (e) {
        if (!e.message.includes("V5")) throw e;
    }
}

async function testV7InvalidTimes() {
    const data = {
        ecosystem: "APU", unit: "APU-04", stage: "cleaned-text",
        speakers: [{id: "S1", label: "P1"}],
        segments: [{ segmentId: "1", speakerId: "S1", start: 10, end: 5, cleanedText: "Error" }]
    };
    try {
        await APUParser.validate(data);
        throw new Error("Debería haber fallado por V7 (End < Start)");
    } catch (e) {
        if (!e.message.includes("V7")) throw e;
    }
}

async function testV6MissingSpeaker() {
    const data = {
        ecosystem: "APU", unit: "APU-04", stage: "cleaned-text",
        speakers: [{id: "S1", label: "P1"}],
        segments: [{ segmentId: "1", speakerId: "S2", start: 0, end: 1, cleanedText: "Test" }]
    };
    try {
        await APUParser.validate(data);
        throw new Error("Debería haber fallado por V6 (Speaker inexistente)");
    } catch (e) {
        if (!e.message.includes("V6")) throw e;
    }
}

async function testV8EmptyText() {
    const data = {
        ecosystem: "APU", unit: "APU-04", stage: "cleaned-text",
        speakers: [{id: "S1", label: "P1"}],
        segments: [{ segmentId: "1", speakerId: "S1", start: 0, end: 1, cleanedText: "" }]
    };
    try {
        await APUParser.validate(data);
        throw new Error("Debería haber fallado por V8 (Texto vacío)");
    } catch (e) {
        if (!e.message.includes("V8")) throw e;
    }
}

async function testFinalizedByHumanWarning() {
    const data = {
        ecosystem: "APU", unit: "APU-04", stage: "cleaned-text",
        speakers: [{id: "S1", label: "P1"}],
        segments: [{ segmentId: "1", speakerId: "S1", start: 0, end: 1, cleanedText: "Ok" }],
        finalizedByHuman: false
    };
    const { warnings } = await APUParser.validate(data);
    if (!warnings.some(w => w.includes("V9"))) {
        throw new Error("Debería haber lanzado advertencia V9");
    }
}

async function testTrazabilidadStageMismatch() {
    const data = {
        ecosystem: "APU", unit: "APU-04", stage: "cleaned-text",
        speakers: [{id: "S1", label: "P1"}],
        segments: [{ segmentId: "1", speakerId: "S1", start: 0, end: 1, cleanedText: "Ok" }]
    };
    const traz = { stage: "raw" };
    const { warnings } = await APUParser.validate(data, traz);
    if (!warnings.some(w => w.includes("Trazabilidad"))) {
        throw new Error("Debería haber lanzado advertencia por mismatch en trazabilidad");
    }
}
