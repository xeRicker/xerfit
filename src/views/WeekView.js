import { Component } from '../core/Component.js';
import { store } from '../core/Store.js';
import { Icons } from '../core/Icons.js';

const toDateKey = (date) => date.toISOString().split('T')[0];

export class WeekView extends Component {
    constructor(container) {
        super(container);
        this.weekOffset = 0;
        this.selectedDate = null;
        this.unsub = store.subscribe(s => this.update(s));
    }

    getWeekDays() {
        const base = new Date();
        const day = (base.getDay() + 6) % 7;
        const monday = new Date(base);
        monday.setDate(base.getDate() - day + this.weekOffset * 7);

        return Array.from({ length: 7 }).map((_, index) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + index);
            return date;
        });
    }

    getTodayKey() {
        return new Date().toISOString().split('T')[0];
    }

    update(state) {
        const weekDays = this.getWeekDays();
        const weekKeys = weekDays.map(toDateKey);
        const dayStats = weekDays.map((date) => {
            const key = toDateKey(date);
            const meals = state.logs[key] || [];
            const cal = meals.reduce((sum, item) => sum + item.cal, 0);
            return { key, meals, cal, date };
        });

        const todayKey = this.getTodayKey();
        const preferred = weekKeys.includes(todayKey) ? todayKey : weekKeys[0];
        if (!this.selectedDate || !weekKeys.includes(this.selectedDate)) {
            this.selectedDate = preferred;
        }

        const total = dayStats.reduce((sum, day) => sum + day.cal, 0);
        const average = Math.round(total / 7);
        const selected = dayStats.find((d) => d.key === this.selectedDate) || dayStats[0];
        const maxDayCal = Math.max(1, ...dayStats.map(d => Math.round(d.cal)));
        const avgHeight = Math.max(8, Math.round((average / maxDayCal) * 100));

        this.container.innerHTML = `
            <header style="padding: calc(var(--safe-top) + 20px) 20px 12px;">
                <h1 style="font-size: 24px; font-weight: 800; display:flex; align-items:center; gap:8px;">
                    <span style="width:20px; height:20px; color:var(--accent-cyan);">${Icons.week}</span>
                    Tygodniowe kalorie
                </h1>
                <p style="color: var(--text-sub); margin-top: 4px;">Średnio ${average} kcal dziennie</p>
            </header>

            <div style="padding: 0 16px;">
                <div class="card" style="margin: 0 0 12px 0;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; gap: 8px;">
                        <button id="week-prev" class="input-field" style="width:auto; padding:8px 12px;">← Poprz.</button>
                        <strong style="text-align:center;">${weekDays[0].toLocaleDateString('pl-PL')} - ${weekDays[6].toLocaleDateString('pl-PL')}</strong>
                        <button id="week-next" class="input-field" style="width:auto; padding:8px 12px;">Nast. →</button>
                    </div>

                    <div class="week-chart">
                        ${dayStats.map(day => {
                            const h = Math.max(10, Math.round((day.cal / maxDayCal) * 100));
                            const readableDate = day.date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
                            return `<button class="week-chart-bar ${this.selectedDate === day.key ? 'active' : ''}" data-date="${day.key}">
                                <div class="fill" style="height:${h}%;"></div>
                                <span>${Math.round(day.cal)}</span>
                                <span style="font-size:10px; color:var(--text-dim);">${readableDate}</span>
                            </button>`;
                        }).join('')}
                        <div class="week-chart-average" style="bottom:${avgHeight}%;">Średnia ${average} kcal</div>
                    </div>

                    <div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:6px; margin-top: 10px;">
                        ${dayStats.map(day => {
                            const pct = Math.min(100, Math.round((day.cal / Math.max(1, state.user.targetCal)) * 100));
                            const active = this.selectedDate === day.key;
                            return `
                            <button class="week-day ${active ? 'active' : ''}" data-date="${day.key}" style="padding:10px 6px; border-radius: 12px; border:1px solid var(--line-soft); background:${active ? 'rgba(93,233,255,.16)' : 'rgba(255,255,255,.02)'}; color:var(--text-main);">
                                <div style="font-size:11px; color:var(--text-sub); text-transform: capitalize;">${day.date.toLocaleDateString('pl-PL', { weekday: 'short' })}</div>
                                <div style="font-weight:700; margin:4px 0;">${Math.round(day.cal)}</div>
                                <div style="height:4px; border-radius:10px; background:rgba(255,255,255,.08); overflow:hidden;"><div style="height:100%; width:${pct}%; background:var(--accent-cyan)"></div></div>
                            </button>`;
                        }).join('')}
                    </div>
                </div>

                <div class="card" style="margin: 0 0 16px 0;">
                    <h3 style="margin-bottom:10px; text-transform: capitalize;">${new Date(selected.key).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                    ${(selected.meals.length === 0)
                        ? '<div style="color:var(--text-dim);">Brak wpisów w tym dniu.</div>'
                        : selected.meals.map(entry => `
                            <div class="list-item" style="margin-bottom: 8px; border-left:4px solid ${entry.color || '#00ff36'};">
                                <div>
                                    <div style="font-weight:700;">${entry.name}</div>
                                    <div style="font-size:12px; color:var(--text-sub);">${entry.grams}g · B${Math.round(entry.p)} T${Math.round(entry.f)} W${Math.round(entry.c)}</div>
                                </div>
                                <div style="color:var(--accent-main); font-weight:700;">${Math.round(entry.cal)} kcal</div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
            <div style="height: 96px;"></div>
        `;

        this.container.querySelector('#week-prev').onclick = () => { this.weekOffset -= 1; this.selectedDate = null; this.update(store.state); };
        this.container.querySelector('#week-next').onclick = () => { this.weekOffset += 1; this.selectedDate = null; this.update(store.state); };
        this.container.querySelectorAll('.week-day, .week-chart-bar').forEach(btn => {
            btn.onclick = () => {
                this.selectedDate = btn.dataset.date;
                this.update(store.state);
            };
        });
    }

    destroy() { this.unsub(); }
}
