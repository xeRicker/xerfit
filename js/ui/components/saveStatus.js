import { escapeHtml, renderMaterialIcon } from '../../utils.js';

const ICONS = {
    idle: 'cloud_upload',
    saving: 'progress_activity',
    saved: 'check_circle',
    error: 'error'
};

const DEFAULTS = {
    idle: 'Gotowe do zapisu',
    saving: 'Zapisywanie…',
    saved: 'Zapisano na GitHubie',
    error: 'Zapis nie powiódł się'
};

export function renderSaveStatus(status) {
    const state = ICONS[status?.state] ? status.state : 'idle';
    return `
        <div class="save-status save-status--${state}" data-save-status role="status">
            ${renderMaterialIcon(ICONS[state])}
            <div class="save-status__body">
                <span class="save-status__title">${escapeHtml(status?.title || DEFAULTS[state])}</span>
                ${status?.detail ? `<span class="save-status__detail">${escapeHtml(status.detail)}</span>` : ''}
            </div>
            ${status?.actionLabel ? `<button type="button" class="btn btn--secondary btn--compact" data-save-retry>${escapeHtml(status.actionLabel)}</button>` : ''}
        </div>
    `;
}
