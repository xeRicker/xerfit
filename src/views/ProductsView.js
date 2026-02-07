import { Component } from '../core/Component.js';
import { store } from '../core/Store.js';
import { Icons } from '../core/Icons.js';

const ICON_OPTIONS = ['leaf', 'chicken', 'egg', 'fish', 'grain', 'beef', 'cheese', 'pasta', 'snack', 'bottle'];
const COLOR_OPTIONS = ['#2596be', '#58b8da', '#6b8cff', '#7ac4de', '#489bb8', '#a980ff', '#ff8db2', '#87d3a9'];
const PAGE_SIZE = 8;
const emptyForm = () => ({ name: '', cal: '', p: '', c: '', f: '', color: '#2596be', icon: 'leaf', defaultMeal: 'global' });

export class ProductsView extends Component {
    constructor(container) {
        super(container);
        this.pendingDeleteId = null;
        this.query = '';
        this.sortBy = 'name';
        this.page = 1;
        this.onlyFavorites = false;
        this.formOpen = false;
        this.editingId = null;
        this.form = emptyForm();
        this.unsub = store.subscribe(s => this.update(s));
    }

    iconFor(key) { return Icons[key] || Icons.leaf; }
    isFormValid() { const f = this.form; return Boolean(f.name.trim()) && [f.cal, f.p, f.c, f.f].every(v => String(v).length > 0 && Number(v) >= 0); }

    getFiltered(products) {
        const query = this.query.trim().toLowerCase();
        const source = products.filter(p => !query || p.name.toLowerCase().includes(query)).filter(p => !this.onlyFavorites || p.favorite);
        const sorted = [...source].sort((a, b) => (this.sortBy === 'protein' ? b.p - a.p : this.sortBy === 'fat' ? b.f - a.f : this.sortBy === 'calories' ? b.cal - a.cal : a.name.localeCompare(b.name, 'pl')));
        const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
        if (this.page > pages) this.page = pages;
        return { pages, total: sorted.length, items: sorted.slice((this.page - 1) * PAGE_SIZE, this.page * PAGE_SIZE) };
    }

    openEditForm(product) { this.formOpen = true; this.editingId = product.id; this.form = { name: product.name, cal: String(product.cal), p: String(product.p), c: String(product.c), f: String(product.f), color: product.color || '#2596be', icon: product.icon || 'leaf', defaultMeal: product.defaultMeal || 'global' }; }

