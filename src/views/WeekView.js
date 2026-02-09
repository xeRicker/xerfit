import { Component } from '../core/Component.js';
import { store } from '../core/Store.js';
import { Icons } from '../core/Icons.js';

const toDateKey = (date) => date.toLocaleDateString('en-CA');
const MEALS = ['breakfast', 'lunch', 'dinner'];
const MEAL_LABELS = { breakfast: 'Śniadanie', lunch: 'Obiad', dinner: 'Kolacja' };
const MEAL_ICONS = { breakfast: Icons.breakfast, lunch: Icons.lunch, dinner: Icons.dinner };

export class WeekView extends Component {
    constructor(container) {
        super(container);
        this.weekOffset = 0;
        this.selectedDate = null;
        this.editEntryId = null;
        this.editValue = 0;
        this.unsub = store.subscribe(s => this.update(s));
    }

    getWeekDays() {
        const base = new Date();
        const day = (base.getDay() + 6) % 7;
        const monday = new Date(base);
        monday.setDate(base.getDate() - day + this.weekOffset * 7);
        return Array.from({ length: 7 }).map((_, index) => { const date = new Date(monday); date.setDate(monday.getDate() + index); return date; });
    }

    renderEntry(entry) {
        return `<div class="list-item meal-entry week-entry food-entry" style="margin-bottom: 8px; border-left:4px solid ${entry.color || '#FF6A00'};">
            <div class="meal-entry-top"><div class="meal-entry-main"><span class="meal-entry-icon" style="color:${entry.color || '#FF6A00'};">${Icons[entry.icon] || Icons.leaf}</span><div style="min-width:0;"><div class="entry-title">${entry.name}</div><div class="entry-sub">${Math.round(entry.grams)}g · <span class="meal-kcal">${Math.round(entry.cal)} kcal</span></div></div></div><div class="entry-actions entry-actions-right">${this.editEntryId === String(entry.id)
        ? `<input type="number" class="input-field edit-inline" data-id="${entry.id}" value="${Math.round(this.editValue || entry.grams)}" style="width:74px;padding:6px;text-align:right;"> <button class="save-inline btn-icon" data-id="${entry.id}">${Icons.check}</button> <button class="cancel-inline btn-icon" style="color:var(--text-sub);">${Icons.close}</button>`
        : `<button class="edit-day-entry btn-icon" data-id="${entry.id}" data-grams="${Math.round(entry.grams)}">${Icons.edit}</button><button class="del-day-entry btn-icon btn-danger" data-id="${entry.id}">${Icons.close}</button>`}
            </div></div>
            <div class="macro-stack macro-stack-bottom"><span class="macro-pill macro-pill-strong"><span class="macro-icon protein">${Icons.protein}</span>${Math.round(entry.p)}</span><span class="macro-pill macro-pill-strong"><span class="macro-icon fat">${Icons.fat}</span>${Math.round(entry.f)}</span><span class="macro-pill macro-pill-strong"><span class="macro-icon carbs">${Icons.carbs}</span>${Math.round(entry.c)}</span></div>
        </div>`;
    }

