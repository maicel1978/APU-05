import db from '../core/Database.js';
import { normalizeGlossaryImport } from './GlossaryFormat.js';

/**
 * GlossaryManager (v8.5.0) - Capa de Conocimiento Vivo
 * Gestiona diccionarios dinámicos, categorías personalizadas y portabilidad.
 */
export class GlossaryManager {
    constructor() {
        this.baseDictionary = {
            sintomas: ['dolor', 'fiebre', 'tos', 'disnea', 'cansancio', 'estrés', 'soledad', 'insomnio', 'malestar'],
            medicamentos: ['ibuprofeno', 'paracetamol', 'aspirina', 'tratamiento', 'dosis', 'vacuna'],
            contextos: ['hospital', 'consulta', 'atención primaria', 'emergencias', 'comunidad', 'clínica']
        };
    }

    /**
     * Devuelve el glosario unificado (Base + Usuario) con metadatos.
     */
    async getFullGlossary() {
        const customTerms = await db.glossaries.toArray();
        const merged = JSON.parse(JSON.stringify(this.baseDictionary));

        customTerms.forEach(item => {
            const cat = item.category.toLowerCase().trim();
            const term = item.term.toLowerCase().trim();
            if (!merged[cat]) merged[cat] = [];
            if (!merged[cat].includes(term)) {
                merged[cat].push(term);
            }
        });

        return merged;
    }

    /**
     * Extrae términos y su evidencia del texto.
     */
    async extractEvidence(text) {
        const glossary = await this.getFullGlossary();
        const lowerText = text.toLowerCase();
        const results = {};

        for (const [category, terms] of Object.entries(glossary)) {
            results[category] = [];
            terms.forEach(term => {
                const regex = new RegExp(`\\b${term}\\b`, 'g');
                const matches = lowerText.match(regex);
                if (matches) {
                    results[category].push({ term, count: matches.length });
                }
            });
            results[category].sort((a, b) => b.count - a.count);
        }
        return results;
    }

    /**
     * Gestión CRUD con validación de integridad.
     */
    async addTerm(term, category) {
        const t = term.toLowerCase().trim();
        const c = category.toLowerCase().trim();
        if (!t || !c) return;

        const existing = await db.glossaries.where({ term: t, category: c }).first();
        if (!existing) {
            await db.glossaries.add({ term: t, category: c, timestamp: new Date().toISOString() });
        }
    }

    async removeTerm(id) {
        await db.glossaries.delete(id);
    }

    async clearUserGlossary() {
        await db.glossaries.clear();
    }

    /**
     * Portabilidad: Genera un objeto JSON compatible para exportación.
     */
    async exportToJSON() {
        const terms = await db.glossaries.toArray();
        return {
            apu_version: "8.5.0",
            export_date: new Date().toISOString(),
            custom_glossary: terms.map(t => ({ term: t.term, category: t.category }))
        };
    }

    /**
     * Portabilidad: Ingesta masiva desde JSON.
     */
    async importFromJSON(data) {
        const entries = normalizeGlossaryImport(data);
        for (const item of entries) {
            await this.addTerm(item.term, item.category);
        }
        return entries.length;
    }
}
