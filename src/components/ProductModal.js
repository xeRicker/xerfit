import { Component } from '../core/Component.js';
import { Icons } from '../core/Icons.js';

const MEALS = [
    { id: 'breakfast', label: 'Breakfast', icon: Icons.breakfast },
    { id: 'lunch', label: 'Lunch', icon: Icons.lunch },
    { id: 'dinner', label: 'Dinner', icon: Icons.dinner }
];

export class ProductModal extends Component {
    constructor() {
        super('#modal-layer');
        this.onAdd = null;
        this.products = [];
        this.meal = 'breakfast';
    }

    open(products, onAdd) {
        this.products = products;
        this.onAdd = onAdd;
        this.step = 'select';
        this.selectedProduct = null;
        this.meal = 'breakfast';
        this.renderContent();

        requestAnimationFrame(() => {
            this.container.querySelector('.backdrop')?.classList.add('open');
            this.container.querySelector('.modal-sheet')?.classList.add('open');
        });
    }

    close() {
        const b = this.container.querySelector('.backdrop');
        const s = this.container.querySelector('.modal-sheet');
        if (b && s) {
            b.classList.remove('open');
            s.classList.remove('open');
            setTimeout(() => this.container.innerHTML = '', 300);
        }
    }

    renderContent() {
        let content = '';

        if (this.step === 'select') {
            content = `
                <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 14px;">Add product</h2>
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; margin-bottom: 14px;">
                    ${MEALS.map(m => `
                        <button class="meal-select ${this.meal === m.id ? 'active' : ''}" data-meal="${m.id}" style="padding:9px 8px; border-radius:12px; border:1px solid ${this.meal === m.id ? 'var(--line-strong)' : 'var(--line-soft)'}; color:${this.meal === m.id ? 'var(--neon-green)' : 'var(--text-sub)'}; background: rgba(255,255,255,0.03); display:flex; flex-direction:column; align-items:center; gap:4px;">
                            <span style="width:16px; height:16px;">${m.icon}</span>
                            <span style="font-size:11px; font-weight:600;">${m.label}</span>
                        </button>
                    `).join('')}
                </div>
                <div style="max-height: 46vh; overflow-y: auto;">
                    ${this.products.map(p => `
                        <button class="list-item product-item" data-id="${p.id}" style="width:100%; text-align:left; border-radius:14px; margin-bottom:8px;">
                            <div>
                                <div style="font-weight: 600;">${p.name}</div>
                                <div style="font-size: 11px; color: var(--text-sub);">
                                    ${p.cal} kcal · P${p.p} C${p.c} F${p.f}
                                </div>
                            </div>
                            <div style="width:18px; height:18px; color:var(--neon-green);">${Icons.plus}</div>
                        </button>
                    `).join('')}
                </div>
            `;
        } else {
            content = `
                <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">${this.selectedProduct.name}</h2>
                <div style="font-size:12px; color:var(--text-sub); margin-bottom: 16px;">Target meal: <span style="color:var(--neon-green); text-transform:capitalize;">${this.meal}</span></div>
                <div class="input-group" style="margin-bottom: 16px;">
                    <input type="number" id="gram-input" class="input-field" placeholder="Grams" value="100" autofocus style="font-size: 32px; font-weight: 700; text-align: center; color: var(--neon-green);">
                </div>
                <button id="confirm-add" class="btn-primary" style="display:flex; align-items:center; justify-content:center; gap:8px;">
                    <span style="width:16px; height:16px;">${Icons.check}</span>
                    Confirm add
                </button>
            `;
        }

        this.container.innerHTML = `
            <div class="backdrop"></div>
            <div class="modal-sheet">${content}</div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        this.container.querySelector('.backdrop').onclick = () => this.close();

        if (this.step === 'select') {
            this.container.querySelectorAll('.meal-select').forEach(el => {
                el.onclick = () => {
                    this.meal = el.dataset.meal;
                    this.renderContent();
                };
            });

            this.container.querySelectorAll('.product-item').forEach(el => {
                el.onclick = () => {
                    this.selectedProduct = this.products.find(p => String(p.id) === String(el.dataset.id));
                    if (!this.selectedProduct) return;
                    this.step = 'grams';
                    this.renderContent();
                };
            });
        } else {
            this.container.querySelector('#confirm-add').onclick = () => {
                const input = this.container.querySelector('#gram-input');
                const grams = parseFloat(input?.value) || 0;
                if (grams <= 0 || !this.selectedProduct) return;
                this.onAdd(this.selectedProduct, grams, this.meal);
                this.close();
            };
        }
    }
}
