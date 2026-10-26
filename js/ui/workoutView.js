import { escapeHtml, formatWeight, renderMaterialIcon, sanitizeDecimal, sanitizeInteger } from '../utils.js';
import { workoutService } from '../services/workoutService.js';
import { workoutAnalysis } from '../services/workoutAnalysis.js';
import { dialogService, notify, sheetService, showCelebration } from './components/dialogs.js';

const SUGGESTION_ICONS = {
    up: 'trending_up',
    'up-reps': 'add_chart',
    hold: 'remove',
    down: 'trending_down',
    muted: 'more_horiz'
};

export function createWorkoutView(app) {
    return {
        render() {
            const session = app.session;
            const entry = workoutService.getCurrentEntry(session);
            if (!session || !entry) return renderMissingSession();

            const status = workoutService.entryStatus(entry);
            const progress = workoutService.summary(session);
            const activeIndex = app.activeSetIndex();

            return `
                <header class="app-header">
                    <div class="workout-topbar">
                        <span class="workout-topbar__position numeric">${session.currentIndex + 1}/${session.exercises.length}</span>
                        <span class="workout-topbar__split">${escapeHtml(session.splitName)} · ${escapeHtml(session.containerName)}</span>
                    </div>
                    <div class="workout-topbar__actions">
                        <button type="button" class="icon-btn" data-action="exit" aria-label="Wyjdź z treningu, wróć później">
                            ${renderMaterialIcon('minimize')}
                        </button>
                        <button type="button" class="icon-btn" data-action="finish" aria-label="Zakończ trening">
                            ${renderMaterialIcon('flag')}
                        </button>
                    </div>
                </header>

                ${renderProgressBar(progress)}

                <section class="exercise-stage">
                    <div class="exercise-stage__head">
                        <h2 class="exercise-stage__name">${escapeHtml(entry.name)}</h2>
                        <span class="badge badge--plain">${escapeHtml(entry.group)}</span>
                    </div>
                    ${renderPrevious(entry)}
                    ${renderInputs(entry, activeIndex)}
                    ${renderSuggestion(entry)}
                </section>

                ${renderSetList(entry, status, activeIndex)}
                ${renderBottomActions(app, entry, status)}
            `;
        },

        bind(root) {
            root.addEventListener('click', event => handleClick(app, event));
            root.addEventListener('input', event => handleInput(app, event));
        }
    };
}

function renderMissingSession() {
    return `
        <div class="empty-state">
            ${renderMaterialIcon('fitness_center')}
            <h3 class="empty-state__title">Brak aktywnego treningu</h3>
            <p class="empty-state__text">Wybierz split i kliknij Startuj, żeby zacząć.</p>
            <a class="btn btn--primary btn--compact" href="#/plan">Wróć do planu</a>
        </div>
    `;
}

function renderProgressBar(progress) {
    return `
        <div class="workout-progress" role="progressbar" aria-valuenow="${progress.progressPercent}" aria-valuemin="0" aria-valuemax="100" aria-label="Postęp treningu">
            <span class="workout-progress__fill" style="width:${progress.progressPercent}%"></span>
        </div>
    `;
}

function renderPrevious(entry) {
    if (!entry.previous) {
        return `
            <p class="previous-line">
                <span class="previous-line__label">Pierwszy raz</span>
                <span class="previous-line__value muted">brak historii</span>
            </p>
        `;
    }

    return `
        <p class="previous-line">
            <span class="previous-line__label">Poprzednio</span>
            <span class="previous-line__value numeric">${formatWeight(entry.previous.weight)} kg × ${entry.previous.reps} powt.</span>
        </p>
    `;
}

