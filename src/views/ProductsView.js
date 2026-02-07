import { Component } from '../core/Component.js';
import { store } from '../core/Store.js';
import { Icons } from '../core/Icons.js';

const ICON_OPTIONS = ['leaf', 'chicken', 'egg', 'fish', 'grain'];
const COLOR_OPTIONS = ['#00ff36', '#5de9ff', '#c595ff', '#ffd166', '#ff6f82', '#8cff9f'];

export class ProductsView extends Component {
    constructor(container) {
        super(container);
        this.pendingDeleteId = null;
        this.form = {
            name: '', cal: '', p: '', c: '', f: '',
            color: '#00ff36', icon: 'leaf', defaultMeal: 'global'
        };
        this.unsub = store.subscribe(s => this.update(s));
    }

    iconFor(key) { return Icons[key] || Icons.leaf; }

    isFormValid() {
        const f = this.form;
        return Boolean(f.name.trim()) && [f.cal, f.p, f.c, f.f].every(v => String(v).length > 0 && Number(v) >= 0);
    }

    update(state) {
        const canSave = this.isFormValid();

        this.container.innerHTML = `
            <header style="padding: calc(var(--safe-top) + 20px) 20px 10px;">
                <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; display:flex; align-items:center; gap:8px;">
                    <span style="width:18px; height:18px; color: var(--accent-main);">${Icons.products}</span>
                    Produkty
                </h1>
                <p style="color: var(--text-sub); font-size: 13px;">Twoja baza produktów</p>
            </header>

            <div style="padding: 0 16px;">
                <div class="card" style="margin: 0 0 24px 0; border-color: var(--line-strong); background: var(--grad-liquid), var(--grad-surface);">
                    <h3 style="margin-bottom: 12px; font-size: 13px; color: var(--accent-main); letter-spacing: .7px;">NOWY PRODUKT</h3>
                    <input id="p-name" class="input-field" placeholder="Nazwa" value="${this.form.name}" style="margin-bottom: 8px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px;">
                        <input id="p-cal" type="number" class="input-field" placeholder="kcal" value="${this.form.cal}">
                        <input id="p-p" type="number" class="input-field" placeholder="B" value="${this.form.p}">
                        <input id="p-f" type="number" class="input-field" placeholder="T" value="${this.form.f}">
                        <input id="p-c" type="number" class="input-field" placeholder="W" value="${this.form.c}">
                    </div>

                    <div style="margin-top:12px;">
                        <label class="input-label">Kolor</label>
                        <div id="color-options" style="display:flex; gap:8px; flex-wrap:wrap;">
                            ${COLOR_OPTIONS.map(color => `<button class="color-opt" data-color="${color}" style="width:24px; height:24px; border-radius:50%; background:${color}; border:${this.form.color === color ? '2px solid #fff' : '1px solid #00000055'};"></button>`).join('')}
                        </div>
                    </div>

                    <div style="margin-top:10px; display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                        <div>
                            <label class="input-label">Ikona</label>
                            <select id="p-icon" class="input-field">
                                ${ICON_OPTIONS.map(icon => `<option value="${icon}" ${this.form.icon === icon ? 'selected' : ''}>${icon}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="input-label">Domyślny posiłek</label>
                            <select id="p-meal" class="input-field">
                                <option value="global" ${this.form.defaultMeal === 'global' ? 'selected' : ''}>Globalny</option>
                                <option value="breakfast" ${this.form.defaultMeal === 'breakfast' ? 'selected' : ''}>Śniadanie</option>
                                <option value="lunch" ${this.form.defaultMeal === 'lunch' ? 'selected' : ''}>Obiad</option>
                                <option value="dinner" ${this.form.defaultMeal === 'dinner' ? 'selected' : ''}>Kolacja</option>
                            </select>
                        </div>
                    </div>

                    <button id="save-prod" class="btn-primary" ${canSave ? '' : 'disabled'} style="margin-top: 12px; display:flex; align-items:center; justify-content:center; gap:8px;">
                        <span style="width:16px; height:16px;">${Icons.check}</span>
                        Zapisz produkt
                    </button>
                </div>

                <div style="margin-bottom: 8px; font-size: 12px; color: var(--text-sub); text-transform: uppercase; letter-spacing: 1px;">Zapisane produkty</div>
                ${state.products.map(p => `
                    <div class="list-item" style="border-left: 4px solid ${p.color || '#00ff36'};">
                        <div style="flex: 1; display:flex; align-items:center; gap:10px;">
                            <span style="width:18px; height:18px; color:${p.color || '#00ff36'};">${this.iconFor(p.icon)}</span>
                            <div>
                                <div style="font-weight: 600; font-size: 15px;">${p.name}</div>
                                <div style="font-size: 11px; color: var(--text-sub); margin-top: 2px;">100g: ${p.cal} kcal · B${p.p} T${p.f} W${p.c} · ${({global:'globalny',breakfast:'śniadanie',lunch:'obiad',dinner:'kolacja'})[p.defaultMeal || 'global']}</div>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px; margin-left:10px;">
                            ${this.pendingDeleteId === p.id ? `<button class="confirm-del" data-id="${p.id}" style="font-size:11px; padding:6px 8px; border-radius:8px; background:rgba(255,107,122,.12); color:var(--accent-red); border:1px solid rgba(255,107,122,.5);">Potwierdź</button>` : ''}
                            <button class="del-prod" data-id="${p.id}" style="color: var(--accent-red); width:22px; height:22px; display:grid; place-items:center;">${Icons.close}</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="height: 100px;"></div>
        `;

        this.bindEvents();
    }

    syncForm() {
        this.form = {
            ...this.form,
            name: this.container.querySelector('#p-name').value,
            cal: this.container.querySelector('#p-cal').value,
            p: this.container.querySelector('#p-p').value,
            f: this.container.querySelector('#p-f').value,
            c: this.container.querySelector('#p-c').value,
            icon: this.container.querySelector('#p-icon').value,
            defaultMeal: this.container.querySelector('#p-meal').value
        };
    }

    bindEvents() {
        ['#p-name', '#p-cal', '#p-p', '#p-f', '#p-c', '#p-icon', '#p-meal'].forEach(sel => {
            const el = this.container.querySelector(sel);
            el.oninput = () => { this.syncForm(); this.update(store.state); };
            el.onchange = () => { this.syncForm(); this.update(store.state); };
        });

        this.container.querySelectorAll('.color-opt').forEach(btn => {
            btn.onclick = () => {
                this.form.color = btn.dataset.color;
                this.update(store.state);
            };
        });

        this.container.querySelector('#save-prod').onclick = () => {
            if (!this.isFormValid()) return;
            store.addProduct({
                name: this.form.name.trim(),
                cal: Number(this.form.cal),
                p: Number(this.form.p),
                c: Number(this.form.c),
                f: Number(this.form.f),
                color: this.form.color,
                icon: this.form.icon,
                defaultMeal: this.form.defaultMeal
            });
            this.form = { name: '', cal: '', p: '', c: '', f: '', color: '#00ff36', icon: 'leaf', defaultMeal: 'global' };
            this.update(store.state);
        };

        this.container.querySelectorAll('.del-prod').forEach(btn => {
            btn.onclick = (e) => {
                const id = e.currentTarget.dataset.id;
                this.pendingDeleteId = this.pendingDeleteId === id ? null : id;
                this.update(store.state);
            };
        });

        this.container.querySelectorAll('.confirm-del').forEach(btn => {
            btn.onclick = (e) => {
                store.deleteProduct(e.currentTarget.dataset.id);
                this.pendingDeleteId = null;
            };
        });
    }

    destroy() { this.unsub(); }
}
