import { Component } from '../core/Component.js';
import { store } from '../core/Store.js';
import { Icons } from '../core/Icons.js';

const ICON_OPTIONS = ['chicken', 'rice', 'potato', 'egg', 'oats', 'fish', 'avocado', 'yogurt'];
const COLOR_OPTIONS = ['#FF6A00', '#FF9500', '#FF4D00', '#0A84FF', '#30D158', '#FF375F', '#64D2FF', '#FFD60A', '#BF5AF2', '#5E5CE6'];
const PAGE_SIZE = 8;
const emptyForm = () => ({ name: '', cal: '', p: '', c: '', f: '', color: '#FF6A00', icon: 'chicken', defaultMeal: 'global' });

export class ProductsView extends Component {
    constructor(container) {
        super(container);
        this.query = '';
        this.sortBy = 'name';
        this.page = 1;
        this.onlyFavorites = false;
        this.formOpen = false;
        this.editingId = null;
        this.form = emptyForm();
        this.unsub = store.subscribe(s => this.update(s));
    }

    iconFor(key) { return Icons[key] || Icons.chicken; }
    isFormValid() { const f = this.form; return Boolean(f.name.trim()) && [f.cal, f.p, f.c, f.f].every(v => String(v).length > 0 && Number(v) >= 0); }

    getFiltered(products) {
        const query = this.query.trim().toLowerCase();
        const source = products.filter(p => !query || p.name.toLowerCase().includes(query)).filter(p => !this.onlyFavorites || p.favorite);
        const sorted = [...source].sort((a, b) => (this.sortBy === 'protein' ? b.p - a.p : this.sortBy === 'fat' ? b.f - a.f : this.sortBy === 'carbs' ? b.c - a.c : this.sortBy === 'calories' ? b.cal - a.cal : a.name.localeCompare(b.name, 'pl')));
        const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
        if (this.page > pages) this.page = pages;
        return { pages, total: sorted.length, items: sorted.slice((this.page - 1) * PAGE_SIZE, this.page * PAGE_SIZE) };
    }

    openEditForm(product) {
        this.formOpen = true;
        this.editingId = product.id;
        this.form = { name: product.name, cal: String(product.cal), p: String(product.p), c: String(product.c), f: String(product.f), color: product.color || '#FF6A00', icon: product.icon || 'chicken', defaultMeal: product.defaultMeal || 'global' };
    }

