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
                <div style="margin-top:1.5rem; padding:1rem; border:1px solid #000; background:#fff8e7; font-size:0.8rem; line-height:1.5; color:#333;">
                    <strong>🛡️ Rigor y Juicio Metodológico:</strong> La comparabilidad de entrevistas cualitativas y cuantitativas depende rigurosamente del diseño del estudio, la población seleccionada, el instrumento de recolección y el procedimiento metodológico. El software no sustituye en ningún caso el entrenamiento ni el juicio metodológico del investigador.
                </div>
                <div style="margin-top:1rem; padding:1rem; border:1px dashed #000; background:#f9f9f9; font-size:0.7rem;">
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
            comparative: `
                <p>El modo <strong>Transversal (Comparativo)</strong> permite contrastar distribuciones entre grupos definidos por covariables clínicas (ej. Control vs. Intervención):</p>
                <ul>
                    <li>Contraste Léxico (G²): evalúa keyness léxica entre dos grupos explícitos.</li>
                    <li>Requiere selección formal de variable, Grupo A y Grupo B antes del cálculo.</li>
                </ul>`,
            longitudinal: `
                <p>El modo <strong>Longitudinal</strong> se encuentra reservado para diseños con estructura temporal según el protocolo.</p>`,
            general: `<p>Seleccione un diseño de investigación para ver la guía específica.</p>`
        };
        return contents[id] || contents.general;
    }
};
