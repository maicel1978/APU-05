import db from '../core/Database.js';

/**
 * Motor de IA Semántica Local (Nivel 4) - Versión Resiliente
 */
export class SemanticEngine {
    constructor() {
        this.worker = null;
        this.isReady = false;
    }

    init(onProgress) {
        const workerCode = `
            import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';
            env.useBrowserCache = true;
            let extractor;

            const cosineSimilarity = (v1, v2) => {
                let dot = 0, n1 = 0, n2 = 0;
                for (let i = 0; i < v1.length; i++) {
                    dot += v1[i] * v2[i];
                    n1 += v1[i] * v1[i];
                    n2 += v2[i] * v2[i];
                }
                return dot / (Math.sqrt(n1) * Math.sqrt(n2));
            };

            self.onmessage = async (e) => {
                const { type, text, id, queryVector, embeddings, limit } = e.data;
                if (type === 'load') {
                    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
                        progress_callback: (p) => self.postMessage({ type: 'progress', data: p })
                    });
                    self.postMessage({ type: 'ready' });
                } else if (type === 'embed') {
                    const output = await extractor(text, { pooling: 'mean', normalize: true });
                    self.postMessage({ type: 'result', id, vector: Array.from(output.data) });
                } else if (type === 'search') {
                    const results = (embeddings || []).map(emb => ({
                        segmentId: emb.segmentId,
                        score: cosineSimilarity(queryVector, emb.vector)
                    }))
                    .sort((a, b) => b.score - a.score)
                    .slice(0, limit);
                    self.postMessage({ type: 'search_results', results });
                }
            };
        `;
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob), { type: 'module' });
        this.worker.onmessage = (e) => {
            if (e.data.type === 'progress') onProgress(e.data);
            if (e.data.type === 'ready') this.isReady = true;
        };
        this.worker.postMessage({ type: 'load' });
    }

    async generateEmbeddings(sessionId, segments, onStep) {
        let count = 0;
        for (const seg of segments) {
            const vector = await this._getEmbedding(seg.cleanedText, seg.segmentId);
            await db.embeddings.add({ sessionId, segmentId: seg.segmentId, vector });
            count++;
            onStep(count, segments.length);
        }
    }

    async _getEmbedding(text, id) {
        return new Promise((resolve) => {
            const handler = (e) => {
                if (e.data.id === id) {
                    this.worker.removeEventListener('message', handler);
                    resolve(e.data.vector);
                }
            };
            this.worker.addEventListener('message', handler);
            this.worker.postMessage({ type: 'embed', text, id });
        });
    }

    async search(query, sessionId, limit = 10) {
        const queryVector = await this._getEmbedding(query, 'query');
        const allEmbeds = await db.embeddings.where('sessionId').equals(sessionId).toArray();
        const segments = await db.segments.where('sessionId').equals(sessionId).toArray();
        const segMap = new Map(segments.map(s => [s.segmentId, s]));

        return new Promise((resolve) => {
            const handler = (e) => {
                if (e.data.type === 'search_results') {
                    this.worker.removeEventListener('message', handler);
                    const enriched = e.data.results
                        .filter(r => segMap.has(r.segmentId))
                        .map(r => ({ ...r, text: segMap.get(r.segmentId).cleanedText }));
                    resolve(enriched);
                }
            };
            this.worker.addEventListener('message', handler);
            this.worker.postMessage({ type: 'search', queryVector, embeddings: allEmbeds, limit });
        });
    }
}