    update(state) {
        const { items, pages, total } = this.getFiltered(state.products);
        const isEditing = Boolean(this.editingId);
        this.container.innerHTML = `
            <header class="screen-header"><h1>Produkty</h1></header>
            <div class="products-screen screen-shell">
                <div class="card toolbar-card products-toolbar">
                    <div class="search-shell"><span class="search-icon">${Icons.search}</span><input id="search" class="input-field search-input" placeholder="Szukaj po nazwie produktu" value="${this.query}"><button id="clear-search" class="btn-icon" ${this.query ? '' : 'disabled'}>${Icons.close}</button></div>
                    <div class="products-controls">
                        <div class="products-filter-switch"><button id="filter-all" class="btn-muted chip-switch ${this.onlyFavorites ? '' : 'is-active'}">Wszystkie</button><button id="filter-fav" class="btn-muted chip-switch ${this.onlyFavorites ? 'is-active' : ''}">${Icons.star}<span>Ulubione</span></button></div>
                        <button id="toggle-form" class="btn-primary chip-large product-add-btn">${Icons.plus}<span>${this.formOpen ? 'Zamknij formularz' : 'Dodaj produkt'}</span></button>
                    </div>
                    <div class="sort-row"><span class="input-label input-label-tight">Sortowanie</span><select id="sort" class="input-field"><option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>Nazwa (A-Z)</option><option value="protein" ${this.sortBy === 'protein' ? 'selected' : ''}>Najwięcej białka</option><option value="fat" ${this.sortBy === 'fat' ? 'selected' : ''}>Najwięcej tłuszczu</option><option value="carbs" ${this.sortBy === 'carbs' ? 'selected' : ''}>Najwięcej węgli</option><option value="calories" ${this.sortBy === 'calories' ? 'selected' : ''}>Najwięcej kcal</option></select></div>
                </div>
                ${this.formOpen ? `<div class="card product-form-card"><h3 class="product-form-title">${isEditing ? 'Edycja produktu' : 'Nowy produkt'}</h3><input id="p-name" class="input-field product-name-input" placeholder="Nazwa" value="${this.form.name}"><div class="product-grid-fields"><input id="p-cal" type="number" class="input-field" placeholder="kcal" value="${this.form.cal}"><input id="p-p" type="number" class="input-field macro-input" placeholder="Białko" value="${this.form.p}"><input id="p-f" type="number" class="input-field macro-input" placeholder="Tłuszcz" value="${this.form.f}"><input id="p-c" type="number" class="input-field macro-input" placeholder="Węgle" value="${this.form.c}"></div><div class="color-palette">${COLOR_OPTIONS.map(color => `<button class="color-opt ${this.form.color === color ? 'is-active' : ''}" data-color="${color}" style="background:${color};"></button>`).join('')}</div><div class="icon-palette">${ICON_OPTIONS.map(icon => `<button class="icon-opt ${this.form.icon === icon ? 'is-active' : ''}" data-icon="${icon}">${this.iconFor(icon)}</button>`).join('')}</div><div class="product-form-select"><select id="p-meal" class="input-field"><option value="global" ${this.form.defaultMeal === 'global' ? 'selected' : ''}>Globalny</option><option value="breakfast" ${this.form.defaultMeal === 'breakfast' ? 'selected' : ''}>Śniadanie</option><option value="lunch" ${this.form.defaultMeal === 'lunch' ? 'selected' : ''}>Obiad</option><option value="dinner" ${this.form.defaultMeal === 'dinner' ? 'selected' : ''}>Kolacja</option></select></div><div class="product-form-actions"><button id="save-prod" class="btn-primary" ${this.isFormValid() ? '' : 'disabled'}>${isEditing ? 'Zapisz' : 'Dodaj'}</button><button id="close-form" class="btn-muted">Anuluj</button></div></div>` : ''}
                <div class="products-results">Wyniki: ${total}</div>
                ${items.map(p => `<div class="list-item meal-entry food-entry product-row" style="border-left:3px solid ${p.color || '#FF6A00'};"><div class="meal-entry-top"><div class="meal-entry-main"><span class="meal-entry-icon" style="color:${p.color || '#FF6A00'};">${this.iconFor(p.icon)}</span><div class="product-copy"><div class="entry-title">${p.name}</div><div class="entry-sub">100g · <span class="meal-kcal">${p.cal} kcal</span></div><div class="product-macros"><span class="macro-pill macro-pill-strong"><span class="macro-icon protein">${Icons.protein}</span>${p.p}</span><span class="macro-pill macro-pill-strong"><span class="macro-icon fat">${Icons.fat}</span>${p.f}</span><span class="macro-pill macro-pill-strong"><span class="macro-icon carbs">${Icons.carbs}</span>${p.c}</span></div></div></div><div class="entry-actions entry-actions-right product-actions"><button class="fav-prod btn-icon ${p.favorite ? 'is-active' : ''}" data-id="${p.id}">${p.favorite ? Icons.starFilled : Icons.star}</button><button class="edit-prod btn-icon" data-id="${p.id}">${Icons.edit}</button><button class="del-prod btn-icon btn-danger" data-id="${p.id}">${Icons.close}</button></div></div></div>`).join('')}
                <div class="pager-row"><button id="prev-page" class="icon-nav-btn" ${this.page === 1 ? 'disabled' : ''}>${Icons.chevronLeft}</button><span>Strona ${this.page}/${pages}</span><button id="next-page" class="icon-nav-btn" ${this.page === pages ? 'disabled' : ''}>${Icons.chevronRight}</button></div>
            </div><div style="height: 100px;"></div>`;
        this.bindEvents();
    }

