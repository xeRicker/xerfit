import { GITHUB_CONFIG } from '../config/config.js';

const STORAGE_KEY = 'xerfit_github_token';

export const tokenService = {
    get() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return stored;
        const configured = GITHUB_CONFIG.TOKEN;
        return configured && configured !== '__GH_TOKEN__' ? configured : '';
    },

    set(token) {
        if (token) localStorage.setItem(STORAGE_KEY, token);
        else localStorage.removeItem(STORAGE_KEY);
    },

    clear() {
        localStorage.removeItem(STORAGE_KEY);
    },

    hasToken() {
        return Boolean(this.get());
    }
};
