import { WORKOUT_CONFIG } from '../config/config.js';
import { escapeHtml, formatDate, formatDateShort, formatDuration, formatVolume, formatWeight, renderMaterialIcon, formatWeekday } from '../utils.js';
import { workoutAnalysis } from '../services/workoutAnalysis.js';
import { renderLineChart } from './charts.js';

const METRICS = {
    weight: { label: 'Ciężar', unit: 'kg', value: item => Math.max(...workoutAnalysis.completedSets(item.entry).map(set => Number(set.weight))) },
    oneRepMax: { label: '1RM', unit: 'kg', value: item => item.bestOneRepMax },
    reps: { label: 'Powtórzenia', unit: 'powt.', value: item => Math.max(...workoutAnalysis.completedSets(item.entry).map(set => Number(set.reps))) },
    volume: { label: 'Objętość', unit: 'kg', value: item => item.volume }
};

export function createHistoryView(app) {
    return {
        render() {
            if (app.historyUI.exerciseId) return renderExerciseDetail(app);
            if (app.historyUI.tab === 'exercises') return renderExerciseList(app);
            return renderWorkoutList(app);
        },

        bind(root) {
            root.addEventListener('click', event => {
                const trigger = event.target.closest('[data-action]');
                if (!trigger) return;

                const action = trigger.dataset.action;
                if (action === 'history-tab') {
                    app.historyUI.tab = trigger.dataset.tab;
                    app.historyUI.exerciseId = null;
                    app.render();
                }
                if (action === 'open-exercise') {
                    app.historyUI.tab = 'exercises';
                    app.historyUI.exerciseId = trigger.dataset.exercise;
                    app.render();
                }
                if (action === 'close-exercise') {
                    app.historyUI.exerciseId = null;
                    app.render();
                }
                if (action === 'metric') {
                    app.historyUI.metric = trigger.dataset.metric;
                    app.render();
                }
                if (action === 'toggle-workout') {
                    const id = trigger.dataset.session;
                    app.historyUI.openSessionId = app.historyUI.openSessionId === id ? null : id;
                    app.render();
                }
            });
        }
    };
}

function renderTabs(app) {
    const tabs = [
        { id: 'workouts', label: 'Treningi' },
        { id: 'exercises', label: 'Ćwiczenia' }
    ];

    return `
        <div class="segmented" role="tablist" aria-label="Widok historii">
            ${tabs.map(tab => `
                <button type="button" class="segmented__item" role="tab" data-action="history-tab" data-tab="${tab.id}"
                    aria-selected="${app.historyUI.tab === tab.id}">${tab.label}</button>
            `).join('')}
        </div>
    `;
}

function renderWorkoutList(app) {
    const sessions = [...app.workouts].reverse();

    return `
        ${renderTabs(app)}
        ${sessions.length ? `<div class="history-list">${sessions.map(session => renderSessionCard(app, session)).join('')}</div>` : `
            <div class="empty-state">
                ${renderMaterialIcon('history')}
                <h3 class="empty-state__title">Brak treningów</h3>
                <p class="empty-state__text">Zakończony trening pojawi się tutaj razem z objętością i progresem.</p>
            </div>
        `}
    `;
}

function renderSessionCard(app, session) {
    const isOpen = app.historyUI.openSessionId === session.id;
    const performed = session.exercises.filter(entry => workoutAnalysis.completedSets(entry).length);

    return `
        <article class="card history-card">
            <button type="button" class="history-card__head" data-action="toggle-workout" data-session="${session.id}">
                <span class="history-card__titles">
                    <span class="history-card__name">${escapeHtml(session.splitName)}</span>
                    <span class="history-card__date">${escapeHtml(session.containerName ? `${session.containerName} · ` : '')}${escapeHtml(formatWeekday(session.date))}, ${escapeHtml(formatDate(session.date))}</span>
                </span>
                ${renderMaterialIcon(isOpen ? 'expand_less' : 'expand_more')}
            </button>
            <div class="history-card__stats">
                <span class="badge badge--plain">${renderMaterialIcon('schedule')}<span>${escapeHtml(formatDuration(session.startedAt, session.finishedAt))}</span></span>
                <span class="badge badge--plain">${renderMaterialIcon('weight')}<span>${escapeHtml(formatVolume(session.volume))} kg</span></span>
                <span class="badge badge--plain">${renderMaterialIcon('fitness_center')}<span>${performed.length}</span></span>
            </div>
            ${isOpen ? `
                <ul class="list history-card__body">
                    ${session.exercises.map(entry => renderSessionExercise(entry)).join('')}
                </ul>
            ` : ''}
        </article>
    `;
}

function renderSessionExercise(entry) {
    const sets = workoutAnalysis.completedSets(entry);
    const value = sets.length ? sets.map(set => `${formatWeight(set.weight)}×${set.reps}`).join(' · ') : 'brak serii';

    return `
        <li class="list__item">
            <span class="list__body">
                <span class="list__title">${escapeHtml(entry.name)}</span>
                <span class="list__meta">${escapeHtml(value)}</span>
            </span>
            ${entry.skipped ? '<span class="badge badge--muted">Pominięte</span>' : ''}
        </li>
    `;
}

