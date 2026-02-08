import { GITHUB_CONFIG } from '../config/config.js';

const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${GITHUB_CONFIG.TOKEN}`
};

const hasToken = () => GITHUB_CONFIG.TOKEN && GITHUB_CONFIG.TOKEN !== '__GH_TOKEN__';

const toBase64 = (content) => btoa(unescape(encodeURIComponent(content)));
const fromBase64 = (content) => decodeURIComponent(escape(atob(content)));

async function getFile(path) {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.REPO_OWNER}/${GITHUB_CONFIG.REPO_NAME}/contents/${path}`;
    const response = await fetch(url, { headers });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`GitHub GET failed (${response.status})`);
    return response.json();
}

async function putFile(path, data, sha = undefined) {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.REPO_OWNER}/${GITHUB_CONFIG.REPO_NAME}/contents/${path}`;
    const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
            message: `Update ${path}`,
            content: toBase64(JSON.stringify(data, null, 2)),
            sha
        })
    });
    if (!response.ok) throw new Error(`GitHub PUT failed (${response.status})`);
    return response.json();
}

async function deleteFile(path, sha) {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.REPO_OWNER}/${GITHUB_CONFIG.REPO_NAME}/contents/${path}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ message: `Delete ${path}`, sha })
    });
    if (!response.ok) throw new Error(`GitHub DELETE failed (${response.status})`);
}

export class GitHubDataService {
    static async loadProfiles() {
        if (!hasToken()) return null;
        try {
            const file = await getFile('database/profiles.json');
            if (!file) return null;
            return JSON.parse(fromBase64(file.content));
        } catch {
            return null;
        }
    }

    static async saveProfiles(profiles) {
        if (!hasToken()) return;
        const existing = await getFile('database/profiles.json');
        await putFile('database/profiles.json', profiles, existing?.sha);
    }

    static async loadProfileData(profileId) {
        if (!hasToken()) return null;
        try {
            const file = await getFile(`database/${profileId}.json`);
            if (!file) return null;
            return JSON.parse(fromBase64(file.content));
        } catch {
            return null;
        }
    }

    static async saveProfileData(profileId, data) {
        if (!hasToken()) return;
        try {
            const path = `database/${profileId}.json`;
            const existing = await getFile(path);
            await putFile(path, data, existing?.sha);
        } catch {
            // silent fallback to local cache only
        }
    }

    static async deleteProfileData(profileId) {
        if (!hasToken()) return;
        try {
            const path = `database/${profileId}.json`;
            const existing = await getFile(path);
            if (!existing?.sha) return;
            await deleteFile(path, existing.sha);
        } catch {
            // silent fallback
        }
    }
}
