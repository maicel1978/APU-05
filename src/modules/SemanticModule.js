import { Renderer } from '../ui/Renderer.js';
import { SemanticEngine } from '../science/Semantic.js';

/**
 * Módulo de IA Semántica (APU-05B)
 */
export const SemanticModule = {
    id: 'semantic',
    label: 'CONCEPTOS',
    engine: new SemanticEngine(),

    async render(container, state) {
        Renderer.renderSemanticUI(
            container,
            this.engine.isReady,
            () => this.initIA(state),
            () => this.indexIA(state),
            (q) => this.handleSearch(q, state)
        );
    },

    async initIA(state) {
        Renderer.logSystem("Descargando modelo IA...");
        this.engine.init((p) => {
            const progressDiv = document.getElementById('ia-progress');
            if (p.type === 'progress' && progressDiv) {
                progressDiv.innerText = `DESCARGANDO: ${p.data.progress.toFixed(1)}%`;
            }
            if (this.engine.isReady) {
                Renderer.showToast("IA Lista", "success");
                this.render(document.getElementById('view-semantic'), state);
            }
        });
    },

    async indexIA(state) {
        if (!state.segments.length) return;
        Renderer.setLoading(true, "Codificando Significado...");
        try {
            await this.engine.generateEmbeddings(state.sessionId, state.segments, (c, t) => {
                const prog = document.getElementById('index-progress');
                if (prog) prog.innerText = `PROCESADO: ${c} / ${t}`;
            });
            Renderer.showToast("Base semántica lista", "success");
        } finally {
            Renderer.setLoading(false);
        }
    },

    async handleSearch(q, state) {
        Renderer.setLoading(true, "Analizando significado...");
        try {
            const res = await this.engine.search(q, state.sessionId);
            Renderer.renderSemanticResults(document.getElementById('semantic-results'), res);
        } finally {
            Renderer.setLoading(false);
        }
    }
};