function renderInputs(entry, activeIndex) {
    const set = entry.sets[activeIndex] || entry.sets[0];
    const isAssisted = Number(set?.weight) < 0;
    const hint = isAssisted
        ? `Asysta ${formatWeight(Math.abs(Number(set.weight)))} kg · wpisz 0 dla masy własnej`
        : `Zakres ${entry.repMin}–${entry.repMax} powt. · edytujesz serię ${activeIndex + 1} z ${entry.sets.length}`;

    return `
        <div class="logger">
            <div class="logger__field">
                <span class="logger__label">Ciężar</span>
                <div class="logger__row">
                    <button type="button" class="logger__step" data-action="adjust" data-field="weight" data-delta="-1" aria-label="Zmniejsz ciężar">
                        ${renderMaterialIcon('remove')}
                    </button>
                    <div class="logger__input-wrap">
                        <input class="logger__input numeric" type="text" inputmode="decimal" value="${formatWeight(set?.weight ?? 0)}" data-input="weight" aria-label="Ciężar w kilogramach">
                        <span class="logger__unit">kg</span>
                    </div>
                    <button type="button" class="logger__step" data-action="adjust" data-field="weight" data-delta="1" aria-label="Zwiększ ciężar">
                        ${renderMaterialIcon('add')}
                    </button>
                </div>
            </div>

            <div class="logger__field">
                <span class="logger__label">Powtórzenia</span>
                <div class="logger__row">
                    <button type="button" class="logger__step" data-action="adjust" data-field="reps" data-delta="-1" aria-label="Zmniejsz powtórzenia">
                        ${renderMaterialIcon('remove')}
                    </button>
                    <div class="logger__input-wrap">
                        <input class="logger__input numeric" type="text" inputmode="numeric" value="${set?.reps ?? entry.repMax}" data-input="reps" aria-label="Liczba powtórzeń">
                        <span class="logger__unit">powt.</span>
                    </div>
                    <button type="button" class="logger__step" data-action="adjust" data-field="reps" data-delta="1" aria-label="Zwiększ powtórzenia">
                        ${renderMaterialIcon('add')}
                    </button>
                </div>
            </div>
        </div>
        <p class="logger__hint ${isAssisted ? 'logger__hint--assist' : ''}">${escapeHtml(hint)}</p>
    `;
}

function renderSuggestion(entry) {
    const suggestion = workoutService.recommendationFor(entry);
    const level = suggestion.level === 'up-reps' ? 'up' : suggestion.level;
    const icon = SUGGESTION_ICONS[suggestion.level] || 'insights';

    return `
        <div class="suggestion">
            <span class="badge badge--${level}">${renderMaterialIcon(icon)}<span>${escapeHtml(suggestion.headline)}</span></span>
            <span class="suggestion__detail">${escapeHtml(suggestion.detail)}</span>
        </div>
    `;
}

function renderSetList(entry, status, activeIndex) {
    return `
        <section class="set-list">
            <div class="section__head">
                <h3 class="section__title">Serie</h3>
                <span class="section__hint">${status === 'skipped' ? 'Pominięte' : `${workoutAnalysis.completedSets(entry).length} z ${entry.sets.length}`}</span>
            </div>
            <ul class="set-chips">
                ${entry.sets.map((set, index) => `
                    <li class="set-chip ${set.done ? 'is-done' : ''} ${index === activeIndex ? 'is-active' : ''}">
                        <button type="button" class="set-chip__main" data-action="toggle-set" data-index="${index}">
                            <span class="set-chip__index">${set.done ? renderMaterialIcon('check') : index + 1}</span>
                            <span class="set-chip__value numeric">${formatWeight(set.weight)} kg × ${set.reps}</span>
                        </button>
                        <button type="button" class="set-chip__edit" data-action="edit-set" data-index="${index}" aria-label="Edytuj serię ${index + 1}">
                            ${renderMaterialIcon('edit')}
                        </button>
                        ${entry.sets.length > 1 ? `
                            <button type="button" class="set-chip__remove" data-action="remove-set" data-index="${index}" aria-label="Usuń serię ${index + 1}">
                                ${renderMaterialIcon('close')}
                            </button>
                        ` : ''}
                    </li>
                `).join('')}
            </ul>
            <button type="button" class="btn btn--ghost btn--block btn--compact" data-action="add-set">
                ${renderMaterialIcon('add')}<span>Dodaj serię</span>
            </button>
        </section>
    `;
}

function renderBottomActions(app, entry, status) {
    const allDone = status !== 'skipped' && workoutAnalysis.completedSets(entry).length >= entry.sets.length;
    const isFirst = app.session.currentIndex === 0;
    const isLast = app.session.currentIndex === app.session.exercises.length - 1;

    return `
        <div class="workout-actions">
            <div class="workout-nav">
                <button type="button" class="workout-nav__step" data-action="step-prev" aria-label="Poprzednie ćwiczenie" ${isFirst ? 'disabled' : ''}>
                    ${renderMaterialIcon('chevron_left')}
                </button>
                <button type="button" class="btn btn--ghost" data-action="skip">
                    ${renderMaterialIcon(entry.skipped ? 'undo' : 'block')}<span>${entry.skipped ? 'Przywróć' : 'Pomiń'}</span>
                </button>
                <button type="button" class="workout-nav__step" data-action="step-next" aria-label="Następne ćwiczenie" ${isLast ? 'disabled' : ''}>
                    ${renderMaterialIcon('chevron_right')}
                </button>
            </div>
            <button type="button" class="btn btn--primary btn--large btn--block" data-action="confirm-set">
                ${renderMaterialIcon('check')}<span>${allDone ? 'Popraw serię' : 'Zapisz serię'}</span>
            </button>
        </div>
    `;
}

