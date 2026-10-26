import { escapeHtml, renderMaterialIcon } from '../../utils.js';

let feedbackLayer = null;
let sheetLayer = null;
let toastStack = null;
let celebrationLayer = null;

export const dialogService = {
    alert(message, title = 'Komunikat') {
        return openFeedback({
            title,
            message,
            actions: [{ label: 'OK', value: true, variant: 'primary' }]
        });
    },

    confirm(message, title = 'Potwierdź') {
        return openFeedback({
            title,
            message,
            actions: [
                { label: 'Anuluj', value: false, variant: 'ghost' },
                { label: 'OK', value: true, variant: 'primary' }
            ]
        });
    },

    confirmDanger(message, title = 'Potwierdź', confirmLabel = 'Usuń') {
        return openFeedback({
            title,
            message,
            actions: [
                { label: 'Anuluj', value: false, variant: 'ghost' },
                { label: confirmLabel, value: true, variant: 'danger' }
            ]
        });
    },

    prompt(message, title = 'Wpisz wartość', options = {}) {
        return openFeedback({
            title,
            message,
            input: { value: options.value || '', placeholder: options.placeholder || '', inputmode: options.inputmode || 'text' },
            actions: [
                { label: 'Anuluj', value: null, variant: 'ghost' },
                { label: 'Zapisz', value: 'input', variant: 'primary' }
            ]
        });
    }
};

export const sheetService = {
    open({ title, searchPlaceholder = 'Szukaj', onSearch = null, onPick = null, onConfirm = null, confirmLabel = 'Zapisz', render, actions = [] }) {
        const layer = ensureSheetLayer();
        const search = layer.querySelector('.sheet__search');

        layer._onSearch = onSearch;
        layer._onPick = onPick;
        layer._onConfirm = onConfirm;
        layer._confirmLabel = confirmLabel;
        layer._render = render;

        layer.querySelector('.sheet__title').textContent = title;
        layer.querySelector('.sheet__body').innerHTML = render('');
        search.hidden = !onSearch;
        search.querySelector('input').value = '';
        renderSheetActions(layer, actions);
        layer.classList.add('is-open');

        return new Promise(resolve => {
            layer._resolve = resolve;
        });
    },

    refresh(query = '') {
        if (!sheetLayer?._render) return;
        sheetLayer.querySelector('.sheet__body').innerHTML = sheetLayer._render(query);
    },

    close(value = null) {
        if (!sheetLayer) return;
        const resolve = sheetLayer._resolve;
        const onPick = sheetLayer._onPick;
        const onConfirm = sheetLayer._onConfirm;

        sheetLayer.classList.remove('is-open');
        sheetLayer._resolve = null;
        sheetLayer._render = null;
        sheetLayer._onPick = null;
        sheetLayer._onConfirm = null;

        if (value?.picked && onPick) onPick(value.picked);
        if (value?.confirmed && onConfirm) onConfirm();
        if (resolve) resolve(value);
    }
};

export function showCelebration({ title, headline, detail, icon = 'emoji_events' }) {
    const layer = ensureCelebrationLayer();
    const card = layer.querySelector('.celebration');
    card.innerHTML = `
        <span class="celebration__icon material-symbols-rounded" aria-hidden="true">${escapeHtml(icon)}</span>
        <span class="celebration__title">${escapeHtml(title)}</span>
        <span class="celebration__headline">${escapeHtml(headline)}</span>
        <span class="celebration__detail">${escapeHtml(detail)}</span>
    `;
    layer.classList.add('is-open');

    clearTimeout(layer._timer);
    layer._timer = setTimeout(() => layer.classList.remove('is-open'), 2600);
    layer.onclick = () => layer.classList.remove('is-open');
}

function ensureCelebrationLayer() {
    if (celebrationLayer) return celebrationLayer;

    celebrationLayer = document.createElement('div');
    celebrationLayer.className = 'celebration-layer';
    celebrationLayer.innerHTML = '<div class="celebration" role="status" aria-live="polite"></div>';
    document.body.appendChild(celebrationLayer);
    return celebrationLayer;
}

