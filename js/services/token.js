import { GITHUB_CONFIG } from '../config/config.js';

export const tokenService = {
    get() {
        const configured = GITHUB_CONFIG.TOKEN;
        return configured && configured !== '__GH_TOKEN__' ? configured : '';
    },

    hasToken() {
        return Boolean(this.get());
    }
};
