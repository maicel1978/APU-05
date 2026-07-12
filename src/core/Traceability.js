/**
 * Utilidades puras para conservar y resumir trazabilidad APU-04.
 */
export function buildTraceabilityMetadata(traceability) {
    if (!traceability) return null;
    return {
        sourceHash: traceability.source_hash ?? null,
        sourceRefs: traceability.sourceRefs ?? null,
        auditLog: traceability.auditLog ?? null,
        segmentCount: Array.isArray(traceability.segments) ? traceability.segments.length : 0
    };
}

export function buildAuditRecords(traceability, sessionId) {
    if (!traceability || !Array.isArray(traceability.segments)) return [];
    return traceability.segments.map((segment) => {
        const { _pk, ...data } = segment;
        return { ...data, sessionId };
    });
}

export function buildCompactAuditMap(traceability) {
    const map = new Map();
    if (!traceability || !Array.isArray(traceability.segments)) return map;
    for (const segment of traceability.segments) {
        map.set(segment.segmentId, {
            h: segment.editedByHuman === true,
            a: segment.anomalous === true,
            r: segment.anomalyReason ?? null
        });
    }
    return map;
}

export function summarizeTraceabilities(traceabilities) {
    const summary = {
        total: 0,
        edited: 0,
        reviewed: 0,
        changed: 0,
        anomalous: 0,
        traceabilityCases: 0
    };

    for (const traceability of traceabilities || []) {
        if (!traceability || !Array.isArray(traceability.segments)) continue;
        summary.traceabilityCases++;
        for (const segment of traceability.segments) {
            summary.total++;
            if (segment.editedByHuman === true) {
                summary.edited++;
                summary.reviewed++;
            }
            if (segment.anomalous === true) summary.anomalous++;
            if (hasTextChange(segment.modificationsLog)) summary.changed++;
        }
    }
    return summary;
}

function hasTextChange(modificationsLog) {
    if (!Array.isArray(modificationsLog)) return false;
    return modificationsLog.some((entry) => entry?.before !== entry?.after);
}
