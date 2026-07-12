/** Identidad interna de hablantes en una o varias sesiones. */
export function speakerKey(sessionId, speakerId) {
    if (sessionId === null || sessionId === undefined) return String(speakerId);
    return `${sessionId}::${speakerId}`;
}

export function buildSpeakerMap(speakers, showSession = false) {
    const map = new Map();
    const list = Array.isArray(speakers) ? speakers : [];

    for (const speaker of list) {
        const label = speaker.label || speaker.id;
        const display = showSession ? `${label} · Entrevista #${speaker.sessionId}` : label;
        map.set(speakerKey(speaker.sessionId, speaker.id), display);
    }

    // Compatibilidad: el ID simple solo es seguro cuando no se repite.
    const counts = new Map();
    for (const speaker of list) counts.set(speaker.id, (counts.get(speaker.id) || 0) + 1);
    for (const speaker of list) {
        if (counts.get(speaker.id) === 1) map.set(speaker.id, speaker.label || speaker.id);
    }
    return map;
}

export function resolveSpeakerLabel(speakerMap, segmentOrKey) {
    if (!speakerMap) return null;
    if (typeof segmentOrKey === 'string') return speakerMap.get(segmentOrKey) || null;
    const segment = segmentOrKey || {};
    return speakerMap.get(speakerKey(segment.sessionId, segment.speakerId))
        || speakerMap.get(segment.speakerId)
        || null;
}
