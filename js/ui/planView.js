import { escapeHtml, renderMaterialIcon, sanitizeDecimal, sanitizeInteger } from '../utils.js';
import { exercisesService } from '../services/exercisesService.js';
import { planService } from '../services/planService.js';
import { dialogService, notify, sheetService } from './components/dialogs.js';

export function createPlanView(app) {
    return {
        render() {
            if (!app.plan.containers.length) return renderNoContainers(app);
            if (app.planUI.selectedSplitId) return renderSplitEditor(app);
            return renderContainer(app);
        },

        bind(root) {
            root.addEventListener('click', event => handleClick(app, event));
            root.addEventListener('input', event => handleInput(app, event));
        }
    };
}

function renderNoContainers() {
    return `
        <div class="empty-state">
            ${renderMaterialIcon('calendar_month')}
            <h3 class="empty-state__title">Brak zakładek</h3>
            <p class="empty-state__text">Zakładka grupuje splity, np. „Grudzień” albo „Styczeń”. Możesz ją później skopiować i zmienić ćwiczenia.</p>
            <button type="button" class="btn btn--primary btn--compact" data-action="new-container">
                ${renderMaterialIcon('add')}<span>Nowa zakładka</span>
            </button>
        </div>
    `;
}

function renderContainer(app) {
    const container = app.currentContainer();
    if (!container) return renderNoContainers();

    return `
        ${renderContainerTabs(app, container)}
        ${renderPlanSaveBar(app)}
        <div class="container-head">
            <input class="text-input container-head__name" type="text" value="${escapeHtml(container.name)}" data-field="container-name" aria-label="Nazwa zakładki">
            <div class="container-head__actions">
                <button type="button" class="icon-btn" data-action="copy-container" aria-label="Kopiuj zakładkę">
                    ${renderMaterialIcon('content_copy')}
                </button>
                <button type="button" class="icon-btn icon-btn--danger" data-action="remove-container" aria-label="Usuń zakładkę">
                    ${renderMaterialIcon('delete')}
                </button>
            </div>
        </div>

        ${container.splits.length ? `<div class="split-list">${container.splits.map(split => renderSplitCard(app, container, split)).join('')}</div>` : renderNoSplits()}

        <button type="button" class="btn btn--ghost btn--block" data-action="new-split">
            ${renderMaterialIcon('add')}<span>Nowy split</span>
        </button>
    `;
}

function renderContainerTabs(app, active) {
    return `
        <div class="container-tabs" role="tablist" aria-label="Zakładki planu">
            ${app.plan.containers.map(container => `
                <button type="button" class="chip" role="tab" data-action="select-container" data-container="${container.id}"
                    aria-pressed="${container.id === active.id}">${escapeHtml(container.name)}</button>
            `).join('')}
            <button type="button" class="chip chip--action" data-action="new-container" aria-label="Nowa zakładka">
                ${renderMaterialIcon('add')}
            </button>
        </div>
    `;
}

function renderNoSplits() {
    return `
        <div class="empty-state">
            ${renderMaterialIcon('splitscreen')}
            <h3 class="empty-state__title">Zakładka bez splitów</h3>
            <p class="empty-state__text">Dodaj split, np. Upper albo Lower, i wybierz do niego ćwiczenia z katalogu.</p>
        </div>
    `;
}

function renderSplitCard(app, container, split) {
    const items = planService.listSplitExercises(app.plan, app.exercises, split);
    const preview = items.slice(0, 4).map(item => item.name).join(' · ');
    const rest = items.length > 4 ? ` +${items.length - 4}` : '';

    return `
        <article class="card split-card">
            <div class="split-card__head">
                <div class="split-card__titles">
                    <h3 class="card__title">${escapeHtml(split.name)}</h3>
                    <span class="card__meta">${items.length} ${plural(items.length, 'ćwiczenie', 'ćwiczenia', 'ćwiczeń')}</span>
                </div>
                <button type="button" class="icon-btn" data-action="edit-split" data-split="${split.id}" aria-label="Edytuj split ${escapeHtml(split.name)}">
                    ${renderMaterialIcon('edit')}
                </button>
            </div>
            ${items.length ? `<p class="split-card__preview">${escapeHtml(preview)}${escapeHtml(rest)}</p>` : '<p class="split-card__preview muted">Brak ćwiczeń</p>'}
            <button type="button" class="btn btn--primary btn--block" data-action="start-split" data-split="${split.id}" data-container="${container.id}" ${items.length ? '' : 'disabled'}>
                ${renderMaterialIcon('play_arrow')}<span>Startuj</span>
            </button>
        </article>
    `;
}

