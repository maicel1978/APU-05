import { Renderer } from '../ui/Renderer.js';
import { AuditEngine } from '../science/AuditEngine.js';
import { StatsEngine } from '../science/StatsEngine.js';

/**
 * Módulo de Exportación y Portafolio (APU-05E)
 * Final del camino: Generación del documento definitivo por secciones.
 */
export const ExportModule = {
    id: 'export',
    label: 'REPORTE',
    category: 'tool',
    stats: new StatsEngine(),

    async render(container, state) {
        if (!state.sessionId) {
            container.innerHTML = `
                <div class="wb-card" style="text-align:center;">
                    <h3 class="wb-title">Generador de Reportes</h3>
                    <p class="empty-msg">No hay evidencia cargada. Inicie una sesión para compilar el reporte.</p>
                </div>`;
            return;
        }

        container.innerHTML = `
            <div style="font-family:var(--font-sans); padding:1rem;">
                <h2 style="font-size:1.1rem; border-bottom:2px solid #000; padding-bottom:0.5rem; margin-bottom:1.5rem; text-transform:uppercase;">Compilación de Informe Final</h2>
                
                <section class="wb-card">
                    <h3 style="font-size:0.9rem; font-weight:bold; margin-bottom:1rem;">CONFIGURACIÓN DEL DOCUMENTO</h3>
                    <p style="font-size:0.8rem; line-height:1.5; margin-bottom:2rem;">
                        El sistema unificará los hallazgos de cada etapa (Caracterización, Estructura, Síntesis e Impacto) en un borrador académico estructurado por secciones.
                    </p>
                    <button id="btn-generate-export" class="btn-core" style="width:100%; padding:1rem; background:#000; color:#fff;">💾 GENERAR Y DESCARGAR (.MD)</button>
                </section>

                <div id="export-preview" style="border:1px solid #000; padding:2rem; background:#fff; margin-top:2rem;">
                    <h4 style="font-size:0.7rem; color:var(--muted); margin-bottom:1rem;">VISTA PREVIA DEL DOCUMENTO:</h4>
                    <div id="preview-text" style="font-family:var(--font-mono); font-size:0.75rem; white-space:pre-wrap; border-top:1px solid #eee; padding-top:1rem;">
                        Preparando previsualización...
                    </div>
                </div>
            </div>
        `;

        this._generatePreview(state);
        container.querySelector('#btn-generate-export').onclick = () => this.handleExport(state);
    },

    async _generatePreview(state) {
        const stats = await this.stats.getCorpusStats(state.segments);
        const report = AuditEngine.generateFullProjectReport(state, stats);
        const previewEl = document.getElementById('preview-text');
        if (previewEl) previewEl.innerText = report;
    },

    async handleExport(state) {
        Renderer.setLoading(true, "Compilando Informe...");
        try {
            const stats = await this.stats.getCorpusStats(state.segments);
            const reportContent = AuditEngine.generateFullProjectReport(state, stats);
            
            const blob = new Blob([reportContent], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `APU05_Reporte_${state.topology}_${new Date().toISOString().split('T')[0]}.md`;
            a.click();
            URL.revokeObjectURL(url);

            Renderer.showToast("Informe descargado con éxito", "success");
        } catch (err) {
            Renderer.showToast("Error en compilación", "error");
        } finally {
            Renderer.setLoading(false);
        }
    }
};
