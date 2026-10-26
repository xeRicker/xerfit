import { escapeHtml, formatDate, formatWeight } from '../utils.js';
import { workoutAnalysis } from '../services/workoutAnalysis.js';

export function renderRecentSessions(history, limit = 8) {
    if (!history.length) return '<p class="section__hint">Brak zapisanych treningów z tym ćwiczeniem.</p>';

    return `
        <ul class="session-list">
            ${[...history].reverse().slice(0, limit).map(item => `
                <li class="session-item">
                    <span class="session-item__date">${escapeHtml(formatDate(item.date))}</span>
                    <span class="session-item__sets">
                        ${workoutAnalysis.completedSets(item.entry).map(set => `
                            <span class="set-pill">
                                <span class="set-pill__weight numeric">${escapeHtml(formatWeight(set.weight))}</span>
                                <span class="set-pill__unit">kg</span>
                                <span class="set-pill__times">×</span>
                                <span class="set-pill__reps numeric">${escapeHtml(String(set.reps))}</span>
                            </span>
                        `).join('')}
                    </span>
                </li>
            `).join('')}
        </ul>
    `;
}
