/**
 * Validador de Contrato Metodológico (R13 - Adapter Edition)
 * v8.7.0: Blindado contra cambios en el esquema JSON de APU-04.
 */
export class APUParser {
    // Configuración del mapeo: Si el JSON cambia, solo editamos esto.
    static MAPPING = {
        primary_key: 'segmentId',
        text_field: 'cleanedText',
        speakers_list: 'speakers',
        required_unit: 'APU-04'
    };

    static async validate(json, targetDesign) {
        const errors = [];
        const warnings = [];

        // 1. Verificación de Origen
        if (json.unit !== this.MAPPING.required_unit) {
            errors.push(`UNIDAD INVÁLIDA: Se requiere ${this.MAPPING.required_unit}, pero se recibió ${json.unit || 'DESCONOCIDA'}.`);
        }

        // 2. Verificación de Herencia APU-03 (Microdatos)
        if (!json.covariateSchema || !Array.isArray(json.covariateSchema)) {
            warnings.push("HERENCIA DÉBIL: No se detectó esquema de covariables de APU-03.");
        }

        // 3. Verificación de Integridad de Segmentos
        if (!json.segments || !Array.isArray(json.segments)) {
            errors.push("FALLO ESTRUCTURAL: El archivo no contiene el array de segmentos narrativos.");
        } else {
            this._checkSegments(json.segments, errors);
        }

        if (errors.length > 0) {
            throw new Error(errors.join("\n"));
        }

        return { data: json, warnings };
    }

    static _checkSegments(segments, errors) {
        const pkSet = new Set();
        segments.forEach((s, i) => {
            const id = s[this.MAPPING.primary_key] || `Index:${i}`;
            if (pkSet.has(id)) errors.push(`SEGMENTO DUPLICADO: ${id}`);
            pkSet.add(id);
            if (!s[this.MAPPING.text_field]) errors.push(`TEXTO AUSENTE: Segmento ${id}`);
        });
    }
}
