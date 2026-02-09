import { Navigation } from './components/Navigation.js';
import { DaysView } from './views/DaysView.js';
import { ProductsView } from './views/ProductsView.js';
import { YouView } from './views/YouView.js';
import { WeekView } from './views/WeekView.js';
import { store } from './core/Store.js';
import { GitHubDataService } from './services/GitHubDataService.js';
import { Icons } from './core/Icons.js';

const PROFILE_AVATARS = ['profile1', 'profile2', 'profile3', 'profile4'];

class App {
    constructor() {
        this.outlet = document.getElementById('router-outlet');
        this.nav = new Navigation(document.getElementById('bottom-nav'), (tab) => this.route(tab));
        this.currentView = null;
        this.syncState = { hasPendingSync: false, isSyncing: false };
        this.syncUnsub = null;
        this.nav.render();
        this.bindToasts();
        this.bindSyncButton();
        this.start();
    }

    async start() {
        this.showLoading('Ładowanie danych');
        const selectedProfile = await this.openProfilePicker();
        await store.initProfile(selectedProfile);
        this.hideLoading();
        this.route('days');
        const current = (await GitHubDataService.loadProfiles()).find(p => p.id === selectedProfile);
        store.toast(`Aktywny profil: ${current?.name || selectedProfile}`);
        this.renderSyncButton();
    }

    normalizeProfile(raw, index = 0) {
        return {
            id: raw.id,
            name: raw.name || raw.id,
            avatar: PROFILE_AVATARS.includes(raw.avatar) ? raw.avatar : PROFILE_AVATARS[index % PROFILE_AVATARS.length]
        };
    }

