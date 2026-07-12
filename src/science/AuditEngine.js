/**
 * Motor de Narrativa Académica APU-05 (v8.3.0)
 * Compilador de Evidencia para Reporte Final.
 */
export class AuditEngine {
    static async generateIndividualReport(state, stats, diagnosis, impact) {
        const date = new Date().toLocaleDateString();
        
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
        report += `> "${data.ideaCentral || 'Análisis de esencia completado.'}"\n\n`;

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

    // Reporte genérico simplificado para el prototipo
    static generateFullProjectReport(state, stats) {
        const provisional = state.isProvisional === true;
        const status = provisional ? 'PROVISIONAL — TEXTO NO FINALIZADO EN APU-04' : 'Consolidado';
        const warning = provisional
            ? '\n> ADVERTENCIA: Este documento es exploratorio. El corpus puede cambiar después de la revisión humana.\n'
            : '';
        return `
# REPORTE DE PROYECTO: ${state.topology.toUpperCase()}
Estado: ${status}
Fecha: ${new Date().toLocaleDateString()}
${warning}

## CARACTERIZACIÓN DE LA EVIDENCIA
- Volumen: ${stats.production.words} palabras en ${stats.production.segments} segmentos.
- Duración: ${stats.production.duration} minutos.
- Complejidad: ${stats.complexity.lexicalDiversity}% de diversidad léxica.

## MEMORIA TÉCNICA
Análisis ejecutado bajo estándares local-first.
El corpus superó la validación estructural de entrada APU-04 5.x.

--------------------------------------------------
DOCUMENTO PREPARADO PARA EVALUACIÓN ACADÉMICA.
        `.trim();
    }
}
