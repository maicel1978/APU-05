import { Renderer } from '../ui/Renderer.js';
import { APUParser } from '../core/Parser.js';
import { SessionManager } from '../core/Session.js';
import { State } from '../core/State.js';
import { readInputPackages } from '../core/InputPackage.js';
import { summarizeTraceabilities } from '../core/Traceability.js';
import { StatsEngine } from '../science/StatsEngine.js';
import { Charts } from '../ui/Charts.js';
import db from '../core/Database.js';

/**
 * Módulo TRANSVERSAL (APU-05C) - Workbench v9.3.0
 * Foco: Relación entre Narrativa y Microdatos (Covariables).
 */
export const TransversalModule = {
    id: 'transversal',
    label: 'Transversal',
    category: 'methodology',
    stats: new StatsEngine(),
    steps: [
        { id: 1, label: 'INGESTA' },
        { id: 2, label: 'PERFIL MUESTRA' },
        { id: 3, label: 'DISPARIDAD' },
        { id: 4, label: 'CONTRASTE LÉXICO (OPCIONAL)' }
    ],

    async renderStep(stepId, container, state) {
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'view-container';
        container.appendChild(wrapper);

        if (stepId > 1 && !state.sessionId) {
            wrapper.innerHTML = '<div class="empty-msg">Acceso Bloqueado: Primero cargue los datos en el Paso 1.</div>';
            return;
        }

        try {
            switch(stepId) {
                case 1: this._renderIngesta(wrapper, state); break;
                case 2: await this._renderProfile(wrapper, state); break;
                case 3: await this._renderDisparity(wrapper, state); break;
                case 4: await this._renderG2(wrapper, state); break;
            }
            Renderer.renderProvisionalBanner(wrapper, state);
        } catch (err) {
            wrapper.innerHTML = `<div style="padding:2rem; border:2px solid red; color:red;"><h3>ERROR TRANSVERSAL</h3>${err.message}</div>`;
        }
    },

    _renderIngesta(container, state) {
        Renderer.renderModuleTitle(container, "01. Ingesta Transversal");
        container.innerHTML += `
            <div class="wb-card" style="text-align:center; padding:4rem;">
                <p style="margin-bottom:2rem; font-size:0.85rem; color:#666;">Seleccione los archivos del estudio. Se validará la existencia de variables de grupo.</p>
                <input type="file" id="transversal-upload" accept=".json" multiple style="display:none;">
                <button class="btn-core" onclick="document.getElementById('transversal-upload').click()">📂 SELECCIONAR CORPUS + TRAZABILIDADES OPCIONALES</button>
            </div>`;

        container.querySelector('#transversal-upload').onchange = async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;
            Renderer.setLoading(true, "Cruzando Microdatos...");
            try {
                const packages = await readInputPackages(files);
                const validated = [];
                for (const input of packages) {
                    const validation = await APUParser.validate(
                        input.cleaned,
                        'comparative',
                        input.traceability
                    );
                    if (validation.requiresConfirmation && !Renderer.confirmProvisional(validation.warnings, input.cleanedFileName)) {
                        e.target.value = '';
                        Renderer.showToast('Carga transversal cancelada.', 'info');
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
                State.covariateKeys = await this.stats.getAvailableCovariatesForSessions(sessionIds);
                Renderer.showToast(`Carga exitosa: ${packages.length} casos, ${State.auditSummary.traceabilityCases} con trazabilidad.`, "success");
            } catch (err) { alert(err.message); } finally { Renderer.setLoading(false); }
        };
    },

    async _renderProfile(container, state) {
        Renderer.renderModuleTitle(container, "02. Perfil de la Muestra");
        if (state.covariateKeys.length === 0) {
            container.innerHTML += '<p class="empty-msg">No hay variables clínicas definidas para caracterizar.</p>';
            return;
        }

        container.innerHTML += `
            <div class="wb-card">
                <label style="font-size:0.75rem; font-weight:bold; margin-bottom:1rem; display:block;">SELECCIONAR VARIABLE DEMOGRÁFICA</label>
                <select id="profile-var" style="width:100%; padding:0.8rem; border:1px solid #000; font-family:var(--font-mono); margin-bottom:2rem;">
                    ${state.covariateKeys.map(k => `<option value="${k}">${k.toUpperCase()}</option>`).join('')}
                </select>
                <div style="height:250px;"><canvas id="profile-chart"></canvas></div>
            </div>`;

        const selector = container.querySelector('#profile-var');
        selector.onchange = () => this._updateProfileChart(selector.value, state);
        this._updateProfileChart(selector.value, state);
    },

    async _updateProfileChart(key, state) {
        const rawSpeakers = await db.speakers.where('sessionId').anyOf(state.sessionIds).toArray();
        const dist = {};
        rawSpeakers.forEach(s => { const val = s.covariates?.[key] || 'Sin dato'; dist[val] = (dist[val] || 0) + 1; });
        Charts.renderDistribution('profile-chart', Object.keys(dist), Object.values(dist), `Distribución de ${key}`);
    },

    async _renderDisparity(container, state) {
        Renderer.renderModuleTitle(container, "03. Disparidad Temática");
        container.innerHTML += `<p class="empty-msg">Análisis de frecuencia cruzada por subgrupos en proceso.</p>`;
    },

    async _renderG2(container, state) {
        Renderer.renderModuleTitle(container, "04. Contraste Léxico Exploratorio (G²)");
        if (state.covariateKeys.length === 0) {
            container.innerHTML += '<p class="empty-msg">No hay covariables observadas para definir grupos.</p>';
            return;
        }

        container.innerHTML += `
            <div class="wb-card">
                <p style="font-size:0.8rem; line-height:1.5; margin-bottom:1.5rem;">
                    Compara palabras desproporcionadas entre dos corpus. No demuestra efecto clínico ni diferencias independientes entre participantes.
                </p>
                <label>VARIABLE DEL PROTOCOLO</label>
                <select id="g2-var" style="width:100%; padding:0.8rem; margin:0.5rem 0 1rem;"></select>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                    <div><label>GRUPO A</label><select id="g2-a" disabled style="width:100%; padding:0.8rem; margin-top:0.5rem;"></select></div>
                    <div><label>GRUPO B</label><select id="g2-b" disabled style="width:100%; padding:0.8rem; margin-top:0.5rem;"></select></div>
                </div>
                <button id="g2-run" class="btn-core" disabled style="width:100%; margin-top:1.5rem;">CALCULAR CONTRASTE EXPLORATORIO</button>
                <div id="g2-results-area" style="margin-top:2rem;"></div>
            </div>`;

        const variable = container.querySelector('#g2-var');
        const groupA = container.querySelector('#g2-a');
        const groupB = container.querySelector('#g2-b');
        const run = container.querySelector('#g2-run');
        const area = container.querySelector('#g2-results-area');
        this._setSelectOptions(variable, state.covariateKeys, '-- SELECCIONAR COVARIABLE --');

        variable.onchange = async () => {
            const values = variable.value
                ? await this.stats.getCovariateValuesForSessions(state.sessionIds, variable.value)
                : [];
            this._setSelectOptions(groupA, values, '-- SELECCIONAR --');
            this._setSelectOptions(groupB, values, '-- SELECCIONAR --');
            groupA.disabled = values.length < 2;
            groupB.disabled = values.length < 2;
            run.disabled = true;
            area.innerHTML = values.length < 2 ? '<p class="empty-msg">Se requieren al menos dos valores observados.</p>' : '';
        };
        const updateButton = () => { run.disabled = !groupA.value || !groupB.value || groupA.value === groupB.value; };
        groupA.onchange = updateButton;
        groupB.onchange = updateButton;

        run.onclick = async () => {
            Renderer.setLoading(true, "Calculando contraste léxico...");
            try {
                const result = await this.stats.calculateKeyness(
                    state.sessionIds, variable.value, groupA.value, groupB.value,
                    { minTotal: 2, limit: 20 }
                );
                this._renderKeynessResult(area, result);
            } catch (error) {
                area.innerHTML = `<p class="empty-msg">${Renderer.sanitize(error.message)}</p>`;
            } finally {
                Renderer.setLoading(false);
            }
        };
    },

    _setSelectOptions(select, values, placeholder) {
        select.replaceChildren();
        const empty = document.createElement('option');
        empty.value = '';
        empty.textContent = placeholder;
        select.appendChild(empty);
        for (const value of values) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        }
    },

    _renderKeynessResult(container, result) {
        const warnings = result.warnings.length
            ? `<div style="border:1px solid #a16207; padding:0.8rem; background:#fef3c7;">${result.warnings.map(Renderer.sanitize).join('<br>')}</div>`
            : '';
        container.innerHTML = `
            ${warnings}
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin:1rem 0; font-size:0.75rem;">
                <div><strong>${Renderer.sanitize(result.groupA.label)}</strong><br>${result.groupA.participantCount} participantes · ${result.groupA.tokenCount} palabras</div>
                <div><strong>${Renderer.sanitize(result.groupB.label)}</strong><br>${result.groupB.participantCount} participantes · ${result.groupB.tokenCount} palabras</div>
            </div>
            <p style="font-size:0.7rem;">Segmentos incluidos: ${result.includedSegments} · Excluidos por grupo ausente/diferente: ${result.excludedSegments}</p>
            ${this._renderKeynessTable(result.terms, result.groupA.label, result.groupB.label)}`;
    },

    _renderKeynessTable(terms, labelA, labelB) {
        if (terms.length === 0) return '<p class="empty-msg">No se detectaron términos desproporcionados con el umbral actual.</p>';
        return `<table class="wb-table" style="margin-top:1rem;">
            <thead><tr><th>TÉRMINO</th><th>G²</th><th>${Renderer.sanitize(labelA)} PMW</th><th>${Renderer.sanitize(labelB)} PMW</th><th>MÁS FRECUENTE EN</th></tr></thead>
            <tbody>${terms.map(term => `<tr>
                <td><strong>${Renderer.sanitize(term.word)}</strong></td>
                <td>${term.g2.toFixed(2)}</td>
                <td>${term.groupAPmw.toFixed(0)}</td>
                <td>${term.groupBPmw.toFixed(0)}</td>
                <td>${Renderer.sanitize(term.direction)}</td>
            </tr>`).join('')}</tbody>
        </table>`;
    }
};
