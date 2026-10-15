import { GITHUB_CONFIG } from '../config/config.js';
import { isLocalhost } from '../utils.js';
import { tokenService } from './token.js';

const DATA_FILES = {
    exercises: 'database/exercises.json',
    plan: 'database/plan.json',
    workouts: 'database/workouts.json'
};

const MAX_ATTEMPTS = 3;
const USES_LOCAL_WRITES = isLocalhost();

class ApiService {
    constructor() {
        this.baseUrl = `https://api.github.com/repos/${GITHUB_CONFIG.REPO_OWNER}/${GITHUB_CONFIG.REPO_NAME}/contents/`;
    }

    requestHeaders() {
        const headers = { Accept: 'application/vnd.github+json' };
        const token = tokenService.get();
        if (token) headers.Authorization = `Bearer ${token}`;
        return headers;
    }

    async read(key) {
        const relativePath = DATA_FILES[key];
        const remote = await this.readRemote(relativePath);
        if (remote !== null) return remote;
        const local = await this.readLocalFile(relativePath);
        if (local !== null) return local;
        throw new Error(`Nie udało się wczytać ${relativePath}.`);
    }

    async write(key, data, message) {
        const relativePath = DATA_FILES[key];
        if (USES_LOCAL_WRITES) {
            await this.writeLocal(relativePath, data);
            return { target: 'local' };
        }
        if (!tokenService.hasToken()) {
            throw new Error('Brak tokenu GitHub w tej wersji strony. Zapis danych działa przez dev-server.js na localhost albo przez wdrożenie z sekretem GH_TOKEN.');
        }
        await this.writeRepository(relativePath, data, message);
        return { target: 'github' };
    }

    async readRemote(relativePath) {
        if (!tokenService.hasToken()) return null;
        try {
            const response = await this.fetchWithRetry(`${this.baseUrl}${relativePath}?v=${Date.now()}`, { headers: this.requestHeaders() }, relativePath);
            if (response.status === 404) return null;
            if (!response.ok) throw await this.createApiError(response, relativePath);
            return decodeFileContent(await response.json());
        } catch (error) {
            if (error.status) throw error;
            return null;
        }
    }

    async readLocalFile(relativePath) {
        const response = await fetch(`./${relativePath}?v=${Date.now()}`);
        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`Nie udało się odczytać ${relativePath} (HTTP ${response.status}).`);
        return response.json();
    }

    async writeRepository(relativePath, data, message) {
        const url = `${this.baseUrl}${relativePath}`;
        const current = await this.fetchCurrent(url, relativePath);
        const body = {
            message,
            branch: GITHUB_CONFIG.BRANCH,
            content: encodeFileContent(data),
            ...(current?.sha ? { sha: current.sha } : {})
        };
        const response = await this.fetchWithRetry(url, { method: 'PUT', headers: this.requestHeaders(), body: JSON.stringify(body) }, relativePath);
        if (!response.ok) throw await this.createApiError(response, relativePath);
    }

    async fetchCurrent(url, relativePath) {
        const response = await this.fetchWithRetry(url, { headers: this.requestHeaders() }, relativePath);
        if (response.status === 404) return null;
        if (!response.ok) throw await this.createApiError(response, relativePath);
        return response.json();
    }

    async writeLocal(relativePath, data) {
        const response = await fetch(`./${relativePath}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data, null, 2)
        });
        if (!response.ok) {
            throw new Error(`Zapis lokalny nie powiódł się (HTTP ${response.status}). Uruchom node dev-server.js.`);
        }
    }

    async fetchWithRetry(url, options, resource) {
        let lastNetworkError;

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
            try {
                const response = await fetch(url, options);
                const isRetryable = response.status === 429 || response.status === 503;
                if (!isRetryable || attempt === MAX_ATTEMPTS) return response;

                const retryAfter = Number(response.headers.get('retry-after'));
                const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : attempt * 1000;
                await wait(delay);
            } catch (error) {
                lastNetworkError = error;
                if (attempt < MAX_ATTEMPTS) await wait(attempt * 1000);
            }
        }

        const error = new Error(`Nie udało się połączyć z GitHub podczas zapisu ${resource}.`);
        error.cause = lastNetworkError;
        error.resource = resource;
        throw error;
    }

    async createApiError(response, resource) {
        let details = '';

        try {
            const payload = await response.json();
            details = payload?.message ? `: ${payload.message}` : '';
        } catch {
            details = '';
        }

        const error = new Error(`GitHub API (${resource}) zwróciło błąd HTTP ${response.status}${details}`);
        error.status = response.status;
        error.resource = resource;
        return error;
    }
}

function encodeFileContent(data) {
    return btoa(unescape(encodeURIComponent(`${JSON.stringify(data, null, 2)}\n`)));
}

function decodeFileContent(file) {
    if (!file?.content) return null;
    return JSON.parse(decodeURIComponent(escape(atob(file.content.replace(/\s/g, '')))));
}

function wait(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

export const apiService = new ApiService();
export { DATA_FILES };