    syncForm() {
        if (!this.formOpen) return;
        this.form = { ...this.form, name: this.container.querySelector('#p-name')?.value || '', cal: this.container.querySelector('#p-cal')?.value || '', p: this.container.querySelector('#p-p')?.value || '', f: this.container.querySelector('#p-f')?.value || '', c: this.container.querySelector('#p-c')?.value || '', defaultMeal: this.container.querySelector('#p-meal')?.value || 'global' };
        const save = this.container.querySelector('#save-prod');
        if (save) save.disabled = !this.isFormValid();
    }

    bindEvents() {
        this.container.querySelector('#toggle-form').onclick = () => { this.formOpen = !this.formOpen; if (!this.formOpen) { this.form = emptyForm(); this.editingId = null; } this.update(store.state); };
        ['#p-name', '#p-cal', '#p-p', '#p-f', '#p-c', '#p-meal'].forEach(sel => { const el = this.container.querySelector(sel); if (el) { el.oninput = () => this.syncForm(); el.onchange = () => this.syncForm(); } });
        this.container.querySelectorAll('.color-opt').forEach(btn => btn.onclick = () => { this.form.color = btn.dataset.color; this.update(store.state); });
        this.container.querySelectorAll('.icon-opt').forEach(btn => btn.onclick = () => { this.form.icon = btn.dataset.icon; this.update(store.state); });
        const save = this.container.querySelector('#save-prod');
        if (save) save.onclick = () => { this.syncForm(); if (!this.isFormValid()) return; const payload = { name: this.form.name.trim(), cal: Number(this.form.cal), p: Number(this.form.p), c: Number(this.form.c), f: Number(this.form.f), color: this.form.color, icon: this.form.icon, defaultMeal: this.form.defaultMeal }; if (this.editingId) store.updateProduct(this.editingId, payload); else store.addProduct({ ...payload, favorite: false }); this.formOpen = false; this.editingId = null; this.form = emptyForm(); this.update(store.state); };
        const close = this.container.querySelector('#close-form');
        if (close) close.onclick = () => { this.formOpen = false; this.editingId = null; this.form = emptyForm(); this.update(store.state); };
        this.container.querySelector('#search').oninput = (e) => {
            this.query = e.currentTarget.value;
            this.page = 1;
            this.update(store.state);
            const input = this.container.querySelector('#search');
            if (input) {
                input.focus();
                const pos = this.query.length;
                input.setSelectionRange(pos, pos);
            }
        };
        this.container.querySelector('#clear-search').onclick = () => { this.query = ''; this.page = 1; this.update(store.state); };
        this.container.querySelector('#sort').onchange = (e) => { this.sortBy = e.currentTarget.value; this.page = 1; this.update(store.state); };
        this.container.querySelector('#filter-all').onclick = () => { this.onlyFavorites = false; this.page = 1; this.update(store.state); };
        this.container.querySelector('#filter-fav').onclick = () => { this.onlyFavorites = true; this.page = 1; this.update(store.state); };
        this.container.querySelectorAll('.fav-prod').forEach(btn => btn.onclick = () => store.toggleFavoriteProduct(btn.dataset.id));
        this.container.querySelectorAll('.edit-prod').forEach(btn => btn.onclick = () => { const product = store.state.products.find(p => String(p.id) === String(btn.dataset.id)); if (!product) return; this.openEditForm(product); this.update(store.state); });
        this.container.querySelectorAll('.del-prod').forEach(btn => btn.onclick = () => store.deleteProduct(btn.dataset.id));
        const prev = this.container.querySelector('#prev-page'); const next = this.container.querySelector('#next-page');
        if (prev) prev.onclick = () => { if (this.page > 1) { this.page -= 1; this.update(store.state); } };
        if (next) next.onclick = () => { const pages = this.getFiltered(store.state.products).pages; if (this.page < pages) { this.page += 1; this.update(store.state); } };
    }

    destroy() { this.unsub(); }
}
