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
        this.collapsedMeals = {};
        this.activeDialog = null;
        this.unsub = store.subscribe(s => this.update(s));
    }

    iconFor(entry) { return Icons[entry.icon] || Icons.leaf; }

    openEntryEditor(entry) {
        this.activeDialog = { type: 'edit', entry };
        this.update(store.state);
    }

    openCopyDialog(meal) {
        this.activeDialog = { type: 'copy', meal };
        this.update(store.state);
    }

    closeDialog() {
        this.activeDialog = null;
        this.update(store.state);
    }

    renderDialog(state) {
        if (!this.activeDialog) return '';
        if (this.activeDialog.type === 'edit') {
            const e = this.activeDialog.entry;
            return `<div class="backdrop open close-dialog"></div><div class="modal-sheet open"><h2>Edycja porcji</h2>
                <div class="input-group" style="margin-top:10px;"><label class="input-label">Gramatura</label><input id="edit-grams" type="number" class="input-field" value="${Math.round(e.grams)}"></div>
                <div style="display:flex; gap:8px;"><button class="input-field close-dialog">Anuluj</button><button id="save-edit" class="btn-primary">Zapisz</button></div></div>`;
        }
        return `<div class="backdrop open close-dialog"></div><div class="modal-sheet open"><h2>Kopiuj posiłek</h2>
            <div class="input-group" style="margin-top:10px;"><label class="input-label">Data docelowa</label><input id="copy-date" type="date" class="input-field" value="${state.currentDate}"></div>
            <div class="input-group"><label class="input-label">Posiłek docelowy</label><select id="copy-meal" class="input-field">${MEALS.map(m => `<option value="${m.id}" ${m.id === this.activeDialog.meal ? 'selected' : ''}>${m.title}</option>`).join('')}</select></div>
            <div style="display:flex; gap:8px;"><button class="input-field close-dialog">Anuluj</button><button id="confirm-copy" class="btn-primary">Kopiuj</button></div></div>`;
    }

    update(state) {
        const date = state.currentDate;
        const meals = state.logs[date] || [];
        const totals = meals.reduce((acc, m) => ({ cal: acc.cal + m.cal, p: acc.p + m.p, c: acc.c + m.c, f: acc.f + m.f }), { cal: 0, p: 0, c: 0, f: 0 });

        this.container.innerHTML = `
            <div id="day-strip-container" style="position: sticky; top: 0; z-index: 10;"></div>
            <div id="dashboard-container"></div>
            <div style="padding: 0 16px 10px;">
                <div class="section-title-row"><h3>Posiłki dnia</h3></div>
                ${MEALS.map(group => {
                    const entries = meals.filter(m => (m.meal || 'breakfast') === group.id);
                    const collapsed = Boolean(this.collapsedMeals[group.id]);
                    return `<section class="card meal-card">
                        <div class="meal-head">
                            <div class="meal-label"><span class="meal-label-icon">${group.icon}</span><span>${group.title}</span></div>
                            <div class="meal-head-actions"><button class="copy-meal btn-icon" data-meal="${group.id}" title="Kopiuj">${Icons.calendar}</button><button class="toggle-meal btn-icon" data-meal="${group.id}" title="Zwiń">${collapsed ? Icons.expand : Icons.collapse}</button></div>
                        </div>
                        ${collapsed ? '' : entries.length === 0 ? `<div class="meal-empty"><span>Brak produktów</span></div>` : entries.map((m, idx) => `<div class="list-item meal-entry" style="animation-delay:${idx * 40}ms; border-left:3px solid ${m.color || '#2596be'};">
                            <div class="meal-entry-main"><span class="meal-entry-icon" style="color:${m.color || '#2596be'};">${this.iconFor(m)}</span><div style="min-width:0;"><div class="entry-title">${m.name}</div><div class="entry-sub">${m.grams}g · <span class="meal-kcal">${Math.round(m.cal)} kcal</span></div></div></div>
                            <div class="meal-entry-side">
                                <div class="macro-stack"><span class="macro-pill macro-pill-strong"><span class="macro-icon protein">${Icons.protein}</span>${Math.round(m.p)}</span><span class="macro-pill macro-pill-strong"><span class="macro-icon fat">${Icons.fat}</span>${Math.round(m.f)}</span><span class="macro-pill macro-pill-strong"><span class="macro-icon carbs">${Icons.carbs}</span>${Math.round(m.c)}</span></div>
                                <div class="entry-actions"><button class="edit-btn btn-icon" data-id="${m.id}">${Icons.edit}</button><button class="del-btn btn-icon btn-danger" data-id="${m.id}">${Icons.close}</button></div>
                            </div>
                        </div>`).join('')}
                    </section>`;
                }).join('')}
            </div>
            <button id="add-btn" class="btn-float" title="Dodaj produkt">${Icons.plus}</button>
            ${this.renderDialog(state)}
            <div style="height: 96px;"></div>`;

        const stripContainer = this.container.querySelector('#day-strip-container');
        const dashboardContainer = this.container.querySelector('#dashboard-container');
        if (!this.dayStrip) this.dayStrip = new DayStrip(stripContainer); else this.dayStrip.container = stripContainer;
        this.dayStrip.render(state);
        if (!this.dashboard) this.dashboard = new Dashboard(dashboardContainer); else this.dashboard.container = dashboardContainer;
        this.dashboard.render(totals, state.user);

        this.container.querySelector('#add-btn').onclick = () => this.modal.open(state.products, (product, grams, meal) => store.addMealEntry(product, grams, meal));
        this.container.querySelectorAll('.del-btn').forEach(btn => { btn.onclick = (e) => store.deleteMealEntry(e.currentTarget.dataset.id); });
        this.container.querySelectorAll('.edit-btn').forEach(btn => { btn.onclick = (e) => this.openEntryEditor(meals.find(item => String(item.id) === String(e.currentTarget.dataset.id))); });
        this.container.querySelectorAll('.toggle-meal').forEach(btn => { btn.onclick = () => { const mealId = btn.dataset.meal; this.collapsedMeals[mealId] = !this.collapsedMeals[mealId]; this.update(store.state); }; });
        this.container.querySelectorAll('.copy-meal').forEach(btn => { btn.onclick = () => this.openCopyDialog(btn.dataset.meal); });
        this.container.querySelectorAll('.close-dialog').forEach(el => { el.onclick = () => this.closeDialog(); });
        const saveEdit = this.container.querySelector('#save-edit');
        if (saveEdit) saveEdit.onclick = () => {
            const grams = Number(this.container.querySelector('#edit-grams')?.value);
            if (this.activeDialog?.entry && grams > 0) store.updateMealEntry(this.activeDialog.entry.id, { grams });
            this.closeDialog();
        };
        const confirmCopy = this.container.querySelector('#confirm-copy');
        if (confirmCopy) confirmCopy.onclick = () => {
            const targetDate = this.container.querySelector('#copy-date')?.value;
            const targetMeal = this.container.querySelector('#copy-meal')?.value;
            if (targetDate && targetMeal) { store.copyMealEntries(state.currentDate, this.activeDialog.meal, targetDate, targetMeal); store.toast('Skopiowano posiłek.'); }
            this.closeDialog();
        };
    }

    destroy() { this.unsub(); }
}
