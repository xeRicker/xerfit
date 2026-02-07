import { StorageService } from '../services/StorageService.js';

const mealDefaults = ['global', 'breakfast', 'lunch', 'dinner'];

class Store {
    constructor() {
        this.subscribers = [];

        const user = StorageService.get('db/user', {
            weight: 70,
            height: 175,
            age: 28,
            sex: 'male',
            activity: 1.4,
            targetCal: 2500,
            targetP: 180,
            targetC: 250,
            targetF: 70
        });

        const products = StorageService.get('db/products', [
            { id: '1', name: 'Jajko', p: 12.6, c: 1.1, f: 10.6, cal: 143 },
            { id: '2', name: 'Pierś z kurczaka', p: 31, c: 0, f: 3.6, cal: 165 },
            { id: '3', name: 'Płatki owsiane', p: 13, c: 68, f: 6.5, cal: 379 }
        ]).map((p, i) => ({
            color: p.color || ['#00ff36', '#5de9ff', '#c595ff'][i % 3],
            icon: p.icon || ['egg', 'chicken', 'grain'][i % 3],
            defaultMeal: mealDefaults.includes(p.defaultMeal) ? p.defaultMeal : 'global',
            ...p
        }));

        this.state = {
            user,
            products,
            logs: StorageService.get('db/logs', {}),
            currentDate: new Date().toISOString().split('T')[0]
        };
    }

    subscribe(cb) {
        this.subscribers.push(cb);
        cb(this.state);
        return () => this.subscribers = this.subscribers.filter(sub => sub !== cb);
    }

    notify() { this.subscribers.forEach(cb => cb(this.state)); }

    setDate(dateStr) {
        if (this.state.currentDate === dateStr) return;
        this.state.currentDate = dateStr;
        this.notify();
    }

    updateUser(data) {
        this.state.user = { ...this.state.user, ...data };
        StorageService.save('db/user', this.state.user);
        this.notify();
    }

    addProduct(product) {
        const newProduct = { ...product, id: Date.now().toString() };
        this.state.products = [...this.state.products, newProduct];
        StorageService.save('db/products', this.state.products);
        this.notify();
    }

    deleteProduct(id) {
        this.state.products = this.state.products.filter(p => p.id !== id);
        StorageService.save('db/products', this.state.products);
        this.notify();
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
            color: product.color || '#00ff36',
            icon: product.icon || 'leaf',
            p: product.p * factor,
            c: product.c * factor,
            f: product.f * factor,
            cal: product.cal * factor
        };

        this.state.logs[date] = [...this.state.logs[date], entry];
        StorageService.save('db/logs', this.state.logs);
        this.notify();
    }

    deleteMealEntry(id) {
        const date = this.state.currentDate;
        this.state.logs[date] = (this.state.logs[date] || []).filter(e => e.id !== id);
        StorageService.save('db/logs', this.state.logs);
        this.notify();
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
