/**
 * Registro de Módulos APU-05
 * Gestiona la carga y el ciclo de vida de los plugins de análisis.
 */
class ModuleRegistry {
    constructor() {
        this.modules = new Map();
    }

    /**
     * Registra un nuevo módulo de análisis.
     * @param {Object} moduleDefinition - { id, label, init, render, update }
     */
    register(moduleDefinition) {
        if (!moduleDefinition.id || !moduleDefinition.label) {
            console.error("Módulo inválido: Falta ID o Label", moduleDefinition);
            return;
        }
        this.modules.set(moduleDefinition.id, moduleDefinition);
        console.log(`[REGISTRY] Módulo '${moduleDefinition.label}' cargado.`);
    }

    getModules() {
        return Array.from(this.modules.values());
    }

    getModule(id) {
        return this.modules.get(id);
    }
}

export const Registry = new ModuleRegistry();
