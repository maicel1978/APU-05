/**
 * Motor de Renderizado DOM (Rigor UI)
 * V8.6.0: Edición Editorial de Transcripción y Restauración de Componentes.
 */
export class Renderer {
    static sanitize(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static updateStatus(text, isError = false) {
        const el = document.getElementById('status-text');
        if (el) {
            el.innerText = text.toUpperCase();
            el.style.color = isError ? '#ff4444' : 'inherit';
        }
    }

    static logSystem(message) {
        const el = document.getElementById('system-log');
        if (el) {
            const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            el.innerText = `[${time}] ${message.toUpperCase()}`;
        }
    }

    static showToast(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = 'position:fixed; bottom:2rem; right:2rem; z-index:1000; display:flex; flex-direction:column; gap:0.5rem;';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        const colors = { error: '#fee2e2', success: '#dcfce7', info: '#f4f4f5' };
        toast.style.cssText = `padding:0.75rem 1.25rem; background:${colors[type]}; border:1px solid #000; font-family:monospace; font-size:0.75rem; box-shadow:4px 4px 0px rgba(0,0,0,0.1);`;
        toast.innerText = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    static setLoading(isLoading, message = "Procesando...") {
        let overlay = document.getElementById('loading-overlay');
        if (isLoading) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'loading-overlay';
                overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.9); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:2000; backdrop-filter:blur(5px);';
                overlay.innerHTML = `<div style="border:3px solid #000; padding:3rem; background:#fff; text-align:center;"><div class="spinner" style="border:5px solid #eee; border-top:5px solid #000; border-radius:50%; width:40px; height:40px; animation: spin 1s linear infinite; margin:0 auto 1.5rem;"></div><div id="loading-message" style="font-family:monospace; font-weight:bold; font-size:1.1rem;"></div></div>`;
                document.body.appendChild(overlay);
            }
            document.getElementById('loading-message').innerText = message.toUpperCase();
        } else if (overlay) overlay.remove();
    }

    static renderCorpus(container, segments, speakerMap) {
        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3rem; border-bottom:2px solid #000; padding-bottom:1rem;">
                <div>
                    <h2 style="font-family:monospace; font-size:1.1rem; font-weight:800; text-transform:uppercase; letter-spacing:-0.5px;">EVIDENCIA PRIMARIA</h2>
                    <p style="font-size:0.65rem; color:#71717a; text-transform:uppercase; letter-spacing:1px; margin-top:0.2rem;">Transcripción Auditada del Testimonio</p>
                </div>
                <div style="text-align:right;">
                    <span style="font-size:0.55rem; background:#000; color:#fff; padding:4px 10px; font-weight:bold; letter-spacing:1px;">MODO LECTURA</span>
                </div>
            </div>`;
        
        const fragment = document.createDocumentFragment();
        segments.forEach(seg => {
            const article = document.createElement('article');
            article.style.cssText = 'margin-bottom:2.5rem; padding:1.5rem; border-left:1px solid #eee; transition:all 0.2s ease;';
            const audit = seg.audit?.h ? '✍️' : (seg.audit?.a ? '⚠️' : '');
            article.innerHTML = `
                <div style="display:flex; justify-content:space-between; font-family:monospace; font-size:0.6rem; color:#71717a; margin-bottom:1rem;">
                    <span>ID: ${seg.segmentId} ${audit}</span>
                    <span>${seg.start.toFixed(1)}s — ${seg.end.toFixed(1)}s</span>
                </div>
                <div style="font-size:1.05rem; line-height:1.8; color:#1a1a1a;">
                    <span style="display:inline-block; padding:2px 6px; background:#000; color:#fff; font-size:0.65rem; font-family:monospace; margin-right:0.8rem; text-transform:uppercase;">
                        ${this.sanitize(speakerMap.get(seg.speakerId) || 'P')}
                    </span>
                    ${this.sanitize(seg.cleanedText)}
                </div>`;
            article.onmouseenter = () => { article.style.borderLeft = '4px solid #000'; article.style.background = '#fcfcfc'; };
            article.onmouseleave = () => { article.style.borderLeft = '1px solid #eee'; article.style.background = 'transparent'; };
            fragment.appendChild(article);
        });
        container.appendChild(fragment);
    }

    static renderNarrativeRadiography(container, data, speakerMap, title = "Caracterización Narrativa") {
        container.innerHTML = `
            <div style="font-family:sans-serif; display:flex; flex-direction:column; gap:2.5rem; animation: slideIn 0.3s ease-out;">
                <section>
                    <h3 style="font-size:0.8rem; font-weight:800; border-left:4px solid #000; padding-left:0.5rem; margin-bottom:1rem; text-transform:uppercase;">1. Producción Discursiva</h3>
                    <table style="width:100%; border-collapse:collapse; font-family:monospace; font-size:0.8rem; border:1px solid #000;">
                        <tr style="background:#000; color:#fff;"><th style="padding:0.6rem; text-align:left;">INDICADOR</th><th style="padding:0.6rem; text-align:right;">VALOR</th></tr>
                        <tr><td>Segmentos Totales</td><td style="text-align:right;">${data.production.segments}</td></tr>
                        <tr><td>Palabras Totales</td><td style="text-align:right;">${data.production.words}</td></tr>
                        <tr><td>Duración Estimada</td><td style="text-align:right;">${data.production.duration} min</td></tr>
                        <tr style="background:#f9f9f9; font-weight:bold;"><td>Velocidad Media</td><td style="text-align:right;">${data.production.wpm} wpm</td></tr>
                    </table>
                </section>
                <section>
                    <h3 style="font-size:0.8rem; font-weight:800; border-left:4px solid #000; padding-left:0.5rem; margin-bottom:1rem; text-transform:uppercase;">2. Participación en el Diálogo</h3>
                    <div style="display:grid; grid-template-columns: 1fr 200px; gap:20px; align-items:center;">
                        <table style="width:100%; border-collapse:collapse; font-family:monospace; font-size:0.8rem; border:1px solid #000;">
                            <tr style="background:#f4f4f5;"><th style="padding:0.6rem; text-align:left;">HABLANTE</th><th style="padding:0.6rem; text-align:right;">% DISCURSO</th></tr>
                            ${Object.entries(data.participation).map(([id, s]) => `<tr><td>${speakerMap.get(id) || id}</td><td style="text-align:right; font-weight:bold;">${((s.words / data.production.words) * 100).toFixed(0)}%</td></tr>`).join('')}
                        </table>
                        <div style="height:150px;"><canvas id="speaker-dist-chart"></canvas></div>
                    </div>
                </section>
                <section>
                    <h3 style="font-size:0.8rem; font-weight:800; border-left:4px solid #000; padding-left:0.5rem; margin-bottom:1rem; text-transform:uppercase;">3. Complejidad Narrativa</h3>
                    <table style="width:100%; border-collapse:collapse; font-family:monospace; font-size:0.8rem; border:1px solid #000;">
                        <tr style="background:#000; color:#fff;"><th style="padding:0.6rem; text-align:left;">INDICADOR</th><th style="padding:0.6rem; text-align:right;">VALOR</th></tr>
                        <tr><td>Palabras Únicas</td><td style="text-align:right;">${data.complexity.uniqueWords}</td></tr>
                        <tr><td>Diversidad Léxica</td><td style="text-align:right; font-weight:bold;">${data.complexity.lexicalDiversity}%</td></tr>
                    </table>
                </section>
            </div>`;
        const ctx = container.querySelector('#speaker-dist-chart').getContext('2d');
        new Chart(ctx, { type: 'doughnut', data: { labels: Object.keys(data.participation).map(id => speakerMap.get(id) || id), datasets: [{ data: Object.values(data.participation).map(s => s.words), backgroundColor: ['#000', '#666', '#ccc'] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
    }

    static renderModuleTitle(container, title) {
        const h = document.createElement('h2');
        h.style.cssText = 'font-size:1.1rem; font-weight:800; border-bottom:4px solid #000; padding-bottom:0.5rem; margin-bottom:2rem; text-transform:uppercase; letter-spacing:-1px; font-family:monospace;';
        h.innerText = title;
        container.appendChild(h);
    }
}
