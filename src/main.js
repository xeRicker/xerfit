import { Navigation } from './components/Navigation.js';
import { DaysView } from './views/DaysView.js';
import { ProductsView } from './views/ProductsView.js';
import { YouView } from './views/YouView.js';
import { WeekView } from './views/WeekView.js';
import { store } from './core/Store.js';
import { GitHubDataService } from './services/GitHubDataService.js';

class App {
    constructor() {
        this.outlet = document.getElementById('router-outlet');
        this.nav = new Navigation(document.getElementById('bottom-nav'), (tab) => this.route(tab));
        this.currentView = null;
        this.nav.render();
        this.bindToasts();
        this.start();
    }

    async start() {
        this.showLoading('Ładowanie danych');
        const selectedProfile = await this.openProfilePicker();
        await store.initProfile(selectedProfile);
        this.hideLoading();
        this.route('days');
    }

    async openProfilePicker() {
        const profiles = await GitHubDataService.loadProfiles();
        return new Promise((resolve) => {
            const layer = document.getElementById('modal-layer');
            const buttons = profiles.map((profile) => `<button class="profile-tile" data-id="${profile.id}">${profile.name}</button>`).join('');
            layer.innerHTML = `<div class="profile-picker-backdrop"></div><div class="profile-picker"><h2>Wybierz profil</h2><p>Każdy profil ma osobną bazę produktów i wpisów.</p><div class="profile-list">${buttons}</div><div class="profile-create"><input id="new-profile" class="input-field" placeholder="Nowy profil"><button id="add-profile" class="btn-primary">Dodaj</button></div></div>`;
            const close = (profileId) => { layer.innerHTML = ''; resolve(profileId); };
            layer.querySelectorAll('.profile-tile').forEach((btn) => {
                btn.onclick = () => close(btn.dataset.id);
            });
            layer.querySelector('#add-profile').onclick = async () => {
                const input = layer.querySelector('#new-profile');
                const name = input.value.trim();
                if (!name) return;
                const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const next = [...profiles, { id, name }];
                await GitHubDataService.saveProfiles(next);
                close(id);
            };
        });
    }

    showLoading(label) {
        const layer = document.getElementById('modal-layer');
        layer.innerHTML = `<div class="loading-screen"><div class="loader-orb"></div><div class="loading-label">${label}</div></div>`;
    }

    hideLoading() {
        const layer = document.getElementById('modal-layer');
        if (layer.querySelector('.loading-screen')) layer.innerHTML = '';
    }

    bindToasts() {
        const holder = document.createElement('div');
        holder.className = 'toast-holder';
        document.body.appendChild(holder);
        store.onToast(({ message, type }) => {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.textContent = message;
            holder.appendChild(toast);
            setTimeout(() => toast.classList.add('show'), 20);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 280);
            }, 2500);
        });
    }

    route(tab) {
        if (this.currentView && this.currentView.destroy) this.currentView.destroy();
        this.outlet.innerHTML = '';

        if (tab === 'days') this.currentView = new DaysView(this.outlet);
        else if (tab === 'week') this.currentView = new WeekView(this.outlet);
        else if (tab === 'products') this.currentView = new ProductsView(this.outlet);
        else if (tab === 'you') this.currentView = new YouView(this.outlet);
    }
}

new App();
