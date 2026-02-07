import { Component } from '../core/Component.js';
import { store } from '../core/Store.js';
import { DayStrip } from '../components/DayStrip.js';
import { Dashboard } from '../components/Dashboard.js';
import { ProductModal } from '../components/ProductModal.js';
import { Icons } from '../core/Icons.js';

export class DaysView extends Component {
    constructor(container) {
        super(container);
        this.modal = new ProductModal();
        this.unsub = store.subscribe(s => this.update(s));
    }

    update(state) {
        const date = state.currentDate;
        const meals = state.logs[date] || [];

        const totals = meals.reduce((acc, m) => ({
            cal: acc.cal + m.cal,
            p: acc.p + m.p,
            c: acc.c + m.c,
            f: acc.f + m.f
        }), { cal: 0, p: 0, c: 0, f: 0 });

        this.container.innerHTML = `
            <div id="day-strip-container" style="position: sticky; top: 0; z-index: 10;"></div>
            <div id="dashboard-container"></div>

            <div style="padding: 0 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin: 16px 4px 8px;">
                    <h3 style="font-size: 14px; color: var(--text-sub); text-transform: uppercase; letter-spacing: 1px;">Log</h3>
                    <span style="font-size: 12px; color: var(--text-dim);">${meals.length} entries</span>
                </div>
                
                ${meals.length === 0 ?
            `<div style="text-align: center; padding: 40px; color: var(--text-dim); font-size: 13px;">No data for this day</div>` : ''}

                <div class="meal-list">
                    ${meals.map(m => `
                        <div class="list-item anim-slide">
                            <div style="flex: 1;">
                                <div style="font-weight: 500; font-size: 15px; color: var(--text-main);">${m.name}</div>
                                <div style="font-size: 12px; color: var(--text-sub); margin-top: 2px;">
                                    ${m.grams}g <span style="margin: 0 4px; color: #333;">|</span> <span style="color: var(--neon-blue);">${Math.round(m.cal)} kcal</span>
                                </div>
                            </div>
                            <!-- Compact Macros -->
                            <div style="display: flex; gap: 6px; font-size: 10px; font-weight: 600; color: var(--text-dim);">
                                <span style="color: var(--neon-green);">P${Math.round(m.p)}</span>
                                <span style="color: var(--neon-blue);">C${Math.round(m.c)}</span>
                                <span style="color: var(--neon-purple);">F${Math.round(m.f)}</span>
                            </div>
                            <button class="del-btn" data-id="${m.id}" style="background:none; color: var(--text-dim); padding: 8px; margin-left: 8px;">
                                ${Icons.trash}
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <button id="add-btn" class="btn-float">${Icons.plus}</button>
            <div style="height: 100px;"></div>
        `;

        // Mount Sub-components
        new DayStrip(this.container.querySelector('#day-strip-container')).render(state);
        new Dashboard(this.container.querySelector('#dashboard-container')).render(totals, state.user);

        // Events
        this.container.querySelector('#add-btn').onclick = () => {
            this.modal.open(state.products, (prod, grams) => store.addLogEntry(prod, grams));
        };
        this.container.querySelectorAll('.del-btn').forEach(btn => {
            btn.onclick = (e) => store.deleteLogEntry(e.currentTarget.dataset.id);
        });
    }

    destroy() { this.unsub(); }
}