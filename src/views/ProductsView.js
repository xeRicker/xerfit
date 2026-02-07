import { Component } from '../core/Component.js';
import { store } from '../core/Store.js';
import { Icons } from '../core/Icons.js';

export class ProductsView extends Component {
    constructor(container) {
        super(container);
        this.pendingDeleteId = null;
        this.unsub = store.subscribe(s => this.update(s));
    }

    update(state) {
        this.container.innerHTML = `
            <header style="padding: calc(var(--safe-top) + 20px) 20px 10px;">
                <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; display:flex; align-items:center; gap:8px;">
                    <span style="width:18px; height:18px; color: var(--neon-green);">${Icons.products}</span>
                    Products
                </h1>
                <p style="color: var(--text-sub); font-size: 13px;">Manage your food database</p>
            </header>

            <div style="padding: 0 16px;">
                <div class="card" style="margin: 0 0 24px 0; border-color: var(--line-strong);">
                    <h3 style="margin-bottom: 12px; font-size: 13px; color: var(--neon-green); letter-spacing: .7px;">NEW PRODUCT</h3>
                    <input id="p-name" class="input-field" placeholder="Product Name" style="margin-bottom: 8px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px;">
                        <input id="p-cal" type="number" class="input-field" placeholder="Kcal">
                        <input id="p-p" type="number" class="input-field" placeholder="P">
                        <input id="p-c" type="number" class="input-field" placeholder="C">
                        <input id="p-f" type="number" class="input-field" placeholder="F">
                    </div>
                    <button id="save-prod" class="btn-primary" style="margin-top: 12px; display:flex; align-items:center; justify-content:center; gap:8px;">
                        <span style="width:16px; height:16px;">${Icons.check}</span>
                        Save Product
                    </button>
                </div>

                <div style="margin-bottom: 8px; font-size: 12px; color: var(--text-sub); text-transform: uppercase; letter-spacing: 1px;">Saved Items</div>
                ${state.products.map(p => `
                    <div class="list-item" style="border-left: 3px solid var(--neon-green);">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; font-size: 15px;">${p.name}</div>
                            <div style="font-size: 11px; color: var(--text-sub); margin-top: 2px;">
                                100g: <span style="color:var(--text-main);">${p.cal}</span> kcal · P${p.p} C${p.c} F${p.f}
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px; margin-left:10px;">
                            ${this.pendingDeleteId === p.id ? `<button class="confirm-del" data-id="${p.id}" style="font-size:11px; padding:6px 8px; border-radius:8px; background:rgba(255,107,122,.12); color:var(--neon-red); border:1px solid rgba(255,107,122,.5);">Confirm</button>` : ''}
                            <button class="del-prod" data-id="${p.id}" style="color: var(--neon-red); width:22px; height:22px; display:grid; place-items:center;">${Icons.close}</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="height: 100px;"></div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        this.container.querySelector('#save-prod').onclick = () => {
            const name = document.getElementById('p-name').value.trim();
            if (!name) return;
            store.addProduct({
                name,
                cal: Number(document.getElementById('p-cal').value),
                p: Number(document.getElementById('p-p').value),
                c: Number(document.getElementById('p-c').value),
                f: Number(document.getElementById('p-f').value),
            });
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
