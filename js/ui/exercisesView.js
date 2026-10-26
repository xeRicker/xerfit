import { escapeHtml, formatDate, formatWeight, renderMaterialIcon } from '../utils.js';
import { exercisesService } from '../services/exercisesService.js';
import { planService } from '../services/planService.js';
import { workoutAnalysis } from '../services/workoutAnalysis.js';
import { dialogService, notify, sheetService } from './components/dialogs.js';
import { renderRecentSessions } from './sessions.js';

export function createExercisesView(app) {
    return {
        render() {
            if (app.exercisesUI.exerciseId) return renderDetail(app);
            return renderCatalog(app);
        },

        bind(root) {
            root.addEventListener('click', event => {
                const trigger = event.target.closest('[data-action]');
                if (!trigger) return;

                const action = trigger.dataset.action;
                const exerciseId = trigger.dataset.exercise;

                if (action === 'open-exercise') {
                    app.go(`#/exercises/${exerciseId}`);
                }
                if (action === 'close-exercise') {
                    app.go('#/exercises');
                }
                if (action === 'new-exercise') openExerciseForm(app, null);
                if (action === 'rename-exercise') openExerciseForm(app, exerciseId);
                if (action === 'remove-exercise') removeExercise(app, exerciseId);
                if (action === 'save-exercises') app.saveExercises();
                if (action === 'discard-exercises') app.discardExercisesDraft();
            });

            root.addEventListener('input', event => {
                if (event.target.dataset.field !== 'exercise-search') return;
                app.exercisesUI.query = event.target.value;
                const list = root.querySelector('[data-exercise-list]');
                if (list) list.innerHTML = renderRows(app, app.exercisesUI.query);
            });
        },

        patch() {
            const search = document.querySelector('[data-field="exercise-search"]');
            if (search && search.value !== app.exercisesUI.query) search.value = app.exercisesUI.query;

            const list = document.querySelector('[data-exercise-list]');
            if (list) list.innerHTML = renderRows(app, app.exercisesUI.query);

            const barHost = document.getElementById('exercises-save-bar');
            const wanted = renderCatalogSaveBar(app);
            if (barHost && barHost.innerHTML !== wanted) barHost.innerHTML = wanted;
        }
    };
}

function renderCatalog(app) {
    const total = Object.keys(app.draftExercises).length;

    return `
        <div class="view-header">
            <h2 class="view-header__title">Ćwiczenia</h2>
            <p class="view-header__subtitle">${total} ${plural(total, 'ćwiczenie', 'ćwiczenia', 'ćwiczeń')} · wspólny dla wszystkich zakładek</p>
        </div>

        <input class="text-input" type="search" placeholder="Szukaj ćwiczenia" value="${escapeHtml(app.exercisesUI.query)}" data-field="exercise-search" aria-label="Szukaj ćwiczenia">

        ${total ? `<div data-exercise-list>${renderRows(app, app.exercisesUI.query)}</div>` : renderEmptyCatalog()}

        <button type="button" class="btn btn--ghost btn--block" data-action="new-exercise">
            ${renderMaterialIcon('add')}<span>Nowe ćwiczenie</span>
        </button>
        <div id="exercises-save-bar">${renderCatalogSaveBar(app)}</div>
    `;
}

function renderEmptyCatalog() {
    return `
        <div class="empty-state">
            ${renderMaterialIcon('fitness_center')}
            <h3 class="empty-state__title">Katalog jest pusty</h3>
            <p class="empty-state__text">Dodaj ćwiczenie raz i wybieraj je w dowolnym splicie. Progresja liczy się po ćwiczeniu, nie po splicie.</p>
        </div>
    `;
}

