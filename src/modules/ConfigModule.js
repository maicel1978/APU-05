import { Renderer } from '../ui/Renderer.js';
import { State } from '../core/State.js';
import db from '../core/Database.js';

/**
 * Módulo de Configuración y Soberanía (APU-05C)
 */
export const ConfigModule = {
    id: 'config',
    label: '⚙️ CONFIG',

    async render(container, state) {
        container.innerHTML = `
            <div style="font-family:var(--font-sans); padding:1rem;">
                <h2 style="font-size:1.1rem; border-bottom:2px solid #000; padding-bottom:0.5rem; margin-bottom:1.5rem; text-transform:uppercase;">Mando del Investigador</h2>
                
                <section style="margin-bottom:2rem;">
                    <h3 style="font-size:0.9rem; font-weight:bold; margin-bottom:1rem;">1. ESCENARIO ANALÍTICO</h3>
                    <select id="topology-select" style="width:100%; padding:0.8rem; border:2px solid #000; font-family:var(--font-mono); font-weight:bold; background:#fff; cursor:pointer;">
                        <option value="single-case" ${state.topology === 'single-case' ? 'selected' : ''}>CASO ÚNICO</option>
                        <option value="cohort" ${state.topology === 'cohort' ? 'selected' : ''}>EXPLORATORIO</option>
                        <option value="comparative" ${state.topology === 'comparative' ? 'selected' : ''}>TRANSVERSAL</option>
                        <option value="longitudinal" ${state.topology === 'longitudinal' ? 'selected' : ''}>LONGITUDINAL</option>
                    </select>
                </section>

                <section style="margin-bottom:2rem; border-top:1px solid #eee; padding-top:1.5rem;">
                    <h3 style="font-size:0.9rem; font-weight:bold; margin-bottom:1rem;">2. GLOSARIO PERSONALIZADO</h3>
                    <div style="border:2px dashed #000; padding:1.5rem; text-align:center; background:#f9f9f9;">
                        <input type="file" id="glossary-upload" accept=".csv" style="display:none;">
                        <button onclick="document.getElementById('glossary-upload').click()" style="padding:0.6rem 1rem; background:#000; color:#fff; cursor:pointer; font-size:0.8rem;">CARGAR CSV</button>
                    </div>
                    <div id="glossary-list" style="margin-top:1rem; font-size:0.75rem;"></div>
                </section>
            </div>
        `;

        container.querySelector('#topology-select').onchange = (e) => {
            State.topology = e.target.value;
            Renderer.showToast(`Escenario: ${e.target.value.toUpperCase()}`, "info");
        };

        container.querySelector('#glossary-upload').onchange = (e) => this.handleGlossaryUpload(e);
        this.renderGlossaryList(container.querySelector('#glossary-list'));
    },

    async handleGlossaryUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        Renderer.setLoading(true, "Procesando Glosario...");
        try {
            const text = await file.text();
            const entries = text.split('\n').map(line => {
                const [term, category] = line.split(',').map(s => s.trim());
                return (term && category) ? { name: file.name, category, term } : null;
            }).filter(e => e);

            if (entries.length > 0) {
                await db.glossaries.bulkAdd(entries);
                Renderer.showToast(`Glosario: ${entries.length} términos`, "success");
                this.renderGlossaryList(document.getElementById('glossary-list'));
            }
        } catch (err) {
            Renderer.showToast("Error en glosario", "error");
        } finally {
            Renderer.setLoading(false);
        }
    },

    async renderGlossaryList(container) {
        if (!container) return;
        const all = await db.glossaries.toArray();
        if (all.length === 0) return container.innerHTML = '<p style="font-style:italic; color:#999;">Glosario vacío.</p>';
        container.innerHTML = `<strong>Términos:</strong> ${all.length}`;
        const btn = document.createElement('button');
        btn.innerText = "LIMPIAR";
        btn.style.cssText = "margin-left:1rem; font-size:0.6rem; color:red; border:1px solid red; background:none; cursor:pointer;";
        btn.onclick = async () => { await db.glossaries.clear(); this.renderGlossaryList(container); };
        container.appendChild(btn);
    }
};
