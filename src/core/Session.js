import db from './Database.js';
import { buildSpeakerMap } from './SpeakerIdentity.js';
import {
    buildAuditRecords,
    buildCompactAuditMap,
    buildTraceabilityMetadata
} from './Traceability.js';

/**
 * SessionManager (v8.0.0)
 * Gestiona la vida de los datos del proyecto.
 */
export class SessionManager {
    static async createSession(data, trazabilidadData = null) {
        return await db.transaction('rw', [db.sessions, db.speakers, db.segments, db.audit], async () => {
            const sessionId = await db.sessions.add({
                sourceSession: data.sourceSession,
                projectName: data.covariateProject?.projectName || data.covariateProject?.name || "Investigación",
                timestamp: new Date().toISOString(),
                traceability: buildTraceabilityMetadata(trazabilidadData)
            });

            // Speakers
            const speakers = (data.speakers || []).map(s => {
                const { _pk, ...rest } = s; 
                return { ...rest, sessionId, covariates: s.covariates || {} };
            });
            await db.speakers.bulkAdd(speakers);

            // Trazabilidad compacta para lectura + registros forenses completos.
            const auditMap = buildCompactAuditMap(trazabilidadData);
            const auditRecords = buildAuditRecords(trazabilidadData, sessionId);
            if (auditRecords.length > 0) await db.audit.bulkAdd(auditRecords);

            // Segmentos
            const segments = (data.segments || []).map(s => {
                const audit = auditMap.get(s.segmentId);
                const { _pk, ...rest } = s;
                return {
                    ...rest,
                    sessionId,
                    audit: audit || null
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
        return await this.getSpeakerMapForSessions([sessionId]);
    }

    static async getSpeakerMapForSessions(sessionIds) {
        const ids = [...new Set((sessionIds || []).filter((id) => id !== null && id !== undefined))];
        if (ids.length === 0) return new Map();
        const speakers = await db.speakers.where('sessionId').anyOf(ids).toArray();
        return buildSpeakerMap(speakers, ids.length > 1);
    }

    static async getAudit(sessionId) {
        return await db.audit.where('sessionId').equals(sessionId).toArray();
    }

    static async getSession(sessionId) {
        return await db.sessions.get(sessionId);
    }
}
