import { Component } from '../core/Component.js';
import { Icons } from '../core/Icons.js';

const MEALS = [
    { id: 'breakfast', label: 'Śniadanie', icon: Icons.breakfast },
    { id: 'lunch', label: 'Obiad', icon: Icons.lunch },
    { id: 'dinner', label: 'Kolacja', icon: Icons.dinner }
];

const PAGE_SIZE = 7;

export class ProductModal extends Component {
    constructor() {
        super('#modal-layer');
        this.products = [];
        this.onAdd = null;
        this.meal = 'breakfast';
        this.query = '';
        this.page = 1;
        this.step = 'select';
        this.selectedProduct = null;
    }

    open(products, onAdd) {
        this.products = products;
        this.onAdd = onAdd;
        this.meal = 'breakfast';
        this.query = '';
        this.page = 1;
        this.step = 'select';
        this.selectedProduct = null;

        this.container.innerHTML = `
            <div class="backdrop"></div>
            <div class="modal-sheet"><div id="modal-content"></div></div>
        `;

        this.renderContent();
        requestAnimationFrame(() => {
            this.container.querySelector('.backdrop')?.classList.add('open');
            this.container.querySelector('.modal-sheet')?.classList.add('open');
        });
    }

    close() {
        const backdrop = this.container.querySelector('.backdrop');
        const sheet = this.container.querySelector('.modal-sheet');
        if (!backdrop || !sheet) return;
        backdrop.classList.remove('open');
        sheet.classList.remove('open');
        setTimeout(() => { this.container.innerHTML = ''; }, 280);
    }

    get filteredProducts() {
        const query = this.query.trim().toLowerCase();
        if (!query) return this.products;
        return this.products.filter(p => p.name.toLowerCase().includes(query));
    }

    iconForProduct(product) {
        return Icons[product.icon] || Icons.leaf;
    }

    renderContent() {
        const root = this.container.querySelector('#modal-content');
        if (!root) return;

        if (this.step === 'select') {
            const source = this.filteredProducts;
            const pages = Math.max(1, Math.ceil(source.length / PAGE_SIZE));
            if (this.page > pages) this.page = pages;
            const pageItems = source.slice((this.page - 1) * PAGE_SIZE, this.page * PAGE_SIZE);

            root.innerHTML = `
                <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 12px;">Dodaj produkt</h2>
                <input id="search-product" class="input-field" placeholder="Szukaj produktu..." value="${this.query}" style="margin-bottom: 10px;">
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; margin-bottom: 14px;">
                    ${MEALS.map(m => `
                        <button class="meal-select" data-meal="${m.id}" style="padding:9px 8px; border-radius:12px; border:1px solid ${this.meal === m.id ? 'var(--line-strong)' : 'var(--line-soft)'}; color:${this.meal === m.id ? 'var(--accent-main)' : 'var(--text-sub)'}; background: rgba(255,255,255,0.03); display:flex; flex-direction:column; align-items:center; gap:4px;">
                            <span style="width:16px; height:16px;">${m.icon}</span>
                            <span style="font-size:11px; font-weight:600;">${m.label}</span>
                        </button>
                    `).join('')}
                </div>

                <div style="max-height: 42vh; overflow-y: auto;">
                    ${pageItems.length === 0 ? `<div style="padding:18px; color:var(--text-dim); text-align:center;">Brak produktów dla tego wyszukiwania</div>` : pageItems.map(p => `
                        <button class="list-item product-item" data-id="${p.id}" style="width:100%; text-align:left; border-radius:14px; margin-bottom:8px; border-left:4px solid ${p.color};">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <span style="width:18px; height:18px; color:${p.color};">${this.iconForProduct(p)}</span>
                                <div>
                                    <div style="font-weight: 600;">${p.name}</div>
                                    <div style="font-size: 11px; color: var(--text-sub);">${p.cal} kcal · B${p.p} T${p.f} W${p.c}</div>
                                </div>
                            </div>
                            <div style="width:18px; height:18px; color:var(--accent-main);">${Icons.plus}</div>
                        </button>
                    `).join('')}
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; font-size:12px; color:var(--text-sub);">
                    <button id="prev-page" ${this.page === 1 ? 'disabled' : ''} style="color:var(--text-sub);">← Poprzednia</button>
                    <span>Strona ${this.page}/${pages}</span>
                    <button id="next-page" ${this.page === pages ? 'disabled' : ''} style="color:var(--text-sub);">Następna →</button>
                </div>
            `;
        } else {
            root.innerHTML = `
                <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 8px;">${this.selectedProduct.name}</h2>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px; color:var(--text-sub); font-size:12px;">
                    <span style="width:14px; height:14px; color:${this.selectedProduct.color};">${this.iconForProduct(this.selectedProduct)}</span>
                    Posiłek: <strong style="color:var(--accent-main);">${MEALS.find(m => m.id === this.meal)?.label}</strong>
                </div>
                <div class="input-group" style="margin-bottom: 14px;">
                    <input type="number" id="gram-input" class="input-field" placeholder="Gramy" value="100" autofocus style="font-size: 30px; font-weight: 700; text-align: right; color: var(--accent-main);">
                </div>
                <div style="display:flex; gap:8px;">
                    <button id="back-step" class="input-field" style="text-align:center;">Wróć</button>
                    <button id="confirm-add" class="btn-primary" style="display:flex; align-items:center; justify-content:center; gap:8px;">
                        <span style="width:16px; height:16px;">${Icons.check}</span>
                        Dodaj do dnia
                    </button>
                </div>
            `;
        }

        this.bindEvents();
    }

    bindEvents() {
        this.container.querySelector('.backdrop').onclick = () => this.close();

        if (this.step === 'select') {
            this.container.querySelector('#search-product').oninput = (e) => {
                this.query = e.currentTarget.value;
                this.page = 1;
                this.renderContent();
            };

            this.container.querySelectorAll('.meal-select').forEach(el => {
                el.onclick = () => {
                    this.meal = el.dataset.meal;
                    this.renderContent();
                };
            });

            this.container.querySelectorAll('.product-item').forEach(el => {
                el.onclick = () => {
                    const selected = this.products.find(p => String(p.id) === String(el.dataset.id));
                    if (!selected) return;
                    this.selectedProduct = selected;
                    if (selected.defaultMeal && selected.defaultMeal !== 'global') {
                        this.meal = selected.defaultMeal;
                    }
                    this.step = 'grams';
                    this.renderContent();
                };
            });

            const prev = this.container.querySelector('#prev-page');
            const next = this.container.querySelector('#next-page');
            if (prev) prev.onclick = () => { if (this.page > 1) { this.page -= 1; this.renderContent(); } };
            if (next) next.onclick = () => { this.page += 1; this.renderContent(); };
        } else {
            this.container.querySelector('#back-step').onclick = () => {
                this.step = 'select';
                this.renderContent();
            };

            this.container.querySelector('#confirm-add').onclick = () => {
                const grams = parseFloat(this.container.querySelector('#gram-input')?.value || '0');
                if (grams <= 0 || !this.selectedProduct) return;
                this.onAdd(this.selectedProduct, grams, this.meal);
                this.close();
            };
        }
    }
}
