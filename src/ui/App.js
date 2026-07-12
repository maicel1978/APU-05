import { APUParser } from '../core/Parser.js';
import { SessionManager } from '../core/Session.js';
import { Renderer } from './Renderer.js';
import { Registry } from '../core/Registry.js';
import { State } from '../core/State.js';
import db from '../core/Database.js';

// Módulos Metodológicos
import { IndividualModule } from '../modules/IndividualModule.js';
import { ExploratoryModule } from '../modules/ExploratoryModule.js';
import { TransversalModule } from '../modules/TransversalModule.js';
import { LongitudinalModule } from '../modules/LongitudinalModule.js';
import { IntegrityModule } from '../modules/IntegrityModule.js';

// Herramientas Globales
import { GlossaryModule } from '../modules/GlossaryModule.js';
import { ReaderModule } from '../modules/ReaderModule.js';
import { ExportModule } from '../modules/ExportModule.js';
import { HelpModule } from '../modules/HelpModule.js';

class App {
    constructor() {
        this.activeMethodId = null;
        this.activeStepId = 1;
        window.onStateChange = (prop, val, state) => this.syncUI(prop, val, state);
        this.init();
    }

    async init() {
        try {
            // 1. Registro de Módulos (Identidad Metodológica)
            Registry.register(IndividualModule);
            Registry.register(ExploratoryModule);
            Registry.register(TransversalModule);
            Registry.register(LongitudinalModule);
            Registry.register(IntegrityModule);
            
            // 2. Registro de Herramientas (Con nombres oficiales solicitados)
            Registry.register({...ReaderModule, label: 'TRANSCRIPCIÓN ORIGINAL', category: 'tool'});
            Registry.register({...GlossaryModule, label: 'GLOSARIO DE TÉRMINOS', category: 'tool'});
            Registry.register({...ExportModule, label: 'REPORTE', category: 'tool'});
            Registry.register({...HelpModule, label: 'AYUDA', category: 'tool'});

            this.renderEntryGate();
            document.getElementById('btn-reset').onclick = () => this.handleReset();
        } catch (e) { console.error("Fallo en inicio:", e); }
    }

    renderEntryGate() {
        const grid = document.getElementById('gate-grid');
        const methods = Registry.getModules().filter(m => m.category === 'methodology');
        grid.innerHTML = methods.map(m => `
            <div class="design-card" data-target="${m.id}">
                <span class="card-tag">${m.id === 'individual' ? 'Unidad' : (m.id === 'integrity' ? 'Meta' : 'Diseño')}</span>
                <h3>${m.label.toUpperCase()}</h3>
            </div>
        `).join('');
        grid.querySelectorAll('.design-card').forEach(card => {
            card.onclick = () => this.activateWorkbench(card.getAttribute('data-target'));
        });
    }

    activateWorkbench(id) {
        this.activeMethodId = id;
        const mod = Registry.getModule(id);
        document.getElementById('entry-gate').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        document.getElementById('display-design').innerText = mod.label.toUpperCase();
        this.renderSidebar();
        this.selectStep(1); 
    }

    renderSidebar() {
        const workflowNav = document.getElementById('workflow-nav');
        const toolsNav = document.getElementById('tools-nav');
        const mod = Registry.getModule(this.activeMethodId);

        if (mod && mod.steps) {
            workflowNav.innerHTML = mod.steps.map(s => `
                <button class="nav-btn ${this.activeStepId === s.id ? 'active' : ''}" 
                        onclick="window.APU.selectStep(${s.id})"
                        ${s.id > 1 && !State.sessionId ? 'disabled' : ''}>
                    <span>0${s.id}</span> ${s.label}
                </button>
            `).join('');
        }

        // ORDEN DE HERRAMIENTAS SOLICITADO: Transcripción, Glosario, Reporte, Ayuda
        const orderedToolIds = ['reader', 'glossary', 'export', 'help'];
        toolsNav.innerHTML = '';
        orderedToolIds.forEach(id => {
            const tool = Registry.getModule(id);
            if (tool) {
                const btn = document.createElement('button');
                btn.className = 'nav-btn';
                btn.innerHTML = `🛠️ ${tool.label}`;
                btn.onclick = () => this.showTool(id);
                toolsNav.appendChild(btn);
            }
        });
    }

    async selectStep(stepId) {
        this.activeStepId = stepId;
        const display = document.getElementById('module-display');
        const viewer = document.getElementById('corpus-viewer');
        display.style.display = 'block';
        viewer.style.display = 'none';
        this.renderSidebar();
        const mod = Registry.getModule(this.activeMethodId);
        if (mod && mod.renderStep) await mod.renderStep(stepId, display, State);
    }

    async showTool(id) {
        const tool = Registry.getModule(id);
        const display = document.getElementById('module-display');
        const viewer = document.getElementById('corpus-viewer');
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

        if (id === 'reader') {
            display.style.display = 'none';
            viewer.style.display = 'block';
            await tool.render(viewer, State);
        } else {
            display.style.display = 'block';
            viewer.style.display = 'none';
            await tool.render(display, State);
        }
    }

    syncUI(prop, val, state) {
        if (prop === 'sessionId' || prop === 'segments') {
            this.renderSidebar();
            this.selectStep(this.activeStepId);
        }
    }

    handleReset() {
        if (confirm("¿Cerrar proyecto?")) db.hardReset().then(() => location.reload());
    }
}

window.APU = new App();
