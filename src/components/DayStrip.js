import { Component } from '../core/Component.js';
import { store } from '../core/Store.js';
import { Icons } from '../core/Icons.js';

const toDateKey = (date) => {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const parseDateKey = (key) => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
};

export class DayStrip extends Component {
    constructor(container) {
        super(container);
    }

    getDays(centerDate) {
        return Array.from({ length: 7 }).map((_, index) => {
            const next = new Date(centerDate);
            next.setUTCDate(centerDate.getUTCDate() + index - 3);
            return next;
        });
    }

    shiftDay(offset, state) {
        const selected = parseDateKey(state.currentDate);
        selected.setUTCDate(selected.getUTCDate() + offset);
        store.setDate(toDateKey(selected));
    }

    render(state) {
        const current = parseDateKey(state.currentDate);
        const days = this.getDays(current);
        const label = current.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

        this.container.innerHTML = `
            <div class="day-strip-wrap">
                <div class="day-strip-head">
                    <button class="icon-nav-btn day-nav" data-shift="-1">${Icons.chevronLeft}</button>
                    <button class="day-current" data-today="1">
                        <span>${label}</span>
                        <small>Wróć do dzisiaj</small>
                    </button>
                    <button class="icon-nav-btn day-nav" data-shift="1">${Icons.chevronRight}</button>
                </div>
                <div class="day-strip">
                    ${days.map(date => {
                        const key = toDateKey(date);
                        const dayCal = (state.logs[key] || []).reduce((sum, e) => sum + e.cal, 0);
                        const pct = Math.min(100, Math.round((dayCal / Math.max(1, state.user.targetCal || 1)) * 100));
                        return `<button class="day-pill ${key === state.currentDate ? 'active' : ''}" data-date="${key}"><span class="day-name">${date.toLocaleDateString('pl-PL', { weekday: 'short', timeZone: 'UTC' })}</span><span class="day-num">${date.toLocaleDateString('pl-PL', { day: 'numeric', timeZone: 'UTC' })}</span><div class="day-cal-track"><div class="day-cal-fill" style="width:${pct}%;"></div></div></button>`;
                    }).join('')}
                </div>
            </div>`;

        this.container.querySelectorAll('.day-pill').forEach(el => {
            el.onclick = () => store.setDate(el.dataset.date);
        });
        this.container.querySelectorAll('.day-nav').forEach(btn => {
            btn.onclick = () => this.shiftDay(Number(btn.dataset.shift), state);
        });
        this.container.querySelector('.day-current').onclick = () => {
            store.setDate(toDateKey(new Date()));
        };
    }
}
