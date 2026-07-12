import db from './Database.js';

/**
 * SessionManager (v8.0.0)
 * Gestiona la vida de los datos del proyecto.
 */
export class SessionManager {
    static async createSession(data, trazabilidadData = null) {
        return await db.transaction('rw', [db.sessions, db.speakers, db.segments], async () => {
            const sessionId = await db.sessions.add({
                sourceSession: data.sourceSession,
                projectName: data.covariateProject?.projectName || "Investigación",
                timestamp: new Date().toISOString()
            });

            // Speakers
            const speakers = (data.speakers || []).map(s => {
                const { _pk, ...rest } = s; 
                return { ...rest, sessionId, covariates: s.covariates || {} };
            });
            await db.speakers.bulkAdd(speakers);

            // Trazabilidad
            const auditMap = new Map();
            if (trazabilidadData?.segments) {
                trazabilidadData.segments.forEach(a => auditMap.set(a.segmentId, a));
            }

            // Segmentos
            const segments = (data.segments || []).map(s => {
                const audit = auditMap.get(s.segmentId);
                const { _pk, ...rest } = s;
                return { 
                    ...rest, sessionId,
                    audit: audit ? { 
                        h: audit.editedByHuman, 
                        a: audit.anomalous,
                        r: audit.anomalyReason 
                    } : null
                };
            });
            await db.segments.bulkAdd(segments);

            return sessionId;
        });
    }

    static async getSegments(sessionId) {
        return await db.segments.where('sessionId').equals(sessionId).toArray();
    }

    static async getSpeakerMap(sessionId) {
        const speakers = await db.speakers.where('sessionId').equals(sessionId).toArray();
        return new Map(speakers.map(s => [s.id, s.label]));
    }
}