    update(state) {
        const { items, pages, total } = this.getFiltered(state.products);
        const isEditing = Boolean(this.editingId);
        this.container.innerHTML = `
            <header style="padding: 14px 20px 10px;"><h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Produkty</h1></header>
            <div style="padding: 0 16px;">
                <div class="card" style="margin: 0 0 12px 0; padding:12px;"><div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;"><span style="width:16px; height:16px; color:var(--accent-cyan);">${Icons.search}</span><input id="search" class="input-field" placeholder="Szukaj produktów..." value="${this.query}" style="padding:10px;"></div><div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom: 8px;"><select id="sort" class="input-field"><option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>Sort: nazwa</option><option value="protein" ${this.sortBy === 'protein' ? 'selected' : ''}>Sort: białko</option><option value="fat" ${this.sortBy === 'fat' ? 'selected' : ''}>Sort: tłuszcz</option><option value="calories" ${this.sortBy === 'calories' ? 'selected' : ''}>Sort: kalorie</option></select><button id="toggle-fav" class="input-field" style="text-align:center; color:${this.onlyFavorites ? 'var(--accent-main)' : 'var(--text-sub)'};">${this.onlyFavorites ? '★ Ulubione' : '☆ Wszystkie'}</button></div><button id="toggle-form" class="btn-primary" style="padding:10px;">Dodaj produkt</button></div>
                ${this.formOpen ? `<div class="card" style="margin: 0 0 16px 0; border-color: var(--line-strong);"><h3 style="margin-bottom: 12px; font-size: 13px; color: var(--accent-main);">${isEditing ? 'Edycja produktu' : 'Nowy produkt'}</h3><input id="p-name" class="input-field" placeholder="Nazwa" value="${this.form.name}" style="margin-bottom: 8px; text-align:right;"><div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;"><input id="p-cal" type="number" class="input-field" placeholder="kcal" value="${this.form.cal}"><input id="p-p" type="number" class="input-field" placeholder="B" value="${this.form.p}"><input id="p-f" type="number" class="input-field" placeholder="T" value="${this.form.f}"><input id="p-c" type="number" class="input-field" placeholder="W" value="${this.form.c}"></div><div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">${COLOR_OPTIONS.map(color => `<button class="color-opt" data-color="${color}" style="width:22px; height:22px; border-radius:50%; background:${color}; border:${this.form.color === color ? '2px solid #fff' : '1px solid #00000055'};"></button>`).join('')}</div><div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">${ICON_OPTIONS.map(icon => `<button class="icon-opt" data-icon="${icon}" style="width:34px;height:34px;border-radius:10px;border:1px solid ${this.form.icon === icon ? 'var(--line-strong)' : 'var(--line-soft)'};color:${this.form.icon === icon ? 'var(--accent-main)' : 'var(--text-sub)'};display:grid;place-items:center;">${this.iconFor(icon)}</button>`).join('')}</div><div style="margin-top:10px;"><select id="p-meal" class="input-field"><option value="global" ${this.form.defaultMeal === 'global' ? 'selected' : ''}>Globalny</option><option value="breakfast" ${this.form.defaultMeal === 'breakfast' ? 'selected' : ''}>Śniadanie</option><option value="lunch" ${this.form.defaultMeal === 'lunch' ? 'selected' : ''}>Obiad</option><option value="dinner" ${this.form.defaultMeal === 'dinner' ? 'selected' : ''}>Kolacja</option></select></div><div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px;"><button id="save-prod" class="btn-primary" ${this.isFormValid() ? '' : 'disabled'}>${isEditing ? 'Zapisz' : 'Dodaj'}</button><button id="close-form" class="input-field">Zamknij</button></div></div>` : ''}
                <div style="margin-bottom: 8px; font-size: 12px; color: var(--text-sub);">Wyniki: ${total}</div>
                ${items.map(p => `<div class="list-item" style="border-left: 4px solid ${p.color || '#2596be'};"><div style="flex: 1; display:flex; align-items:center; gap:10px;"><span style="width:18px; height:18px; color:${p.color || '#2596be'};">${this.iconFor(p.icon)}</span><div><div style="font-weight: 600; font-size: 15px;">${p.name}</div><div style="font-size: 11px; color: var(--text-sub); margin-top: 2px;">100g: ${p.cal} kcal · B${p.p} T${p.f} W${p.c}</div></div></div><div style="display:flex; align-items:center; gap:8px; margin-left:10px;"><button class="fav-prod" data-id="${p.id}" style="color:${p.favorite ? 'var(--accent-main)' : 'var(--text-sub)'}; width:22px; height:22px;">${p.favorite ? Icons.starFilled : Icons.star}</button><button class="edit-prod" data-id="${p.id}" style="color: var(--accent-cyan); width:22px; height:22px;">${Icons.edit}</button><button class="del-prod" data-id="${p.id}" style="color: var(--accent-red); width:22px; height:22px;">${Icons.close}</button></div></div>`).join('')}
                <div style="display:flex; justify-content:space-between; margin:8px 0 0; color:var(--text-sub);"><button id="prev-page" ${this.page === 1 ? 'disabled' : ''}>←</button><span>Strona ${this.page}/${pages}</span><button id="next-page" ${this.page === pages ? 'disabled' : ''}>→</button></div>
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
        this.container.querySelector('#search').oninput = (e) => { this.query = e.currentTarget.value; this.page = 1; this.update(store.state); };
        this.container.querySelector('#sort').onchange = (e) => { this.sortBy = e.currentTarget.value; this.page = 1; this.update(store.state); };
        this.container.querySelector('#toggle-fav').onclick = () => { this.onlyFavorites = !this.onlyFavorites; this.page = 1; this.update(store.state); };
        this.container.querySelectorAll('.fav-prod').forEach(btn => btn.onclick = () => store.toggleFavoriteProduct(btn.dataset.id));
        this.container.querySelectorAll('.edit-prod').forEach(btn => btn.onclick = () => { const product = store.state.products.find(p => String(p.id) === String(btn.dataset.id)); if (!product) return; this.openEditForm(product); this.update(store.state); });
        this.container.querySelectorAll('.del-prod').forEach(btn => btn.onclick = () => store.deleteProduct(btn.dataset.id));
        const prev = this.container.querySelector('#prev-page'); const next = this.container.querySelector('#next-page');
        if (prev) prev.onclick = () => { if (this.page > 1) { this.page -= 1; this.update(store.state); } };
        if (next) next.onclick = () => { this.page += 1; this.update(store.state); };
    }

    destroy() { this.unsub(); }
}
