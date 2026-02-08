import { StorageService } from '../services/StorageService.js';
import { GitHubDataService } from '../services/GitHubDataService.js';

const mealDefaults = ['global', 'breakfast', 'lunch', 'dinner'];

const defaultUser = {
    weight: 70,
    height: 175,
    age: 28,
    sex: 'male',
    activity: 1.4,
    targetCal: 2500,
    targetP: 180,
    targetC: 250,
    targetF: 70,
    proteinMode: 'medium'
};

const defaultProducts = [
    { id: '1', name: 'Pierś z kurczaka', p: 31, c: 0, f: 3.6, cal: 165, icon: 'chicken', color: '#b8ff2c', defaultMeal: 'lunch' },
    { id: '2', name: 'Ryż biały', p: 7.1, c: 78.9, f: 0.7, cal: 356, icon: 'rice', color: '#7ed2ff', defaultMeal: 'lunch' },
    { id: '3', name: 'Ziemniaki', p: 1.9, c: 17.5, f: 0.1, cal: 77, icon: 'potato', color: '#ff9f43', defaultMeal: 'dinner' },
    { id: '4', name: 'Jajka', p: 12.6, c: 1.1, f: 10.6, cal: 143, icon: 'egg', color: '#ffd166', defaultMeal: 'breakfast' },
    { id: '5', name: 'Owsianka', p: 13.2, c: 67.7, f: 6.5, cal: 379, icon: 'oats', color: '#b76fff', defaultMeal: 'breakfast' }
];

class Store {
    constructor() {
        this.subscribers = [];
        this.toastSubscribers = [];
        this.currentProfileId = null;
        this.state = this.normalizeDb({ user: defaultUser, products: defaultProducts, logs: {}, currentDate: new Date().toISOString().split('T')[0] });
    }

    normalizeDb(raw = {}) {
        const products = (raw.products || defaultProducts).map((p, i) => ({
            color: p.color || ['#2596be', '#6b8cff', '#7ac4de', '#58b8da'][i % 3],
            icon: p.icon || ['egg', 'chicken', 'grain', 'fish'][i % 3],
            favorite: Boolean(p.favorite),
            defaultMeal: mealDefaults.includes(p.defaultMeal) ? p.defaultMeal : 'global',
            ...p
        }));
        return {
            user: { ...defaultUser, ...(raw.user || {}) },
            products,
            logs: raw.logs || {},
            currentDate: raw.currentDate || new Date().toISOString().split('T')[0]
        };
    }

    subscribe(cb) {
        this.subscribers.push(cb);
        cb(this.state);
        return () => this.subscribers = this.subscribers.filter(sub => sub !== cb);
    }

    onToast(cb) {
        this.toastSubscribers.push(cb);
        return () => this.toastSubscribers = this.toastSubscribers.filter(sub => sub !== cb);
    }

    notify() { this.subscribers.forEach(cb => cb(this.state)); }

    toast(message, type = 'success') {
        this.toastSubscribers.forEach(cb => cb({ message, type }));
    }

    async initProfile(profileId) {
        this.currentProfileId = profileId;
        const remoteData = await GitHubDataService.loadProfileData(profileId);
        if (remoteData) {
            this.state = this.normalizeDb(remoteData);
            StorageService.save(`db/profiles/${profileId}`, this.state);
        } else {
            const localData = StorageService.get(`db/profiles/${profileId}`, null);
            this.state = this.normalizeDb(localData || { user: defaultUser, products: defaultProducts, logs: {} });
        }
        this.notify();
    }

    async persist(message = '', type = 'success') {
        if (!this.currentProfileId) return;
        StorageService.save(`db/profiles/${this.currentProfileId}`, this.state);
        await GitHubDataService.saveProfileData(this.currentProfileId, this.state);
        if (message) this.toast(message, type);
    }

    setDate(dateStr) {
        if (this.state.currentDate === dateStr) return;
        this.state.currentDate = dateStr;
        this.notify();
        this.persist();
    }

    updateUser(data) {
        this.state.user = { ...this.state.user, ...data };
        this.notify();
        this.persist('Zapisano ustawienia profilu.');
    }

    addProduct(product) {
        const newProduct = { ...product, id: Date.now().toString() };
        this.state.products = [...this.state.products, newProduct];
        this.notify();
        this.persist(`Dodano produkt: ${newProduct.name}`);
    }

