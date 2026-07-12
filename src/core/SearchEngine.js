import { Renderer } from '../ui/Renderer.js';
import { SessionManager } from './Session.js';

/**
 * Motor de Búsqueda KWIC (Key Word In Context)
 * Implementa R4 mediante Workers Inline para alto rendimiento.
 */
export class SearchEngine {
    constructor() {
        this.worker = null;
        this.initWorker();
    }

    initWorker() {
        // Usamos un array de strings para evitar problemas de interpolación de template literals
        const workerLines = [
            "self.onmessage = ({ data }) => {",
            "  const { segments, query, isRegex } = data;",
            "  const results = [];",
            "  let regex;",
            "  try {",
            "    const pattern = isRegex ? query.slice(1, -1) : query.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');",
            "    regex = new RegExp(pattern, 'gi');",
            "  } catch (e) {",
            "    self.postMessage({ error: 'Expresión inválida' });",
            "    return;",
            "  }",
            "  const start = performance.now();",
            "  for (const seg of segments) {",
            "    if (performance.now() - start > 2000) break;",
            "    let match;",
            "    regex.lastIndex = 0;",
            "    while ((match = regex.exec(seg.cleanedText)) !== null) {",
            "      results.push({",
            "        segmentId: seg.segmentId,",
            "        text: seg.cleanedText,",
            "        match: match[0],",
            "        index: match.index",
            "      });",
            "      if (!regex.global) break;",
            "    }",
            "  }",
            "  self.postMessage({ results });",
            "};"
        ];
        
        const blob = new Blob([workerLines.join('\n')], { type: 'application/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
    }

    async search(sessionId, query) {
        if (!query) return [];
        const segments = await SessionManager.getSegments(sessionId);
        const isRegex = query.startsWith('/') && query.endsWith('/');

        return new Promise((resolve, reject) => {
            this.worker.onmessage = ({ data }) => {
                if (data.error) reject(new Error(data.error));
                else resolve(data.results);
            };
            this.worker.postMessage({ segments, query, isRegex });
        });
    }

    renderResults(container, results) {
        container.innerHTML = '';
        if (!results || results.length === 0) {
            container.innerHTML = '<p class="empty-msg">Sin resultados.</p>';
            return;
        }

        results.forEach(res => {
            const item = document.createElement('div');
            item.style.cssText = 'padding: 0.7rem; border-bottom: 1px solid #eee; cursor: pointer; background: #fff; margin-bottom: 0.3rem;';
            const snippet = this._getSnippet(res.text, res.match, res.index);
            item.innerHTML = `
                <div style="font-size:0.6rem; color:#888; margin-bottom:0.2rem;">ID: ${res.segmentId}</div>
                <div style="font-size:0.85rem;">...${snippet}...</div>
            `;
            item.onclick = () => Renderer.highlightSegment(res.segmentId);
            container.appendChild(item);
        });
    }

    _getSnippet(text, match, index) {
        const context = 30;
        const start = Math.max(0, index - context);
        const end = Math.min(text.length, index + match.length + context);
        const fragment = text.substring(start, end);
        const safeFragment = Renderer.sanitize(fragment);
        const safeMatch = Renderer.sanitize(match);
        return safeFragment.split(safeMatch).join(`<strong style="background:#ffeb3b; padding:0 2px;">${safeMatch}</strong>`);
    }
}