function renderRows(app, query) {
    const needle = String(query || '').trim().toLowerCase();
    const list = exercisesService.listCatalog(app.draftExercises)
        .filter(exercise => !needle || exercise.name.toLowerCase().includes(needle));

    if (!list.length) {
        return '<div class="empty-state"><p class="empty-state__text">Nic nie znaleziono.</p></div>';
    }

    const weights = workoutAnalysis.currentWeights(app.draftExercises, app.workouts);

    return `
        <div class="card card--flush">
            <ul class="list">
                ${list.map(exercise => renderRow(app, exercise, weights)).join('')}
            </ul>
        </div>
    `;
}

function renderRow(app, exercise, weights) {
    const stats = weights.find(item => item.exerciseId === exercise.exerciseId);
    const usage = planService.usageOfExercise(app.draft, exercise.exerciseId).length;
    const usageLabel = `${usage} ${plural(usage, 'split', 'splity', 'splitów')}`;
    const meta = stats?.lastDate ? `${formatDate(stats.lastDate)} · ${usageLabel}` : `brak treningów · ${usageLabel}`;

    return `
        <li class="list__item exercise-list-item">
            <button type="button" class="exercise-row__button" data-action="open-exercise" data-exercise="${exercise.exerciseId}">
                <span class="exercise-row__text">
                    <span class="exercise-row__name">${escapeHtml(exercise.name)}</span>
                    <span class="exercise-row__meta">${escapeHtml(meta)}</span>
                </span>
                <span class="exercise-row__value numeric">${stats?.weight ? `${escapeHtml(formatWeight(stats.weight))} kg` : '—'}</span>
                ${renderMaterialIcon('chevron_right', 'exercise-row__chevron')}
            </button>
            ${stats?.isPlateau ? `<span class="badge badge--hold exercise-row__flag">Plateau</span>` : ''}
        </li>
    `;
}

function renderDetail(app) {
    const exerciseId = app.exercisesUI.exerciseId;
    const exercise = exercisesService.describeExercise(app.draftExercises, exerciseId);
    const history = workoutAnalysis.historyForExercise(app.workouts, exerciseId);
    const usage = planService.usageOfExercise(app.draft, exerciseId);
    const last = history.at(-1);
    const lastSets = last ? workoutAnalysis.completedSets(last.entry) : [];
    const lastTopWeight = lastSets.length ? Math.max(...lastSets.map(set => Number(set.weight))) : 0;

    return `
        <div class="editor-head">
            <button type="button" class="icon-btn" data-action="close-exercise" aria-label="Wróć do katalogu">
                ${renderMaterialIcon('arrow_back')}
            </button>
            <h2 class="editor-head__title">${escapeHtml(exercise.name)}</h2>
        </div>

        <div class="detail-facts">
            <span class="detail-fact">
                <span class="detail-fact__label">Ostatnio</span>
                <span class="detail-fact__value numeric">${last ? `${escapeHtml(formatWeight(lastTopWeight))} kg` : '—'}</span>
            </span>
            <span class="detail-fact">
                <span class="detail-fact__label">1RM</span>
                <span class="detail-fact__value numeric">${last ? `${escapeHtml(formatWeight(Math.round(last.bestOneRepMax * 10) / 10))} kg` : '—'}</span>
            </span>
            <span class="detail-fact">
                <span class="detail-fact__label">Treningi</span>
                <span class="detail-fact__value numeric">${history.length}</span>
            </span>
        </div>

        <div class="detail-actions">
            <a class="btn btn--primary btn--block" href="#/history/${exerciseId}">
                ${renderMaterialIcon('show_chart')}<span>Wykres progresji</span>
            </a>
            <div class="detail-actions__row">
                <button type="button" class="btn btn--ghost" data-action="rename-exercise" data-exercise="${exerciseId}">
                    ${renderMaterialIcon('edit')}<span>Zmień nazwę</span>
                </button>
                <button type="button" class="btn btn--danger" data-action="remove-exercise" data-exercise="${exerciseId}">
                    ${renderMaterialIcon('delete')}<span>Usuń</span>
                </button>
            </div>
        </div>

        <section class="section">
            <div class="section__head">
                <h3 class="section__title">W splitach</h3>
                <span class="section__hint">${usage.length} ${plural(usage.length, 'raz', 'razy', 'razy')}</span>
            </div>
            ${usage.length ? `
                <div class="chip-row">
                    ${usage.map(item => `
                        <span class="chip chip--static">
                            ${renderMaterialIcon('splitscreen')}
                            ${escapeHtml(item.splitName)} · ${escapeHtml(item.containerName)}
                        </span>
                    `).join('')}
                </div>
            ` : '<p class="section__hint">To ćwiczenie nie jest teraz w żadnym splicie.</p>'}
        </section>

        <section class="section">
            <div class="section__head">
                <h3 class="section__title">Ostatnie serie</h3>
                <span class="section__hint">${history.length} ${plural(history.length, 'trening', 'treningi', 'treningów')}</span>
            </div>
            ${renderRecentSessions(history, 6)}
        </section>
    `;
}

