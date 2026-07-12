import { Renderer } from '../ui/Renderer.js';
import { Charts } from '../ui/Charts.js';
import { StatsEngine } from '../science/StatsEngine.js';
import db from '../core/Database.js';

/**
 * Módulo de Análisis de Contraste
 */
export const ContrastModule = {
    id: 'contrast',
    label: 'COMPARAR',
    engine: new StatsEngine(),

    async render(container, state) {
        if (!state.sessionId) {
            container.innerHTML = '<p class="empty-msg">Cargue una sesión para comparar.</p>';
            return;
        }
        Renderer.renderContrastOptions(container, state.covariateKeys, (k) => this.handleContrast(k, state));
    },

    async handleContrast(k, state) {
        Renderer.setLoading(true, "Calculando G2...");
        try {
            const res = await this.engine.calculateKeyness(state.sessionId, k);
            const distData = {};
            const rawSpeakers = await db.speakers.where('sessionId').equals(state.sessionId).toArray();
            rawSpeakers.forEach(s => {
                const val = s.covariates?.[k] || 'Sin dato';
                distData[val] = (distData[val] || 0) + 1;
            });
            Charts.renderDistribution('covariate-dist-chart', Object.keys(distData), Object.values(distData), `Muestra: ${k}`);
            
            const area = document.getElementById('contrast-results-area');
            if (area) {
                area.innerHTML = '';
                res.forEach(groupRes => {
                    const div = document.createElement('div');
                    div.style.marginBottom = '2.5rem';
                    div.innerHTML = `<div style="font-weight:bold; margin-bottom:0.8rem; font-size:0.85rem; border-left:3px solid #000; padding-left:0.5rem;">GRUPO: ${groupRes.group.toUpperCase()}</div>`;
                    Charts.renderKeywordImpact(div, groupRes.keywords);
                    area.appendChild(div);
                });
            }
            Renderer.showToast("Análisis completado", "success");
        } catch (err) {
            Renderer.showToast("Fallo estadístico", "error");
        } finally {
            Renderer.setLoading(false);
        }
    }
};
