import { Component } from '../core/Component.js';
import { store } from '../core/Store.js';
import { Icons } from '../core/Icons.js';

export class MealsView extends Component {
    constructor(container) {
        super(container);
        this.unsub = store.subscribe(s => this.update(s));
    }

    update(state) {
        this.container.innerHTML = `
            <header style="padding: calc(var(--safe-top) + 20px) 20px 20px;">
                <h1 style="font-size: 28px; font-weight: 800;">My Foods</h1>
                <p style="color: var(--text-sub);">Database of saved products</p>
            </header>

            <div style="padding: 0 20px;">
                <div class="card" style="margin: 0 0 20px 0; padding: 16px;">
                    <h3 style="margin-bottom: 12px;">Create New Product</h3>
                    <input id="p-name" class="input-field" placeholder="Name (e.g. Banana)" style="margin-bottom: 8px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px;">
                        <input id="p-cal" type="number" class="input-field" placeholder="Kcal">
                        <input id="p-p" type="number" class="input-field" placeholder="P">
                        <input id="p-c" type="number" class="input-field" placeholder="C">
                        <input id="p-f" type="number" class="input-field" placeholder="F">
                    </div>
                    <button id="save-prod" class="btn-primary" style="margin-top: 12px;">Save to DB</button>
                </div>

                ${state.products.map(p => `
                    <div class="list-item" style="border-radius: 12px; margin-bottom: 8px; border: 1px solid #eee;">
                        <div>
                            <div style="font-weight: 600;">${p.name}</div>
                            <div style="font-size: 11px; color: var(--text-sub);">
                                Per 100g: ${p.cal}kcal P${p.p} C${p.c} F${p.f}
                            </div>
                        </div>
                        <button class="del-prod" data-id="${p.id}" style="color: var(--c-red); opacity: 0.6;">${Icons.trash}</button>
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