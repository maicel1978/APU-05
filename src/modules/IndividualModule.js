import { Renderer } from '../ui/Renderer.js';
import { APUParser } from '../core/Parser.js';
import { SessionManager } from '../core/Session.js';
import { State } from '../core/State.js';
import { readInputPackages } from '../core/InputPackage.js';
import { summarizeTraceabilities } from '../core/Traceability.js';
import { NER } from '../science/NER.js';
import { SentimentEngine } from '../science/Sentiment.js';
import { StatsEngine } from '../science/StatsEngine.js';
import { Charts } from '../ui/Charts.js';
import { GlossaryManager } from '../science/GlossaryManager.js';

/**
 * Módulo INDIVIDUAL (APU-05A) - v8.2.0 Workbench
 * Sellado contra regresiones.
 */
export const IndividualModule = {
    id: 'individual',
    label: 'Individual',
    category: 'methodology',
    ner: new NER(),
    sentiment: new SentimentEngine(),
    stats: new StatsEngine(),
    glossary: new GlossaryManager(),
    steps: [
        { id: 1, label: 'INGESTA' },
        { id: 2, label: 'CARACTERIZACIÓN' },
        { id: 3, label: 'ESTRUCTURA' },
        { id: 4, label: 'SÍNTESIS' },
        { id: 5, label: 'IMPACTO' }
    ],

    async renderStep(stepId, container, state) {
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'view-container';
        container.appendChild(wrapper);

        try {
            switch(stepId) {
                case 1: this._renderIngesta(wrapper, state); break;
                case 2: await this._renderCharacterization(wrapper, state); break;
                case 3: await this._renderStructure(wrapper, state); break;
                case 4: await this._renderSynthesis(wrapper, state); break;
                case 5: await this._renderImpact(wrapper, state); break;
            }
            Renderer.renderProvisionalBanner(wrapper, state);
        } catch (err) {
            console.error(err);
            wrapper.innerHTML = `<div style="padding:2rem; border:2px solid red; color:red; font-family:monospace;"><h3>ERROR DE ANÁLISIS</h3>${err.message}</div>`;
        }
    },

    _renderIngesta(container, state) {
        Renderer.renderModuleTitle(container, "01. Carga de Evidencia");
        if (!state.sessionId) {
            container.innerHTML += `
                <div class="wb-card" style="text-align:center; padding:4rem;">
                    <input type="file" id="wb-file-upload" accept=".json" multiple style="display:none;">
                    <button class="btn-core" onclick="document.getElementById('wb-file-upload').click()">📂 SELECCIONAR CORPUS + TRAZABILIDAD OPCIONAL</button>
                </div>`;
            container.querySelector('#wb-file-upload').onchange = async (e) => {
                const files = Array.from(e.target.files);
                if (files.length === 0) return;
                Renderer.setLoading(true, "Procesando...");
                try {
                    const packages = await readInputPackages(files);
                    if (packages.length !== 1) {
                        throw new Error('El diseño Individual admite un solo caso.');
                    }
                    const input = packages[0];
                    const validation = await APUParser.validate(
                        input.cleaned,
                        'individual',
                        input.traceability
                    );
                    if (validation.requiresConfirmation && !Renderer.confirmProvisional(validation.warnings, input.cleanedFileName)) {
                        e.target.value = '';
                        Renderer.showToast('Carga provisional cancelada.', 'info');
                        return;
                    }
                    const sid = await SessionManager.createSession(validation.data, validation.traceability);
                    State.isProvisional = validation.requiresConfirmation;
                    State.validationWarnings = validation.warnings;
                    State.auditSummary = summarizeTraceabilities([validation.traceability]);
                    State.sessionIds = [sid];
                    State.speakerMap = await SessionManager.getSpeakerMapForSessions([sid]);
                    State.segments = await SessionManager.getSegments(sid);
                    State.sessionId = sid;
                    const message = validation.traceability
                        ? `Carga exitosa: ${validation.traceability.segments.length} segmentos con trazabilidad.`
                        : 'Carga exitosa sin trazabilidad complementaria.';
                    Renderer.showToast(message, "success");
                } catch (err) { alert(err.message); } finally { Renderer.setLoading(false); }
            };
        } else {
            container.innerHTML += `<div class="wb-card" style="border-left:5px solid green;"><h3>✅ SESIÓN ACTIVA</h3><p>Evidencia validada. Use la barra lateral para analizar.</p></div>`;
        }
    },

    async _renderCharacterization(container, state) {
        Renderer.renderModuleTitle(container, "02. Caracterización Narrativa");
        const stats = await this.stats.getCorpusStats(state.segments);
        Renderer.renderNarrativeRadiography(container, stats, state.speakerMap);
    },

    async _renderStructure(container, state) {
        Renderer.renderModuleTitle(container, "03. Estructura Narrativa");
        const data = await this.stats.getNarrativeStructure(state.segments);
        const fullText = state.segments.map(s => s.cleanedText).join(' ');
        const evidence = await this.glossary.extractEvidence(fullText);

        container.innerHTML += `
            <div class="wb-card">
                <h4 style="font-size:0.8rem; color:#666; margin-bottom:1.5rem; text-transform:uppercase;">Dominancia Temática</h4>
                <div style="display:grid; gap:20px;">
                    ${data.weights.map(w => `
                        <div style="border-bottom:1px solid #eee; padding-bottom:1rem;">
                            <div style="display:flex; align-items:center; gap:15px; margin-bottom:0.5rem;">
                                <div style="width:120px; font-size:0.75rem; font-weight:bold;">${w.label.toUpperCase()}</div>
                                <div style="flex:1; height:10px; background:#eee; border:1px solid #000;"><div style="width:${w.weight}%; height:100%; background:#000;"></div></div>
                                <div style="width:40px; font-size:0.7rem; text-align:right;">${w.weight}%</div>
                            </div>
                            <div style="font-size:0.65rem; color:#666; padding-left:135px;">
                                <strong>EVIDENCIA:</strong> ${evidence[w.label]?.map(e => `${e.term} (${e.count})`).join(', ') || 'N/A'}
                            </div>
                        </div>`).join('')}
                </div>
            </div>`;
    },

    async _renderSynthesis(container, state) {
        Renderer.renderModuleTitle(container, "04. Síntesis Analítica");
        const diagnosis = await this.stats.getNarrativeDiagnosis(state.segments);
        const idea = state.segments.find(s => s.cleanedText.toLowerCase().includes(diagnosis.core.toLowerCase())) || state.segments[0];
        container.innerHTML += `
            <div class="wb-card" style="line-height:1.7;">
                <h4 style="font-size:0.85rem; font-weight:bold; text-transform:uppercase; color:#666; margin-bottom:1rem;">Idea Central</h4>
                <p style="font-size:1.1rem; font-style:italic; font-weight:bold; margin-bottom:2.5rem; border-left:5px solid #000; padding-left:1.5rem;">"${idea.cleanedText}"</p>
            </div>`;
    },

    async _renderImpact(container, state) {
        Renderer.renderModuleTitle(container, "05. Matriz de Prioridades");
        const fullText = state.segments.map(s => s.cleanedText).join(' ');
        const evidence = await this.glossary.extractEvidence(fullText);
        const list = [];
        for (const [cat, items] of Object.entries(evidence)) {
            items.forEach(i => {
                const s = this.sentiment.analyzeAspect(fullText, i.term) || { score: 0, intensity: 1 };
                if (s.score < 0) {
                    const actVal = cat === 'medicamentos' ? 1.5 : 1;
                    list.push({ term: i.term, count: i.count, val: i.count * s.intensity * actVal });
                }
            });
        }
        const sorted = list.sort((a,b) => b.val - a.val).slice(0, 5);
        container.innerHTML += `
            <div class="wb-card">
                <table class="wb-table">
                    <thead><tr><th>HALLAZGO CRÍTICO</th><th>MAGNITUD</th><th>PRIORIDAD</th></tr></thead>
                    <tbody>
                        ${sorted.map((d, i) => `<tr><td style="font-weight:bold;">${d.term.toUpperCase()}</td><td style="text-align:center;">${d.count}</td><td style="text-align:center; background:${i < 3 ? '#fee2e2' : '#fff'}; font-weight:bold;">P${i+1}</td></tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    }
};
