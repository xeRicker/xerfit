import { escapeHtml, formatWeight, renderMaterialIcon } from '../utils.js';
import { tokenService } from '../services/token.js';
import { planService } from '../services/planService.js';
import { dialogService, notify, sheetService } from './components/dialogs.js';

export function createSettingsView(app) {
    return {
        render() {
            const defaults = app.draft.defaults;
            const exerciseCount = Object.keys(app.draftExercises).length;
            const containerCount = app.draft.containers.length;

            return `
                <div class="view-header">
                    <h2 class="view-header__title">Ustawienia</h2>
                    <p class="view-header__subtitle">Zakres powtórzeń i skok ciężaru</p>
                </div>

                <section class="section card">
                    <h3 class="card__title">Progresja</h3>
                    <p class="section__hint">Globalny zakres powtórzeń i domyślny skok ciężaru. Ćwiczenie w splicie może nadpisać te wartości.</p>
                    <div class="stepper">
                        ${renderStepper('Powtórzenia min', 'repMin', defaults.repMin, 1, 'powt.')}
                        ${renderStepper('Powtórzenia max', 'repMax', defaults.repMax, 1, 'powt.')}
                        ${renderStepper('Skok ciężaru', 'increment', defaults.increment, 0.5, 'kg')}
                    </div>
                </section>

                <section class="section card">
                    <h3 class="card__title">Dane</h3>
                    <ul class="list">
                        <li class="list__item">
                            ${renderMaterialIcon('calendar_month')}
                            <span class="list__body">
                                <span class="list__title">Zakładki</span>
                                <span class="list__meta">${containerCount} ${plural(containerCount, 'zakładka', 'zakładki', 'zakładek')}</span>
                            </span>
                        </li>
                        <li class="list__item">
                            ${renderMaterialIcon('fitness_center')}
                            <span class="list__body">
                                <span class="list__title">Katalog ćwiczeń</span>
                                <span class="list__meta">${exerciseCount} ${plural(exerciseCount, 'pozycja', 'pozycje', 'pozycji')}</span>
                            </span>
                        </li>
                        <li class="list__item">
                            ${renderMaterialIcon('history')}
                            <span class="list__body">
                                <span class="list__title">Zapisane treningi</span>
                                <span class="list__meta">${app.workouts.length} w bazie</span>
                            </span>
                        </li>
                    </ul>
                    <button type="button" class="btn btn--ghost btn--block btn--compact" data-action="reload">
                        ${renderMaterialIcon('refresh')}<span>Wczytaj dane z GitHuba</span>
                    </button>
                    <button type="button" class="btn btn--ghost btn--block btn--compact" data-action="token">
                        ${renderMaterialIcon('vpn_key')}<span>${tokenService.hasToken() ? 'Zmień token GitHub' : 'Ustaw token GitHub'}</span>
                    </button>
                    <button type="button" class="btn btn--danger btn--block btn--compact" data-action="clear-session">
                        ${renderMaterialIcon('delete_sweep')}<span>Usuń trwający trening z urządzenia</span>
                    </button>
                </section>

                ${renderSaveBar(app)}
            `;
        },

        bind(root) {
            root.addEventListener('click', event => {
                const trigger = event.target.closest('[data-action]');
                if (!trigger) return;

                const action = trigger.dataset.action;

                if (action === 'step') {
                    const field = trigger.dataset.field;
                    const current = Number(app.draft.defaults[field]) || 0;
                    planService.setDefaults(app.draft, { [field]: current + Number(trigger.dataset.step) });
                    app.markPlanDirty();
                }
                if (action === 'save-plan') app.savePlan();
                if (action === 'discard-plan') app.discardPlanDraft();
                if (action === 'reload') app.reloadData();
                if (action === 'clear-session') clearSession(app);
                if (action === 'token') setToken(app);
            });

            root.addEventListener('change', event => {
                const field = event.target.dataset.defaultField;
                if (!field) return;
                planService.setDefaults(app.draft, { [field]: event.target.value });
                app.markPlanDirty();
            });
        }
    };
}

function renderStepper(label, field, value, step, unit) {
    return `
        <div class="stepper__row">
            <span class="stepper__label">
                <span class="field__label">${escapeHtml(label)}</span>
                <span class="stepper__hint">${escapeHtml(unit)}</span>
            </span>
            <div class="stepper__controls">
                <button type="button" class="icon-btn" data-action="step" data-field="${field}" data-step="-${step}" aria-label="Zmniejsz ${escapeHtml(label)}">
                    ${renderMaterialIcon('remove')}
                </button>
                <input class="text-input numeric stepper__input" type="text" inputmode="decimal"
                    value="${escapeHtml(formatWeight(value))}" data-default-field="${field}" aria-label="${escapeHtml(label)}">
                <button type="button" class="icon-btn" data-action="step" data-field="${field}" data-step="${step}" aria-label="Zwiększ ${escapeHtml(label)}">
                    ${renderMaterialIcon('add')}
                </button>
            </div>
        </div>
    `;
}

function renderSaveBar(app) {
    if (!app.isPlanDirty()) return '';

    return `
        <div class="action-bar action-bar--grid">
            <button type="button" class="btn btn--ghost" data-action="discard-plan">${renderMaterialIcon('undo')}<span>Cofnij</span></button>
            <button type="button" class="btn btn--primary" data-action="save-plan">${renderMaterialIcon('save')}<span>Zapisz</span></button>
        </div>
    `;
}

async function clearSession(app) {
    const confirmed = await dialogService.confirmDanger('Usunąć trwający trening zapisany na tym urządzeniu? Historia treningów zostanie bez zmian.', 'Usuń trwający trening', 'Usuń');
    if (!confirmed) return;
    app.clearSession();
    notify('Trwający trening usunięty.', { type: 'success' });
}

function setToken(app) {
    sheetService.open({
        title: 'Token GitHub',
        actions: [{ label: 'Anuluj' }],
        confirmLabel: 'Zapisz token',
        render: () => `
            <div class="field">
                <label class="field__label" for="tokenValue">Personal access token (repo)</label>
                <input class="text-input" id="tokenValue" type="password" autocomplete="off" placeholder="github_pat_..." value="${escapeHtml(tokenService.get() || '')}">
            </div>
            <p class="action-bar__hint">Token zostaje tylko w tej przeglądarce (localStorage). Nie jest wysyłany nigdzie poza api.github.com.</p>
        `,
        onConfirm: () => {
            const value = document.getElementById('tokenValue')?.value.trim() || '';
            tokenService.set(value);
            notify(value ? 'Token zapisany.' : 'Token usunięty.', { type: 'success' });
            app.render();
            return true;
        }
    }).then(() => app.render());
}

function plural(count, one, few, many) {
    if (count === 1) return one;
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14)) return few;
    return many;
}
