/**
 * Motor de Sentimiento Minimalista APU-05
 * Basado en léxico (Rigor e interpretabilidad 100%).
 */
export class SentimentEngine {
    constructor() {
        // Léxico básico de salud y emociones
        this.lexicon = {
            positivo: ['mejor', 'alivio', 'bien', 'esperanza', 'bueno', 'excelente', 'curación', 'ayuda', 'tranquilidad'],
            negativo: ['dolor', 'miedo', 'triste', 'peor', 'barrera', 'duda', 'soledad', 'cansado', 'mal', 'reacción', 'error', 'fallo'],
            incertidumbre: ['no sé', 'quizás', 'tal vez', 'duda', 'confusión', 'depende', 'posiblemente', 'entiendo', 'pregunta']
        };
    }

    analyzeUncertainty(text) {
        const lower = text.toLowerCase();
        let count = 0;
        this.lexicon.incertidumbre.forEach(term => {
            if (lower.includes(term)) count++;
        });
        return count;
    }

    analyze(text) {
        const tokens = text.toLowerCase().split(/\W+/);
        let score = 0;
        let posCount = 0;
        let negCount = 0;

        tokens.forEach(t => {
            if (this.lexicon.positivo.includes(t)) { score += 1; posCount++; }
            if (this.lexicon.negativo.includes(t)) { score -= 1; negCount++; }
        });

        return {
            score,
            label: score > 0 ? 'Positivo' : (score < 0 ? 'Negativo' : 'Neutro'),
            intensity: Math.abs(score)
        };
    }

    /**
     * Análisis por Aspecto (ABSA)
     * Busca el sentimiento en la proximidad de un término clave.
     */
    analyzeAspect(text, aspect) {
        const index = text.toLowerCase().indexOf(aspect.toLowerCase());
        if (index === -1) return null;

        // Tomar ventana de contexto (50 caracteres antes y después)
        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + 50);
        const context = text.substring(start, end);
        
        return this.analyze(context);
    }
}