function renderSplitEditor(app) {
    const container = app.currentContainer();
    const split = planService.findSplit(container, app.planUI.selectedSplitId);
    if (!split) return renderNoSplits();

    const items = planService.listSplitExercises(app.plan, app.exercises, split);

    return `
        <div class="editor-head">
            <button type="button" class="icon-btn" data-action="close-editor" aria-label="Wróć do listy splitów">
                ${renderMaterialIcon('arrow_back')}
            </button>
            <input class="text-input editor-head__name" type="text" value="${escapeHtml(split.name)}" data-field="split-name" aria-label="Nazwa splitu">
            <button type="button" class="icon-btn icon-btn--danger" data-action="remove-split" data-split="${split.id}" aria-label="Usuń split">
                ${renderMaterialIcon('delete')}
            </button>
        </div>

        <div class="section">
            <div class="section__head">
                <h3 class="section__title">Ćwiczenia</h3>
                <span class="section__hint">${items.length} w kolejności</span>
            </div>
            ${items.length
                ? `<div class="card card--flush"><ul class="list">${items.map((item, index) => renderExerciseRow(item, index, items.length)).join('')}</ul></div>`
                : renderNoExercises()}
        </div>

        <button type="button" class="btn btn--ghost btn--block" data-action="add-exercise">
            ${renderMaterialIcon('add')}<span>Dodaj ćwiczenie</span>
        </button>
        ${renderPlanSaveBar(app, true)}
    `;
}

function renderNoExercises() {
    return `
        <div class="empty-state">
            ${renderMaterialIcon('playlist_add')}
            <h3 class="empty-state__title">Pusto w splicie</h3>
            <p class="empty-state__text">Wybierz ćwiczenia z katalogu w takiej kolejności, w jakiej chcesz je robić.</p>
        </div>
    `;
}

function renderExerciseRow(item, index, total) {
    return `
        <li class="list__item exercise-row">
            <div class="exercise-row__order">
                <button type="button" class="icon-btn icon-btn--mini" data-action="move-up" data-index="${index}" aria-label="W górę" ${index === 0 ? 'disabled' : ''}>
                    ${renderMaterialIcon('keyboard_arrow_up')}
                </button>
                <button type="button" class="icon-btn icon-btn--mini" data-action="move-down" data-index="${index}" aria-label="W dół" ${index === total - 1 ? 'disabled' : ''}>
                    ${renderMaterialIcon('keyboard_arrow_down')}
                </button>
            </div>
            <button type="button" class="list__body exercise-row__body" data-action="edit-exercise" data-index="${index}">
                <span class="list__title">${escapeHtml(item.name)}</span>
                <span class="list__meta">${item.repMin}–${item.repMax} powt. · +${escapeHtml(String(item.increment))} kg</span>
            </button>
            <button type="button" class="icon-btn icon-btn--danger" data-action="remove-exercise" data-index="${index}" aria-label="Usuń ćwiczenie ze splitu">
                ${renderMaterialIcon('remove')}
            </button>
        </li>
    `;
}

function renderPlanSaveBar(app, compact = false) {
    if (!app.isPlanDirty()) return '';

    return `
        <div class="action-bar ${compact ? 'action-bar--grid' : ''}">
            ${compact ? `<button type="button" class="btn btn--ghost" data-action="discard-plan">${renderMaterialIcon('undo')}<span>Cofnij</span></button>` : ''}
            <button type="button" class="btn btn--primary" data-action="save-plan">
                ${renderMaterialIcon('save')}<span>Zapisz plan</span>
            </button>
            ${compact ? '' : '<p class="action-bar__hint">Zmiany planu są w pamięci, dopóki nie klikniesz Zapisz.</p>'}
        </div>
    `;
}

