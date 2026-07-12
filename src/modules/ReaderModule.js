import { Renderer } from '../ui/Renderer.js';

/**
 * Módulo de Lectura Sagrada (v8.8.1)
 * Implementa Defensa de Memoria mediante Carga por Lotes (Paginación interna).
 */
export const ReaderModule = {
    id: 'reader',
    label: 'TRANSCRIPCIÓN ORIGINAL',
    category: 'tool',
    currentFilter: 'all',
    pageSize: 50,
    visibleLimit: 50,

    async render(container, state) {
        if (!state.segments || state.segments.length === 0) {
            container.innerHTML = '<div class="empty-msg"><h3>Sin Evidencia</h3><p>Cargue archivos para habilitar el modo lectura.</p></div>';
            return;
        }

        const sessionIds = [...new Set(state.segments.map(s => s.sessionId))];

        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; background:var(--bg); border-bottom:2px solid #000; padding-bottom:1rem; position:sticky; top:0; z-index:10;">
                <div>
                    <h2 style="font-family:var(--font-mono); font-size:1.1rem; font-weight:800; text-transform:uppercase;">Evidencia Primaria</h2>
                    <select id="reader-session-filter" style="margin-top:0.5rem; padding:0.4rem; border:1px solid #000; font-family:var(--font-mono); font-size:0.7rem; background:#fff; cursor:pointer;">
                        <option value="all">MOSTRAR TODO EL CORPUS</option>
                        ${sessionIds.map(id => `<option value="${id}" ${this.currentFilter == id ? 'selected' : ''}>ENTREVISTA #${id}</option>`).join('')}
                    </select>
                </div>
                <div id="reader-stats" style="text-align:right; font-family:var(--font-mono); font-size:0.6rem; color:var(--muted);"></div>
            </div>
            <div id="corpus-list-container"></div>
            <div id="reader-pagination-area" style="padding:2rem; text-align:center; border-top:1px solid #eee; margin-top:2rem;"></div>
        `;
        Renderer.renderProvisionalBanner(container, state);

        container.querySelector('#reader-session-filter').onchange = (e) => {
            this.currentFilter = e.target.value;
            this.visibleLimit = this.pageSize; // Resetear límite al cambiar de filtro
            this._refreshView(state);
        };

        this._refreshView(state);
    },

    _refreshView(state) {
        const fullList = this.currentFilter === 'all' 
            ? state.segments 
            : state.segments.filter(s => s.sessionId == this.currentFilter);

        const visibleSegments = fullList.slice(0, this.visibleLimit);
        const container = document.getElementById('corpus-list-container');
        const paginationArea = document.getElementById('reader-pagination-area');
        const statsEl = document.getElementById('reader-stats');

        if (!container || !paginationArea) return;

        // 1. Renderizar segmentos visibles
        Renderer.renderCorpus(container, visibleSegments, state.speakerMap);
        const extraTitle = container.querySelector('h2'); if (extraTitle) extraTitle.remove();

        // 2. Gestionar botón "Cargar más" (Defensa de Memoria)
        if (this.visibleLimit < fullList.length) {
            paginationArea.innerHTML = `
                <button id="btn-load-more" class="btn-core" style="width:100%; padding:1rem; background:#f4f4f5;">
                    📥 CARGAR SIGUIENTES ${this.pageSize} SEGMENTOS...
                </button>
            `;
            paginationArea.querySelector('#btn-load-more').onclick = () => {
                this.visibleLimit += this.pageSize;
                this._refreshView(state);
            };
        } else {
            paginationArea.innerHTML = '<p style="font-size:0.7rem; color:var(--muted); font-style:italic;">Fin de la evidencia disponible.</p>';
        }

        // 3. Actualizar estadísticas
        if (statsEl) {
            statsEl.innerHTML = `VISTO: ${visibleSegments.length} / TOTAL: ${fullList.length}<br>DISEÑO: ${state.topology.toUpperCase()}`;
        }
    }
};
