import { Renderer } from '../ui/Renderer.js';
import { APUParser } from '../core/Parser.js';
import { SessionManager } from '../core/Session.js';
import { State } from '../core/State.js';
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
        { id: 4, label: 'CONTRASTE G2' }
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
                <button class="btn-core" onclick="document.getElementById('transversal-upload').click()">📂 SELECCIONAR ARCHIVOS</button>
            </div>`;

        container.querySelector('#transversal-upload').onchange = async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;
            Renderer.setLoading(true, "Cruzando Microdatos...");
            try {
                const validated = [];
                for (const file of files) {
                    const json = JSON.parse(await file.text());
                    const validation = await APUParser.validate(json, 'comparative');
                    if (validation.requiresConfirmation && !Renderer.confirmProvisional(validation.warnings, file.name)) {
                        e.target.value = '';
                        Renderer.showToast('Carga transversal cancelada.', 'info');
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
                State.covariateKeys = await this.stats.getAvailableCovariates(lastSid);
                Renderer.showToast("Carga exitosa", "success");
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
        const rawSpeakers = await db.speakers.where('sessionId').equals(state.sessionId).toArray();
        const dist = {};
        rawSpeakers.forEach(s => { const val = s.covariates?.[key] || 'Sin dato'; dist[val] = (dist[val] || 0) + 1; });
        Charts.renderDistribution('profile-chart', Object.keys(dist), Object.values(dist), `Distribución de ${key}`);
    },

    async _renderDisparity(container, state) {
        Renderer.renderModuleTitle(container, "03. Disparidad Temática");
        container.innerHTML += `<p class="empty-msg">Análisis de frecuencia cruzada por subgrupos en proceso.</p>`;
    },

    async _renderG2(container, state) {
        Renderer.renderModuleTitle(container, "04. Significancia Estadística (G2)");
        if (state.covariateKeys.length === 0) {
            container.innerHTML += '<p class="empty-msg">Se requiere una variable de grupo para el cálculo G2.</p>';
            return;
        }

        container.innerHTML += `
            <div class="wb-card">
                <select id="g2-var" style="width:100%; padding:0.8rem; border:1px solid #000; font-family:var(--font-mono); margin-bottom:2rem;">
                    <option value="">-- SELECCIONAR GRUPO --</option>
                    ${state.covariateKeys.map(k => `<option value="${k}">${k.toUpperCase()}</option>`).join('')}
                </select>
                <div id="g2-results-area"></div>
            </div>`;

        container.querySelector('#g2-var').onchange = async (e) => {
            const key = e.target.value;
            if (!key) return;
            Renderer.setLoading(true, "Calculando G2...");
            const results = await this.stats.calculateKeyness(state.sessionId, key);
            const area = document.getElementById('g2-results-area');
            area.innerHTML = '';
            results.forEach(res => {
                const div = document.createElement('div');
                div.style.marginBottom = '2rem';
                div.innerHTML = `<h4 style="font-size:0.8rem; font-weight:bold; border-bottom:1px solid #000; padding-bottom:0.5rem; margin-bottom:1rem;">PERFIL: ${res.group.toUpperCase()}</h4>`;
                Charts.renderKeywordImpact(div, res.keywords);
                area.appendChild(div);
            });
            Renderer.setLoading(false);
        };
    }
};
