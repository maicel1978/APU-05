import { Renderer } from '../ui/Renderer.js';
import { NER } from '../science/NER.js';

/**
 * Capa 1: Módulo Foundation (APU-05A)
 */
export const FoundationModule = {
    id: 'foundation',
    label: 'REPORTE BASE',
    ner: new NER(),

    async render(container, state) {
        if (!state.sessionId) {
            container.innerHTML = '<p class="empty-msg">Cargue datos para generar el reporte.</p>';
            return;
        }

        Renderer.setLoading(true, "Generando Reporte Foundation...");
        
        try {
            const analysis = await this._analyze(state.segments);
            this._drawReport(container, analysis, state);
            Renderer.showToast("Reporte Base generado", "success");
        } catch (e) {
            console.error(e);
            Renderer.showToast("Error en reporte", "error");
        } finally {
            Renderer.setLoading(false);
        }
    },

    async _analyze(segments) {
        const fullText = segments.map(s => s.cleanedText).join(' ');
        const entities = await this.ner.extract(fullText);
        
        const summary = segments
            .filter(s => s.cleanedText.split(' ').length > 10)
            .sort((a, b) => b.cleanedText.length - a.cleanedText.length)
            .slice(0, 3);

        return { entities, summary, stats: { wordCount: fullText.split(' ').length } };
    },

    _drawReport(container, analysis, state) {
        const topLabel = state.topology.toUpperCase().replace('-', ' ');
        
        container.innerHTML = `
            <div style="font-family:var(--font-sans); padding:1rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #000; padding-bottom:0.5rem; margin-bottom:1.5rem;">
                    <h2 style="font-size:1.1rem; margin:0;">REPORTE DE EVIDENCIA</h2>
                    <span style="font-size:0.6rem; background:#000; color:#fff; padding:2px 6px;">MODO: ${topLabel}</span>
                </div>
                
                <div class="report-section" style="margin-bottom:2rem;">
                    <h3 style="font-size:0.85rem; font-weight:bold; color:#666; margin-bottom:1rem; text-transform:uppercase;">1. Hallazgos por Glosario</h3>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                        ${Object.keys(analysis.entities).map(cat => this._renderEntityBox(cat.toUpperCase(), analysis.entities[cat])).join('')}
                    </div>
                </div>

                <div class="report-section" style="margin-bottom:2rem;">
                    <h3 style="font-size:0.85rem; font-weight:bold; color:#666; margin-bottom:1rem; text-transform:uppercase;">2. Citas de Oro</h3>
                    ${analysis.summary.map(s => `
                        <blockquote style="border-left:3px solid #000; padding-left:1rem; margin-bottom:1rem; font-style:italic; font-size:0.85rem; background:#f9f9f9; padding:0.8rem;">
                            "${s.cleanedText}"
                            <div style="font-size:0.6rem; margin-top:0.5rem; color:#888;">SEGMENTO: ${s.segmentId}</div>
                        </blockquote>
                    `).join('')}
                </div>
            </div>
        `;
    },

    _renderEntityBox(label, list) {
        if (!list || list.length === 0) return '';
        return `
            <div style="border:1px solid #eee; padding:0.8rem; background:#fff;">
                <div style="font-size:0.65rem; font-weight:bold; margin-bottom:0.5rem;">${label}</div>
                <div style="display:flex; flex-wrap:wrap; gap:5px;">
                    ${list.map(e => `<span style="padding:2px 6px; background:#eee; font-size:0.75rem;">${e.term} (${e.count})</span>`).join('')}
                </div>
            </div>
        `;
    }
};
