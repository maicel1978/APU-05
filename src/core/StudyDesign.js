/**
 * Traduce el módulo metodológico elegido al escenario analítico compartido.
 * Mantiene una única fuente de verdad para las etiquetas internas de diseño.
 */
const TOPOLOGY_BY_METHOD = Object.freeze({
    individual: 'single-case',
    exploratory: 'cohort',
    transversal: 'comparative',
    longitudinal: 'longitudinal',
    integrity: 'integrity'
});

/**
 * @param {string} methodId
 * @returns {string|null}
 */
export function getTopologyForMethod(methodId) {
    return TOPOLOGY_BY_METHOD[methodId] ?? null;
}
