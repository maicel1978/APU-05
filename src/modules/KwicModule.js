import { Renderer } from '../ui/Renderer.js';
import { SearchEngine } from '../core/SearchEngine.js';

/**
 * Módulo de Exploración de Contextos (KWIC)
 */
export const KwicModule = {
    id: 'kwic',
    label: 'CONTEXTOS',
    engine: new SearchEngine(),

    async render(container, state) {
        container.innerHTML = `
            <div class="search-box">
                <input type="text" id="kwic-input" placeholder="Palabra o Regex..." style="padding:0.8rem; border:2px solid #000; width:100%; font-family:var(--font-mono);">
                <button id="btn-search-module" style="margin-top:0.8rem; background:#000; color:#fff; padding:0.8rem; width:100%; font-weight:bold; cursor:pointer;">BUSCAR CONTEXTOS</button>
            </div>
            <div id="kwic-results-module" style="margin-top:2rem;"></div>
        `;

        const btn = container.querySelector('#btn-search-module');
        btn.onclick = () => this.handleSearch(state);
    },

    async handleSearch(state) {
        if (!state.sessionId) return Renderer.showToast("Cargue una sesión primero", "info");
        const q = document.getElementById('kwic-input').value;
        if (!q) return;

        Renderer.setLoading(true, "Buscando contextos...");
        try {
            const res = await this.engine.search(state.sessionId, q);
            const resultsContainer = document.getElementById('kwic-results-module');
            this.engine.renderResults(resultsContainer, res);
            Renderer.showToast(`${res.length} hallazgos encontrados`, "success");
        } catch (e) {
            Renderer.showToast(e.message, "error");
        } finally {
            Renderer.setLoading(false);
        }
    }
};
