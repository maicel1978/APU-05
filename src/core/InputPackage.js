/** Lee archivos JSON del navegador y delega su clasificación. */
export async function readInputPackages(files) {
    const documents = [];
    for (const file of files || []) {
        try {
            documents.push({ name: file.name, data: JSON.parse(await file.text()) });
        } catch (error) {
            throw new Error(`${file?.name || 'Archivo'}: no se pudo leer como JSON válido.`);
        }
    }
    return buildInputPackages(documents);
}

/**
 * Clasifica documentos APU-04 seleccionados por el usuario.
 * Función pura: no persiste y no modifica los documentos.
 */
export function buildInputPackages(documents) {
    if (!Array.isArray(documents) || documents.length === 0) {
        throw new Error('No se seleccionaron archivos para cargar.');
    }

    const groups = new Map();
    for (const item of documents) {
        const name = item?.name || 'archivo sin nombre';
        const data = item?.data;
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error(`${name}: no contiene un objeto JSON válido.`);
        }

        const stage = data.stage;
        if (stage !== 'cleaned-text' && stage !== 'trazabilidad') {
            throw new Error(`${name}: etapa "${stage || 'DESCONOCIDA'}" no admitida. Seleccione solo corpus limpio y trazabilidad.`);
        }

        const sourceSession = data.sourceSession;
        if (typeof sourceSession !== 'string' || !sourceSession.trim()) {
            throw new Error(`${name}: falta sourceSession; no se puede identificar el caso.`);
        }

        const group = groups.get(sourceSession) || createGroup(sourceSession);
        if (stage === 'cleaned-text') {
            if (group.cleaned) {
                throw new Error(`Caso ${sourceSession}: se seleccionaron dos corpus principales.`);
            }
            group.cleaned = data;
            group.cleanedFileName = name;
        } else {
            if (group.traceability) {
                throw new Error(`Caso ${sourceSession}: se seleccionaron dos archivos de trazabilidad.`);
            }
            group.traceability = data;
            group.traceabilityFileName = name;
        }
        groups.set(sourceSession, group);
    }

    const packages = [...groups.values()];
    for (const inputPackage of packages) {
        if (!inputPackage.cleaned) {
            throw new Error(`Caso ${inputPackage.sourceSession}: hay trazabilidad, pero falta el corpus cleaned-text correspondiente.`);
        }
    }
    return packages;
}

function createGroup(sourceSession) {
    return {
        sourceSession,
        cleaned: null,
        traceability: null,
        cleanedFileName: null,
        traceabilityFileName: null
    };
}
