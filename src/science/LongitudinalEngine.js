/**
 * Motor Científico Longitudinal APU-05 (v9.5.1)
 * Análisis descriptivo de trayectorias narrativas temporales y Concept Drift (D-038 / R7).
 * Prohibida la inferencia causal automática.
 */
export class LongitudinalEngine {
    static stopWords = new Set([
        'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'que', 'en', 'de', 'del', 'a', 'con', 'por', 'para',
        'si', 'no', 'es', 'son', 'su', 'sus', 'se', 'me', 'mi', 'al', 'lo', 'como', 'pero', 'más', 'fue', 'hay', 'muy', 'este',
        'esta', 'estos', 'estas', 'entonces', 'cuando', 'sobre', 'todo', 'todos', 'porque', 'tiene', 'tienen', 'había', 'desde',
        'está', 'están', 'puede', 'pueden', 'hacer', 'dice', 'ahora', 'bien', 'bueno', 'buenos', 'días', 'señor', 'señora', 'usted',
        'siento', 'veces', 'tengo', 'entiendo', 'ella', 'ellos', 'sólo', 'solo', 'pues', 'cómo', 'cual', 'cuál', 'algo', 'nada'
    ]);

    static _extractVocabularySet(segments) {
        const vocab = new Set();
        (segments || []).forEach(seg => {
            const tokens = (seg?.cleanedText || '').toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
            tokens.forEach(t => {
                if (t.length > 3 && !this.stopWords.has(t)) vocab.add(t);
            });
        });
        return vocab;
    }

    static _calculateWpm(segments) {
        let totalWords = 0;
        let totalDurationSec = 0;
        (segments || []).forEach(seg => {
            const tokens = (seg?.cleanedText || '').trim().split(/\s+/).filter(Boolean);
            totalWords += tokens.length;
            const dur = (seg.end - seg.start);
            if (dur > 0) totalDurationSec += dur;
        });
        const durationMin = totalDurationSec / 60;
        return durationMin > 0 ? Number((totalWords / durationMin).toFixed(1)) : 0;
    }

    static calculateLexicalDrift(segmentsA, segmentsB) {
        const vocabA = this._extractVocabularySet(segmentsA);
        const vocabB = this._extractVocabularySet(segmentsB);

        const intersection = new Set([...vocabA].filter(x => vocabB.has(x)));
        const innovationSet = new Set([...vocabB].filter(x => !vocabA.has(x)));
        const missingSet = new Set([...vocabA].filter(x => !vocabB.has(x)));

        const persistenceRate = vocabA.size > 0 ? Number(((intersection.size / vocabA.size) * 100).toFixed(1)) : 0;
        const innovationRate = vocabB.size > 0 ? Number(((innovationSet.size / vocabB.size) * 100).toFixed(1)) : 0;

        const wpmA = this._calculateWpm(segmentsA);
        const wpmB = this._calculateWpm(segmentsB);
        const deltaWpm = Number((wpmB - wpmA).toFixed(1));

        return {
            vocabSizeA: vocabA.size,
            vocabSizeB: vocabB.size,
            persistentCount: intersection.size,
            emergentCount: innovationSet.size,
            missingCount: missingSet.size,
            persistenceRate,
            innovationRate,
            wpmA,
            wpmB,
            deltaWpm,
            persistentTerms: [...intersection].slice(0, 15),
            emergentTerms: [...innovationSet].slice(0, 15),
            missingTerms: [...missingSet].slice(0, 15)
        };
    }

    static async trackEntityEvolution(segmentsBySession) {
        const nerModule = await import('./NER.js');
        const ner = new nerModule.NER();
        const evolution = [];

        for (const item of segmentsBySession || []) {
            const text = (item.segments || []).map(s => s.cleanedText).join(' ');
            const entities = await ner.extract(text);
            const flatEntities = Object.values(entities).flat();
            const topWords = this._extractVocabularySet(item.segments);

            evolution.push({
                sessionId: item.sessionId,
                label: item.label || `Corte T#${item.sessionId}`,
                segmentCount: item.segments.length,
                wpm: this._calculateWpm(item.segments),
                vocabSize: topWords.size,
                topEntities: flatEntities.sort((a, b) => b.count - a.count).slice(0, 8),
                sampleTerms: [...topWords].slice(0, 12)
            });
        }
        return evolution;
    }

    static generateDescriptiveSummary(driftData, labelA = 'T1', labelB = 'T2') {
        const directionWpm = driftData.deltaWpm >= 0 ? `aumento de +${driftData.deltaWpm}` : `disminución de ${driftData.deltaWpm}`;
        
        return {
            title: `Evolución Narrativa Descriptiva (${labelA} → ${labelB})`,
            statement: `Entre el corte inicial (${labelA}) y el seguimiento (${labelB}), el discurso muestra una persistencia léxica del ${driftData.persistenceRate}% (${driftData.persistentCount} términos conservados) y una innovación léxica del ${driftData.innovationRate}% (${driftData.emergentCount} términos nuevos). La velocidad discursiva experimentó un ${directionWpm} palabras por minuto.`,
            persistentHighlights: driftData.persistentTerms,
            emergentHighlights: driftData.emergentTerms,
            methodologicalWarning: `ADVERTENCIA METODOLÓGICA (PRISMA+ / Regla R7): Las variaciones temporales en la frecuencia discursiva y el vocabulario describen fluctuaciones narrativas en el tiempo (Concept Drift). Está estrictamente PROHIBIDO inferir o declarar relaciones de causalidad clínica, eficacia terapéutica o impacto de intervenciones automáticas sin la contrastación de un diseño experimental formal validado por el investigador.`
        };
    }
}
