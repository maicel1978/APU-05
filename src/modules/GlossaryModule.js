import { Renderer } from '../ui/Renderer.js';
import { GlossaryManager } from '../science/GlossaryManager.js';
import { DiscoveryEngine } from '../science/DiscoveryEngine.js';
import db from '../core/Database.js';

/**
 * Módulo de Base de Conocimiento (GLOSARIO)
 * v8.5.0: Gestión Unificada, Portabilidad y Desarrollo Vivo.
 */
export const GlossaryModule = {
    id: 'glossary',
    label: 'GLOSARIO',
    category: 'tool',
    manager: new GlossaryManager(),
    discovery: new DiscoveryEngine(),

    async render(container, state) {
        container.innerHTML = `
            <div style="font-family:var(--font-sans); padding:1rem;">
                <h2 style="font-family:var(--font-mono); font-size:1.1rem; border-bottom:3px solid #000; padding-bottom:0.5rem; margin-bottom:2rem; text-transform:uppercase;">Glosario Maestro</h2>
                
                <nav class="sub-tabs" style="display:flex; gap:10px; margin-bottom:2rem; border-bottom:1px solid #ddd;">
                    <button class="sub-tab active" id="gs-tab-manage">📖 GESTIÓN</button>
                    <button class="sub-tab" id="gs-tab-discover">✨ DESCUBRIR</button>
                    <button class="sub-tab" id="gs-tab-port">💾 PORTABILIDAD</button>
                </nav>

                <div id="gs-content-area" style="animation: slideIn 0.2s ease-out;"></div>
            </div>
        `;

        this._bindNavigation(container, state);
        this._renderManage(container.querySelector('#gs-content-area'), state);
    },

    _bindNavigation(container, state) {
        const area = container.querySelector('#gs-content-area');
        const tabs = {
            'gs-tab-manage': () => this._renderManage(area, state),
            'gs-tab-discover': () => this._renderDiscovery(area, state),
            'gs-tab-port': () => this._renderPortability(area, state)
        };

        container.querySelectorAll('.sub-tab').forEach(btn => {
            btn.onclick = () => {
                container.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                tabs[btn.id]();
            };
        });
    },

    async _renderManage(container, state) {
        container.innerHTML = `
            <div class="wb-card" style="margin-bottom:2rem; background:var(--accent);">
                <h3 style="font-size:0.8rem; font-weight:bold; margin-bottom:1rem; text-transform:uppercase;">Añadir Término</h3>
                <div style="display:grid; grid-template-columns: 2fr 1fr 100px; gap:10px;">
                    <input type="text" id="gs-new-term" placeholder="Ej: ansiedad, telemedicina..." style="padding:0.7rem; border:1px solid #000; font-family:var(--font-mono); font-size:0.8rem;">
                    <input type="text" id="gs-new-cat" list="gs-cat-list" placeholder="Categoría..." style="padding:0.7rem; border:1px solid #000; font-family:var(--font-mono); font-size:0.8rem;">
                    <datalist id="gs-cat-list"></datalist>
                    <button id="gs-btn-add" class="btn-core" style="background:#000; color:#fff;">GUARDAR</button>
                </div>
            </div>
            <div id="gs-table-container"></div>
        `;

        // Llenar datalist de categorías
        const glossary = await this.manager.getFullGlossary();
        const cats = Object.keys(glossary);
        container.querySelector('#gs-cat-list').innerHTML = cats.map(c => `<option value="${c.toUpperCase()}">`).join('');

        container.querySelector('#gs-btn-add').onclick = async () => {
            const term = container.querySelector('#gs-new-term').value;
            const cat = container.querySelector('#gs-new-cat').value;
            if (term && cat) {
                await this.manager.addTerm(term, cat);
                container.querySelector('#gs-new-term').value = '';
                Renderer.showToast(`'${term}' añadido a ${cat.toUpperCase()}`, "success");
                this._renderList(container.querySelector('#gs-table-container'));
            }
        };

        this._renderList(container.querySelector('#gs-table-container'));
    },

    async _renderList(container) {
        const terms = await db.glossaries.toArray();
        if (terms.length === 0) {
            container.innerHTML = '<p class="empty-msg">No hay términos personalizados aún. Utilice el formulario superior o el motor de descubrimiento.</p>';
            return;
        }

        container.innerHTML = `
            <table class="wb-table">
                <thead><tr><th>TÉRMINO</th><th>CATEGORÍA</th><th style="width:40px;"></th></tr></thead>
                <tbody>
                    ${terms.map(t => `
                        <tr>
                            <td style="font-weight:bold;">${t.term.toUpperCase()}</td>
                            <td style="font-size:0.7rem;">${t.category.toUpperCase()}</td>
                            <td style="text-align:center;"><button class="gs-del" data-id="${t.id}" style="color:red; border:none; background:none; cursor:pointer; font-size:1.2rem;">&times;</button></td>
                        </tr>`).join('')}
                </tbody>
            </table>`;

        container.querySelectorAll('.gs-del').forEach(btn => {
            btn.onclick = async () => {
                await this.manager.removeTerm(parseInt(btn.dataset.id));
                this._renderList(container);
            };
        });
    },

    async _renderDiscovery(container, state) {
        if (!state.segments.length) {
            container.innerHTML = '<p class="empty-msg">Cargue datos para habilitar el descubrimiento de términos.</p>';
            return;
        }
        container.innerHTML = `<p style="font-size:0.8rem; color:var(--muted); margin-bottom:1.5rem;">Candidatos detectados por frecuencia y carga emocional:</p><div id="gs-discovery-list"></div>`;
        const listArea = container.querySelector('#gs-discovery-list');
        
        const glossary = await this.manager.getFullGlossary();
        const suggestions = await this.discovery.suggestTerms(state.segments, glossary);

        if (suggestions.length === 0) {
            listArea.innerHTML = '<p class="empty-msg">El motor no ha encontrado nuevos términos de interés fuera del glosario actual.</p>';
            return;
        }

        suggestions.forEach(s => {
            const card = document.createElement('div');
            card.className = 'wb-card';
            card.style.padding = '1.2rem';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem;">
                    <strong style="font-family:var(--font-mono);">${s.term.toUpperCase()}</strong>
                    <span style="font-size:0.6rem; background:#000; color:#fff; padding:2px 6px;">FREC: ${s.count}</span>
                </div>
                <p style="font-size:0.75rem; color:#666; font-style:italic; margin-bottom:1.2rem;">"...${s.evidence.substring(0, 80)}..."</p>
                <div style="display:flex; gap:10px;">
                    <button class="btn-core gs-quick-add" data-term="${s.term}" data-cat="sintomas" style="font-size:0.6rem;">+ SÍNTOMA</button>
                    <button class="btn-core gs-quick-add" data-term="${s.term}" data-cat="contextos" style="font-size:0.6rem;">+ CONTEXTO</button>
                </div>
            `;
            listArea.appendChild(card);
        });

        listArea.querySelectorAll('.gs-quick-add').forEach(btn => {
            btn.onclick = async () => {
                await this.manager.addTerm(btn.dataset.term, btn.dataset.cat);
                Renderer.showToast("Capturado", "success");
                btn.closest('.wb-card').style.display = 'none';
            };
        });
    },

    async _renderPortability(container, state) {
        container.innerHTML = `
            <div class="wb-card" style="text-align:center; padding:3rem;">
                <h3 style="font-size:0.9rem; margin-bottom:1rem;">BÓVEDA DE CONOCIMIENTO</h3>
                <p style="font-size:0.75rem; color:var(--muted); margin-bottom:2rem;">Exporte su glosario refinado para usarlo en otros estudios o cargue una biblioteca externa.</p>
                <div style="display:flex; gap:1rem; justify-content:center;">
                    <button id="gs-btn-export" class="btn-core">💾 DESCARGAR (.JSON)</button>
                    <button id="gs-btn-import" class="btn-core">📂 CARGAR BIBLIOTECA</button>
                </div>
                <input type="file" id="gs-file-import" accept=".json" style="display:none;">
            </div>
        `;

        container.querySelector('#gs-btn-export').onclick = async () => {
            const data = await this.manager.exportToJSON();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `APU05_KnowledgeBase_${new Date().getTime()}.json`;
            a.click();
        };

        container.querySelector('#gs-btn-import').onclick = () => container.querySelector('#gs-file-import').click();
        container.querySelector('#gs-file-import').onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const data = JSON.parse(await file.text());
                const count = await this.manager.importFromJSON(data);
                const message = count === 0
                    ? 'Biblioteca compatible: no contiene términos.'
                    : `Importación exitosa: ${count} términos`;
                Renderer.showToast(message, "success");
                this._renderManage(container, state);
            } catch (error) {
                Renderer.showToast(error.message || 'No se pudo importar el glosario.', "error");
            } finally {
                e.target.value = '';
            }
        };
    }
};