function renderExerciseList(app) {
    const weights = workoutAnalysis.currentWeights(app.exercises, app.workouts);

    return `
        ${renderTabs(app)}
        ${weights.length ? `
            <div class="card card--flush">
                <ul class="list">
                    ${weights.map(item => `
                        <li>
                            <button type="button" class="list__item list__item--button" data-action="open-exercise" data-exercise="${item.exerciseId}">
                                <span class="list__body">
                                    <span class="list__title">${escapeHtml(item.name)}</span>
                                    <span class="list__meta">${item.lastDate ? `${escapeHtml(formatDate(item.lastDate))} · ${item.sessions} ${sessionWord(item.sessions)}` : 'brak treningów'}</span>
                                </span>
                                <span class="exercise-weight">
                                    <span class="list__value">${item.weight ? `${escapeHtml(formatWeight(item.weight))} kg` : '—'}</span>
                                    ${item.isPlateau ? '<span class="badge badge--hold">Plateau</span>' : ''}
                                </span>
                            </button>
                        </li>
                    `).join('')}
                </ul>
            </div>
        ` : `
            <div class="empty-state">
                ${renderMaterialIcon('fitness_center')}
                <p class="empty-state__text">Dodaj ćwiczenia do splitu, żeby zobaczyć aktualne ciężary.</p>
            </div>
        `}
    `;
}

function renderExerciseDetail(app) {
    const exerciseId = app.historyUI.exerciseId;
    const exercise = app.exercises[exerciseId] || { name: 'Ćwiczenie', group: '' };
    const history = workoutAnalysis.historyForExercise(app.workouts, exerciseId);
    const metricKey = app.historyUI.metric;
    const metric = METRICS[metricKey] || METRICS.weight;
    const points = history.slice(-WORKOUT_CONFIG.CHART_POINTS).map(item => ({
        label: formatDateShort(item.date),
        value: metric.value(item)
    }));
    const last = history.at(-1);
    const first = history[0];
    const change = last && first && history.length > 1 ? metric.value(last) - metric.value(first) : 0;

    return `
        <div class="editor-head">
            <button type="button" class="icon-btn" data-action="close-exercise" aria-label="Wróć do listy ćwiczeń">
                ${renderMaterialIcon('arrow_back')}
            </button>
            <span class="editor-head__name editor-head__name--static">
                <span class="list__title">${escapeHtml(exercise.name)}</span>
                <span class="list__meta">${escapeHtml(exercise.group)}</span>
            </span>
        </div>

        ${history.length ? `
            <div class="card">
                <div class="stat-grid">
                    <div class="stat">
                        <span class="stat__label">Teraz</span>
                        <span class="stat__value numeric">${escapeHtml(formatWeight(metric.value(last)))}</span>
                        <span class="stat__unit">${escapeHtml(metric.unit)}</span>
                    </div>
                    <div class="stat">
                        <span class="stat__label">Zmiana</span>
                        <span class="stat__value numeric ${change > 0 ? 'accent' : ''}">${change > 0 ? '+' : ''}${escapeHtml(formatWeight(change))}</span>
                        <span class="stat__unit">od ${escapeHtml(formatDate(first.date))}</span>
                    </div>
                </div>

                <div class="chip-row">
                    ${Object.entries(METRICS).map(([key, value]) => `
                        <button type="button" class="chip" data-action="metric" data-metric="${key}" aria-pressed="${key === metricKey}">${value.label}</button>
                    `).join('')}
                </div>

                ${renderLineChart(points, {
                    ariaLabel: `${metric.label} w czasie`,
                    valueFormat: value => formatWeight(Math.round(value * 10) / 10)
                })}
            </div>

            <section class="section">
                <h3 class="section__title">Ostatnie serie</h3>
                <div class="card card--flush">
                    <ul class="list">
                        ${[...history].reverse().slice(0, 8).map(item => `
                            <li class="list__item">
                                <span class="list__body">
                                    <span class="list__title numeric">${escapeHtml(workoutAnalysis.formatSetPlan(item.entry))}</span>
                                    <span class="list__meta">${escapeHtml(formatDate(item.date))} · 1RM ${escapeHtml(formatWeight(Math.round(item.bestOneRepMax * 10) / 10))} kg</span>
                                </span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </section>
        ` : `
            <div class="empty-state">
                ${renderMaterialIcon('show_chart')}
                <h3 class="empty-state__title">Brak historii</h3>
                <p class="empty-state__text">Wykres pojawi się po pierwszym treningu z tym ćwiczeniem.</p>
            </div>
        `}
    `;
}

function sessionWord(count) {
    if (count === 1) return 'trening';
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14)) return 'treningi';
    return 'treningów';
}
