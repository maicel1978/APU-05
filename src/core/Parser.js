/**
 * Validador del contrato APU-04 5.x consumido por APU-05.
 * No transforma ni modifica los documentos cargados.
 */
export class APUParser {
    static async validate(json, targetDesign = 'individual', traceabilityData = null) {
        const errors = [];
        const warnings = [];

        this._checkDocument(json, 'cleaned-text', errors);
        if (errors.length === 0) {
            this._checkCleanedCorpus(json, errors, warnings);
        }

        let traceability = null;
        if (traceabilityData !== null && traceabilityData !== undefined) {
            this._checkDocument(traceabilityData, 'trazabilidad', errors);
            if (errors.length === 0) {
                this._checkTraceability(json, traceabilityData, errors);
                traceability = traceabilityData;
            }
        }

        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        return {
            data: json,
            traceability,
            warnings,
            requiresConfirmation: json.finalizedByHuman === false,
            targetDesign
        };
    }

    static _checkDocument(document, expectedStage, errors) {
        if (!document || typeof document !== 'object' || Array.isArray(document)) {
            errors.push('ARCHIVO INVÁLIDO: Se esperaba un objeto JSON.');
            return;
        }

        if (!this._isSupportedVersion(document.schemaVersion)) {
            errors.push(`VERSIÓN NO COMPATIBLE: APU-05 requiere schemaVersion 5.x.x; se recibió ${document.schemaVersion || 'DESCONOCIDA'}. Reprocese el caso con APU-04 actual.`);
        }
        if (document.ecosystem !== 'APU') {
            errors.push('ORIGEN INVÁLIDO: ecosystem debe ser "APU".');
        }
        if (document.unit !== 'APU-04') {
            errors.push('UNIDAD INVÁLIDA: Se requiere una salida de APU-04.');
        }
        if (document.stage !== expectedStage) {
            errors.push(`ETAPA INVÁLIDA: Se esperaba "${expectedStage}" y se recibió "${document.stage || 'DESCONOCIDA'}".`);
        }
    }

    static _isSupportedVersion(version) {
        if (typeof version !== 'string') return false;
        const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
        return Boolean(match && Number(match[1]) === 5);
    }

    static _checkCleanedCorpus(json, errors, warnings) {
        if (typeof json.finalizedByHuman !== 'boolean') {
            errors.push('REVISIÓN INDETERMINADA: Falta finalizedByHuman en el archivo 5.x.');
        } else if (!json.finalizedByHuman) {
            warnings.push('REVISIÓN PENDIENTE: El texto no fue finalizado por un humano en APU-04. Si continúa, todos los resultados serán provisionales.');
        }

        this._checkCovariates(json, errors);
        const speakerIds = this._checkSpeakers(json.speakers, errors);
        this._checkSegments(json.segments, speakerIds, errors, warnings);
    }

    static _checkCovariates(json, errors) {
        const project = json.covariateProject;
        if (project !== undefined && project !== null && (typeof project !== 'object' || Array.isArray(project))) {
            errors.push('COVARIABLES INVÁLIDAS: covariateProject debe ser un objeto o null.');
        }
        const schema = json.covariateSchema;
        if (schema !== undefined && schema !== null && !Array.isArray(schema)) {
            errors.push('COVARIABLES INVÁLIDAS: covariateSchema debe ser una lista o null.');
        }
    }

    static _checkSpeakers(speakers, errors) {
        const ids = new Set();
        if (!Array.isArray(speakers) || speakers.length === 0) {
            errors.push('HABLANTES AUSENTES: Se requiere speakers[] con al menos un hablante.');
            return ids;
        }

        speakers.forEach((speaker, index) => {
            if (!speaker || typeof speaker !== 'object' || Array.isArray(speaker)) {
                errors.push(`HABLANTE INVÁLIDO: speakers[${index}] no es un objeto.`);
                return;
            }
            if (typeof speaker.id !== 'string' || !speaker.id.trim()) {
                errors.push(`HABLANTE INVÁLIDO: speakers[${index}] no tiene id.`);
                return;
            }
            if (ids.has(speaker.id)) {
                errors.push(`HABLANTE DUPLICADO: ${speaker.id}.`);
            }
            ids.add(speaker.id);
            const covariates = speaker.covariates;
            if (covariates !== undefined && covariates !== null && (typeof covariates !== 'object' || Array.isArray(covariates))) {
                errors.push(`COVARIABLES INVÁLIDAS: hablante ${speaker.id}.`);
            }
        });
        return ids;
    }