function handleClick(app, event) {
    const trigger = event.target.closest('[data-action]');
    if (!trigger || !app.session) return;

    const index = Number(trigger.dataset.index);
    const action = trigger.dataset.action;

    if (action === 'adjust') {
        workoutService.adjustSet(app.session, app.activeSetIndex(), trigger.dataset.field, Number(trigger.dataset.delta));
        app.render();
        return;
    }
    if (action === 'add-set') {
        workoutService.addSet(app.session);
        app.render();
        return;
    }
    if (action === 'remove-set') {
        workoutService.removeSet(app.session, index);
        app.render();
        return;
    }
    if (action === 'toggle-set') {
        workoutService.toggleSetDone(app.session, index);
        app.render();
        return;
    }
    if (action === 'edit-set') {
        openSetEditor(app, index);
        return;
    }
    if (action === 'confirm-set') {
        commitAndAdvance(app);
        return;
    }
    if (action === 'step-prev') {
        workoutService.step(app.session, -1);
        app.render();
        return;
    }
    if (action === 'step-next') {
        workoutService.step(app.session, 1);
        app.render();
        return;
    }
    if (action === 'skip') {
        workoutService.toggleSkipped(app.session);
        app.render();
        return;
    }
    if (action === 'exit') {
        app.exitWorkout();
        return;
    }
    if (action === 'finish') {
        app.finishWorkout();
    }
}

function handleInput(app, event) {
    const field = event.target.dataset.input;
    if (!field) return;
    const cleaned = field === 'weight' ? sanitizeDecimal(event.target.value) : sanitizeInteger(event.target.value);
    if (event.target.value !== cleaned) event.target.value = cleaned;
}

function openSetEditor(app, index) {
    const entry = workoutService.getCurrentEntry(app.session);
    const set = entry?.sets?.[index];
    if (!set) return;

    sheetService.open({
        title: `Seria ${index + 1}`,
        actions: [{ label: 'Anuluj' }],
        confirmLabel: 'Zapisz serię',
        render: () => `
            <div class="form-grid">
                <div class="field">
                    <label class="field__label" for="setWeight">Ciężar (kg)</label>
                    <input class="text-input numeric" id="setWeight" type="text" inputmode="decimal" data-mode="decimal" value="${formatWeight(set.weight)}">
                </div>
                <div class="field">
                    <label class="field__label" for="setReps">Powtórzenia</label>
                    <input class="text-input numeric" id="setReps" type="text" inputmode="numeric" data-mode="integer" value="${set.reps}">
                </div>
            </div>
        `,
        onConfirm: () => {
            const weight = Number.parseFloat(document.getElementById('setWeight')?.value.replace(',', '.')) || 0;
            const reps = Number.parseInt(document.getElementById('setReps')?.value, 10) || 0;
            workoutService.updateSetAt(app.session, app.session.currentIndex, index, { weight, reps });
            app.render();
            return true;
        }
    }).then(() => app.render());
}

function readInputs() {
    const weightInput = document.querySelector('[data-input="weight"]');
    const repsInput = document.querySelector('[data-input="reps"]');
    const rawWeight = String(weightInput?.value ?? '').trim();
    return {
        weight: rawWeight === '' ? 0 : Number.parseFloat(rawWeight.replace(',', '.')),
        reps: Number.parseInt(repsInput?.value || '', 10) || 0
    };
}

function commitAndAdvance(app) {
    const session = app.session;
    const entry = workoutService.getCurrentEntry(session);
    const index = app.activeSetIndex();
    const { weight, reps } = readInputs();

    if (!Number.isFinite(weight)) {
        dialogService.alert('Wpisz ciężar, 0 dla masy własnej albo wartość ujemną dla asysty.', 'Brak ciężaru');
        return;
    }
    if (reps <= 0) {
        dialogService.alert('Wpisz liczbę powtórzeń.', 'Brak powtórzeń');
        return;
    }

    const isRecord = entry.previous && workoutAnalysis.isPersonalRecord(app.workouts, session.id, {
        ...entry,
        sets: entry.sets.map((set, position) => (position === index ? { weight, reps, done: true } : set))
    });

    workoutService.updateSet(session, index, { weight, reps, done: true });
    if (entry.skipped) workoutService.toggleSkipped(session);

    if (isRecord) {
        showCelebration({
            title: 'Nowy rekord',
            headline: `${formatWeight(weight)} kg × ${reps}`,
            detail: entry.name
        });
    }

    if (entry.sets.every(set => workoutAnalysis.isCompletedSet(set))) {
        app.advanceAfterExercise();
        return;
    }
    app.render();
}
