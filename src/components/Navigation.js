import { Component } from '../core/Component.js';
import { Icons } from '../core/Icons.js';

export class Navigation extends Component {
    constructor(container, onNav) {
        super(container);
        this.onNav = onNav;
        this.active = 'days';
    }

    setActive(tab) {
        this.active = tab;
        this.render();
    }

    render() {
        const tabs = [
            { id: 'days', icon: Icons.days, label: 'Jadłospis' },
            { id: 'week', icon: Icons.week, label: 'Podsumowanie' },
            { id: 'products', icon: Icons.products, label: 'Produkty' },
            { id: 'you', icon: Icons.user, label: 'Ty' }
        ];

        this.container.innerHTML = tabs.map(t => `
            <div class="nav-item ${this.active === t.id ? 'active' : ''}" data-id="${t.id}">
                ${t.icon}
                <span>${t.label}</span>
            </div>
        `).join('');

        this.container.querySelectorAll('.nav-item').forEach(el => {
            el.onclick = () => {
                this.setActive(el.dataset.id);
                this.onNav(el.dataset.id);
            };
        });
    }
}