function handleClick(app, event) {
    const trigger = event.target.closest('[data-action]');
    if (!trigger) return;

    const index = Number(trigger.dataset.index);
    const actions = {
        'new-container': () => createContainer(app),
        'select-container': () => selectContainer(app, trigger.dataset.container),
        'copy-container': () => copyContainer(app),
        'remove-container': () => removeContainer(app),
        'new-split': () => createSplit(app),
        'edit-split': () => { app.planUI.selectedSplitId = trigger.dataset.split; app.render(); },
        'close-editor': () => { app.planUI.selectedSplitId = null; app.render(); },
        'start-split': () => app.startWorkout(trigger.dataset.container, trigger.dataset.split),
        'remove-split': () => removeSplit(app, trigger.dataset.split),
        'add-exercise': () => openExercisePicker(app),
        'edit-exercise': () => openTargetEditor(app, index),
        'remove-exercise': () => removeExercise(app, index),
        'move-up': () => moveExercise(app, index, -1),
        'move-down': () => moveExercise(app, index, 1),
        'save-plan': () => app.savePlan(),
        'discard-plan': () => app.discardPlanDraft()
    };

    actions[trigger.dataset.action]?.();
}

function handleInput(app, event) {
    const field = event.target.dataset.field;

    if (field === 'container-name') {
        planService.renameContainer(app.draft, app.planUI.containerId, event.target.value);
        app.markPlanDirty();
        return;
    }

    if (field !== 'split-name') return;
    const split = planService.findSplit(app.currentContainer(), app.planUI.selectedSplitId);
    if (!split) return;
    split.name = event.target.value;
    app.markPlanDirty();
}

function selectContainer(app, containerId) {
    app.selectContainer(containerId);
}

async function createContainer(app) {
    const name = await dialogService.prompt('Nazwa zakładki, np. Grudzień', 'Nowa zakładka');
    if (!name) return;
    const container = planService.addContainer(app.draft, name);
    app.selectContainer(container.id);
}

async function copyContainer(app) {
    const container = app.currentContainer();
    const copy = planService.copyContainer(app.draft, container.id);
    if (!copy) return;
    app.markPlanDirty();
    app.selectContainer(copy.id);
    notify(`Skopiowano zakładkę „${container.name}”.`, { type: 'success' });
}

async function removeContainer(app) {
    const container = app.currentContainer();
    const confirmed = await dialogService.confirmDanger(
        `Usunąć zakładkę „${container.name}” razem z jej splitami? Historia treningów zostanie bez zmian.`,
        'Usuń zakładkę'
    );
    if (!confirmed) return;

    planService.removeContainer(app.draft, container.id);
    app.planUI.selectedSplitId = null;
    app.markPlanDirty();
}

async function createSplit(app) {
    const name = await dialogService.prompt('Nazwa splitu, np. Upper A', 'Nowy split');
    if (!name) return;
    planService.addSplit(app.draft, app.planUI.containerId, name);
    app.markPlanDirty();
}

async function removeSplit(app, splitId) {
    const container = app.currentContainer();
    const split = planService.findSplit(container, splitId);
    if (!split) return;
    const confirmed = await dialogService.confirmDanger(`Usunąć split „${split.name}” razem z jego ćwiczeniami?`, 'Usuń split');
    if (!confirmed) return;

    planService.removeSplit(container, splitId);
    app.planUI.selectedSplitId = null;
    app.markPlanDirty();
}

function removeExercise(app, index) {
    planService.removeSplitExercise(app.draft, app.planUI.selectedSplitId, index);
    app.markPlanDirty();
}

function moveExercise(app, index, offset) {
    planService.moveSplitExercise(app.draft, app.planUI.selectedSplitId, index, offset);
    app.markPlanDirty();
}

