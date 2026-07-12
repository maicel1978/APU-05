import db from '../core/Database.js';

/**
 * Motor de Reconocimiento de Entidades Clínicas (NER Híbrido)
 * V2: Soporta diccionarios dinámicos desde la base de datos local.
 */
export class NER {
    constructor() {
        this.baseDictionary = {
            sintomas: ['dolor', 'fiebre', 'tos', 'disnea', 'cansancio', 'estrés', 'soledad', 'insomnio', 'malestar'],
            medicamentos: ['ibuprofeno', 'paracetamol', 'aspirina', 'tratamiento', 'dosis', 'vacuna'],
            contextos: ['hospital', 'consulta', 'atención primaria', 'emergencias', 'comunidad']
        };
    }

    async extract(text) {
        const results = {};
        const lowerText = text.toLowerCase();
        const customTerms = await db.glossaries.toArray();
        const dictionary = JSON.parse(JSON.stringify(this.baseDictionary));
        
        customTerms.forEach(item => {
            const cat = item.category.toLowerCase();
            if (!dictionary[cat]) dictionary[cat] = [];
            dictionary[cat].push(item.term.toLowerCase());
        });

        Object.keys(dictionary).forEach(category => {
            results[category] = [];
            const uniqueTerms = [...new Set(dictionary[category])];
            uniqueTerms.forEach(term => {
                const regex = new RegExp(`\\b${term}\\b`, 'g');
                const count = (lowerText.match(regex) || []).length;
                if (count > 0) results[category].push({ term, count });
            });
        });

        const temporalMatch = text.match(/\b(\d+)\s*(días|semanas|meses|años)\b/gi);
        if (temporalMatch) {
            if (!results.contextos) results.contextos = [];
            results.contextos.push({ term: 'Evolución: ' + temporalMatch.join(', '), count: 1 });
        }
        return results;
    }
}
