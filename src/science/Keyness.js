const DEFAULT_STOP_WORDS = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'que',
    'en', 'de', 'del', 'a', 'con', 'por', 'para', 'si', 'no', 'es', 'son',
    'su', 'sus', 'se', 'me', 'mi', 'al', 'lo', 'como', 'pero', 'más'
]);

/** Contraste léxico exploratorio entre dos corpus explícitos. */
export function compareKeyness(groupA, groupB, options = {}) {
    const minTotal = options.minTotal ?? 2;
    const limit = options.limit ?? 25;
    const stopWords = options.stopWords ?? DEFAULT_STOP_WORDS;
    const countsA = countTokens(groupA.texts, stopWords);
    const countsB = countTokens(groupB.texts, stopWords);
    const totalA = sumCounts(countsA);
    const totalB = sumCounts(countsB);

    if (totalA === 0 || totalB === 0) {
        throw new Error('Ambos grupos necesitan palabras analizables para calcular G².');
    }

    const vocabulary = new Set([...countsA.keys(), ...countsB.keys()]);
    const terms = [];
    for (const word of vocabulary) {
        const a = countsA.get(word) || 0;
        const c = countsB.get(word) || 0;
        if (a + c < minTotal) continue;
        const g2 = logLikelihood2x2(a, totalA - a, c, totalB - c);
        const rateA = a / totalA;
        const rateB = c / totalB;
        if (Math.abs(rateA - rateB) < Number.EPSILON) continue;
        terms.push({
            word,
            g2,
            groupACount: a,
            groupBCount: c,
            groupAPmw: rateA * 1_000_000,
            groupBPmw: rateB * 1_000_000,
            direction: rateA > rateB ? groupA.label : groupB.label,
            logRatio: smoothedLogRatio(a, totalA, c, totalB)
        });
    }
    terms.sort((left, right) => right.g2 - left.g2 || left.word.localeCompare(right.word, 'es'));

    return {
        groupA: groupMetadata(groupA, totalA),
        groupB: groupMetadata(groupB, totalB),
        minTotal,
        terms: terms.slice(0, limit),
        keywordsA: terms.filter((term) => term.direction === groupA.label).slice(0, limit),
        keywordsB: terms.filter((term) => term.direction === groupB.label).slice(0, limit),
        warnings: sampleWarnings(groupA, groupB)
    };
}

export function tokenizeKeyness(text, stopWords = DEFAULT_STOP_WORDS) {
    if (typeof text !== 'string') return [];
    const tokens = text.normalize('NFC').toLocaleLowerCase('es').match(/[\p{L}\p{N}]+/gu) || [];
    return tokens.filter((token) => token.length > 1 && !stopWords.has(token));
}

export function logLikelihood2x2(a, b, c, d) {
    const cells = [a, b, c, d];
    if (cells.some((value) => !Number.isFinite(value) || value < 0)) {
        throw new Error('La tabla G² contiene valores inválidos.');
    }
    const total = a + b + c + d;
    if (total === 0) return 0;
    const rows = [a + b, c + d];
    const columns = [a + c, b + d];
    const expected = [
        rows[0] * columns[0] / total,
        rows[0] * columns[1] / total,
        rows[1] * columns[0] / total,
        rows[1] * columns[1] / total
    ];
    return 2 * cells.reduce((sum, observed, index) => {
        if (observed === 0 || expected[index] === 0) return sum;
        return sum + observed * Math.log(observed / expected[index]);
    }, 0);
}

function countTokens(texts, stopWords) {
    const counts = new Map();
    for (const text of texts || []) {
        for (const token of tokenizeKeyness(text, stopWords)) {
            counts.set(token, (counts.get(token) || 0) + 1);
        }
    }
    return counts;
}

function sumCounts(counts) {
    let total = 0;
    for (const count of counts.values()) total += count;
    return total;
}

function smoothedLogRatio(a, totalA, c, totalB) {
    const rateA = (a + 0.5) / (totalA + 1);
    const rateB = (c + 0.5) / (totalB + 1);
    return Math.log2(rateA / rateB);
}

function groupMetadata(group, tokenCount) {
    return {
        label: group.label,
        participantCount: group.participantCount ?? null,
        textCount: Array.isArray(group.texts) ? group.texts.length : 0,
        tokenCount
    };
}

function sampleWarnings(groupA, groupB) {
    const warnings = [];
    for (const group of [groupA, groupB]) {
        if (Number.isFinite(group.participantCount) && group.participantCount < 2) {
            warnings.push(`${group.label}: menos de 2 participantes; resultado inestable y solo demostrativo.`);
        }
    }
    return warnings;
}
