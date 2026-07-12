/**
 * Módulo LONGITUDINAL - Workbench v7.0.0
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
        container.innerHTML = `<div class="wb-card"><h3>MODO LONGITUDINAL</h3><p>Paso ${stepId} en construcción bajo estándar Workbench.</p></div>`;
    }
};
