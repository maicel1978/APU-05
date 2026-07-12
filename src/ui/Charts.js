/**
 * Motor de Visualización APU-05 (Rigor Edition)
 * Basado en Chart.js para impacto visual epidemiológico.
 */
export class Charts {
    static _destroyExisting(id) {
        const existing = Chart.getChart(id);
        if (existing) existing.destroy();
    }

    static renderDistribution(canvasId, labels, data, title) {
        this._destroyExisting(canvasId);
        const ctx = document.getElementById(canvasId).getContext('2d');
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Conteo',
                    data: data,
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    borderColor: '#000',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, indexAxis: 'y',
                plugins: { title: { display: true, text: title.toUpperCase(), font: { family: 'monospace' } }, legend: { display: false } },
                scales: { x: { beginAtZero: true, grid: { display: false } }, y: { grid: { display: false } } }
            }
        });
    }

    static renderLine(canvasId, labels, data, title) {
        this._destroyExisting(canvasId);
        const ctx = document.getElementById(canvasId).getContext('2d');
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: title,
                    data: data,
                    borderColor: '#000',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: false,
                    pointRadius: 4,
                    pointBackgroundColor: '#000'
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, title: { display: true, text: title.toUpperCase() } },
                scales: { y: { beginAtZero: false, grid: { color: '#eee' } }, x: { display: false } }
            }
        });
    }

    static renderRadar(canvasId, labels, data, title) {
        this._destroyExisting(canvasId);
        const ctx = document.getElementById(canvasId).getContext('2d');
        return new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: title,
                    data: data,
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    borderColor: '#000',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { r: { angleLines: { display: true }, suggestMin: 0, ticks: { display: false } } }
            }
        });
    }

    static renderPriorityMatrix(canvasId, dataPoints) {
        this._destroyExisting(canvasId);
        const ctx = document.getElementById(canvasId).getContext('2d');
        return new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Problemas Clínicos',
                    data: dataPoints, // {x: frecuencia, y: negatividad, label: nombre}
                    backgroundColor: '#000',
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    tooltip: { callbacks: { label: (ctx) => ctx.raw.label } },
                    annotation: { // Conceptual quadrant markers
                        annotations: {
                            lineX: { type: 'line', xMin: 5, xMax: 5, borderColor: '#ccc', borderDash: [5,5] },
                            lineY: { type: 'line', yMin: 0, yMax: 0, borderColor: '#ccc', borderDash: [5,5] }
                        }
                    }
                },
                scales: {
                    x: { title: { display: true, text: 'FRECUENCIA DE MENCIÓN' }, min: 0 },
                    y: { title: { display: true, text: 'CARGA EMOCIONAL NEGATIVA' } }
                }
            }
        });
    }

    static renderKeywordImpact(container, keywords) {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex; flex-wrap:wrap; gap:10px; justify-content:center; padding:1.5rem; border:1px solid #000; background:#fff;';
        const maxG2 = Math.max(...keywords.map(k => parseFloat(k.g2) || 1));
        keywords.forEach(k => {
            const span = document.createElement('span');
            const weight = parseFloat(k.g2) / maxG2;
            const fontSize = 0.8 + (weight * 1.5);
            span.innerText = k.word;
            span.title = `Fuerza G2: ${k.g2}`;
            span.style.cssText = `font-size:${fontSize}rem; font-weight:${weight > 0.6 ? 'bold' : 'normal'}; border:1px solid rgba(0,0,0,${weight}); padding:4px 10px; background:rgba(0,0,0,${weight * 0.05});`;
            wrapper.appendChild(span);
        });
        container.appendChild(wrapper);
    }
}
