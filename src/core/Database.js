import Dexie from 'https://cdn.jsdelivr.net/npm/dexie@3.2.4/dist/dexie.mjs';

/**
 * APU-05 MASTER BÓVEDA (v8.0.0)
 * Implementa un contenedor de datos indestructible y aislado.
 */
class APUDatabase extends Dexie {
    constructor() {
        super('APU05_Vault_Final_v8');
        
        this.version(1).stores({
            sessions: '++_pk, sourceSession',
            speakers: '++_pk, sessionId, id',
            segments: '++_pk, sessionId, segmentId',
            audit: '++_pk, sessionId, segmentId',
            embeddings: '++_pk, sessionId, segmentId',
            glossaries: '++_pk, term'
        });
    }

    async checkHealth() {
        try {
            await this.open();
            return { ok: true };
        } catch (e) {
            return { ok: false, error: e.name };
        }
    }

    async hardReset() {
        await this.delete();
        location.reload();
    }
}

const db = new APUDatabase();
export default db;