function renderCatalogSaveBar(app) {
    if (!app.isExercisesDirty()) return '';

    return `
        <div class="action-bar action-bar--grid">
            <button type="button" class="btn btn--ghost" data-action="discard-exercises">${renderMaterialIcon('undo')}<span>Cofnij</span></button>
            <button type="button" class="btn btn--primary" data-action="save-exercises">${renderMaterialIcon('save')}<span>Zapisz</span></button>
        </div>
    `;
}

function openExerciseForm(app, exerciseId) {
    const exercise = exerciseId ? exercisesService.describeExercise(app.draftExercises, exerciseId) : { name: '' };

    sheetService.open({
        title: exerciseId ? 'Zmień nazwę' : 'Nowe ćwiczenie',
        actions: [{ label: 'Anuluj' }],
        confirmLabel: exerciseId ? 'Zapisz' : 'Dodaj',
        render: () => `
            <div class="field">
                <label class="field__label" for="exerciseName">Nazwa</label>
                <input class="text-input" id="exerciseName" type="text" value="${escapeHtml(exercise.name)}" data-form="name" placeholder="np. Wyciskanie na smithie">
            </div>
        `,
        onConfirm: () => {
            const name = document.getElementById('exerciseName')?.value.trim() || '';

            if (!name) {
                notify('Podaj nazwę ćwiczenia.', { type: 'warning' });
                return false;
            }
            if (exerciseId) exercisesService.updateExercise(app.draftExercises, exerciseId, { name });
            else exercisesService.addExercise(app.draftExercises, { name });

            app.markExercisesDirty();
            return true;
        }
    }).then(() => app.render());
}

async function removeExercise(app, exerciseId) {
    const exercise = exercisesService.describeExercise(app.draftExercises, exerciseId);
    const usage = planService.usageOfExercise(app.draft, exerciseId);
    const history = workoutAnalysis.historyForExercise(app.workouts, exerciseId);
    const details = [];

    if (usage.length) details.push(`Jest w ${usage.length} ${plural(usage.length, 'splicie', 'splitach', 'splitach')} — zniknie z nich.`);
    if (history.length) details.push(`Historia ${history.length} ${plural(history.length, 'treningu', 'treningów', 'treningów')} zostanie w bazie.`);

    const confirmed = await dialogService.confirmDanger(
        `Usunąć ćwiczenie „${exercise.name}”? ${details.join(' ')}`,
        'Usuń ćwiczenie'
    );
    if (!confirmed) return;

    delete app.draftExercises[exerciseId];
    app.draft.containers.forEach(container => {
        container.splits.forEach(split => {
            split.exercises = split.exercises.filter(item => item.exerciseId !== exerciseId);
        });
    });

    app.exercisesUI.exerciseId = null;
    app.markExercisesDirty();
    app.markPlanDirty();
    notify('Ćwiczenie usunięte z katalogu i splitów.', { type: 'info' });
}

function plural(count, one, few, many) {
    if (count === 1) return one;
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14)) return few;
    return many;
}
