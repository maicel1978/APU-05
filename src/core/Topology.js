/**
 * Motor de Topología APU-05
 * Infiere la estructura del estudio basándose en los metadatos de APU-04.
 */
export class TopologyEngine {
    static identify(sessions, covariateKeys) {
        const count = sessions.length;
        if (count === 0) return 'empty';
        if (count === 1) return 'single-case';

        // Buscar variables de agrupamiento comunes (Epidemiología)
        const commonKeys = this._getCommonKeys(sessions);
        
        if (commonKeys.includes('grupo') || commonKeys.includes('condicion')) {
            return 'comparative'; // Casos vs Controles
        }
        
        if (commonKeys.includes('momento') || commonKeys.includes('visita')) {
            return 'longitudinal'; // Pre vs Post
        }

        return 'cohort'; // Agregado simple
    }

    static _getCommonKeys(sessions) {
        if (!sessions.length) return [];
        let common = Object.keys(sessions[0].covariates || {});
        for (let i = 1; i < sessions.length; i++) {
            const current = Object.keys(sessions[i].covariates || {});
            common = common.filter(k => current.includes(k));
        }
        return common;
    }
}
