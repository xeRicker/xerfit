import { Component } from '../core/Component.js';
import { store } from '../core/Store.js';
import { Icons } from '../core/Icons.js';

export class ProductsView extends Component {
    constructor(container) {
        super(container);
        this.unsub = store.subscribe(s => this.update(s));
    }

    update(state) {
        this.container.innerHTML = `
            <header style="padding: calc(var(--safe-top) + 20px) 20px 10px;">
                <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Products</h1>
                <p style="color: var(--text-sub); font-size: 13px;">Manage your food database</p>
            </header>

            <div style="padding: 0 16px;">
                <!-- Add New Product Card -->
                <div class="card" style="margin: 0 0 24px 0; border-color: var(--neon-blue);">
                    <h3 style="margin-bottom: 12px; font-size: 14px; color: var(--neon-blue);">NEW PRODUCT</h3>
                    <input id="p-name" class="input-field" placeholder="Product Name" style="margin-bottom: 8px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px;">
                        <input id="p-cal" type="number" class="input-field" placeholder="Kcal">
                        <input id="p-p" type="number" class="input-field" placeholder="P">
                        <input id="p-c" type="number" class="input-field" placeholder="C">
                        <input id="p-f" type="number" class="input-field" placeholder="F">
                    </div>
                    <button id="save-prod" class="btn-primary" style="margin-top: 12px;">Save Product</button>
                </div>

                <div style="margin-bottom: 8px; font-size: 12px; color: var(--text-sub); text-transform: uppercase; letter-spacing: 1px;">Saved Items</div>
                ${state.products.map(p => `
                    <div class="list-item" style="border-left: 3px solid var(--neon-blue);">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; font-size: 15px;">${p.name}</div>
                            <div style="font-size: 11px; color: var(--text-sub); margin-top: 2px;">
                                100g: <span style="color:white;">${p.cal}</span> kcal &bull; P${p.p} C${p.c} F${p.f}
                            </div>
                        </div>
                        <button class="del-prod" data-id="${p.id}" style="color: var(--neon-red); opacity: 0.7; padding: 8px;">${Icons.trash}</button>
                    </div>
                `).join('')}
            </div>
            <div style="height: 100px;"></div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        this.container.querySelector('#save-prod').onclick = () => {
            const name = document.getElementById('p-name').value;
            if(!name) return;
            store.addProduct({
                name,
                cal: Number(document.getElementById('p-cal').value),
                p: Number(document.getElementById('p-p').value),
                c: Number(document.getElementById('p-c').value),
                f: Number(document.getElementById('p-f').value),
            });
        };

        this.container.querySelectorAll('.del-prod').forEach(btn => {
            btn.onclick = (e) => store.deleteProduct(e.currentTarget.dataset.id);
        });
    }

    destroy() { this.unsub(); }
}