import { Component } from '../core/Component.js';
import { store } from '../core/Store.js';
import { DayStrip } from '../components/DayStrip.js';
import { Dashboard } from '../components/Dashboard.js';
import { ProductModal } from '../components/ProductModal.js';
import { Icons } from '../core/Icons.js';

const MEAL_SECTIONS = [
    { id: 'breakfast', title: 'Breakfast', icon: Icons.breakfast },
    { id: 'lunch', title: 'Lunch', icon: Icons.lunch },
    { id: 'dinner', title: 'Dinner', icon: Icons.dinner }
];

export class DaysView extends Component {
    constructor(container) {
        super(container);
        this.modal = new ProductModal();
        this.dayStrip = null;
        this.dashboard = null;
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

        const grouped = MEAL_SECTIONS.map(section => ({
            ...section,
            entries: meals.filter(m => (m.meal || 'breakfast') === section.id)
        }));

        this.container.innerHTML = `
            <div id="day-strip-container" style="position: sticky; top: 0; z-index: 10;"></div>
            <div id="dashboard-container"></div>

            <div style="padding: 0 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin: 14px 4px 8px;">
                    <h3 style="font-size: 13px; color: var(--text-sub); text-transform: uppercase; letter-spacing: 1px;">Daily Log</h3>
                    <span style="font-size: 12px; color: var(--text-dim);">${meals.length} entries</span>
                </div>

                ${meals.length === 0 ? `<div class="card" style="margin: 0; text-align:center; color:var(--text-dim);">No meals logged yet. Tap + to add food.</div>` : ''}

                ${grouped.map(group => `
                    <section style="margin: 12px 0 16px;">
                        <div style="display:flex; align-items:center; justify-content:space-between; margin: 0 4px 8px;">
                            <div style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:700;">
                                <span style="width:16px; height:16px; color:var(--neon-green);">${group.icon}</span>
                                ${group.title}
                            </div>
                            <span style="font-size:11px; color:var(--text-sub);">${group.entries.length} items</span>
                        </div>
                        ${group.entries.length === 0 ? `<div style="font-size:12px; color:var(--text-dim); padding: 0 4px;">No items yet</div>` : ''}
                        ${group.entries.map(m => `
                            <div class="list-item anim-slide">
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; font-size: 15px;">${m.name}</div>
                                    <div style="font-size: 12px; color: var(--text-sub); margin-top: 2px;">
                                        ${m.grams}g · <span style="color: var(--neon-green);">${Math.round(m.cal)} kcal</span>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 6px; font-size: 10px; font-weight: 700; color: var(--text-sub); margin-right:6px;">
                                    <span>P${Math.round(m.p)}</span>
                                    <span>C${Math.round(m.c)}</span>
                                    <span>F${Math.round(m.f)}</span>
                                </div>
                                <button class="del-btn" data-id="${m.id}" title="Delete" style="width:24px; height:24px; color: var(--neon-red);">${Icons.close}</button>
                            </div>
                        `).join('')}
                    </section>
                `).join('')}
            </div>

            <button id="add-btn" class="btn-float" title="Add food">${Icons.plus}</button>
            <div style="height: 100px;"></div>
        `;

        const stripContainer = this.container.querySelector('#day-strip-container');
        const dashboardContainer = this.container.querySelector('#dashboard-container');

        if (!this.dayStrip) this.dayStrip = new DayStrip(stripContainer);
        else this.dayStrip.container = stripContainer;
        this.dayStrip.render(state);

        if (!this.dashboard) this.dashboard = new Dashboard(dashboardContainer);
        else this.dashboard.container = dashboardContainer;
        this.dashboard.render(totals, state.user);

        this.container.querySelector('#add-btn').onclick = () => {
            this.modal.open(state.products, (prod, grams, meal) => store.addLogEntry(prod, grams, meal));
        };

        this.container.querySelectorAll('.del-btn').forEach(btn => {
            btn.onclick = (e) => store.deleteLogEntry(e.currentTarget.dataset.id);
        });
    }

    destroy() { this.unsub(); }
}
