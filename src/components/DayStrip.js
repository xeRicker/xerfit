import { Component } from '../core/Component.js';
import { store } from '../core/Store.js';

export class DayStrip extends Component {
    constructor(container) {
        super(container);
        this.days = this.generateDays();
        this.lastDate = null;
        this.didInitialScroll = false;
    }

    generateDays() {
        const days = [];
        for (let i = -7; i <= 7; i++) {
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
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = date.getDate();
            const hasData = logs[dateStr] && logs[dateStr].length > 0;

            return `
                <button class="day-pill ${isToday ? 'active' : ''} ${hasData ? 'has-data' : ''}" data-date="${dateStr}">
                    <span class="day-name">${dayName}</span>
                    <span class="day-num">${dayNum}</span>
                    <div class="day-indicator"></div>
                </button>
            `;
        }).join('');

        this.container.innerHTML = `<div class="day-strip">${html}</div>`;

        const active = this.container.querySelector('.active');
        if (active && (!this.didInitialScroll || this.lastDate !== current)) {
            active.scrollIntoView({ behavior: this.didInitialScroll ? 'smooth' : 'auto', inline: 'center', block: 'nearest' });
            this.didInitialScroll = true;
        }
        this.lastDate = current;

        this.container.querySelectorAll('.day-pill').forEach(el => {
            el.addEventListener('click', () => store.setDate(el.dataset.date));
        });
    }
}
