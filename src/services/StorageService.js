export class StorageService {
    static get(path, fallback) {
        const data = localStorage.getItem(path);
        return data ? JSON.parse(data) : fallback;
    }

    static save(path, data) {
        localStorage.setItem(path, JSON.stringify(data));
    }
}