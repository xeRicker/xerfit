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
        store.toast(`Aktywny profil: ${selectedProfile}`);
    }

    async openProfilePicker() {
        let profiles = await this.loadProfiles();
        let managing = false;
        let creating = false;

        return new Promise((resolve) => {
            const layer = document.getElementById('modal-layer');

            const render = () => {
                const cards = profiles.map((profile, idx) => {
                    const avatar = Icons[profile.avatar || AVATARS[idx % AVATARS.length]];
                    return `<button class="profile-card" data-id="${profile.id}"><span class="profile-avatar">${avatar}</span><span class="profile-name">${profile.name}</span>${managing && profile.id !== 'default' ? `<span class="profile-delete" data-delete="${profile.id}">${Icons.close}</span>` : ''}</button>`;
                }).join('');

                layer.innerHTML = `
                    <div class="profile-picker-backdrop"></div>
                    <div class="profile-picker">
                        <div class="profile-head"><h2>Wybierz profil</h2><button id="manage-profiles" class="chip-btn">${managing ? 'Gotowe' : 'Zarządzaj'}</button></div>
                        <div class="profile-grid">${cards}</div>
                        ${creating ? `<div class="profile-create-sheet"><input id="new-profile" class="input-field" placeholder="Nazwa profilu"><select id="avatar-select" class="input-field">${AVATARS.map((a,i)=>`<option value="${a}">Avatar ${i+1}</option>`).join('')}</select><div class="profile-create-actions"><button id="cancel-create" class="btn-muted">Anuluj</button><button id="confirm-create" class="btn-primary">Utwórz profil</button></div></div>` : `<button id="show-create" class="btn-muted" style="width:100%; margin-top:12px;">+ Dodaj profil</button>`}
                    </div>`;

                layer.querySelectorAll('.profile-card').forEach((btn) => {
                    btn.onclick = (event) => {
                        if (event.target.closest('[data-delete]') || managing) return;
                        layer.innerHTML = '';
                        resolve(btn.dataset.id);
                    };
                });

                layer.querySelectorAll('[data-delete]').forEach((btn) => {
                    btn.onclick = async () => {
                        const id = btn.dataset.delete;
                        profiles = profiles.filter((p) => p.id !== id);
                        localStorage.removeItem(`db/profiles/${id}`);
                        await GitHubDataService.deleteProfileData(id);
                        await this.saveProfiles(profiles);
                        store.toast('Usunięto profil.', 'warning');
                        render();
                    };
                });

                layer.querySelector('#manage-profiles').onclick = () => { managing = !managing; render(); };

                const show = layer.querySelector('#show-create');
                if (show) show.onclick = () => { creating = true; managing = false; render(); };

                const cancel = layer.querySelector('#cancel-create');
                if (cancel) cancel.onclick = () => { creating = false; render(); };

                const confirm = layer.querySelector('#confirm-create');
                if (confirm) confirm.onclick = async () => {
                    const input = layer.querySelector('#new-profile');
                    const avatar = layer.querySelector('#avatar-select').value;
                    const name = input.value.trim();
                    if (!name) return;
                    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    if (!id) return;
                    if (profiles.some((p) => p.id === id)) {
                        store.toast('Profil o tej nazwie już istnieje.', 'warning');
                        return;
                    }
                    profiles = [...profiles, { id, name, avatar }];
                    await this.saveProfiles(profiles);
                    layer.innerHTML = '';
                    resolve(id);
                };
            };

            render();
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
            }, 2300);
        });
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
