const STOP_WORDS = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'que', 'como',
    'con', 'por', 'para', 'del', 'desde', 'hasta', 'pero', 'porque', 'muy',
    'sus', 'este', 'esta', 'estos', 'estas', 'sobre', 'entre', 'también'
]);

/** Detecta saliencias relativas sin obligar a devolver un hallazgo por caso. */
export function detectNarrativeSalience(segments, options = {}) {
    const config = {
        minSessions: options.minSessions ?? 3,
        minTargetCount: options.minTargetCount ?? 2,
        minReferenceCount: options.minReferenceCount ?? 2,
        minReferenceSessions: options.minReferenceSessions ?? 2,
        minRatio: options.minRatio ?? 2,
        maxPerSession: options.maxPerSession ?? 3
    };
    const sessions = groupBySession(segments);
    const warnings = [];
    if (sessions.size < config.minSessions) {
        warnings.push(`Se requieren al menos ${config.minSessions} entrevistas para una referencia leave-one-out estable.`);
        return { findings: [], novelCandidates: [], warnings, sessionCount: sessions.size, config };
    }

    const tokenData = new Map();
    for (const [sessionId, sessionSegments] of sessions) {
        const tokens = sessionSegments.flatMap((segment) => tokenizeSalience(segment.cleanedText));
        tokenData.set(sessionId, { tokens, counts: countTokens(tokens), segments: sessionSegments });
    }

    const findings = [];
    const novelCandidates = [];
    for (const [sessionId, target] of tokenData) {
        if (target.tokens.length === 0) continue;
        const reference = buildReference(tokenData, sessionId);
        const candidates = [];
        for (const [term, targetCount] of target.counts) {
            if (targetCount < config.minTargetCount) continue;
            const referenceCount = reference.counts.get(term) || 0;
            const referenceSessions = reference.presence.get(term) || 0;
            if (referenceCount === 0) {
                novelCandidates.push(candidateRecord(sessionId, term, targetCount, 0, null, target.segments, 'SIN_REFERENCIA'));
                continue;
            }
            if (referenceCount < config.minReferenceCount || referenceSessions < config.minReferenceSessions) continue;
            const targetRate = targetCount / target.tokens.length;
            const referenceRate = referenceCount / reference.totalTokens;
            const ratio = targetRate / referenceRate;
            if (ratio < config.minRatio) continue;
            candidates.push(candidateRecord(
                sessionId, term, targetCount, referenceCount, ratio, target.segments, 'SALIENCIA_RELATIVA'
            ));
        }
        candidates.sort((a, b) => b.ratio - a.ratio || b.targetCount - a.targetCount || a.term.localeCompare(b.term, 'es'));
        findings.push(...candidates.slice(0, config.maxPerSession));
    }

    findings.sort((a, b) => b.ratio - a.ratio || String(a.sessionId).localeCompare(String(b.sessionId)));
    return { findings, novelCandidates, warnings, sessionCount: sessions.size, config };
}

export function tokenizeSalience(text) {
    if (typeof text !== 'string') return [];
    const tokens = text.normalize('NFC').toLocaleLowerCase('es').match(/[\p{L}\p{N}]+/gu) || [];
    return tokens.filter((token) => token.length > 3 && !STOP_WORDS.has(token));
}

function groupBySession(segments) {
    const groups = new Map();
    for (const segment of segments || []) {
        if (segment?.sessionId === null || segment?.sessionId === undefined) continue;
        if (!groups.has(segment.sessionId)) groups.set(segment.sessionId, []);
        groups.get(segment.sessionId).push(segment);
    }
    return groups;
}

function countTokens(tokens) {
    const counts = new Map();
    for (const token of tokens) counts.set(token, (counts.get(token) || 0) + 1);
    return counts;
}

function buildReference(tokenData, excludedSessionId) {
    const counts = new Map();
    const presence = new Map();
    let totalTokens = 0;
    for (const [sessionId, data] of tokenData) {
        if (sessionId === excludedSessionId) continue;
        totalTokens += data.tokens.length;
        for (const [term, count] of data.counts) {
            counts.set(term, (counts.get(term) || 0) + count);
            presence.set(term, (presence.get(term) || 0) + 1);
        }
    }
    return { counts, presence, totalTokens };
}

function candidateRecord(sessionId, term, targetCount, referenceCount, ratio, segments, status) {
    return {
        sessionId,
        term,
        targetCount,
        referenceCount,
        ratio,
        status,
        evidence: segments
            .filter((segment) => tokenizeSalience(segment.cleanedText).includes(term))
            .slice(0, 3)
            .map((segment) => ({ segmentId: segment.segmentId, text: segment.cleanedText }))
    };
}
