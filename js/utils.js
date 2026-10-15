export function generateId(prefix = 'id') {
    return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function toIsoDate(date = new Date()) {
    const value = date instanceof Date ? date : new Date(date);
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

export function formatDate(isoDate) {
    const value = parseIsoDate(isoDate);
    if (!value) return '';
    return `${pad(value.getDate())}.${pad(value.getMonth() + 1)}.${value.getFullYear()}`;
}

export function formatDateShort(isoDate) {
    const value = parseIsoDate(isoDate);
    if (!value) return '';
    return value.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
}

export function formatWeekday(isoDate) {
    const value = parseIsoDate(isoDate);
    if (!value) return '';
    const label = value.toLocaleDateString('pl-PL', { weekday: 'long' });
    return label.charAt(0).toUpperCase() + label.slice(1);
}

export function parseIsoDate(isoDate) {
    const [year, month, day] = String(isoDate || '').split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
}

export function formatWeight(value) {
    const number = Math.round((Number(value) || 0) * 100) / 100;
    if (Number.isInteger(number)) return String(number);
    return number.toFixed(2).replace(/0$/, '').replace('.', ',');
}

export function formatVolume(value) {
    return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(Number(value) || 0);
}

export function formatDuration(startIso, endIso) {
    const start = new Date(startIso).getTime();
    const end = endIso ? new Date(endIso).getTime() : Date.now();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return '0 min';
    const totalMinutes = Math.round((end - start) / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours ? `${hours} h ${minutes} min` : `${minutes} min`;
}

export function formatSignedWeight(value) {
    const number = Number(value) || 0;
    return `${number > 0 ? '+' : '−'}${formatWeight(Math.abs(number))} kg`;
}

export function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

export function renderMaterialIcon(name, extraClass = '') {
    const className = ['material-symbols-rounded', extraClass].filter(Boolean).join(' ');
    return `<span class="${className}" aria-hidden="true">${escapeHtml(name)}</span>`;
}

export function isLocalhost() {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

export function sanitizeDecimal(value) {
    const raw = String(value ?? '').replace(',', '.');
    const negative = raw.trimStart().startsWith('-');
    const digits = raw.replace(/[^0-9.]/g, '');
    const [whole, ...rest] = digits.split('.');
    const number = rest.length ? `${whole}.${rest.join('').slice(0, 2)}` : whole;
    return negative ? `-${number}` : number;
}

export function sanitizeInteger(value) {
    return String(value ?? '').replace(/[^0-9]/g, '').slice(0, 4);
}

function pad(value) {
    return String(value).padStart(2, '0');
}
