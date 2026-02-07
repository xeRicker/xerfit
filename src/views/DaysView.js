import { Component } from '../core/Component.js';
import { store } from '../core/Store.js';
import { DayStrip } from '../components/DayStrip.js';
import { Dashboard } from '../components/Dashboard.js';
import { ProductModal } from '../components/ProductModal.js';
import { Icons } from '../core/Icons.js';

const MEALS = [
    { id: 'breakfast', title: 'Śniadanie', icon: Icons.breakfast },
    { id: 'lunch', title: 'Obiad', icon: Icons.lunch },
    { id: 'dinner', title: 'Kolacja', icon: Icons.dinner }
];

export class DaysView extends Component {
    constructor(container) {
        super(container);
        this.modal = new ProductModal();
        this.dayStrip = null;
        this.dashboard = null;
        this.unsub = store.subscribe(s => this.update(s));
    }

    iconFor(entry) {
        return Icons[entry.icon] || Icons.leaf;
    }

    getEnergyLabel(calories) {
        if (calories >= 1500) return '💣 Bomba kaloryczna';
        if (calories >= 1000) return '🔥 Bardzo kaloryczne';
        if (calories >= 500) return '⚡ Sycące';
        return '🌿 Lekkie';
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

            <div style="padding: 0 0 10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin: 10px 16px 10px;">
                    <h3 style="font-size: 13px; color: var(--text-sub); text-transform: uppercase; letter-spacing: 1px;">Posiłki dnia</h3>
                    <span style="font-size: 12px; color: var(--text-dim);">${meals.length} wpisów</span>
                </div>

                ${MEALS.map(group => {
                    const entries = meals.filter(m => (m.meal || 'breakfast') === group.id);
                    return `
                        <section class="card" style="margin: 0 0 14px 0; border-radius: 0; border-left: 0; border-right: 0;">
                            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                                <div style="display:flex; align-items:center; gap:8px; font-size:15px; font-weight:700;">
                                    <span style="width:18px; height:18px; color:var(--accent-main);">${group.icon}</span>
                                    ${group.title}
                                </div>
                                <span style="font-size:11px; color:var(--text-sub);">${entries.length} produktów</span>
                            </div>
                            ${entries.length === 0 ? `<div style="font-size:12px; color:var(--text-dim);">Brak produktów.</div>` : entries.map((m, idx) => `
                                <div class="list-item anim-slide" style="animation-delay:${idx * 40}ms; border-left:3px solid ${m.color || '#00ff36'};">
                                    <div style="display:flex; align-items:center; gap:10px; flex:1;">
                                        <span style="width:20px; height:20px; color:${m.color || '#00ff36'};">${this.iconFor(m)}</span>
                                        <div>
                                            <div style="font-weight: 600; font-size: 15px;">${m.name}</div>
                                            <div style="font-size: 12px; color: var(--text-sub); margin-top: 2px;">${m.grams}g · <span style="color: var(--accent-main);">${Math.round(m.cal)} kcal</span> · ${this.getEnergyLabel(m.cal)}</div>
                                        </div>
                                    </div>
                                    <div style="display:flex; gap:6px; font-size:10px; font-weight:700; color:var(--text-sub); margin-right:6px;">
                                        <span>B${Math.round(m.p)}</span>
                                        <span>T${Math.round(m.f)}</span>
                                        <span>W${Math.round(m.c)}</span>
                                    </div>
                                    <button class="del-btn" data-id="${m.id}" style="width:24px; height:24px; color:var(--accent-red);">${Icons.close}</button>
                                </div>
                            `).join('')}
                        </section>
                    `;
                }).join('')}
            </div>

            <button id="add-btn" class="btn-float" title="Dodaj produkt">${Icons.plus}</button>
            <div style="height: 96px;"></div>
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
            this.modal.open(state.products, (product, grams, meal) => store.addMealEntry(product, grams, meal));
        };

        this.container.querySelectorAll('.del-btn').forEach(btn => {
            btn.onclick = (e) => store.deleteMealEntry(e.currentTarget.dataset.id);
        });
    }

    destroy() { this.unsub(); }
}
