import { Component } from '../core/Component.js';
import { store } from '../core/Store.js';
import { Icons } from '../core/Icons.js';

const toDateKey = (date) => date.toISOString().split('T')[0];
const MEALS = ['breakfast', 'lunch', 'dinner'];
const MEAL_LABELS = { breakfast: 'Śniadanie', lunch: 'Obiad', dinner: 'Kolacja' };

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
        const avgBottom = Math.min(82, Math.max(12, Math.round((average / maxDayCal) * 100)));

        this.container.innerHTML = `
            <header style="padding: 14px 20px 12px;"><h1 style="font-size: 24px; font-weight: 800;">Tygodniowe kalorie</h1></header>
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
                            return `<button class="week-chart-bar ${this.selectedDate === day.key ? 'active' : ''}" data-date="${day.key}"><div class="fill" style="height:${h}%; background:${gradient};"></div><span>${Math.round(day.cal)}</span><span style="font-size:10px; color:var(--text-dim);">${day.date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })}</span></button>`;
                        }).join('')}
                        <div class="week-chart-average" style="bottom:${avgBottom}%;"><span style="background:rgba(4,8,12,.9); padding-left:6px;">Średnia · ${average} kcal</span></div>
                    </div>
                    <div style="display:flex; gap:12px; margin-top:8px;"><span class="macro-pill"><span style="width:12px;height:12px;background:var(--macro-protein);border-radius:3px;"></span>Białko</span><span class="macro-pill"><span style="width:12px;height:12px;background:var(--macro-fat);border-radius:3px;"></span>Tłuszcze</span><span class="macro-pill"><span style="width:12px;height:12px;background:var(--macro-carb);border-radius:3px;"></span>Węgle</span></div>
                </div>
                <div class="card" style="margin: 0 0 16px 0;">
                    <h3 style="margin-bottom:10px; text-transform: capitalize;">${new Date(selected.key).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                    ${MEALS.map(meal => {
                        const entries = selected.meals.filter(m => (m.meal || 'breakfast') === meal);
                        return `<div style="margin-bottom:10px;"><div style="font-size:13px; color:var(--text-sub); margin-bottom:6px;">${MEAL_LABELS[meal]}</div>${entries.length ? entries.map(entry => `<div class="list-item" style="margin-bottom: 8px; border-left:4px solid ${entry.color || '#2596be'};"><div><div style="font-weight:700;">${entry.name}</div><div style="font-size:12px; color:var(--text-sub);">${entry.grams}g · B${Math.round(entry.p)} T${Math.round(entry.f)} W${Math.round(entry.c)}</div></div><div style="display:flex;align-items:center;gap:8px;"><span style="color:var(--accent-main); font-weight:700;">${Math.round(entry.cal)} kcal</span>${this.editEntryId === String(entry.id) ? `<input type="number" class="input-field edit-inline" data-id="${entry.id}" value="${Math.round(this.editValue || entry.grams)}" style="width:74px;padding:6px;text-align:right;"> <button class="save-inline" data-id="${entry.id}" style="width:20px;height:20px;color:var(--accent-main);">${Icons.check}</button> <button class="cancel-inline" style="width:20px;height:20px;color:var(--text-sub);">${Icons.close}</button>` : `<button class="edit-day-entry" data-id="${entry.id}" data-grams="${Math.round(entry.grams)}" style="width:20px;height:20px;color:var(--accent-cyan);">${Icons.edit}</button><button class="del-day-entry" data-id="${entry.id}" style="width:20px;height:20px;color:var(--accent-red);">${Icons.close}</button>`}</div></div>`).join('') : '<div style="color:var(--text-dim); font-size:12px;">Brak produktów.</div>'}</div>`;
                    }).join('')}
                </div>
            </div><div style="height: 96px;"></div>`;

        this.container.querySelector('#week-prev').onclick = () => { this.weekOffset -= 1; this.selectedDate = null; this.update(store.state); };
        this.container.querySelector('#week-next').onclick = () => { this.weekOffset += 1; this.selectedDate = null; this.update(store.state); };
        this.container.querySelectorAll('.week-chart-bar').forEach(btn => { btn.onclick = () => { this.selectedDate = btn.dataset.date; this.update(store.state); }; });
        this.container.querySelectorAll('.del-day-entry').forEach(btn => { btn.onclick = () => store.deleteMealEntryForDate(this.selectedDate, btn.dataset.id); });
        this.container.querySelectorAll('.edit-day-entry').forEach(btn => { btn.onclick = () => { this.editEntryId = String(btn.dataset.id); this.editValue = Number(btn.dataset.grams) || 100; this.update(store.state); }; });
        this.container.querySelectorAll('.edit-inline').forEach(input => { input.oninput = () => { this.editValue = Number(input.value) || 0; }; });
        this.container.querySelectorAll('.save-inline').forEach(btn => { btn.onclick = () => { if (this.editValue > 0) store.updateMealEntryForDate(this.selectedDate, btn.dataset.id, { grams: this.editValue }); this.editEntryId = null; }; });
        this.container.querySelectorAll('.cancel-inline').forEach(btn => { btn.onclick = () => { this.editEntryId = null; this.update(store.state); }; });
    }

    destroy() { this.unsub(); }
}
