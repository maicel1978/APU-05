/**
 * Motor de Narrativa Académica APU-05 (v8.3.0)
 * Compilador de Evidencia para Reporte Final.
 */
export class AuditEngine {
    static async generateIndividualReport(state, stats, diagnosis, impact) {
        const date = new Date().toLocaleDateString();
        const ideaCentral = state?.synthesis?.ideaCentral || diagnosis?.ideaCentral || 'Análisis de esencia completado.';
        
        let report = `# INFORME ESTRATÉGICO DE INVESTIGACIÓN (INDIVIDUAL)\n`;
        report += `Generado por APU-05 // Analysis & Protocol Utilities\n`;
        report += `Fecha: ${date} | ID Sesión: ${state.sessionId}\n`;
        report += `----------------------------------------------------------\n\n`;

        // 1. Caracterización
        report += `## 1. CARACTERIZACIÓN NARRATIVA\n`;
        report += `| Indicador | Valor |\n`;
        report += `| :--- | :--- |\n`;
        report += `| Segmentos | ${stats.production.segments} |\n`;
        report += `| Palabras | ${stats.production.words} |\n`;
        report += `| Duración | ${stats.production.duration} min |\n`;
        report += `| Velocidad | ${stats.production.wpm} wpm |\n`;
        report += `| Diversidad Léxica | ${stats.complexity.lexicalDiversity}% |\n\n`;

        // 2. Estructura
        report += `## 2. ESTRUCTURA DEL DISCURSO\n`;
        report += `Dominancia de temas detectada mediante frecuencia relativa:\n`;
        diagnosis.weights.forEach(w => {
            report += `- **${w.label.toUpperCase()}**: ${w.weight}%\n`;
        });
        report += `\nConceptos Clave: ${diagnosis.distinctive.map(d => d.term).join(', ')}.\n\n`;

        // 3. Síntesis
        report += `## 3. SÍNTESIS ANALÍTICA (Idea Central)\n`;
        report += `> "${ideaCentral}"\n\n`;

        // 4. Impacto
        report += `## 4. MATRIZ DE PRIORIDADES (M-R-A)\n`;
        report += `| Hallazgo | Magnitud | Prioridad |\n`;
        report += `| :--- | :--- | :--- |\n`;
        impact.forEach((d, i) => {
            report += `| ${d.term.toUpperCase()} | ${d.count} | P${i+1} |\n`;
        });

        report += `\n\n## 5. NOTA METODOLÓGICA (RIGOR)\n`;
        report += `Procesamiento realizado en hardware local. Análisis de sentimiento mediante ABSA léxico. Significancia temática calculada por densidad de glosario. Los datos son inmutables.\n`;
        report += `\n**Cita Sugerida:** Investigador Principal. (${new Date().getFullYear()}). Reporte de Evidencia APU-05. Metodología PRISMA+.\n`;

        return report;
    }

    // Reporte genérico ampliado y forense para el prototipo
    static generateFullProjectReport(state, stats, auditRecords = null, auditSummary = null) {
        const provisional = state.isProvisional === true;
        const status = provisional ? 'PROVISIONAL — TEXTO NO FINALIZADO EN APU-04' : 'Consolidado';
        const warning = provisional
            ? '\n> ADVERTENCIA: Este documento es exploratorio. El corpus puede cambiar después de la revisión humana.\n'
            : '';
        const topology = (state.topology || 'desconocido').toUpperCase();
        const dateStr = new Date().toLocaleDateString();

        let auditSection = '\n## ESTADO FORENSE Y TRAZABILIDAD\n- Trazabilidad complementaria: No disponible o no adjuntada en la ingesta.\n';
        const summary = auditSummary || state.auditSummary;
        if (summary && summary.traceabilityCases > 0) {
            const editedPct = summary.total > 0 ? Math.round((summary.edited / summary.total) * 100) : 0;
            auditSection = `
## ESTADO FORENSE Y TRAZABILIDAD (APU-04 → APU-05)
- Casos con archivo de trazabilidad (_trazabilidad.json): ${summary.traceabilityCases}
- Segmentos auditados: ${summary.total}
- Segmentos editados por humano (editedByHuman): ${summary.edited} (${editedPct}%)
- Segmentos con modificaciones en log: ${summary.changed}
- Segmentos con anomalías / duración 0: ${summary.anomalous}
`;
        } else if (auditRecords && auditRecords.length > 0) {
            const editedCount = auditRecords.filter(a => a.editedByHuman).length;
            const aiCount = auditRecords.filter(a => a.aiSuggested).length;
            const anomalousCount = auditRecords.filter(a => a.anomalous || (a.start === a.end)).length;
            auditSection = `
## ESTADO FORENSE Y TRAZABILIDAD (APU-04 → APU-05)
- Segmentos con registros de auditoría: ${auditRecords.length}
- Segmentos editados por humano (editedByHuman): ${editedCount}
- Segmentos sugeridos por IA (aiSuggested): ${aiCount}
- Segmentos con anomalías / duración 0: ${anomalousCount}
`;
        }

        let warningsSection = '';
        if (state.validationWarnings && state.validationWarnings.length > 0) {
            warningsSection = `\n## ADVERTENCIAS DE CALIDAD\n${state.validationWarnings.map(w => `- ${w}`).join('\n')}\n`;
        }

        return `
# REPORTE DE PROYECTO: ${topology}
Estado: ${status}
Fecha: ${dateStr}
${warning}

## CARACTERIZACIÓN DE LA EVIDENCIA
- Volumen: ${stats.production.words} palabras en ${stats.production.segments} segmentos.
- Duración: ${stats.production.duration} minutos.
- Velocidad media: ${stats.production.wpm} palabras por minuto (wpm).
- Complejidad: ${stats.complexity.lexicalDiversity}% de diversidad léxica.
${auditSection.trim()}
${warningsSection.trim()}

## MEMORIA TÉCNICA
Análisis ejecutado bajo estándares local-first inmutables (PRISMA+ v5.3).
El corpus superó la validación estructural estricta de entrada APU-04 5.x.

--------------------------------------------------
DOCUMENTO PREPARADO PARA EVALUACIÓN ACADÉMICA.
        `.trim();
    }
}
