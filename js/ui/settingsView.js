import { escapeHtml, formatWeight, renderMaterialIcon } from '../utils.js';
import { planService } from '../services/planService.js';
import { profileService, strengthService } from '../services/profileService.js';
import { workoutAnalysis } from '../services/workoutAnalysis.js';
import { dialogService, notify, sheetService } from './components/dialogs.js';

export function createSettingsView(app) {
    return {
        render() {
            const defaults = app.draft.defaults;
            const profile = app.profile;

            return `
                <div class="view-header">
                    <h2 class="view-header__title">Ustawienia</h2>
                    <p class="view-header__subtitle">Twoje dane, progresja i zapis</p>
                </div>

                ${renderProfileSection(profile)}
                ${renderStrengthSection(app, profile)}

                <section class="section card">
                    <h3 class="card__title">Progresja</h3>
                    <p class="section__hint">Globalny zakres powtórzeń i skok ciężaru. Ćwiczenie w splicie może nadpisać te wartości.</p>
                    <div class="stepper">
                        ${renderStepper('Powtórzenia min', 'repMin', defaults.repMin, 1, 'powt.')}
                        ${renderStepper('Powtórzenia max', 'repMax', defaults.repMax, 1, 'powt.')}
                        ${renderStepper('Skok ciężaru', 'increment', defaults.increment, 0.5, 'kg')}
                    </div>
                </section>

                <section class="section card">
                    <h3 class="card__title">Dane</h3>
                    <p class="section__hint">${app.workouts.length} ${plural(app.workouts.length, 'zapisany trening', 'zapisane treningi', 'zapisanych treningów')} · ${Object.keys(app.draftExercises).length} ćwiczeń w katalogu</p>
                    <button type="button" class="btn btn--ghost btn--block btn--compact" data-action="reload">
                        ${renderMaterialIcon('refresh')}<span>Wczytaj dane z GitHuba</span>
                    </button>
                    <button type="button" class="btn btn--danger btn--block btn--compact" data-action="clear-session">
                        ${renderMaterialIcon('delete_sweep')}<span>Usuń trwający trening z urządzenia</span>
                    </button>
                </section>

                <div id="settings-save-bar">${app.isPlanDirty() ? renderSaveBar() : ''}</div>
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
                    app.repaint();
                }
                if (action === 'save-plan') app.savePlan();
                if (action === 'discard-plan') app.discardPlanDraft();
                if (action === 'reload') app.reloadData();
                if (action === 'clear-session') clearSession(app);
                if (action === 'profile') openProfileForm(app);
            });

            root.addEventListener('change', event => {
                const field = event.target.dataset.defaultField;
                if (field) {
                    const before = Number(app.draft.defaults[field]) || 0;
                    planService.setDefaults(app.draft, { [field]: event.target.value });
                    if (Number(app.draft.defaults[field]) === before) event.target.value = formatWeight(app.draft.defaults[field]);
                    app.repaint();
                }
            });
        },

        patch(root) {
            document.querySelectorAll('[data-default-field]').forEach(input => {
                const value = app.draft.defaults[input.dataset.defaultField];
                if (value !== undefined) input.value = formatWeight(value);
            });

            const barHost = document.getElementById('settings-save-bar');
            const wanted = app.isPlanDirty() ? renderSaveBar() : '';
            if (barHost && barHost.innerHTML !== wanted) barHost.innerHTML = wanted;

            const profileHost = document.getElementById('settings-profile');
            const profileWanted = renderProfileSection(app.profile);
            if (profileHost && profileHost.innerHTML !== profileWanted) profileHost.innerHTML = profileWanted;
        }
    };
}

function renderProfileSection(profile) {
    const complete = profileService.isComplete(profile);
    const items = [
        { key: 'sex', label: 'Płeć', value: profile.sex === 'female' ? 'Kobieta' : 'Mężczyzna' },
        { key: 'age', label: 'Wiek', value: profile.age ? `${profile.age} lat` : null },
        { key: 'height', label: 'Wzrost', value: profile.height ? `${formatWeight(profile.height)} cm` : null },
        { key: 'weight', label: 'Waga', value: profile.weight ? `${formatWeight(profile.weight)} kg` : null },
        { key: 'bodyFat', label: 'Tkanka tłuszczowa', value: profile.bodyFat ? `${formatWeight(profile.bodyFat)} %` : null }
    ];

    if (!complete) {
        return `
            <section class="section card" id="settings-profile">
                <h3 class="card__title">Twoje dane</h3>
                <p class="section__hint">Potrzebuję płci i wagi, żeby policzyć siłę względną i pokazać, gdzie jesteś na tle typowych przedziałów.</p>
                <button type="button" class="btn btn--primary btn--block" data-action="profile">
                    ${renderMaterialIcon('person')}<span>Uzupełnij dane</span>
                </button>
            </section>
        `;
    }

    return `
        <section class="section card" id="settings-profile">
            <div class="card__head">
                <h3 class="card__title">Twoje dane</h3>
                <button type="button" class="icon-btn" data-action="profile" aria-label="Edytuj dane">
                    ${renderMaterialIcon('edit')}
                </button>
            </div>
            <ul class="list list--tight">
                ${items.map(item => `
                    <li class="list__item profile-row">
                        <span class="profile-row__label">${escapeHtml(item.label)}</span>
                        <span class="profile-row__value numeric">${item.value ? escapeHtml(item.value) : '—'}</span>
                    </li>
                `).join('')}
            </ul>
        </section>
    `;
}

function renderStrengthSection(app, profile) {
    if (!strengthService.hasStandards(app.standards)) return '';

    const weights = workoutAnalysis.currentWeights(app.draftExercises, app.workouts);
    const bodyweight = profile?.weight;
    const rows = [];

    if (bodyweight && profileService.isComplete(profile)) {
        weights.forEach(item => {
            const oneRepMax = item.oneRepMax;
            if (!oneRepMax) return;
            const lift = strengthService.matchLift(app.standards, item.name);
            if (!lift) return;
            const ratio = oneRepMax / bodyweight;
            const level = strengthService.classify(app.standards, lift, ratio, profile.sex);
            if (!level) return;
            rows.push({ name: item.name, ratio, level, lift });
        });
    }

    rows.sort((a, b) => b.ratio - a.ratio);

    return `
        <section class="section card">
            <h3 class="card__title">Siła względna</h3>
            ${!profileService.isComplete(profile)
                ? '<p class="section__hint">Uzupełnij płeć i wagę, żeby zobaczyć porównanie.</p>'
                : (rows.length ? `
                    <p class="section__hint">Szacowany 1RM podzielony przez Twoją wagę (${escapeHtml(formatWeight(bodyweight))} kg).</p>
                    <ul class="strength-list">
                        ${rows.slice(0, 8).map(row => renderStrengthRow(row)).join('')}
                    </ul>
                ` : '<p class="section__hint">Zapisz trening z tymi ćwiczeniami, żeby zobaczyć porównanie.</p>')}
        </section>
    `;
}

function renderStrengthRow({ name, ratio, level, lift }) {
    const percent = Math.round(level.progress * 100);

    return `
        <li class="strength-row">
            <span class="strength-row__head">
                <span class="strength-row__name">${escapeHtml(name)}</span>
                <span class="strength-row__ratio numeric">${escapeHtml(formatWeight(Math.round(ratio * 100) / 100))}×</span>
            </span>
            <span class="strength-row__track">
                <span class="strength-row__fill" style="width:${percent}%"></span>
            </span>
            <span class="strength-row__foot">
                <span class="strength-row__level">${escapeHtml(level.label)}</span>
                <span class="strength-row__hint">${escapeHtml(lift.label)}${level.nextBound ? ` · próg ${escapeHtml(formatWeight(level.nextBound))}×` : ' · najwyższy próg'}</span>
            </span>
        </li>
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

function renderSaveBar() {
    return `
        <div class="action-bar action-bar--grid">
            <button type="button" class="btn btn--ghost" data-action="discard-plan">${renderMaterialIcon('undo')}<span>Cofnij</span></button>
            <button type="button" class="btn btn--primary" data-action="save-plan">${renderMaterialIcon('save')}<span>Zapisz</span></button>
        </div>
    `;
}

function openProfileForm(app) {
    const profile = app.profile;

    sheetService.open({
        title: 'Twoje dane',
        actions: [{ label: 'Anuluj' }],
        confirmLabel: 'Zapisz',
        render: () => `
            <div class="field">
                <span class="field__label">Płeć</span>
                <div class="segmented segmented--compact">
                    <label class="segmented__option">
                        <input type="radio" name="profileSex" value="male" ${profile.sex !== 'female' ? 'checked' : ''}>
                        <span>Mężczyzna</span>
                    </label>
                    <label class="segmented__option">
                        <input type="radio" name="profileSex" value="female" ${profile.sex === 'female' ? 'checked' : ''}>
                        <span>Kobieta</span>
                    </label>
                </div>
            </div>
            <div class="form-grid">
                ${renderProfileField('Wiek', 'age', profile.age, 'integer', 'lat')}
                ${renderProfileField('Wzrost', 'height', profile.height, 'integer', 'cm')}
                ${renderProfileField('Waga', 'weight', profile.weight, 'decimal', 'kg')}
                ${renderProfileField('Tkanka tłuszczowa', 'bodyFat', profile.bodyFat, 'decimal', '%')}
            </div>
            <p class="action-bar__hint">Dane zostają tylko na tym urządzeniu. Waga i płeć są potrzebne do porównania siły; tłuszcz liczony jest z masy ciała.</p>
        `,
        onConfirm: () => {
            const sex = document.querySelector('input[name="profileSex"]:checked')?.value || 'male';
            const values = { sex };
            let invalid = null;

            document.querySelectorAll('[data-profile-field]').forEach(input => {
                const field = input.dataset.profileField;
                const raw = String(input.value).trim();
                if (raw === '') {
                    values[field] = null;
                    return;
                }
                const number = Number.parseFloat(raw.replace(',', '.'));
                if (!Number.isFinite(number) || number <= 0) invalid = field;
                values[field] = number;
            });

            if (invalid) {
                notify('Wpisz poprawną liczbę.', { type: 'warning' });
                return false;
            }
            app.setProfile(values);
            return true;
        }
    }).then(() => app.fullRender());
}

function renderProfileField(label, field, value, mode, unit) {
    return `
        <div class="field">
            <label class="field__label" for="profile-${field}">${escapeHtml(label)} (${escapeHtml(unit)})</label>
            <input class="text-input numeric" id="profile-${field}" type="text" inputmode="${mode === 'integer' ? 'numeric' : 'decimal'}"
                value="${value === null || value === undefined ? '' : escapeHtml(formatWeight(value))}" data-mode="${mode}" data-profile-field="${field}">
        </div>
    `;
}

async function clearSession(app) {
    const confirmed = await dialogService.confirmDanger('Usunąć trwający trening zapisany na tym urządzeniu? Historia treningów zostanie bez zmian.', 'Usuń trwający trening', 'Usuń');
    if (!confirmed) return;
    app.clearSession();
    notify('Trwający trening usunięty.', { type: 'success' });
}

function plural(count, one, few, many) {
    if (count === 1) return one;
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14)) return few;
    return many;
}
