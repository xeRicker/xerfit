import { escapeHtml } from '../utils.js';

export function renderLineChart(points, options = {}) {
    const { width = 320, height = 170, valueFormat = value => String(Math.round(value)) } = options;
    const padding = { top: 14, right: 12, bottom: 26, left: 34 };

    if (points.length === 0) return renderEmptyChart('Brak danych do wykresu');
    if (points.length === 1) {
        return renderSinglePoint(points[0], { width, height, padding, valueFormat });
    }

    const values = points.map(point => Number(point.value) || 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || Math.max(max * 0.1, 1);
    const lo = Math.max(0, min - span * 0.2);
    const hi = max + span * 0.2;

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const stepX = plotWidth / (points.length - 1);
    const yFor = value => padding.top + plotHeight - ((value - lo) / (hi - lo)) * plotHeight;

    const coords = points.map((point, index) => ({
        x: padding.left + stepX * index,
        y: yFor(Number(point.value) || 0),
        point
    }));

    const linePath = coords.map((coord, index) => `${index ? 'L' : 'M'}${coord.x.toFixed(1)} ${coord.y.toFixed(1)}`).join(' ');
    const areaPath = `${linePath} L${coords.at(-1).x.toFixed(1)} ${(padding.top + plotHeight).toFixed(1)} L${coords[0].x.toFixed(1)} ${(padding.top + plotHeight).toFixed(1)} Z`;
    const gridValues = [max, min];
    const firstLabel = points[0].label || '';
    const lastLabel = points.at(-1).label || '';

    return `
        <svg class="chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(options.ariaLabel || 'Wykres progresji')}" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--brand-primary)" stop-opacity="0.28"></stop>
                    <stop offset="100%" stop-color="var(--brand-primary)" stop-opacity="0"></stop>
                </linearGradient>
            </defs>
            ${gridValues.map(value => `
                <line class="chart__grid" x1="${padding.left}" y1="${yFor(value).toFixed(1)}" x2="${width - padding.right}" y2="${yFor(value).toFixed(1)}"></line>
                <text class="chart__axis-label" x="${padding.left - 6}" y="${(yFor(value) + 4).toFixed(1)}" text-anchor="end">${escapeHtml(valueFormat(value))}</text>
            `).join('')}
            <path class="chart__area" d="${areaPath}"></path>
            <path class="chart__line" d="${linePath}"></path>
            ${coords.map(coord => `<circle class="chart__dot" cx="${coord.x.toFixed(1)}" cy="${coord.y.toFixed(1)}" r="3.2"><title>${escapeHtml(`${coord.point.label || ''}: ${valueFormat(coord.point.value)}`)}</title></circle>`).join('')}
            <text class="chart__x-label" x="${padding.left}" y="${height - 8}" text-anchor="start">${escapeHtml(firstLabel)}</text>
            <text class="chart__x-label" x="${width - padding.right}" y="${height - 8}" text-anchor="end">${escapeHtml(lastLabel)}</text>
        </svg>
    `;
}

function renderSinglePoint(point, { width, height, padding, valueFormat }) {
    return `
        <svg class="chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Pojedynczy pomiar">
            <line class="chart__grid" x1="${padding.left}" y1="${height / 2}" x2="${width - padding.right}" y2="${height / 2}"></line>
            <circle class="chart__dot" cx="${width / 2}" cy="${height / 2}" r="4.5"></circle>
            <text class="chart__single-label" x="${width / 2}" y="${height / 2 - 16}" text-anchor="middle">${escapeHtml(valueFormat(point.value))}</text>
            <text class="chart__x-label" x="${width / 2}" y="${height - 8}" text-anchor="middle">${escapeHtml(point.label || '')}</text>
        </svg>
    `;
}

function renderEmptyChart(message) {
    return `<div class="chart-empty">${escapeHtml(message)}</div>`;
}
