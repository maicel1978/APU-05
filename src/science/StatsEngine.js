import db from '../core/Database.js';
import { SessionManager } from '../core/Session.js';
import { speakerKey } from '../core/SpeakerIdentity.js';
import { getCovariateValues, prepareKeynessComparison } from './KeynessGroups.js';
import { detectNarrativeSalience } from './NarrativeSalience.js';

/**
 * Motor Estadístico APU-05 (Unified v9.0.0)
 * Unifica el análisis Individual (Rigor) y Exploratorio (ENA).
 */
export class StatsEngine {
    constructor() {
        this.stopWords = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'que', 'en', 'de', 'del', 'a', 'con', 'por', 'para', 'si', 'no', 'es', 'su', 'esto', 'esta', 'este', 'como', 'donde', 'pero', 'entonces']);
    }

    async getCorpusStats(segments) {
        const stats = { totalSegments: segments.length, totalWords: 0, durationTotal: 0, speakerStats: {}, uniqueWordsSet: new Set() };
        segments.forEach(s => {
            const tokens = s.cleanedText.trim().toLowerCase().split(/\s+/).filter(t => t.length > 0);
            stats.totalWords += tokens.length;
            tokens.forEach(t => {
                const cleanT = t.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
                if (cleanT.length > 1 && !this.stopWords.has(cleanT)) stats.uniqueWordsSet.add(cleanT);
            });
            const duration = (s.end - s.start);
            stats.durationTotal += duration > 0 ? duration : 0;
            const participantId = speakerKey(s.sessionId, s.speakerId);
            if (!stats.speakerStats[participantId]) stats.speakerStats[participantId] = { words: 0, segments: 0 };
            stats.speakerStats[participantId].words += tokens.length;
            stats.speakerStats[participantId].segments += 1;
        });

        const nerModule = await import('./NER.js');
        const ner = new nerModule.NER();
        const entities = await ner.extract(segments.map(s => s.cleanedText).join(' '));

        return {
            production: { segments: stats.totalSegments, words: stats.totalWords, duration: (stats.durationTotal / 60).toFixed(2), wpm: (stats.durationTotal > 0) ? (stats.totalWords / (stats.durationTotal / 60)).toFixed(0) : 0 },
            participation: stats.speakerStats,
            complexity: { uniqueWords: stats.uniqueWordsSet.size, lexicalDiversity: stats.totalWords > 0 ? ((stats.uniqueWordsSet.size / stats.totalWords) * 100).toFixed(1) : 0, avgSegmentLength: stats.totalSegments > 0 ? (stats.totalWords / stats.totalSegments).toFixed(1) : 0 },
            entidades: entities
        };
    }

    async getAdjacencyMatrix(segments, terms, threshold = 1) {
        const links = [];
        for (let i = 0; i < terms.length; i++) {
            for (let j = i + 1; j < terms.length; j++) {
                const termA = terms[i].toLowerCase();
                const termB = terms[j].toLowerCase();
                const weight = segments.filter(s => {
                    const txt = s.cleanedText.toLowerCase();
                    return txt.includes(termA) && txt.includes(termB);
                }).length;
                if (weight >= threshold) links.push({ source: terms[i], target: terms[j], weight });
            }
        }
        return links.sort((a, b) => b.weight - a.weight);
    }

    async getNarrativeSalience(segments, options = {}) {
        return detectNarrativeSalience(segments, options);
    }

    // Adaptador temporal para el generador de hipótesis existente.
    async getNarrativeOutliers(segments, options = {}) {
        const result = await this.getNarrativeSalience(segments, options);
        return result.findings.map(finding => ({
            sessionId: finding.sessionId,
            keyTopic: finding.term,
            intensity: finding.ratio.toFixed(1),
            evidence: finding.evidence,
            status: finding.status
        }));
    }

    async getNarrativeStructure(segments) {
        const stats = await this.getCorpusStats(segments);
        const entities = stats.entidades;
        const totalCount = Object.values(entities).reduce((a, cat) => a + cat.reduce((s, e) => s + e.count, 0), 0);
        const weights = Object.keys(entities).map(cat => ({
            label: cat,
            weight: totalCount > 0 ? ((entities[cat].reduce((s, e) => s + e.count, 0) / totalCount) * 100).toFixed(0) : 0
        })).sort((a,b) => b.weight - a.weight);
        return { weights, core: weights[0]?.label || 'General', distinctive: Object.values(entities).flat().sort((a,b) => b.count - a.count).slice(0, 8) };
    }

    async getNarrativeDiagnosis(segments) {
        const struct = await this.getNarrativeStructure(segments);
        const relations = [];
        const core = struct.core;
        const nerModule = await import('./NER.js');
        const ner = new nerModule.NER();
        const dict = await ner.extract(""); // Get categories
        const cats = Object.keys(dict).filter(c => c !== core).slice(0,4);
        
        for (const cat of cats) {
            const weight = segments.filter(s => s.cleanedText.toLowerCase().includes(core) && s.cleanedText.toLowerCase().includes(cat)).length;
            if (weight > 0) relations.push({ term: cat, strength: weight });
        }
        return { ...struct, relations };
    }

    async getNGrams(segments, n = 2, limit = 5) {
        const ngrams = new Map();
        segments.forEach(seg => {
            const tokens = this._tokenize(seg.cleanedText);
            for (let i = 0; i <= tokens.length - n; i++) {
                const gram = tokens.slice(i, i + n).join(' ');
                ngrams.set(gram, (ngrams.get(gram) || 0) + 1);
            }
        });
        return Array.from(ngrams.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([word, count]) => ({ word, count }));
    }

    _tokenize(text) {
        return text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\_`~()]/g, "").split(/\s+/).filter(t => t.length > 3 && !this.stopWords.has(t));
    }

    async getAvailableCovariates(sessionId) {
        return await this.getAvailableCovariatesForSessions([sessionId]);
    }

    async getAvailableCovariatesForSessions(sessionIds) {
        const speakers = await this._getSpeakersForSessions(sessionIds);
        const keys = new Set();
        speakers.forEach(s => { if (s.covariates) Object.keys(s.covariates).forEach(k => keys.add(k)); });
        return Array.from(keys).sort((a, b) => a.localeCompare(b, 'es'));
    }

    async getCovariateValuesForSessions(sessionIds, covariateKey) {
        return getCovariateValues(await this._getSpeakersForSessions(sessionIds), covariateKey);
    }

    async calculateKeyness(sessionIds, covariateKey, groupA, groupB, options = {}) {
        const ids = this._normalizeSessionIds(sessionIds);
        const [speakers, segments] = await Promise.all([
            this._getSpeakersForSessions(ids),
            db.segments.where('sessionId').anyOf(ids).toArray()
        ]);
        return prepareKeynessComparison({ segments, speakers, covariateKey, groupA, groupB }, options);
    }

    async _getSpeakersForSessions(sessionIds) {
        const ids = this._normalizeSessionIds(sessionIds);
        if (ids.length === 0) return [];
        return await db.speakers.where('sessionId').anyOf(ids).toArray();
    }

    _normalizeSessionIds(sessionIds) {
        const list = Array.isArray(sessionIds) ? sessionIds : [sessionIds];
        return [...new Set(list.filter((id) => id !== null && id !== undefined))];
    }

    /**
     * ENA: Generador de Hipótesis Candidatas (Rigor Metodológico)
     */
    async generateHypotheses(segments, links, outliers) {
        const hypotheses = [];

        // 1. Hipótesis de Vínculo (Relacional)
        if (links && links.length > 0) {
            const topLink = links[0];
            hypotheses.push({
                type: 'RELACIONAL',
                statement: `Se sugiere investigar la interdependencia entre "${topLink.source.toUpperCase()}" y "${topLink.target.toUpperCase()}" debido a una alta tasa de co-ocurrencia (${topLink.weight} menciones).`,
                question: `¿De qué manera el fenómeno de ${topLink.source} está mediando la experiencia de ${topLink.target} en esta cohorte?`
            });
        }

        // 2. Hipótesis de Desviación (Focal)
        if (outliers && outliers.length > 0) {
            const topOutlier = outliers[0];
            hypotheses.push({
                type: 'FOCAL',
                statement: `La Entrevista #${topOutlier.sessionId} presenta una saliencia relativa en "${topOutlier.keyTopic.toUpperCase()}" (${topOutlier.intensity}x frente a la referencia leave-one-out).`,
                question: `¿Qué características del caso #${topOutlier.sessionId} podrían explicar esta saliencia exploratoria respecto a las demás entrevistas?`
            });
        }

        return hypotheses;
    }
}
