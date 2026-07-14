import { Renderer } from '../ui/Renderer.js';
import { APUParser } from '../core/Parser.js';
import { SessionManager } from '../core/Session.js';
import { State } from '../core/State.js';
import { readInputPackages } from '../core/InputPackage.js';
import { summarizeTraceabilities } from '../core/Traceability.js';
import { LongitudinalEngine } from '../science/LongitudinalEngine.js';

/**
 * Módulo LONGITUDINAL (APU-05L) - Workbench v9.5.1
 * Análisis Descriptivo de Trayectorias Temporales y Concept Drift (D-038 / R7).
 * Prohibida la inferencia causal automática.
 */
export const LongitudinalModule = {
    id: 'longitudinal',
    label: 'Longitudinal',
    category: 'methodology',
    steps: [
        { id: 1, label: 'INGESTA' },
        { id: 2, label: 'EVOLUCIÓN' }
    ],

    async renderStep(stepId, container, state) {
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'view-container';
        container.appendChild(wrapper);

        if (stepId > 1 && (!state.segments || !state.segments.length)) {
            wrapper.innerHTML = '<div class="empty-msg">Acceso Bloqueado: Primero cargue las visitas o cortes en el Paso 1.</div>';
            return;
        }

        try {
            switch (stepId) {
                case 1:
                    this._renderIngesta(wrapper, state);
                    break;
                case 2:
                    await this._renderEvolution(wrapper, state);
                    break;
            }
            Renderer.renderProvisionalBanner(wrapper, state);
        } catch (err) {
            console.error(err);
            wrapper.innerHTML = `<div style="padding:2rem; border:2px solid red; color:red; font-family:monospace;"><h3>ERROR DE ANÁLISIS LONGITUDINAL</h3>${Renderer.sanitize(err.message)}</div>`;
        }
    },

    _renderIngesta(container, state) {
        Renderer.renderModuleTitle(container, "01. Carga de Serie Temporal");
        if (!state.sessionId) {
            container.innerHTML += `
                <div class="wb-card" style="text-align:center; padding:4rem;">
                    <input type="file" id="longitudinal-upload" accept=".json" multiple style="display:none;">
                    <button class="btn-core" onclick="document.getElementById('longitudinal-upload').click()">📂 SELECCIONAR CORTES TEMPORALES + TRAZABILIDAD</button>
                    <p style="font-size:0.75rem; color:#666; margin-top:1rem; font-family:monospace;">
                        Cargue dos o más entrevistas o visitas en orden cronológico (_cleaned.json) de la misma unidad analítica (D-038).
                    </p>
                </div>`;
            container.querySelector('#longitudinal-upload').onchange = async (e) => {
                const files = Array.from(e.target.files);
                if (files.length === 0) return;
                Renderer.setLoading(true, "Procesando Serie Temporal...");
                try {
                    const packages = await readInputPackages(files);
                    const validated = [];
                    for (const input of packages) {
                        const validation = await APUParser.validate(
                            input.cleaned,
                            'longitudinal',
                            input.traceability
                        );
                        if (validation.requiresConfirmation && !Renderer.confirmProvisional(validation.warnings, input.cleanedFileName)) {
                            e.target.value = '';
                            Renderer.showToast('Carga longitudinal cancelada.', 'info');
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
                    Renderer.showToast(`Serie temporal integrada: ${packages.length} cortes temporales.`, "success");
                } catch (err) {
                    alert(err.message);
                } finally {
                    Renderer.setLoading(false);
                }
            };
        } else {
            container.innerHTML += `
                <div class="wb-card" style="border-left:5px solid #10b981; margin-bottom:2rem;">
                    <h3>✅ SERIE TEMPORAL ACTIVA</h3>
                    <p style="font-family:monospace; font-size:0.8rem; color:#666; margin-top:0.5rem;">
                        ID Sesiones/Visitas: ${(state.sessionIds || [state.sessionId]).join(', ')} | Estado: ${state.isProvisional ? 'PROVISIONAL (No finalizado en APU-04)' : 'CONSOLIDADO / REVISADO'}
                    </p>
                </div>`;
        }
    },

    async _renderEvolution(container, state) {
        Renderer.renderModuleTitle(container, "02. Trayectoria y Evolución Discursiva");

        const sessionsMap = new Map();
        for (const seg of state.segments || []) {
            const sid = seg.sessionId || 'T1';
            if (!sessionsMap.has(sid)) sessionsMap.set(sid, []);
            sessionsMap.get(sid).push(seg);
        }
        const sessionEntries = [...sessionsMap.entries()].sort((a, b) => Number(a[0]) - Number(b[0]));

        if (sessionEntries.length < 2) {
            container.innerHTML += `
                <div class="wb-card" style="border-left:5px solid #f59e0b; background:#fffbeb;">
                    <h4 style="font-size:0.9rem; font-weight:bold; color:#b45309; margin-bottom:0.5rem;">⚠️ ANÁLISIS EVOLUTIVO LIMITADO A UN SOLO CORTE</h4>
                    <p style="font-size:0.8rem; color:#78350f; line-height:1.5;">
                        Para realizar un contraste de Concept Drift (persistencia vs innovación léxica y trayectorias discursivas), el módulo Longitudinal requiere al menos dos cortes o visitas temporales (T1 y T2).
                        Actualmente hay 1 corte cargado (${sessionEntries[0]?.[1]?.length || 0} segmentos). Cargue visitas adicionales en el Paso 01 para habilitar el comparador temporal.
                    </p>
                </div>`;
            return;
        }

        const segmentsA = sessionEntries[0][1];
        const segmentsB = sessionEntries[sessionEntries.length - 1][1];
        const labelA = `Corte #${sessionEntries[0][0]}`;
        const labelB = `Corte #${sessionEntries[sessionEntries.length - 1][0]}`;

        const drift = LongitudinalEngine.calculateLexicalDrift(segmentsA, segmentsB);
        const summary = LongitudinalEngine.generateDescriptiveSummary(drift, labelA, labelB);

        container.innerHTML += `
            <div class="wb-card" style="border:2px solid #a16207; background:#fef3c7; color:#713f12; padding:1.2rem; margin-bottom:2rem; font-family:monospace; font-size:0.75rem;">
                <div style="font-weight:bold; font-size:0.85rem; margin-bottom:0.4rem;">🛑 REGLA PRISMA+ R7 / D-038 (NO INFERENCIA CAUSAL):</div>
                <div>${Renderer.sanitize(summary.methodologicalWarning)}</div>
            </div>

            <div class="wb-card" style="border-left:5px solid #000; margin-bottom:2rem;">
                <h3 style="font-size:1rem; font-weight:bold; margin-bottom:0.8rem; text-transform:uppercase;">${Renderer.sanitize(summary.title)}</h3>
                <p style="font-size:0.9rem; line-height:1.6; color:#1f2937;">${Renderer.sanitize(summary.statement)}</p>
            </div>

            <h3 style="font-size:0.85rem; font-weight:800; border-left:4px solid #000; padding-left:0.5rem; margin-bottom:1rem; text-transform:uppercase;">Métricas de Deriva Narrativa (Concept Drift)</h3>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:1.5rem; margin-bottom:2.5rem;">
                <div class="wb-card" style="margin:0; border-top:3px solid #10b981;">
                    <span style="font-size:0.65rem; color:#666; font-family:monospace; text-transform:uppercase;">Persistencia Léxica</span>
                    <h3 style="font-size:1.8rem; font-family:monospace; margin:0.5rem 0 0; color:#065f46;">${drift.persistenceRate}%</h3>
                    <div style="font-size:0.7rem; color:#666; margin-top:0.3rem;">${drift.persistentCount} términos de ${labelA} conservados</div>
                </div>
                <div class="wb-card" style="margin:0; border-top:3px solid #3b82f6;">
                    <span style="font-size:0.65rem; color:#666; font-family:monospace; text-transform:uppercase;">Innovación / Novedad</span>
                    <h3 style="font-size:1.8rem; font-family:monospace; margin:0.5rem 0 0; color:#1e40af;">${drift.innovationRate}%</h3>
                    <div style="font-size:0.7rem; color:#666; margin-top:0.3rem;">${drift.emergentCount} términos emergentes en ${labelB}</div>
                </div>
                <div class="wb-card" style="margin:0; border-top:3px solid #f59e0b;">
                    <span style="font-size:0.65rem; color:#666; font-family:monospace; text-transform:uppercase;">Delta Velocidad (WPM)</span>
                    <h3 style="font-size:1.8rem; font-family:monospace; margin:0.5rem 0 0; color:${drift.deltaWpm >= 0 ? '#065f46' : '#b45309'};">${drift.deltaWpm >= 0 ? '+' : ''}${drift.deltaWpm} <span style="font-size:0.8rem;">wpm</span></h3>
                    <div style="font-size:0.7rem; color:#666; margin-top:0.3rem;">De ${drift.wpmA} a ${drift.wpmB} wpm</div>
                </div>
                <div class="wb-card" style="margin:0; border-top:3px solid #6b7280;">
                    <span style="font-size:0.65rem; color:#666; font-family:monospace; text-transform:uppercase;">Trayectoria Vocabulario</span>
                    <h3 style="font-size:1.4rem; font-family:monospace; margin:0.5rem 0 0; color:#374151;">${drift.vocabSizeA} → ${drift.vocabSizeB}</h3>
                    <div style="font-size:0.7rem; color:#666; margin-top:0.3rem;">Palabras únicas por visita</div>
                </div>
            </div>

            <div class="wb-card" style="margin-bottom:2rem;">
                <h4 style="font-size:0.8rem; color:#666; margin-bottom:1rem; text-transform:uppercase;">Términos que Persisten en el Tiempo (${labelA} ∩ ${labelB})</h4>
                <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
                    ${drift.persistentTerms.length > 0 ? drift.persistentTerms.map(t => `<span style="background:#dcfce7; color:#166534; border:1px solid #86efac; padding:0.4rem 0.8rem; font-family:monospace; font-size:0.75rem; border-radius:4px; font-weight:bold;">${Renderer.sanitize(t.toUpperCase())}</span>`).join('') : '<p style="font-size:0.8rem; color:#666;">Sin coincidencias relevantes.</p>'}
                </div>
            </div>

            <div class="wb-card" style="margin-bottom:2rem;">
                <h4 style="font-size:0.8rem; color:#666; margin-bottom:1rem; text-transform:uppercase;">Términos Emergentes (Nuevos en el Seguimiento ${labelB})</h4>
                <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
                    ${drift.emergentTerms.length > 0 ? drift.emergentTerms.map(t => `<span style="background:#e0e7ff; color:#3730a3; border:1px solid #a5b4fc; padding:0.4rem 0.8rem; font-family:monospace; font-size:0.75rem; border-radius:4px; font-weight:bold;">+ ${Renderer.sanitize(t.toUpperCase())}</span>`).join('') : '<p style="font-size:0.8rem; color:#666;">Sin términos nuevos.</p>'}
                </div>
            </div>

            <div class="wb-card">
                <h4 style="font-size:0.8rem; color:#666; margin-bottom:1rem; text-transform:uppercase;">Términos Ausentes en el Seguimiento (Presentes en ${labelA}, no en ${labelB})</h4>
                <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
                    ${drift.missingTerms.length > 0 ? drift.missingTerms.map(t => `<span style="background:#f3f4f6; color:#4b5563; border:1px solid #d1d5db; padding:0.4rem 0.8rem; font-family:monospace; font-size:0.75rem; border-radius:4px;">- ${Renderer.sanitize(t.toUpperCase())}</span>`).join('') : '<p style="font-size:0.8rem; color:#666;">Sin términos ausentes.</p>'}
                </div>
            </div>
        `;
    }
};
