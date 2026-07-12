import { Renderer } from '../ui/Renderer.js';
import { APUParser } from '../core/Parser.js';
import { SessionManager } from '../core/Session.js';
import { State } from '../core/State.js';
import { StatsEngine } from '../science/StatsEngine.js';

/**
 * Módulo EXPLORATORIO (APU-05B) - Workbench v9.2.0
 * Ingesta de Cohorte y Análisis de Patrones (ENA) con Generador de Hipótesis.
 */
export const ExploratoryModule = {
    id: 'exploratory',
    label: 'Exploratorio',
    category: 'methodology',
    stats: new StatsEngine(),
    steps: [
        { id: 1, label: 'INGESTA' },
        { id: 2, label: 'PULSO' },
        { id: 3, label: 'VÍNCULOS' },
        { id: 4, label: 'HALLAZGOS' },
        { id: 5, label: 'HIPÓTESIS' }
    ],

    async renderStep(stepId, container, state) {
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'view-container';
        container.appendChild(wrapper);

        if (stepId > 1 && !state.segments.length) {
            wrapper.innerHTML = '<div class="empty-msg">Acceso Bloqueado: Primero cargue la cohorte en el Paso 1.</div>';
            return;
        }

        try {
            switch(stepId) {
                case 1: this._renderIngesta(wrapper, state); break;
                case 2: await this._renderPulse(wrapper, state); break;
                case 3: await this._renderLinks(wrapper, state); break;
                case 4: await this._renderFindings(wrapper, state); break;
                case 5: await this._renderHypotheses(wrapper, state); break;
            }
            Renderer.renderProvisionalBanner(wrapper, state);
        } catch (err) {
            wrapper.innerHTML = `<div style="padding:2rem; border:2px solid red; color:red;"><h3>ERROR DE ANÁLISIS</h3>${err.message}</div>`;
        }
    },

    _renderIngesta(container, state) {
        Renderer.renderModuleTitle(container, "01. Ingesta de Cohorte");
        if (!state.sessionId) {
            container.innerHTML += `
                <div class="wb-card" style="text-align:center; padding:4rem;">
                    <input type="file" id="cohort-upload" accept=".json" multiple style="display:none;">
                    <button class="btn-core" onclick="document.getElementById('cohort-upload').click()">📂 SELECCIONAR ARCHIVOS</button>
                </div>`;
            container.querySelector('#cohort-upload').onchange = async (e) => {
                const files = Array.from(e.target.files);
                if (files.length === 0) return;
                Renderer.setLoading(true, "Procesando Cohorte...");
                try {
                    const validated = [];
                    for (const file of files) {
                        const json = JSON.parse(await file.text());
                        const validation = await APUParser.validate(json, 'exploratory');
                        if (validation.requiresConfirmation && !Renderer.confirmProvisional(validation.warnings, file.name)) {
                            Renderer.showToast('Carga de cohorte cancelada.', 'info');
                            return;
                        }
                        validated.push(validation);
                    }

                    let allSegments = [];
                    let lastSid = null;
                    for (const validation of validated) {
                        const sid = await SessionManager.createSession(validation.data);
                        lastSid = sid;
                        allSegments.push(...(await SessionManager.getSegments(sid)));
                    }
                    State.isProvisional = validated.some((item) => item.requiresConfirmation);
                    State.validationWarnings = validated.flatMap((item) => item.warnings);
                    State.speakerMap = await SessionManager.getSpeakerMap(lastSid);
                    State.segments = allSegments;
                    State.sessionId = lastSid;
                    Renderer.showToast("Cohorte integrada", "success");
                } catch (err) { alert(err.message); } finally { Renderer.setLoading(false); }
            };
        } else {
            container.innerHTML += `<div class="wb-card"><h3>✅ COHORTE ACTIVA</h3><p>${state.segments.length} segmentos integrados.</p></div>`;
        }
    },

    async _renderPulse(container, state) {
        Renderer.renderModuleTitle(container, "02. Pulso de Cohorte");
        const stats = await this.stats.getCorpusStats(state.segments);
        Renderer.renderNarrativeRadiography(container, stats, state.speakerMap, "Radiografía de Cohorte");
    },

    async _renderLinks(container, state) {
        Renderer.renderModuleTitle(container, "03. Vínculos Narrativos");
        const stats = await this.stats.getCorpusStats(state.segments);
        const allTerms = Object.values(stats.entidades).flat().map(e => e.term).slice(0, 15);

        if (allTerms.length === 0) {
            container.innerHTML += '<p class="empty-msg">Sin términos suficientes. Verifique su Glosario.</p>';
            return;
        }

        const links = await this.stats.getAdjacencyMatrix(state.segments, allTerms);
        container.innerHTML += `
            <div class="wb-card">
                <h4 style="font-size:0.8rem; color:#666; margin-bottom:1.5rem; text-transform:uppercase;">Asociaciones Críticas</h4>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    ${links.slice(0, 8).map(l => `
                        <div class="link-row" data-a="${l.source}" data-b="${l.target}" style="padding:1rem; border:1px solid #000; background:#f9f9f9; display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
                            <div style="font-family:var(--font-mono); font-size:0.9rem;">
                                <strong>${l.source.toUpperCase()}</strong> 🔗 <strong>${l.target.toUpperCase()}</strong>
                            </div>
                            <div style="font-size:0.7rem; background:#000; color:#fff; padding:2px 8px;">Fuerza: ${l.weight}</div>
                        </div>`).join('')}
                </div>
                <div id="link-evidence" style="margin-top:2rem; padding:1.5rem; border:1px dashed #000; background:#fff; display:none;"></div>
            </div>`;

        container.querySelectorAll('.link-row').forEach(row => {
            row.onclick = () => this._showLinkEvidence(row.dataset.a, row.dataset.b, state);
        });
    },

    _showLinkEvidence(a, b, state) {
        const area = document.getElementById('link-evidence');
        area.style.display = 'block';
        const matches = state.segments.filter(s => {
            const txt = s.cleanedText.toLowerCase();
            return txt.includes(a.toLowerCase()) && txt.includes(b.toLowerCase());
        }).slice(0, 3);

        area.innerHTML = `
            <h4 style="font-size:0.8rem; font-weight:bold; margin-bottom:1rem; text-transform:uppercase;">Evidencia de Vínculo: ${a} + ${b}</h4>
            ${matches.map(m => `<blockquote style="font-size:0.8rem; border-left:3px solid #000; padding-left:1rem; margin-bottom:1rem;">"${m.cleanedText}"</blockquote>`).join('')}
        `;
        area.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    async _renderFindings(container, state) {
        Renderer.renderModuleTitle(container, "04. Hallazgos Sorpresa");
        const outliers = await this.stats.getNarrativeOutliers(state.segments);
        if (outliers.length === 0) {
            container.innerHTML += '<p class="empty-msg">Se requieren al menos 2 entrevistas para detectar hallazgos.</p>';
            return;
        }
        container.innerHTML += `
            <div class="wb-card">
                <div style="display:grid; gap:15px;">
                    ${outliers.slice(0, 5).map(o => `
                        <div style="padding:1.5rem; border:1px solid #000; border-left:8px solid #000;">
                            <div style="font-size:0.6rem; font-weight:bold; color:var(--muted);">SESIÓN #${o.sessionId}</div>
                            <div style="font-size:1rem; font-weight:bold; margin:0.5rem 0;">HALLAZGO ATÍPICO: "${o.keyTopic.toUpperCase()}"</div>
                            <p style="font-size:0.8rem;">Desviación temática: <strong>${o.intensity}x</strong> superior al promedio.</p>
                        </div>`).join('')}
                </div>
            </div>`;
    },

    async _renderHypotheses(container, state) {
        Renderer.renderModuleTitle(container, "05. Hipótesis Candidatas");
        Renderer.setLoading(true, "Generando líneas de investigación...");
        try {
            const stats = await this.stats.getCorpusStats(state.segments);
            const topTerms = Object.values(stats.entidades).flat().map(e => e.term).slice(0, 10);
            const links = await this.stats.getAdjacencyMatrix(state.segments, topTerms);
            const outliers = await this.stats.getNarrativeOutliers(state.segments);

            const hypotheses = await this.stats.generateHypotheses(state.segments, links, outliers);

            container.innerHTML += `
                <div class="wb-card">
                    <p style="font-size:0.85rem; margin-bottom:2rem; line-height:1.5;">Basado en los patrones detectados, el sistema sugiere las siguientes líneas de investigación para profundizar en el análisis cualitativo:</p>
                    ${hypotheses.map(h => `
                        <div style="margin-bottom:2rem; padding:1.5rem; border:1px solid #000; background:#f9f9fb;">
                            <span style="font-size:0.6rem; font-weight:bold; background:#000; color:#fff; padding:2px 8px;">TIPO: ${h.type}</span>
                            <p style="font-size:1rem; font-weight:bold; margin:1rem 0;">"${h.statement}"</p>
                            <div style="font-size:0.85rem; color:#444; border-top:1px solid #eee; padding-top:1rem;">
                                <strong>PREGUNTA CIENTÍFICA:</strong><br> ${h.question}
                            </div>
                        </div>`).join('')}
                </div>`;
        } finally { Renderer.setLoading(false); }
    },

    _renderManual(container) {
        Renderer.renderModuleTitle(container, "Guía ENA");
        container.innerHTML += `<div class="wb-card"><p style="font-size:0.85rem; line-height:1.6;">El Análisis Exploratorio de Narrativas (ENA) detecta patrones emergentes en grandes volúmenes de texto mediante estadística inferencial y co-ocurrencias léxicas.</p></div>`;
    }
};