export function notify(message, { type = 'info', duration = 3200 } = {}) {
    const stack = ensureToastStack();
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `${renderMaterialIcon(iconFor(type))}<span>${escapeHtml(message)}</span>`;
    stack.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

function iconFor(type) {
    if (type === 'success') return 'check_circle';
    if (type === 'danger') return 'error';
    if (type === 'warning') return 'warning';
    return 'info';
}

function openFeedback({ title, message, input = null, actions }) {
    const layer = ensureFeedbackLayer();
    const card = layer.querySelector('.feedback-card');
    card.innerHTML = `
        <h3 class="feedback-card__title">${escapeHtml(title)}</h3>
        ${message ? `<p class="feedback-card__message">${escapeHtml(message)}</p>` : ''}
        ${input ? `<input class="text-input" type="text" inputmode="${escapeHtml(input.inputmode)}" placeholder="${escapeHtml(input.placeholder)}" value="${escapeHtml(input.value)}">` : ''}
        <div class="feedback-card__actions"></div>
    `;

    const actionsBox = card.querySelector('.feedback-card__actions');
    layer.classList.add('is-open');

    return new Promise(resolve => {
        const finish = value => {
            layer.classList.remove('is-open');
            document.removeEventListener('keydown', onKeydown);
            resolve(value);
        };
        const onKeydown = event => {
            if (event.key === 'Escape') finish(null);
        };

        actions.forEach(action => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `btn btn--${action.variant} btn--compact`;
            button.textContent = action.label;
            button.addEventListener('click', () => {
                if (action.value === 'input') {
                    finish(card.querySelector('.text-input')?.value.trim() ?? '');
                    return;
                }
                finish(action.value);
            });
            actionsBox.appendChild(button);
        });

        document.addEventListener('keydown', onKeydown);
        const inputElement = card.querySelector('.text-input');
        if (inputElement) {
            inputElement.focus();
            inputElement.select();
        } else {
            actionsBox.querySelector('.btn--primary, .btn--danger')?.focus();
        }
    });
}

function renderSheetActions(layer, actions) {
    const box = layer.querySelector('.sheet__actions');
    box.innerHTML = '';

    if (layer._onConfirm) {
        const confirmButton = document.createElement('button');
        confirmButton.type = 'button';
        confirmButton.className = 'btn btn--primary btn--block';
        confirmButton.dataset.sheetConfirm = '';
        confirmButton.innerHTML = `${renderMaterialIcon('check')}<span>${escapeHtml(layer._confirmLabel)}</span>`;
        box.appendChild(confirmButton);
    }

    actions.forEach(action => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = action.variant === 'primary' ? 'btn btn--primary btn--block' : 'btn btn--ghost btn--block';
        button.textContent = action.label;
        button.addEventListener('click', () => sheetService.close(action.value ?? null));
        box.appendChild(button);
    });
}

function ensureFeedbackLayer() {
    if (feedbackLayer) return feedbackLayer;
    feedbackLayer = document.createElement('div');
    feedbackLayer.className = 'feedback-layer';
    feedbackLayer.innerHTML = '<div class="feedback-card" role="dialog" aria-modal="true"></div>';
    feedbackLayer.addEventListener('click', event => {
        if (event.target === feedbackLayer) closeFeedback();
    });
    document.body.appendChild(feedbackLayer);
    return feedbackLayer;
}

function closeFeedback() {
    if (feedbackLayer) feedbackLayer.classList.remove('is-open');
}

function ensureSheetLayer() {
    if (sheetLayer) return sheetLayer;

    sheetLayer = document.createElement('div');
    sheetLayer.className = 'sheet';
    sheetLayer.innerHTML = `
        <div class="sheet__panel" role="dialog" aria-modal="true">
            <div class="sheet__handle"></div>
            <div class="sheet__head">
                <h3 class="sheet__title"></h3>
                <button type="button" class="icon-btn" data-sheet-close aria-label="Zamknij">${renderMaterialIcon('close')}</button>
            </div>
            <div class="sheet__search">
                <input class="text-input" type="search" autocomplete="off">
            </div>
            <div class="sheet__body"></div>
            <div class="sheet__actions"></div>
        </div>
    `;

    sheetLayer.addEventListener('click', handleSheetClick);
    sheetLayer.addEventListener('input', handleSheetInput);
    sheetLayer.addEventListener('keydown', handleSheetKeydown);
    sheetLayer.querySelector('.sheet__search input').addEventListener('input', event => {
        sheetLayer._onSearch?.(event.target.value);
    });

    document.body.appendChild(sheetLayer);
    return sheetLayer;
}

function handleSheetClick(event) {
    if (event.target === sheetLayer || event.target.closest('[data-sheet-close]')) {
        sheetService.close(null);
        return;
    }
    if (event.target.closest('[data-sheet-confirm]')) {
        if (!sheetLayer._onConfirm || sheetLayer._onConfirm() !== false) {
            sheetService.close({ confirmed: true });
        }
        return;
    }
    const option = event.target.closest('[data-sheet-pick]');
    if (option) sheetService.close({ picked: option.dataset.sheetPick });
}

function handleSheetInput(event) {
    const input = event.target.closest('[data-mode]');
    if (!input) return;
    const cleaned = input.dataset.mode === 'integer'
        ? input.value.replace(/[^0-9]/g, '')
        : input.value.replace(',', '.').replace(/[^0-9.]/g, '');
    if (input.value !== cleaned) input.value = cleaned;
}

function handleSheetKeydown(event) {
    if (event.key === 'Enter' && event.target.closest('[data-form]')) event.preventDefault();
    if (event.key === 'Escape') sheetService.close(null);
}

function ensureToastStack() {
    if (toastStack) return toastStack;
    toastStack = document.createElement('div');
    toastStack.className = 'toast-stack';
    document.body.appendChild(toastStack);
    return toastStack;
}
