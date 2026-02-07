export class Component {
    constructor(container) {
        this.container = typeof container === 'string'
            ? document.querySelector(container)
            : container;
    }

    render(html) {
        if (this.container) {
            this.container.innerHTML = html;
            this.afterRender();
        }
    }

    afterRender() {}
}