import { Navigation } from './components/Navigation.js';
import { DaysView } from './views/DaysView.js';
import { ProductsView } from './views/ProductsView.js';
import { YouView } from './views/YouView.js';

class App {
    constructor() {
        this.outlet = document.getElementById('router-outlet');
        this.nav = new Navigation(document.getElementById('bottom-nav'), (tab) => this.route(tab));
        this.currentView = null;
        this.nav.render();
        this.route('days');
    }

    route(tab) {
        if (this.currentView && this.currentView.destroy) this.currentView.destroy();
        this.outlet.innerHTML = '';

        if (tab === 'days') this.currentView = new DaysView(this.outlet);
        else if (tab === 'products') this.currentView = new ProductsView(this.outlet);
        else if (tab === 'you') this.currentView = new YouView(this.outlet);
    }
}

new App();