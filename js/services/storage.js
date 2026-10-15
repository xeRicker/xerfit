import { STORAGE_KEYS } from '../config/config.js';

export const storageService = {
    read(key) {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            localStorage.removeItem(key);
            return null;
        }
    },

    write(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    clear(key) {
        localStorage.removeItem(key);
    }
};

export { STORAGE_KEYS };