function openExercisePicker(app) {
    const splitId = app.planUI.selectedSplitId;

    sheetService.open({
        title: 'Wybierz ćwiczenie',
        searchPlaceholder: 'Szukaj w katalogu',
        actions: [{ label: 'Gotowe', variant: 'primary' }],
        render: query => renderCatalog(app, query),
        onPick: exerciseId => {
            planService.addExerciseToSplit(app.draft, app.planUI.containerId, splitId, exerciseId);
            app.markPlanDirty();
            notify('Dodano do splitu.', { type: 'success', duration: 1600 });
        }
    }).then(() => app.render());
}

function renderCatalog(app, query) {
    const needle = String(query || '').trim().toLowerCase();
    const groups = exercisesService.listCatalogGroups(app.exercises)
        .map(group => ({ ...group, exercises: group.exercises.filter(item => item.name.toLowerCase().includes(needle)) }))
        .filter(group => group.exercises.length);

    if (!Object.keys(app.exercises).length) {
        return `
            <div class="empty-state">
                ${renderMaterialIcon('fitness_center')}
                <h3 class="empty-state__title">Katalog jest pusty</h3>
                <p class="empty-state__text">Najpierw dodaj ćwiczenia w zakładce Ćwiczenia.</p>
            </div>
        `;
    }

    return groups.length ? groups.map(group => `
        <div class="sheet-group">
            <span class="sheet-group__title">${escapeHtml(group.group)}</span>
            <ul class="list">
                ${group.exercises.map(item => `
                    <li>
                        <button type="button" class="list__item list__item--button" data-sheet-pick="${item.exerciseId}">
                            <span class="list__body"><span class="list__title">${escapeHtml(item.name)}</span></span>
                            ${renderMaterialIcon('add')}
                        </button>
                    </li>
                `).join('')}
            </ul>
        </div>
    `).join('') : '<div class="empty-state"><p class="empty-state__text">Nic nie znaleziono.</p></div>';
}

function openTargetEditor(app, index) {
    const split = planService.findSplit(app.currentContainer(), app.planUI.selectedSplitId);
    const item = planService.listSplitExercises(app.plan, app.exercises, split)[index];
    if (!item) return;
    const defaults = app.draft.defaults;

    sheetService.open({
        title: item.name,
        actions: [{ label: 'Anuluj' }],
        confirmLabel: 'Zapisz',
        render: () => `
            <div class="form-grid">
                ${renderNumberField('Powt. min', 'repMin', item.repMin, 'integer')}
                ${renderNumberField('Powt. max', 'repMax', item.repMax, 'integer')}
                ${renderNumberField('Skok kg', 'increment', item.increment, 'decimal')}
            </div>
            <p class="action-bar__hint">Globalny zakres to ${defaults.repMin}–${defaults.repMax} powt. i +${escapeHtml(String(defaults.increment))} kg. Te wartości obowiązują tylko w tym splicie — progresja i tak liczy się po ćwiczeniu.</p>
        `,
        onConfirm: () => {
            const values = readTargetValues();
            if (values.repMin > values.repMax) {
                notify('Powtórzenia min nie mogą być większe niż max.', { type: 'warning' });
                return false;
            }
            planService.updateSplitExercise(app.draft, app.planUI.selectedSplitId, index, values);
            app.markPlanDirty();
            return true;
        }
    }).then(() => app.render());
}

function renderNumberField(label, field, value, mode) {
    return `
        <div class="field">
            <label class="field__label" for="field-${field}">${escapeHtml(label)}</label>
            <input class="text-input numeric" id="field-${field}" type="text" inputmode="${mode === 'integer' ? 'numeric' : 'decimal'}"
                value="${escapeHtml(String(value))}" data-form="${field}" data-mode="${mode}">
        </div>
    `;
}

function readTargetValues() {
    const values = {};

    document.querySelectorAll('[data-form]').forEach(element => {
        const field = element.dataset.form;
        const raw = element.dataset.mode === 'integer' ? sanitizeInteger(element.value) : sanitizeDecimal(element.value);
        values[field] = element.dataset.mode === 'integer' ? Number.parseInt(raw, 10) || 0 : Number.parseFloat(raw) || 0;
    });

    return values;
}

function plural(count, one, few, many) {
    if (count === 1) return one;
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14)) return few;
    return many;
}