    static _checkSegments(segments, speakerIds, errors, warnings) {
        if (!Array.isArray(segments) || segments.length === 0) {
            errors.push('SEGMENTOS AUSENTES: Se requiere segments[] con al menos un segmento.');
            return;
        }

        const ids = new Set();
        let zeroDurationCount = 0;
        segments.forEach((segment, index) => {
            if (!segment || typeof segment !== 'object' || Array.isArray(segment)) {
                errors.push(`SEGMENTO INVÁLIDO: segments[${index}] no es un objeto.`);
                return;
            }
            const id = segment.segmentId;
            if (typeof id !== 'string' || !id.trim()) {
                errors.push(`SEGMENTO INVÁLIDO: segments[${index}] no tiene segmentId.`);
            } else if (ids.has(id)) {
                errors.push(`SEGMENTO DUPLICADO: ${id}.`);
            } else {
                ids.add(id);
            }

            if (!speakerIds.has(segment.speakerId)) {
                errors.push(`HABLANTE DESCONOCIDO: ${id || `segments[${index}]`} referencia ${segment.speakerId || 'SIN ID'}.`);
            }
            if (typeof segment.cleanedText !== 'string' || !segment.cleanedText.trim()) {
                errors.push(`TEXTO AUSENTE: ${id || `segments[${index}]`}.`);
            }
            if (!Number.isFinite(segment.start) || !Number.isFinite(segment.end)) {
                errors.push(`TIEMPO INVÁLIDO: ${id || `segments[${index}]`} requiere start/end numéricos.`);
            } else if (segment.end < segment.start) {
                errors.push(`TIEMPO INVERTIDO: ${id || `segments[${index}]`} tiene end menor que start.`);
            } else if (segment.end === segment.start) {
                zeroDurationCount++;
            }
        });

        if (zeroDurationCount > 0) {
            warnings.push(`DURACIÓN NO CALCULABLE: ${zeroDurationCount} segmento(s) tienen start === end; el texto se conserva y no se usará una división por cero.`);
        }
    }

    static _checkTraceability(cleaned, traceability, errors) {
        if (traceability.sourceSession !== cleaned.sourceSession) {
            errors.push('TRAZABILIDAD INCOMPATIBLE: sourceSession no coincide con el corpus limpio.');
        }
        if (!Array.isArray(traceability.segments)) {
            errors.push('TRAZABILIDAD INVÁLIDA: Falta segments[].');
            return;
        }

        const cleanIds = new Set(cleaned.segments.map((segment) => segment.segmentId));
        const traceIds = new Set();
        traceability.segments.forEach((segment, index) => {
            const id = segment?.segmentId;
            if (typeof id !== 'string' || !id.trim()) {
                errors.push(`TRAZABILIDAD INVÁLIDA: segments[${index}] no tiene segmentId.`);
            } else if (traceIds.has(id)) {
                errors.push(`TRAZABILIDAD DUPLICADA: ${id}.`);
            } else {
                traceIds.add(id);
            }
        });

        const missing = [...cleanIds].filter((id) => !traceIds.has(id));
        const extra = [...traceIds].filter((id) => !cleanIds.has(id));
        if (missing.length || extra.length) {
            errors.push(`TRAZABILIDAD INCOMPATIBLE: IDs faltantes=${missing.length}, adicionales=${extra.length}.`);
        }

        const auditFinalized = traceability.auditLog?.finalizedByHuman;
        if (typeof auditFinalized === 'boolean' && auditFinalized !== cleaned.finalizedByHuman) {
            errors.push('TRAZABILIDAD INCOMPATIBLE: finalizedByHuman no coincide.');
        }
    }
}