    deleteProduct(id) {
        this.state.products = this.state.products.filter(p => p.id !== id);
        this.notify();
        this.persist('Usunięto produkt.', 'warning');
    }

    toggleFavoriteProduct(id) {
        this.state.products = this.state.products.map(product => (
            String(product.id) === String(id)
                ? { ...product, favorite: !product.favorite }
                : product
        ));
        this.notify();
        this.persist();
    }

    updateProduct(id, data) {
        this.state.products = this.state.products.map(product => (
            String(product.id) === String(id)
                ? { ...product, ...data }
                : product
        ));
        this.notify();
        this.persist('Zaktualizowano produkt.');
    }

    addMealEntry(product, grams, meal = 'breakfast') {
        const date = this.state.currentDate;
        if (!this.state.logs[date]) this.state.logs[date] = [];

        const factor = grams / 100;
        const entry = {
            id: Date.now().toString(),
            productId: product.id,
            name: product.name,
            grams,
            meal,
            color: product.color || '#2596be',
            icon: product.icon || 'leaf',
            p: product.p * factor,
            c: product.c * factor,
            f: product.f * factor,
            cal: product.cal * factor
        };

        this.state.logs[date] = [...this.state.logs[date], entry];
        this.notify();
        this.persist(`Dodano ${product.name} do dnia.`);
    }

    updateMealEntry(entryId, data = {}) {
        const date = this.state.currentDate;
        const entries = this.state.logs[date] || [];
        let updated = false;

        this.state.logs[date] = entries.map(entry => {
            if (String(entry.id) !== String(entryId)) return entry;
            updated = true;
            const grams = Math.max(1, Number(data.grams ?? entry.grams));
            const ratio = grams / Math.max(1, Number(entry.grams) || 1);
            return {
                ...entry,
                meal: data.meal || entry.meal,
                grams,
                p: entry.p * ratio,
                c: entry.c * ratio,
                f: entry.f * ratio,
                cal: entry.cal * ratio
            };
        });

        if (!updated) return;
        this.notify();
        this.persist('Zapisano zmiany porcji.');
    }

    updateMealEntryForDate(date, entryId, data = {}) {
        const entries = this.state.logs[date] || [];
        let updated = false;
        this.state.logs[date] = entries.map(entry => {
            if (String(entry.id) !== String(entryId)) return entry;
            updated = true;
            const grams = Math.max(1, Number(data.grams ?? entry.grams));
            const ratio = grams / Math.max(1, Number(entry.grams) || 1);
            return {
                ...entry,
                meal: data.meal || entry.meal,
                grams,
                p: entry.p * ratio,
                c: entry.c * ratio,
                f: entry.f * ratio,
                cal: entry.cal * ratio
            };
        });
        if (!updated) return;
        this.notify();
        this.persist('Zaktualizowano wpis dnia.');
    }

    deleteMealEntryForDate(date, id) {
        this.state.logs[date] = (this.state.logs[date] || []).filter(e => String(e.id) !== String(id));
        this.notify();
        this.persist('Usunięto wpis.', 'warning');
    }

    copyMealEntries(sourceDate, sourceMeal, targetDate, targetMeal) {
        const source = (this.state.logs[sourceDate] || []).filter(entry => (entry.meal || 'breakfast') === sourceMeal);
        if (!source.length) return;
        if (!this.state.logs[targetDate]) this.state.logs[targetDate] = [];

        const copies = source.map(entry => ({
            ...entry,
            id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
            meal: targetMeal,
            copiedFrom: sourceDate
        }));

        this.state.logs[targetDate] = [...this.state.logs[targetDate], ...copies];
        this.notify();
        this.persist('Skopiowano posiłek.');
    }

    deleteMealEntry(id) {
        const date = this.state.currentDate;
        this.state.logs[date] = (this.state.logs[date] || []).filter(e => e.id !== id);
        this.notify();
        this.persist('Usunięto produkt z dnia.', 'warning');
    }

    calculateTDEE() {
        const u = this.state.user;
        const bmr = u.sex === 'female'
            ? (10 * u.weight) + (6.25 * u.height) - (5 * u.age) - 161
            : (10 * u.weight) + (6.25 * u.height) - (5 * u.age) + 5;
        return Math.round(bmr * Number(u.activity || 1.2));
    }
}

export const store = new Store();
