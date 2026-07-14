import { Renderer } from '../ui/Renderer.js';
import { APUParser } from '../core/Parser.js';
import { SessionManager } from '../core/Session.js';
import { State } from '../core/State.js';
import { readInputPackages } from '../core/InputPackage.js';
import { summarizeTraceabilities } from '../core/Traceability.js';
import { resolveSpeakerLabel } from '../core/SpeakerIdentity.js';

/**
 * Módulo AUDITORÍA E INTEGRIDAD (APU-05I) - v9.5.1 Workbench
 * Inspección forense y validación de calidad del corpus y su trazabilidad.
 */
export const IntegrityModule = {
    id: 'integrity',
    label: 'Auditoría',
    category: 'methodology',
    steps: [
        { id: 1, label: 'INGESTA' },
        { id: 2, label: 'CALIDAD' }
    ],

    async renderStep(stepId, container, state) {
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'view-container';
        container.appendChild(wrapper);

        try {
            switch (stepId) {
                case 1:
                    this._renderIngesta(wrapper, state);
                    break;
                case 2:
                    await this._renderQuality(wrapper, state);
                    break;
            }
            Renderer.renderProvisionalBanner(wrapper, state);
        } catch (err) {
            console.error(err);
            wrapper.innerHTML = `<div style="padding:2rem; border:2px solid red; color:red; font-family:monospace;"><h3>ERROR EN AUDITORÍA</h3>${Renderer.sanitize(err.message)}</div>`;
        }
    },

    _renderIngesta(container, state) {
        Renderer.renderModuleTitle(container, "01. Carga y Estado del Corpus");
        if (!state.sessionId) {
            container.innerHTML += `
                <div class="wb-card" style="text-align:center; padding:4rem;">
                    <input type="file" id="wb-file-upload-integrity" accept=".json" multiple style="display:none;">
                    <button class="btn-core" onclick="document.getElementById('wb-file-upload-integrity').click()">📂 SELECCIONAR CORPUS + TRAZABILIDAD OPCIONAL</button>
                    <p style="font-size:0.75rem; color:#666; margin-top:1rem; font-family:monospace;">
                        Cargue el corpus limpiado (_cleaned.json) y su archivo de trazabilidad (_trazabilidad.json) de APU-04.
                    </p>
                </div>`;
            container.querySelector('#wb-file-upload-integrity').onchange = async (e) => {
                const files = Array.from(e.target.files);
                if (files.length === 0) return;
                Renderer.setLoading(true, "Procesando Auditoría...");
                try {
                    const packages = await readInputPackages(files);
                    if (packages.length !== 1) {
                        throw new Error('El módulo de Auditoría admite un solo caso en esta vista.');
                    }
                    const input = packages[0];
                    const validation = await APUParser.validate(
                        input.cleaned,
                        'integrity',
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
                        ? `Carga forense exitosa: ${validation.traceability.segments.length} segmentos auditados.`
                        : 'Carga exitosa sin trazabilidad complementaria.';
                    Renderer.showToast(message, "success");
                } catch (err) {
                    alert(err.message);
                } finally {
                    Renderer.setLoading(false);
                }
            };
        } else {
            container.innerHTML += `
                <div class="wb-card" style="border-left:5px solid #10b981; margin-bottom:2rem;">
                    <h3>✅ SESIÓN ACTIVA Y AUDITADA EN MEMORIA</h3>
                    <p style="font-family:monospace; font-size:0.8rem; color:#666; margin-top:0.5rem;">
                        ID Sesión: ${state.sessionId} | Estado: ${state.isProvisional ? 'PROVISIONAL (No finalizado en APU-04)' : 'CONSOLIDADO / REVISADO'}
                    </p>
                </div>`;
            this._renderSummaryCards(container, state);
        }
    },

    _renderSummaryCards(container, state) {
        const summary = state.auditSummary || { total: state.segments.length, edited: 0, changed: 0, anomalous: 0, traceabilityCases: 0 };
        const total = state.segments?.length || summary.total || 0;
        const editedPct = total > 0 ? Math.round((summary.edited / total) * 100) : 0;
        const zeroDurCount = (state.segments || []).filter(s => s.start === s.end || s.audit?.a).length;

        container.innerHTML += `
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:1.5rem; margin-bottom:2rem;">
                <div class="wb-card" style="margin:0; border-top:3px solid #000;">
                    <span style="font-size:0.65rem; color:#666; font-family:monospace; text-transform:uppercase;">Volumen del Corpus</span>
                    <h3 style="font-size:1.8rem; font-family:monospace; margin:0.5rem 0 0;">${total} <span style="font-size:0.8rem; font-weight:normal;">segmentos</span></h3>
                </div>
                <div class="wb-card" style="margin:0; border-top:3px solid ${summary.traceabilityCases > 0 ? '#10b981' : '#f59e0b'};">
                    <span style="font-size:0.65rem; color:#666; font-family:monospace; text-transform:uppercase;">Archivo Trazabilidad</span>
                    <h3 style="font-size:1.4rem; font-family:monospace; margin:0.5rem 0 0; color:${summary.traceabilityCases > 0 ? '#065f46' : '#92400e'};">
                        ${summary.traceabilityCases > 0 ? 'CONECTADO' : 'AUSENTE'}
                    </h3>
                </div>
                <div class="wb-card" style="margin:0; border-top:3px solid #3b82f6;">
                    <span style="font-size:0.65rem; color:#666; font-family:monospace; text-transform:uppercase;">Edición Humana (APU-04)</span>
                    <h3 style="font-size:1.8rem; font-family:monospace; margin:0.5rem 0 0;">${summary.edited} <span style="font-size:0.8rem; font-weight:normal;">(${editedPct}%)</span></h3>
                </div>
                <div class="wb-card" style="margin:0; border-top:3px solid ${zeroDurCount > 0 ? '#ef4444' : '#10b981'};">
                    <span style="font-size:0.65rem; color:#666; font-family:monospace; text-transform:uppercase;">Anomalías (start===end)</span>
                    <h3 style="font-size:1.8rem; font-family:monospace; margin:0.5rem 0 0; color:${zeroDurCount > 0 ? '#dc2626' : 'inherit'};">${zeroDurCount} <span style="font-size:0.8rem; font-weight:normal;">casos</span></h3>
                </div>
            </div>`;

        if (state.validationWarnings && state.validationWarnings.length > 0) {
            container.innerHTML += `
                <div class="wb-card" style="border-left:4px solid #f59e0b; background:#fffbeb; margin-bottom:2rem;">
                    <h4 style="font-size:0.8rem; font-family:monospace; color:#92400e; margin-bottom:0.5rem;">⚠️ ADVERTENCIAS DE INGESTA DETECTADAS:</h4>
                    <ul style="margin:0; padding-left:1.5rem; font-size:0.75rem; font-family:monospace; color:#78350f;">
                        ${state.validationWarnings.map(w => `<li>${Renderer.sanitize(w)}</li>`).join('')}
                    </ul>
                </div>`;
        }
    },

    async _renderQuality(container, state) {
        Renderer.renderModuleTitle(container, "02. Inspección Forense de Calidad");
        if (!state.sessionId || !state.segments || state.segments.length === 0) {
            container.innerHTML += `<p class="empty-msg">No hay evidencia cargada. Complete el Paso 01 primero.</p>`;
            return;
        }

        Renderer.setLoading(true, "Cargando registros forenses...");
        try {
            const auditRecords = await SessionManager.getAudit(state.sessionId);
            const auditMapFull = new Map();
            for (const rec of auditRecords || []) {
                auditMapFull.set(rec.segmentId, rec);
            }

            const wrapper = document.createElement('div');
            container.appendChild(wrapper);

            let currentFilter = 'all';
            const renderTable = () => {
                const totalCount = state.segments.length;
                const editedCount = state.segments.filter(s => auditMapFull.get(s.segmentId)?.editedByHuman).length;
                const aiCount = state.segments.filter(s => auditMapFull.get(s.segmentId)?.aiSuggested).length;
                const anomalousCount = state.segments.filter(s => s.start === s.end || s.audit?.a || auditMapFull.get(s.segmentId)?.anomalous).length;

                const filtered = state.segments.filter(seg => {
                    const fullAudit = auditMapFull.get(seg.segmentId);
                    if (currentFilter === 'edited') return fullAudit?.editedByHuman === true;
                    if (currentFilter === 'ai') return fullAudit?.aiSuggested === true;
                    if (currentFilter === 'anomalous') return seg.start === seg.end || seg.audit?.a || fullAudit?.anomalous;
                    return true;
                });

                wrapper.innerHTML = `
                    <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1.5rem;">
                        <button class="btn-filter ${currentFilter === 'all' ? 'active' : ''}" data-filter="all" style="padding:0.5rem 1rem; border:1px solid #000; background:${currentFilter === 'all' ? '#000' : '#fff'}; color:${currentFilter === 'all' ? '#fff' : '#000'}; font-family:monospace; font-size:0.75rem; cursor:pointer;">
                            🔘 Todos (${totalCount})
                        </button>
                        <button class="btn-filter ${currentFilter === 'edited' ? 'active' : ''}" data-filter="edited" style="padding:0.5rem 1rem; border:1px solid #000; background:${currentFilter === 'edited' ? '#000' : '#fff'}; color:${currentFilter === 'edited' ? '#fff' : '#000'}; font-family:monospace; font-size:0.75rem; cursor:pointer;">
                            ✍️ Editados (${editedCount})
                        </button>
                        <button class="btn-filter ${currentFilter === 'ai' ? 'active' : ''}" data-filter="ai" style="padding:0.5rem 1rem; border:1px solid #000; background:${currentFilter === 'ai' ? '#000' : '#fff'}; color:${currentFilter === 'ai' ? '#fff' : '#000'}; font-family:monospace; font-size:0.75rem; cursor:pointer;">
                            🤖 Sugeridos IA (${aiCount})
                        </button>
                        <button class="btn-filter ${currentFilter === 'anomalous' ? 'active' : ''}" data-filter="anomalous" style="padding:0.5rem 1rem; border:1px solid #000; background:${currentFilter === 'anomalous' ? '#000' : '#fff'}; color:${currentFilter === 'anomalous' ? '#fff' : '#000'}; font-family:monospace; font-size:0.75rem; cursor:pointer;">
                            ⚠️ Anomalías (${anomalousCount})
                        </button>
                    </div>
                    ${filtered.length === 0 ? `<p style="font-family:monospace; font-size:0.8rem; color:#666; padding:2rem; border:1px dashed #ccc; text-align:center;">No hay segmentos que coincidan con este filtro.</p>` : `
                    <div style="overflow-x:auto; border:1px solid #000;">
                        <table style="width:100%; border-collapse:collapse; font-family:monospace; font-size:0.75rem;">
                            <thead>
                                <tr style="background:#000; color:#fff; text-align:left;">
                                    <th style="padding:0.75rem; border-bottom:1px solid #000; width:14%;">ID / ESTADO</th>
                                    <th style="padding:0.75rem; border-bottom:1px solid #000; width:18%;">HABLANTE & TIEMPO</th>
                                    <th style="padding:0.75rem; border-bottom:1px solid #000; width:68%;">CONTENIDO Y TRAZA FORENSE</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filtered.map(seg => {
                                    const fullAudit = auditMapFull.get(seg.segmentId) || {};
                                    const isZeroDur = seg.start === seg.end;
                                    const isAnom = seg.audit?.a || fullAudit.anomalous || isZeroDur;
                                    const isEdited = fullAudit.editedByHuman || seg.audit?.h;
                                    const isAi = fullAudit.aiSuggested;

                                    let badgeHtml = '<span style="background:#f3f4f6; color:#374151; padding:2px 6px; font-size:0.65rem; border:1px solid #d1d5db;">✔️ ORIGINAL</span>';
                                    if (isEdited) badgeHtml = '<span style="background:#dcfce7; color:#166534; padding:2px 6px; font-size:0.65rem; border:1px solid #86efac; font-weight:bold;">✍️ EDICIÓN HUMANA</span>';
                                    else if (isAi) badgeHtml = '<span style="background:#e0e7ff; color:#3730a3; padding:2px 6px; font-size:0.65rem; border:1px solid #a5b4fc; font-weight:bold;">🤖 SUGERIDO IA</span>';

                                    let anomalyHtml = '';
                                    if (isAnom) {
                                        const reason = fullAudit.anomalyReason || seg.audit?.r || (isZeroDur ? 'start === end (duración 0)' : 'Anomalía advertida');
                                        anomalyHtml = `<div style="margin-top:0.4rem; color:#dc2626; font-weight:bold; font-size:0.7rem;">⚠️ ANOMALÍA: ${Renderer.sanitize(reason)}</div>`;
                                    }

                                    let modLogHtml = '';
                                    if (Array.isArray(fullAudit.modificationsLog) && fullAudit.modificationsLog.length > 0) {
                                        const lastMod = fullAudit.modificationsLog[fullAudit.modificationsLog.length - 1];
                                        if (lastMod && lastMod.before !== lastMod.after) {
                                            modLogHtml = `<div style="margin-top:0.5rem; padding:0.4rem; background:#f9fafb; border-left:2px solid #6b7280; font-size:0.7rem; color:#4b5563;"><strong>Texto Previo:</strong> "${Renderer.sanitize(lastMod.before || '')}"</div>`;
                                        }
                                    }

                                    const spkLabel = resolveSpeakerLabel(state.speakerMap, seg) || seg.speakerId || 'N/A';
                                    const wpmStr = fullAudit.wpm !== undefined ? `${fullAudit.wpm} wpm` : 'N/A';

                                    return `
                                        <tr style="border-bottom:1px solid #eee; vertical-align:top;">
                                            <td style="padding:0.75rem; border-right:1px solid #eee;">
                                                <div style="font-weight:bold; color:#111;">${Renderer.sanitize(seg.segmentId)}</div>
                                                <div style="margin-top:0.4rem;">${badgeHtml}</div>
                                            </td>
                                            <td style="padding:0.75rem; border-right:1px solid #eee; color:#4b5563;">
                                                <div style="font-weight:bold; color:#000;">${Renderer.sanitize(spkLabel)}</div>
                                                <div style="margin-top:0.2rem;">${seg.start.toFixed(1)}s – ${seg.end.toFixed(1)}s</div>
                                                <div style="font-size:0.65rem; color:#6b7280; margin-top:0.2rem;">Velocidad: ${Renderer.sanitize(String(wpmStr))}</div>
                                            </td>
                                            <td style="padding:0.75rem; font-family:sans-serif; font-size:0.85rem; line-height:1.5; color:#1f2937;">
                                                <div>${Renderer.sanitize(seg.cleanedText)}</div>
                                                ${anomalyHtml}
                                                ${modLogHtml}
                                            </td>
                                        </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>`}
                `;

                wrapper.querySelectorAll('.btn-filter').forEach(btn => {
                    btn.onclick = () => {
                        currentFilter = btn.getAttribute('data-filter');
                        renderTable();
                    };
                });
            };

            renderTable();
        } finally {
            Renderer.setLoading(false);
        }
    }
};
