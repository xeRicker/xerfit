import { Component } from '../core/Component.js';
import { Icons } from '../core/Icons.js';

export class ProductModal extends Component {
    constructor() {
        super('#modal-layer');
        this.onAdd = null;
        this.products = [];
    }

    open(products, onAdd) {
        this.products = products;
        this.onAdd = onAdd;
        this.step = 'select'; // select | grams
        this.selectedProduct = null;
        this.renderContent();

        requestAnimationFrame(() => {
            this.container.querySelector('.backdrop').classList.add('open');
            this.container.querySelector('.modal-sheet').classList.add('open');
        });
    }

    close() {
        const b = this.container.querySelector('.backdrop');
        const s = this.container.querySelector('.modal-sheet');
        if(b && s) {
            b.classList.remove('open');
            s.classList.remove('open');
            setTimeout(() => this.container.innerHTML = '', 300);
        }
    }

    renderContent() {
        let content = '';

        if (this.step === 'select') {
            content = `
                <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Select Product</h2>
                <div style="max-height: 50vh; overflow-y: auto;">
                    ${this.products.map(p => `
                        <div class="list-item product-item" data-id="${p.id}" style="border-radius: 12px; margin-bottom: 8px; border: 1px solid #eee;">
                            <div>
                                <div style="font-weight: 600;">${p.name}</div>
                                <div style="font-size: 11px; color: var(--text-sub);">
                                    ${p.cal} kcal &bull; P${p.p} C${p.c} F${p.f}
                                </div>
                            </div>
                            <div style="color: var(--c-blue);">${Icons.plus}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            content = `
                <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">
                    How much ${this.selectedProduct.name}?
                </h2>
                <div class="input-group" style="margin-bottom: 24px;">
                    <input type="number" id="gram-input" class="input-field" placeholder="Grams" value="100" autofocus style="font-size: 32px; font-weight: 700; text-align: center; color: var(--c-blue);">
                </div>
                <button id="confirm-add" class="btn-primary">Add to Day</button>
            `;
        }

        this.container.innerHTML = `
            <div class="backdrop"></div>
            <div class="modal-sheet">
                ${content}
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        this.container.querySelector('.backdrop').onclick = () => this.close();

        if (this.step === 'select') {
            this.container.querySelectorAll('.product-item').forEach(el => {
                el.onclick = () => {
                    this.selectedProduct = this.products.find(p => p.id === el.dataset.id);
                    this.step = 'grams';
                    this.renderContent();
                };
            });
        } else {
            this.container.querySelector('#confirm-add').onclick = () => {
                const g = parseFloat(document.getElementById('gram-input').value) || 0;
                if (g > 0) {
                    this.onAdd(this.selectedProduct, g);
                    this.close();
                }
            };
        }
    }
}