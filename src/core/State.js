/**
 * Estado Reactivo Central (v8.0.0)
 */
export const State = new Proxy({
    version: '8.0.0',
    sessionId: null,
    sessionIds: [],
    topology: null,
    segments: [],
    speakerMap: new Map(),
    covariateKeys: [],
    isProvisional: false,
    validationWarnings: [],
    auditSummary: {
        total: 0,
        edited: 0,
        reviewed: 0,
        changed: 0,
        anomalous: 0,
        traceabilityCases: 0
    }
}, {
    set(target, property, value) {
        target[property] = value;
        if (window.onStateChange) {
            window.onStateChange(property, value, target);
        }
        return true;
    }
});
