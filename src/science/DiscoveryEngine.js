import { SentimentEngine } from './Sentiment.js';

/**
 * DiscoveryEngine (v7.6.0)
 * Motor de minería de candidatos para el glosario.
 * Detecta términos frecuentes con alta carga emocional que no están categorizados.
 */
export class DiscoveryEngine {
    constructor() {
        this.sentiment = new SentimentEngine();
        this.stopWords = new Set(['este', 'esta', 'estos', 'estas', 'pero', 'entonces', 'porque', 'cuando', 'donde', 'quien', 'quienes']);
    }

    async suggestTerms(segments, existingGlossary) {
        const wordFreq = new Map();
        const glossaryTerms = new Set(Object.values(existingGlossary).flat());

        segments.forEach(seg => {
            const tokens = seg.cleanedText.toLowerCase()
                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
                .split(/\s+/)
                .filter(t => t.length > 4 && !this.stopWords.has(t) && !glossaryTerms.has(t));

            tokens.forEach(t => {
                if (!wordFreq.has(t)) wordFreq.set(t, { count: 0, text: [] });
                const meta = wordFreq.get(t);
                meta.count++;
                if (meta.text.length < 2) meta.text.push(seg.cleanedText);
            });
        });

        // Filtrar y calificar por "Interés" (Frecuencia + Potencial Emocional)
        const candidates = [];
        for (const [word, data] of wordFreq.entries()) {
            if (data.count < 2) continue; // Mínimo 2 menciones

            const sent = this.sentiment.analyze(data.text.join(' '));
            candidates.push({
                term: word,
                count: data.count,
                relevance: sent.intensity,
                sentimentLabel: sent.label,
                evidence: data.text[0]
            });
        }

        return candidates.sort((a, b) => (b.count * b.relevance) - (a.count * a.relevance)).slice(0, 10);
    }
}
