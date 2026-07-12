import { StatsEngine } from '../src/science/StatsEngine.js';

/**
 * Suite de Pruebas para StatsEngine (Rigor Matemático)
 */
export async function runStatsTests(logger) {
    const stats = new StatsEngine();
    const tests = [
        testProductionMetrics,
        testComplexityTTR
    ];

    let passed = 0;
    for (const test of tests) {
        try {
            await test(stats);
            logger.log(`STATS: ${test.name}`, true);
            passed++;
        } catch (e) {
            logger.log(`STATS: ${test.name}`, false, e.message);
        }
    }
    return { total: tests.length, passed };
}

async function testProductionMetrics(engine) {
    const segments = [
        { cleanedText: "Hola mundo", start: 0, end: 60, speakerId: "S1" }
    ];
    const res = await engine.getCorpusStats(segments);
    if (res.production.words !== 2) throw new Error("Conteo de palabras erróneo");
    if (res.production.duration !== "1.00") throw new Error("Conversión a minutos errónea");
}

async function testComplexityTTR(engine) {
    const segments = [
        { cleanedText: "hola hola mundo", start: 0, end: 1, speakerId: "S1" }
    ];
    const res = await engine.getCorpusStats(segments);
    // TTR = (2 palabras únicas: hola, mundo) / (3 palabras totales) = 66.7%
    if (res.complexity.lexicalDiversity !== "66.7") {
        throw new Error(`TTR calculado mal: ${res.complexity.lexicalDiversity}% esperado 66.7%`);
    }
}
