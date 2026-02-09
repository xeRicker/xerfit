import { Component } from '../core/Component.js';
import { store } from '../core/Store.js';
import { Icons } from '../core/Icons.js';

const toDateKey = (date) => date.toLocaleDateString('en-CA');

export class DayStrip extends Component {
    constructor(container) {
        super(container);
        this.anchorDate = new Date();
    }

    getDays(centerDate) {
        return Array.from({ length: 7 }).map((_, index) => {
            const next = new Date(centerDate);
            next.setDate(centerDate.getDate() + index - 3);
            return next;
        });
    }

    shiftDay(offset, state) {
        const selected = new Date(`${state.currentDate}T00:00:00`);
        selected.setDate(selected.getDate() + offset);
        store.setDate(toDateKey(selected));
    }

    render(state) {
        const current = new Date(`${state.currentDate}T00:00:00`);
        const days = this.getDays(current);
        const label = current.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });

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
                        return `<button class="day-pill ${key === state.currentDate ? 'active' : ''}" data-date="${key}"><span class="day-name">${date.toLocaleDateString('pl-PL', { weekday: 'short' })}</span><span class="day-num">${date.getDate()}</span><div class="day-cal-track"><div class="day-cal-fill" style="width:${pct}%;"></div></div></button>`;
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
