import { GITHUB_CONFIG } from '../config/config.js';
import { escapeHtml, formatWeight, renderMaterialIcon } from '../utils.js';
import { tokenService } from '../services/token.js';
import { planService } from '../services/planService.js';
import { dialogService, notify, sheetService } from './components/dialogs.js';
import { renderSaveStatus } from './components/saveStatus.js';

export function createSettingsView(app) {
    return {
        render() {
            const defaults = app.draft.defaults;
            const exerciseCount = Object.keys(app.draftExercises).length;
            const containerCount = app.draft.containers.length;

            return `
                <div class="view-header">
                    <h2 class="view-header__title">Ustawienia</h2>
                    <p class="view-header__subtitle">Zakres powtórzeń, zakładki i zapis danych</p>
                </div>

                ${renderDefaultsSection(defaults)}
                ${app.isPlanDirty() || app.isExercisesDirty() ? renderSaveBar(app) : ''}

                <section class="section card">
                    <h3 class="card__title">Zapis do GitHuba</h3>
                    ${renderSaveStatus(app.planSave)}
                    ${renderSaveStatus(app.exercisesSave)}
                    <ul class="list">
                        <li class="list__item">
                            ${renderMaterialIcon(tokenService.hasToken() ? 'key' : 'key_off')}
                            <span class="list__body">
                                <span class="list__title">${tokenService.hasToken() ? 'Token skonfigurowany' : 'Brak tokenu w tej wersji'}</span>
                                <span class="list__meta">${tokenService.hasToken() ? 'Zapis idzie przez GitHub API' : 'Zapis lokalnie przez dev-server.js'}</span>
                            </span>
                        </li>
                        <li class="list__item">
                            ${renderMaterialIcon('folder')}
                            <span class="list__body">
                                <span class="list__title">Repozytorium</span>
                                <span class="list__meta">${escapeHtml(GITHUB_CONFIG.REPO_OWNER)}/${escapeHtml(GITHUB_CONFIG.REPO_NAME)}</span>
                            </span>
                        </li>
                    </ul>
                    <button type="button" class="btn btn--ghost btn--block btn--compact" data-action="token">
                        ${renderMaterialIcon('vpn_key')}<span>Ustaw token ręcznie</span>
                    </button>
                </section>

                <section class="section card">
                    <h3 class="card__title">Dane</h3>
                    <ul class="list">
                        <li class="list__item">
                            ${renderMaterialIcon('calendar_month')}
                            <span class="list__body">
                                <span class="list__title">Zakładki</span>
                                <span class="list__meta">${containerCount} ${containerCount === 1 ? 'zakładka' : 'zakładki'}</span>
                            </span>
                        </li>
                        <li class="list__item">
                            ${renderMaterialIcon('fitness_center')}
                            <span class="list__body">
                                <span class="list__title">Katalog ćwiczeń</span>
                                <span class="list__meta">${exerciseCount} pozycji</span>
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
                    <button type="button" class="btn btn--danger btn--block btn--compact" data-action="clear-session">
                        ${renderMaterialIcon('delete_sweep')}<span>Usuń trwający trening z urządzenia</span>
                    </button>
                </section>
            `;
        },

        bind(root) {
            root.addEventListener('click', event => {
                const retryExercises = event.target.closest('[data-exercises-retry]');
                if (retryExercises) {
                    app.saveExercises();
                    return;
                }

                const trigger = event.target.closest('[data-action]');
                if (!trigger) return;

                const action = trigger.dataset.action;
                const step = Number(trigger.dataset.step);

                if (action === 'step') {
                    const field = trigger.dataset.field;
                    const current = Number(app.draft.defaults[field]) || 0;
                    planService.setDefaults(app.draft, { [field]: current + step });
                    app.markPlanDirty();
                }
                if (action === 'save-all') {
                    if (app.isPlanDirty()) app.savePlan();
                    if (app.isExercisesDirty()) app.saveExercises();
                }
                if (action === 'discard-all') {
                    app.discardPlanDraft();
                    app.discardExercisesDraft();
                }
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

function renderDefaultsSection(defaults) {
    return `
        <section class="section card">
            <h3 class="card__title">Progresja</h3>
            <p class="section__hint">Globalny zakres powtórzeń i domyślny skok ciężaru. Każde ćwiczenie w splicie może nadpisać te wartości.</p>
            <div class="stepper">
                ${renderStepper('Powtórzenia min', 'repMin', defaults.repMin, 1, 'powt.')}
                ${renderStepper('Powtórzenia max', 'repMax', defaults.repMax, 1, 'powt.')}
                ${renderStepper('Skok ciężaru', 'increment', defaults.increment, 0.5, 'kg')}
            </div>
        </section>
    `;
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
    const labels = [];
    if (app.isPlanDirty()) labels.push('plan');
    if (app.isExercisesDirty()) labels.push('ćwiczenia');

    return `
        <div class="action-bar action-bar--grid">
            <button type="button" class="btn btn--ghost" data-action="discard-all">${renderMaterialIcon('undo')}<span>Cofnij</span></button>
            <button type="button" class="btn btn--primary" data-action="save-all">${renderMaterialIcon('save')}<span>Zapisz</span></button>
        </div>
        <p class="action-bar__hint">Niezapisane zmiany: ${escapeHtml(labels.join(' i '))}.</p>
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