    update(state) {
        const weekDays = this.getWeekDays();
        const weekKeys = weekDays.map(toDateKey);
        const dayStats = weekDays.map((date) => {
            const key = toDateKey(date);
            const meals = state.logs[key] || [];
            const p = meals.reduce((sum, item) => sum + item.p, 0);
            const c = meals.reduce((sum, item) => sum + item.c, 0);
            const f = meals.reduce((sum, item) => sum + item.f, 0);
            const cal = meals.reduce((sum, item) => sum + item.cal, 0);
            return { key, meals, cal, p, c, f, date };
        });
        if (!this.selectedDate || !weekKeys.includes(this.selectedDate)) this.selectedDate = weekKeys[0];

        const average = Math.round(dayStats.reduce((sum, day) => sum + day.cal, 0) / 7);
        const selected = dayStats.find((d) => d.key === this.selectedDate) || dayStats[0];
        const maxDayCal = Math.max(1, ...dayStats.map(d => Math.round(d.cal)));

        this.container.innerHTML = `
            <header style="padding: 14px 20px 12px;"><h1 style="font-size: 24px; font-weight: 800;">Podsumowanie</h1></header>
            <div style="padding: 0 16px;">
                <div class="card" style="margin: 0 0 12px 0;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; gap: 8px;"><button id="week-prev" class="icon-nav-btn">${Icons.chevronLeft}</button><strong style="text-align:center;">${weekDays[0].toLocaleDateString('pl-PL')} - ${weekDays[6].toLocaleDateString('pl-PL')}</strong><button id="week-next" class="icon-nav-btn">${Icons.chevronRight}</button></div>
                    <div class="week-chart">
                        ${dayStats.map(day => {
                            const h = Math.max(10, Math.round((day.cal / maxDayCal) * 100));
                            const totalMacro = Math.max(1, (day.p * 4) + (day.c * 4) + (day.f * 9));
                            const pShare = Math.round(((day.p * 4) / totalMacro) * 100);
                            const fShare = Math.round(((day.f * 9) / totalMacro) * 100);
                            const cShare = Math.max(0, 100 - pShare - fShare);
                            const gradient = `linear-gradient(to top, var(--macro-carb) 0% ${cShare}%, var(--macro-fat) ${cShare}% ${cShare + fShare}%, var(--macro-protein) ${cShare + fShare}% 100%)`;
                            return `<button class="week-chart-bar ${this.selectedDate === day.key ? 'active' : ''}" data-date="${day.key}"><span class="week-bar-date">${day.date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })}</span><div class="fill" style="height:${h}%; background:${gradient};"></div><span class="week-bar-kcal">${Math.round(day.cal)} kcal</span></button>`;
                        }).join('')}
                    </div>
                    <div class="week-legend-row"><span class="macro-pill"><span style="width:12px;height:12px;background:var(--macro-protein);border-radius:3px;"></span>Białko</span><span class="macro-pill"><span style="width:12px;height:12px;background:var(--macro-fat);border-radius:3px;"></span>Tłuszcze</span><span class="macro-pill"><span style="width:12px;height:12px;background:var(--macro-carb);border-radius:3px;"></span>Węgle</span><span class="week-average-pill">Średnia · ${average} kcal</span></div>
                </div>
                <div class="card" style="margin: 0 0 16px 0;">
                    <h3 style="margin-bottom:10px; text-transform: capitalize;">${new Date(selected.key).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                    ${MEALS.map(meal => {
                        const entries = selected.meals.filter(m => (m.meal || 'breakfast') === meal);
                        return `<div style="margin-bottom:10px;"><div class="meal-label meal-label-week"><span class="meal-label-icon">${MEAL_ICONS[meal]}</span><span>${MEAL_LABELS[meal]}</span></div>${entries.length ? entries.map(entry => this.renderEntry(entry)).join('') : `<div class="meal-empty"><span>Brak produktów</span></div>`}</div>`;
                    }).join('')}
                </div>
            </div><div style="height: 96px;"></div>`;

        this.container.querySelector('#week-prev').onclick = () => { this.weekOffset -= 1; this.selectedDate = null; this.update(store.state); };
        this.container.querySelector('#week-next').onclick = () => { this.weekOffset += 1; this.selectedDate = null; this.update(store.state); };
        this.container.querySelectorAll('.week-chart-bar').forEach(btn => { btn.onclick = () => { this.selectedDate = btn.dataset.date; this.update(store.state); }; });
        this.container.querySelectorAll('.del-day-entry').forEach(btn => { btn.onclick = () => store.deleteMealEntryForDate(this.selectedDate, btn.dataset.id); });
        this.container.querySelectorAll('.edit-day-entry').forEach(btn => { btn.onclick = () => { this.editEntryId = String(btn.dataset.id); this.editValue = Number(btn.dataset.grams) || 100; this.update(store.state); }; });
        this.container.querySelectorAll('.edit-inline').forEach(input => { input.oninput = () => { this.editValue = Number(input.value) || 0; }; });
        this.container.querySelectorAll('.save-inline').forEach(btn => { btn.onclick = () => { if (this.editValue > 0) store.updateMealEntryForDate(this.selectedDate, btn.dataset.id, { grams: this.editValue }); this.editEntryId = null; this.update(store.state); }; });
        this.container.querySelectorAll('.cancel-inline').forEach(btn => { btn.onclick = () => { this.editEntryId = null; this.update(store.state); }; });
    }

    destroy() { this.unsub(); }
}
