import { StorageService } from '../services/StorageService.js';

class Store {
    constructor() {
        this.subscribers = [];
        this.state = {
            user: StorageService.get('db/user', {
                weight: 70, height: 175,
                targetCal: 2500, targetP: 180, targetC: 250, targetF: 70
            }),
            products: StorageService.get('db/products', [
                { id: '1', name: 'Large Egg', p: 6, c: 0.6, f: 5, cal: 72 },
                { id: '2', name: 'Chicken Breast', p: 31, c: 0, f: 3.6, cal: 165 },
                { id: '3', name: 'Oats', p: 13, c: 68, f: 6.5, cal: 379 }
            ]),
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

    // Actions
    setDate(dateStr) {
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

    addLogEntry(product, grams) {
        const date = this.state.currentDate;
        if (!this.state.logs[date]) this.state.logs[date] = [];

        const factor = grams / 100;
        const entry = {
            id: Date.now().toString(),
            productId: product.id,
            name: product.name,
            grams: grams,
            p: product.p * factor,
            c: product.c * factor,
            f: product.f * factor,
            cal: product.cal * factor
        };

        this.state.logs[date] = [...this.state.logs[date], entry];
        StorageService.save('db/logs', this.state.logs);
        this.notify();
    }

    deleteLogEntry(id) {
        const date = this.state.currentDate;
        this.state.logs[date] = this.state.logs[date].filter(e => e.id !== id);
        StorageService.save('db/logs', this.state.logs);
        this.notify();
    }
}

export const store = new Store();