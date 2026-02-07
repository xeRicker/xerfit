import { Component } from '../core/Component.js';
import { store } from '../core/Store.js';

export class DayStrip extends Component {
    constructor(container) {
        super(container);
        this.days = this.generateDays();
        this.didInitialScroll = false;
    }

    generateDays() {
        const days = [];
        for (let i = -14; i <= 14; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            days.push(d);
        }
        return days;
    }

    render(state) {
        const current = state.currentDate;
        const logs = state.logs;

        const html = this.days.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            const isToday = dateStr === current;
            const dayName = date.toLocaleDateString('pl-PL', { weekday: 'short' });
            const dayNum = date.getDate();
            const dayCal = (logs[dateStr] || []).reduce((sum, e) => sum + e.cal, 0);
            const pct = Math.min(100, Math.round((dayCal / Math.max(1, state.user.targetCal || 1)) * 100));

            return `
                <button class="day-pill ${isToday ? 'active' : ''}" data-date="${dateStr}">
                    <span class="day-name">${dayName}</span>
                    <span class="day-num">${dayNum}</span>
                    <div class="day-cal-track"><div class="day-cal-fill" style="width:${pct}%;"></div></div>
                </button>
            `;
        }).join('');

        this.container.innerHTML = `
            <div class="day-strip-wrap">
                <div class="app-logo">Xerfit</div>
                <div class="day-strip">${html}</div>
            </div>
        `;

        const active = this.container.querySelector('.active');
        if (active && !this.didInitialScroll) {
            active.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
            this.didInitialScroll = true;
        }

        this.container.querySelectorAll('.day-pill').forEach(el => {
            el.addEventListener('click', () => store.setDate(el.dataset.date));
        });
    }
}
