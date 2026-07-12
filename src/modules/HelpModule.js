import { Renderer } from '../ui/Renderer.js';
import { AuditEngine } from '../science/AuditEngine.js';

/**
 * Módulo de Ayuda Adaptativo (v8.4.0)
 * Cambia su contenido según la metodología activa.
 */
export const HelpModule = {
    id: 'help',
    label: 'AYUDA',
    category: 'tool',

    async render(container, state) {
        const contextId = state.topology || 'general';
        const helpContent = this._getHelpContent(contextId);

        container.innerHTML = `
            <div class="wb-card">
                <h2 class="wb-title">GUÍA METODOLÓGICA: ${contextId.toUpperCase()}</h2>
                <div style="font-size:0.85rem; line-height:1.6; color:#333;">
                    ${helpContent}
                </div>
                <div style="margin-top:2rem; padding:1rem; border:1px dashed #000; background:#f9f9f9; font-size:0.7rem;">
                    <strong>Nota:</strong> Esta ayuda se ha adaptado automáticamente al diseño de estudio activo.
                </div>
            </div>
        `;
    },

    _getHelpContent(id) {
        const contents = {
            individual: `
                <p>El análisis <strong>Individual</strong> se enfoca en la trayectoria narrativa de un solo caso. Los pasos 02 al 05 están diseñados para:</p>
                <ul>
                    <li>Caracterizar el volumen y riqueza del discurso.</li>
                    <li>Identificar la estructura de temas dominantes.</li>
                    <li>Sintetizar la esencia analítica bajo el modelo SOEP.</li>
                </ul>`,
            exploratory: `
                <p>El modo <strong>Exploratorio</strong> busca patrones masivos en una cohorte. Aquí los algoritmos detectan:</p>
                <ul>
                    <li>Co-ocurrencias: conceptos que aparecen vinculados en la muestra.</li>
                    <li>Outliers: entrevistas que se desvían de la norma emocional o temática.</li>
                </ul>`,
            general: `<p>Seleccione un diseño de investigación para ver la guía específica.</p>`
        };
        return contents[id] || contents.general;
    }
};
