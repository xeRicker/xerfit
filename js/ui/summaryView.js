import { escapeHtml, formatDate, formatDuration, formatVolume, formatWeight, formatSignedWeight, renderMaterialIcon } from '../utils.js';
import { workoutAnalysis } from '../services/workoutAnalysis.js';
import { renderSaveStatus } from './components/saveStatus.js';

export function createSummaryView(app) {
    return {
        render() {
            const session = app.summarySession;
            if (!session) {
                return `
                    <div class="empty-state">
                        ${renderMaterialIcon('insights')}
                        <h3 class="empty-state__title">Brak podsumowania</h3>
                        <p class="empty-state__text">Zakończ trening, żeby zobaczyć wyniki.</p>
                        <a class="btn btn--primary btn--compact" href="#/plan">Wróć do planu</a>
                    </div>
                `;
            }

            const performed = session.exercises.filter(entry => workoutAnalysis.completedSets(entry).length);
            const progress = performed
                .map(entry => ({ entry, delta: workoutAnalysis.exerciseProgress(app.workouts, entry.exerciseId) }))
                .filter(item => item.delta?.isProgress);
            const plateaus = performed.filter(entry => workoutAnalysis.isPlateau(app.workouts, entry.exerciseId));

            return `
                <section class="summary-hero">
                    <span class="badge badge--up">${renderMaterialIcon('celebration')}<span>Trening zapisany</span></span>
                    <h2 class="summary-hero__title">Dobra robota!</h2>
                    <p class="summary-hero__subtitle">${escapeHtml(session.splitName)} · ${escapeHtml(session.containerName)} · ${escapeHtml(formatDate(session.date))}</p>
                </section>

                <div class="stat-grid">
                    <div class="stat">
                        <span class="stat__label">Czas</span>
                        <span class="stat__value numeric">${escapeHtml(formatDuration(session.startedAt, session.finishedAt))}</span>
                    </div>
                    <div class="stat">
                        <span class="stat__label">Objętość</span>
                        <span class="stat__value numeric">${escapeHtml(formatVolume(workoutAnalysis.sessionVolume(session)))}</span>
                        <span class="stat__unit">kg</span>
                    </div>
                    <div class="stat">
                        <span class="stat__label">Serie</span>
                        <span class="stat__value numeric">${workoutAnalysis.sessionSetCount(session)}</span>
                    </div>
                    <div class="stat">
                        <span class="stat__label">Ćwiczenia</span>
                        <span class="stat__value numeric">${performed.length}</span>
                    </div>
                </div>

                ${renderSaveStatus(app.summarySave)}

                <section class="section">
                    <h3 class="section__title">Progres</h3>
                    ${progress.length ? `<div class="card card--flush"><ul class="list">${progress.map(item => renderProgressRow(item)).join('')}</ul></div>` : renderNoProgress()}
                </section>

                ${plateaus.length ? `
                    <section class="section">
                        <div class="section__head">
                            <h3 class="section__title">Plateau</h3>
                            <span class="section__hint">bez progresu od ${plateaus.length > 1 ? 'kilku' : '3'} treningów</span>
                        </div>
                        <div class="card card--flush">
                            <ul class="list">
                                ${plateaus.map(entry => `
                                    <li class="list__item">
                                        ${renderMaterialIcon('trending_flat')}
                                        <span class="list__body"><span class="list__title">${escapeHtml(entry.name)}</span></span>
                                        <span class="badge badge--hold">Plateau</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </section>
                ` : ''}

                <section class="section">
                    <h3 class="section__title">Ćwiczenia</h3>
                    <div class="card card--flush">
                        <ul class="list">
                            ${session.exercises.map(entry => renderExerciseRow(entry)).join('')}
                        </ul>
                    </div>
                </section>

                <div class="action-bar">
                    <a class="btn btn--primary btn--block" href="#/history">${renderMaterialIcon('history')}<span>Zobacz historię</span></a>
                    <a class="btn btn--ghost btn--block" href="#/plan">${renderMaterialIcon('home')}<span>Wróć do planu</span></a>
                </div>
            `;
        },

        bind(root) {
            root.addEventListener('click', event => {
                if (event.target.closest('[data-save-retry]')) app.retrySummarySave();
            });
        }
    };
}

function renderProgressRow({ entry, delta }) {
    const weightDelta = delta.weightDelta;

    return `
        <li class="list__item">
            ${renderMaterialIcon('trending_up', 'accent')}
            <span class="list__body">
                <span class="list__title">${escapeHtml(entry.name)}</span>
                <span class="list__meta">${escapeHtml(workoutAnalysis.formatSetPlan(entry))}</span>
            </span>
            <span class="badge badge--up">${escapeHtml(weightDelta > 0 ? formatSignedWeight(weightDelta) : '+1RM')}</span>
        </li>
    `;
}

function renderExerciseRow(entry) {
    const sets = workoutAnalysis.completedSets(entry);
    const status = entry.skipped
        ? { label: 'Pominięte', className: 'badge--muted' }
        : sets.length
            ? { label: sets.map(set => `${formatWeight(set.weight)}×${set.reps}`).join(' · '), className: 'badge--plain' }
            : { label: 'Brak serii', className: 'badge--muted' };

    return `
        <li class="list__item">
            <span class="list__body">
                <span class="list__title">${escapeHtml(entry.name)}</span>
                <span class="list__meta">${sets.length} ${sets.length === 1 ? 'seria' : 'serie'} · ${escapeHtml(formatVolume(workoutAnalysis.entryVolume(entry)))} kg</span>
            </span>
            <span class="badge ${status.className}">${escapeHtml(status.label)}</span>
        </li>
    `;
}

function renderNoProgress() {
    return `
        <div class="empty-state">
            ${renderMaterialIcon('equalizer')}
            <p class="empty-state__text">Brak progresu w tym treningu. Następnym razem dołóż powtórzenie w górnej części zakresu.</p>
        </div>
    `;
}