    normalizeId(value) {
        return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    async openProfilePicker() {
        let profiles = (await GitHubDataService.loadProfiles()).map((p, i) => this.normalizeProfile(p, i));
        if (!profiles.length) profiles = [this.normalizeProfile({ id: 'default', name: 'Domyślny' })];
        let managing = false;
        let editor = null;

        return new Promise((resolve) => {
            const layer = document.getElementById('modal-layer');

            const saveAndRender = async () => {
                await GitHubDataService.saveProfiles(profiles);
                render();
            };

            const renderEditor = () => {
                if (!editor) return '';
                const profile = editor.id ? profiles.find(p => p.id === editor.id) : { name: '', avatar: PROFILE_AVATARS[0] };
                const selectedAvatar = editor.avatar || profile?.avatar || PROFILE_AVATARS[0];
                return `<div class="profile-editor">
                    <h3>${editor.id ? 'Edytuj profil' : 'Nowy profil'}</h3>
                    <input id="profile-name" class="input-field" placeholder="Nazwa profilu" value="${profile?.name || ''}">
                    <div class="profile-avatar-grid">${PROFILE_AVATARS.map(avatar => `<button class="profile-avatar-pick ${selectedAvatar === avatar ? 'active' : ''}" data-avatar="${avatar}">${Icons[avatar]}</button>`).join('')}</div>
                    <div class="profile-editor-actions"><button id="cancel-profile-editor" class="btn-muted">Anuluj</button><button id="save-profile-editor" class="btn-primary" disabled>Zapisz</button></div>
                </div>`;
            };

            const render = () => {
                layer.innerHTML = `
                    <div class="profile-picker-backdrop"></div>
                    <div class="profile-picker">
                        <div class="profile-head"><h2>Wybierz profil</h2><button id="manage-profiles" class="btn-muted chip-btn">${managing ? 'Zakończ' : 'Zarządzaj'}</button></div>
                        <div class="profile-grid">${profiles.map(profile => `<button class="profile-card" data-id="${profile.id}"><span class="profile-avatar">${Icons[profile.avatar]}</span><span class="profile-name">${profile.name}</span>${managing ? `<span class="profile-tools"><button class="profile-tool" data-edit="${profile.id}" title="Edytuj">${Icons.edit}</button>${profile.id !== 'default' ? `<button class="profile-tool danger" data-delete="${profile.id}" title="Usuń">${Icons.close}</button>` : ''}</span>` : ''}</button>`).join('')}</div>
                        ${editor ? renderEditor() : `<button id="show-create" class="btn-primary profile-add-btn">${Icons.plus}<span>Dodaj profil</span></button>`}
                    </div>`;

                layer.querySelectorAll('.profile-card').forEach((btn) => {
                    btn.onclick = (event) => {
                        if (event.target.closest('[data-edit]') || event.target.closest('[data-delete]')) return;
                        if (managing) return;
                        layer.innerHTML = '';
                        resolve(btn.dataset.id);
                    };
                });

                layer.querySelector('#manage-profiles').onclick = () => {
                    managing = !managing;
                    editor = null;
                    render();
                };

                const show = layer.querySelector('#show-create');
                if (show) show.onclick = () => {
                    editor = { id: null, avatar: PROFILE_AVATARS[0] };
                    managing = true;
                    render();
                };

                layer.querySelectorAll('[data-delete]').forEach(btn => {
                    btn.onclick = async () => {
                        profiles = profiles.filter(p => p.id !== btn.dataset.delete);
                        await saveAndRender();
                    };
                });

                layer.querySelectorAll('[data-edit]').forEach(btn => {
                    btn.onclick = () => {
                        const selected = profiles.find(p => p.id === btn.dataset.edit);
                        editor = { id: selected.id, avatar: selected.avatar };
                        render();
                    };
                });

                layer.querySelectorAll('.profile-avatar-pick').forEach(btn => {
                    btn.onclick = () => {
                        editor.avatar = btn.dataset.avatar;
                        render();
                    };
                });

                const cancel = layer.querySelector('#cancel-profile-editor');
                if (cancel) cancel.onclick = () => {
                    editor = null;
                    render();
                };

                const profileName = layer.querySelector('#profile-name');
                const saveBtn = layer.querySelector('#save-profile-editor');
                if (profileName && saveBtn) {
                    const setSaveState = () => {
                        const name = profileName.value.trim();
                        const id = this.normalizeId(name);
                        const idTaken = profiles.some(p => p.id === id && p.id !== editor.id);
                        saveBtn.disabled = !name || !id || idTaken;
                    };
                    profileName.oninput = setSaveState;
                    setSaveState();
                    saveBtn.onclick = async () => {
                        const name = profileName.value.trim();
                        const id = this.normalizeId(name);
                        if (!name || !id) return;
                        if (editor.id) {
                            profiles = profiles.map(p => (p.id === editor.id ? { ...p, name, avatar: editor.avatar } : p));
                        } else {
                            profiles = [...profiles, { id, name, avatar: editor.avatar }];
                        }
                        editor = null;
                        await saveAndRender();
                    };
                }
            };

            render();
        });
    }


    bindSyncButton() {
        const app = document.getElementById('app');
        const btn = document.createElement('button');
        btn.id = 'github-sync-btn';
        btn.className = 'btn-primary sync-github-btn';
        btn.innerHTML = `${Icons.check}<span>Zapisz</span>`;
        btn.onclick = () => store.syncToGitHub();
        app.appendChild(btn);
        this.syncUnsub = store.onSyncState((syncState) => {
            this.syncState = syncState;
            this.renderSyncButton();
        });
        this.renderSyncButton();
    }

    renderSyncButton() {
        const btn = document.getElementById('github-sync-btn');
        if (!btn) return;
        const { hasPendingSync, isSyncing } = this.syncState;
        btn.disabled = isSyncing || !hasPendingSync;
        btn.classList.toggle('is-pending', hasPendingSync && !isSyncing);
        btn.classList.toggle('is-syncing', isSyncing);
        btn.innerHTML = isSyncing
            ? `${Icons.calendar}<span>Zapisywanie…</span>`
            : `${Icons.check}<span>${hasPendingSync ? 'Zapisz' : 'Wszystko zapisane'}</span>`;
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
            toast.innerHTML = `<span class="toast-icon">${type === 'warning' ? Icons.warning : Icons.check}</span><span>${message}</span>`;
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
