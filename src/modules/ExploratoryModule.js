import { Renderer } from '../ui/Renderer.js';
import { APUParser } from '../core/Parser.js';
import { SessionManager } from '../core/Session.js';
import { State } from '../core/State.js';
import { readInputPackages } from '../core/InputPackage.js';
import { summarizeTraceabilities } from '../core/Traceability.js';
import { StatsEngine } from '../science/StatsEngine.js';

/**
 * Módulo EXPLORATORIO (APU-05B) - Workbench v9.5.1
 * Ingesta de Cohorte y Análisis de Patrones (ENA) con Grafo de Red e Hipótesis.
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
            console.error(err);
            wrapper.innerHTML = `<div style="padding:2rem; border:2px solid red; color:red; font-family:monospace;"><h3>ERROR DE ANÁLISIS</h3>${Renderer.sanitize(err.message)}</div>`;
        }
    },

    _renderIngesta(container, state) {
        Renderer.renderModuleTitle(container, "01. Ingesta de Cohorte");
        if (!state.sessionId) {
            container.innerHTML += `
                <div class="wb-card" style="text-align:center; padding:4rem;">
                    <input type="file" id="cohort-upload" accept=".json" multiple style="display:none;">
                    <button class="btn-core" onclick="document.getElementById('cohort-upload').click()">📂 SELECCIONAR CORPUS + TRAZABILIDADES OPCIONALES</button>
                </div>`;
            container.querySelector('#cohort-upload').onchange = async (e) => {
                const files = Array.from(e.target.files);
                if (files.length === 0) return;
                Renderer.setLoading(true, "Procesando Cohorte...");
                try {
                    const packages = await readInputPackages(files);
                    const validated = [];
                    for (const input of packages) {
                        const validation = await APUParser.validate(
                            input.cleaned,
                            'exploratory',
                            input.traceability
                        );
                        if (validation.requiresConfirmation && !Renderer.confirmProvisional(validation.warnings, input.cleanedFileName)) {
                            e.target.value = '';
                            Renderer.showToast('Carga de cohorte cancelada.', 'info');
                            return;
                        }
                        validated.push(validation);
                    }

                    let allSegments = [];
                    let lastSid = null;
                    const sessionIds = [];
                    for (const validation of validated) {
                        const sid = await SessionManager.createSession(validation.data, validation.traceability);
                        lastSid = sid;
                        sessionIds.push(sid);
                        allSegments.push(...(await SessionManager.getSegments(sid)));
                    }
                    State.isProvisional = validated.some((item) => item.requiresConfirmation);
                    State.validationWarnings = validated.flatMap((item) => item.warnings);
                    State.auditSummary = summarizeTraceabilities(validated.map((item) => item.traceability));
                    State.sessionIds = sessionIds;
                    State.speakerMap = await SessionManager.getSpeakerMapForSessions(sessionIds);
                    State.segments = allSegments;
                    State.sessionId = lastSid;
                    Renderer.showToast(`Cohorte integrada: ${packages.length} casos, ${State.auditSummary.traceabilityCases} con trazabilidad.`, "success");
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

    _getTopVocabularyTerms(stats, segments, limit = 15) {
        const nerTerms = Object.values(stats?.entidades || {}).flat().map(e => e?.term).filter(Boolean);
        const stopWords = new Set([
            'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'que', 'en', 'de', 'del', 'a', 'con', 'por', 'para',
            'si', 'no', 'es', 'son', 'su', 'sus', 'se', 'me', 'mi', 'al', 'lo', 'como', 'pero', 'más', 'fue', 'hay', 'muy', 'este',
            'esta', 'estos', 'estas', 'entonces', 'cuando', 'sobre', 'todo', 'todos', 'porque', 'tiene', 'tienen', 'había', 'desde',
            'está', 'están', 'puede', 'pueden', 'hacer', 'dice', 'ahora', 'bien', 'bueno', 'buenos', 'días', 'señor', 'señora', 'usted',
            'siento', 'veces', 'tengo', 'entiendo', 'ella', 'ellos', 'sólo', 'solo', 'pues', 'cómo', 'cual', 'cuál', 'algo', 'nada'
        ]);
        const counts = new Map();
        (segments || []).forEach(seg => {
            const tokens = (seg?.cleanedText || '').toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
            tokens.forEach(t => {
                if (t.length > 3 && !stopWords.has(t) && !nerTerms.includes(t)) {
                    counts.set(t, (counts.get(t) || 0) + 1);
                }
            });
        });
        const freqTerms = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0]);
        return [...new Set([...nerTerms, ...freqTerms])].slice(0, limit);
    },

    async _renderLinks(container, state) {
        Renderer.renderModuleTitle(container, "03. Vínculos Narrativos");
        const stats = await this.stats.getCorpusStats(state.segments);
        const allTerms = this._getTopVocabularyTerms(stats, state.segments, 15);

        if (allTerms.length === 0) {
            container.innerHTML += '<p class="empty-msg">Sin términos analizables en la cohorte seleccionada.</p>';
            return;
        }

        const links = await this.stats.getAdjacencyMatrix(state.segments, allTerms, 1);
        if (links.length === 0) {
            container.innerHTML += '<p class="empty-msg">No se detectaron co-ocurrencias significativas entre los términos analizados.</p>';
            return;
        }

        const topLinks = links.slice(0, 10);
        const activeNodes = [...new Set(topLinks.flatMap(l => [l.source, l.target]))];
        const svgHtml = this._drawNetworkSvg(topLinks, activeNodes);

        container.innerHTML += `
            <div class="wb-card">
                <h4 style="font-size:0.8rem; color:#666; margin-bottom:1rem; text-transform:uppercase;">Grafo de Red Léxica</h4>
                ${svgHtml}
                <h4 style="font-size:0.8rem; color:#666; margin-bottom:1rem; text-transform:uppercase;">Asociaciones Críticas Detalladas</h4>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    ${links.slice(0, 8).map(l => `
                        <div class="link-row" data-a="${Renderer.sanitize(l.source)}" data-b="${Renderer.sanitize(l.target)}" style="padding:1rem; border:1px solid #000; background:#f9f9f9; display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
                            <div style="font-family:var(--font-mono); font-size:0.9rem;">
                                <strong>${Renderer.sanitize(l.source.toUpperCase())}</strong> 🔗 <strong>${Renderer.sanitize(l.target.toUpperCase())}</strong>
                            </div>
                            <div style="font-size:0.7rem; background:#000; color:#fff; padding:2px 8px;">Fuerza: ${l.weight}</div>
                        </div>`).join('')}
                </div>
                <div id="link-evidence" style="margin-top:2rem; padding:1.5rem; border:1px dashed #000; background:#fff; display:none;"></div>
            </div>`;

        container.querySelectorAll('.svg-link, .link-row').forEach(el => {
            el.onclick = () => {
                const a = el.getAttribute('data-a');
                const b = el.getAttribute('data-b');
                if (a && b) this._showLinkEvidence(a, b, state);
            };
        });

        container.querySelectorAll('.svg-node').forEach(node => {
            node.onclick = () => {
                const term = node.getAttribute('data-term');
                if (term) this._showNodeEvidence(term, state);
            };
        });
    },

    _drawNetworkSvg(links, nodes) {
        if (!nodes || nodes.length === 0 || !links || links.length === 0) return '';
        const cx = 325;
        const cy = 180;
        const r = 120;
        const nodePositions = new Map();

        nodes.forEach((term, index) => {
            const angle = (2 * Math.PI * index) / nodes.length - Math.PI / 2;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            nodePositions.set(term, { x, y, term });
        });

        const linesHtml = links.map(link => {
            const posA = nodePositions.get(link.source);
            const posB = nodePositions.get(link.target);
            if (!posA || !posB) return '';
            const strokeWidth = Math.min(Math.max(link.weight, 1.5), 6);
            const midX = (posA.x + posB.x) / 2;
            const midY = (posA.y + posB.y) / 2;
            return `
                <g class="svg-link" data-a="${Renderer.sanitize(link.source)}" data-b="${Renderer.sanitize(link.target)}" style="cursor:pointer; transition:all 0.2s;">
                    <line x1="${posA.x}" y1="${posA.y}" x2="${posB.x}" y2="${posB.y}" stroke="#000" stroke-width="${strokeWidth}" stroke-opacity="0.35" />
                    <rect x="${midX - 14}" y="${midY - 9}" width="28" height="18" fill="#fff" stroke="#000" stroke-width="1" rx="3" />
                    <text x="${midX}" y="${midY}" text-anchor="middle" dominant-baseline="central" font-family="monospace" font-size="9" font-weight="bold" fill="#000">${link.weight}</text>
                </g>`;
        }).join('');

        const nodesHtml = nodes.map(term => {
            const pos = nodePositions.get(term);
            if (!pos) return '';
            const label = term.length > 10 ? term.slice(0, 9) + '…' : term;
            return `
                <g class="svg-node" data-term="${Renderer.sanitize(term)}" style="cursor:pointer; transition:all 0.2s;">
                    <circle cx="${pos.x}" cy="${pos.y}" r="22" fill="#fff" stroke="#000" stroke-width="2" />
                    <text x="${pos.x}" y="${pos.y}" text-anchor="middle" dominant-baseline="central" font-family="monospace" font-size="9" font-weight="bold" fill="#000">${Renderer.sanitize(label.toUpperCase())}</text>
                </g>`;
        }).join('');

        return `
            <div style="border:1px solid #000; background:#fcfcfc; padding:1rem; margin-bottom:2rem; overflow-x:auto;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; font-family:monospace; font-size:0.7rem; color:#666;">
                    <span>MAPA LÉXICO DE CO-OCURRENCIAS (Nodos = Términos | Enlaces = Co-ocurrencias por segmento)</span>
                    <span style="background:#000; color:#fff; padding:2px 6px;">INTERACTIVO: HAGA CLIC EN NODOS O ENLACES</span>
                </div>
                <svg viewBox="0 0 650 360" style="width:100%; max-height:420px; display:block; margin:0 auto;">
                    ${linesHtml}
                    ${nodesHtml}
                </svg>
            </div>`;
    },

    _showNodeEvidence(term, state) {
        const area = document.getElementById('link-evidence');
        if (!area) return;
        area.style.display = 'block';
        const matches = state.segments.filter(s => s.cleanedText.toLowerCase().includes(term.toLowerCase())).slice(0, 4);

        area.innerHTML = `
            <h4 style="font-size:0.8rem; font-weight:bold; margin-bottom:1rem; text-transform:uppercase;">Evidencia del Nodo: ${Renderer.sanitize(term.toUpperCase())} (${matches.length} menciones principales)</h4>
            ${matches.map(m => `<blockquote style="font-size:0.8rem; border-left:3px solid #000; padding-left:1rem; margin-bottom:1rem;">"${Renderer.sanitize(m.cleanedText)}"</blockquote>`).join('')}
        `;
        area.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    _showLinkEvidence(a, b, state) {
        const area = document.getElementById('link-evidence');
        if (!area) return;
        area.style.display = 'block';
        const matches = state.segments.filter(s => {
            const txt = s.cleanedText.toLowerCase();
            return txt.includes(a.toLowerCase()) && txt.includes(b.toLowerCase());
        }).slice(0, 4);

        area.innerHTML = `
            <h4 style="font-size:0.8rem; font-weight:bold; margin-bottom:1rem; text-transform:uppercase;">Evidencia de Vínculo: ${Renderer.sanitize(a.toUpperCase())} 🔗 ${Renderer.sanitize(b.toUpperCase())} (${matches.length} co-ocurrencias)</h4>
            ${matches.map(m => `<blockquote style="font-size:0.8rem; border-left:3px solid #000; padding-left:1rem; margin-bottom:1rem;">"${Renderer.sanitize(m.cleanedText)}"</blockquote>`).join('')}
        `;
        area.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    async _renderFindings(container, state) {
        Renderer.renderModuleTitle(container, "04. Saliencias Narrativas Exploratorias");
        const result = await this.stats.getNarrativeSalience(state.segments);
        const warnings = result.warnings.length
            ? `<div style="border:1px solid #a16207; background:#fef3c7; padding:1rem; margin-bottom:1rem;">${result.warnings.map(Renderer.sanitize).join('<br>')}</div>`
            : '';
        if (result.findings.length === 0) {
            container.innerHTML += `${warnings}<p class="empty-msg">No se detectaron saliencias relativas que superen los criterios actuales. Este resultado es válido y no obliga a generar un hallazgo.</p>`;
            return;
        }
        container.innerHTML += `
            ${warnings}
            <div class="wb-card">
                <p style="font-size:0.75rem; margin-bottom:1rem;">Cada entrevista se compara contra las demás mediante referencia leave-one-out. Una saliencia no demuestra importancia clínica.</p>
                <div style="display:grid; gap:15px;">
                    ${result.findings.slice(0, 8).map(finding => `
                        <div style="padding:1.5rem; border:1px solid #000; border-left:8px solid #000;">
                            <div style="font-size:0.6rem; font-weight:bold;">SESIÓN #${Renderer.sanitize(String(finding.sessionId))}</div>
                            <div style="font-size:1rem; font-weight:bold; margin:0.5rem 0;">SALIENCIA: "${Renderer.sanitize(finding.term.toUpperCase())}"</div>
                            <p style="font-size:0.8rem;">Razón relativa: <strong>${finding.ratio.toFixed(1)}x</strong> · Caso: ${finding.targetCount} · Referencia: ${finding.referenceCount}</p>
                            ${finding.evidence.map(item => `<blockquote style="font-size:0.75rem; border-left:2px solid #999; padding-left:0.7rem;">${Renderer.sanitize(item.text)}</blockquote>`).join('')}
                        </div>`).join('')}
                </div>
            </div>`;
    },

    async _renderHypotheses(container, state) {
        Renderer.renderModuleTitle(container, "05. Hipótesis Candidatas");
        Renderer.setLoading(true, "Generando líneas de investigación...");
        try {
            const stats = await this.stats.getCorpusStats(state.segments);
            const topTerms = this._getTopVocabularyTerms(stats, state.segments, 10);
            const links = await this.stats.getAdjacencyMatrix(state.segments, topTerms, 1);
            const outliers = await this.stats.getNarrativeOutliers(state.segments);

            const hypotheses = await this.stats.generateHypotheses(state.segments, links, outliers);

            container.innerHTML += `
                <div class="wb-card">
                    <p style="font-size:0.85rem; margin-bottom:2rem; line-height:1.5;">Basado en los patrones detectados, el sistema sugiere las siguientes líneas de investigación para profundizar en el análisis cualitativo:</p>
                    ${hypotheses.map(h => `
                        <div style="margin-bottom:2rem; padding:1.5rem; border:1px solid #000; background:#f9f9fb;">
                            <span style="font-size:0.6rem; font-weight:bold; background:#000; color:#fff; padding:2px 8px;">TIPO: ${Renderer.sanitize(h.type)}</span>
                            <p style="font-size:1rem; font-weight:bold; margin:1rem 0;">"${Renderer.sanitize(h.statement)}"</p>
                            <div style="font-size:0.85rem; color:#444; border-top:1px solid #eee; padding-top:1rem;">
                                <strong>PREGUNTA CIENTÍFICA:</strong><br> ${Renderer.sanitize(h.question)}
                            </div>
                        </div>`).join('')}
                </div>`;
        } finally { Renderer.setLoading(false); }
    }
};
