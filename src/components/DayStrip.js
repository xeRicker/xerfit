import { Component } from '../core/Component.js';
import { store } from '../core/Store.js';

export class DayStrip extends Component {
    constructor(container) {
        super(container);
        this.days = this.generateDays();
    }

    generateDays() {
        // Generate 14 days centered on today
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
                <div class="day-pill ${isToday ? 'active' : ''} ${hasData ? 'has-data' : ''}" 
                     data-date="${dateStr}">
                    <span class="day-name">${dayName}</span>
                    <span class="day-num">${dayNum}</span>
                    <div class="day-indicator"></div>
                </div>
            `;
        }).join('');

        this.container.innerHTML = `<div class="day-strip">${html}</div>`;

        // Auto scroll to active
        setTimeout(() => {
            const active = this.container.querySelector('.active');
            if(active) active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }, 100);

        this.container.querySelectorAll('.day-pill').forEach(el => {
            el.addEventListener('click', () => store.setDate(el.dataset.date));
        });
    }
}