import { registerHooks } from 'node:module';
import { readFile } from 'node:fs/promises';

const ROOT = new URL('../', import.meta.url);
const listeners = new Map();

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier)) {
            return { url: new URL(`${specifier}.js`, context.parentURL).href, shortCircuit: true };
        }
        return nextResolve(specifier, context);
    }
});

function createElementStub(id = '') {
    const element = {
        id,
        innerHTML: '',
        textContent: '',
        value: '',
        hidden: false,
        dataset: {},
        classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
        style: { setProperty() {} },
        addEventListener(type, handler) { (listeners.get(id) || []).push?.([type, handler]); },
        removeEventListener() {},
        appendChild() {},
        remove() {},
        focus() {},
        select() {},
        closest: () => null,
        querySelector: () => createElementStub(`${id} >`),
        querySelectorAll: () => [],
        getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 0, right: 0, width: 100, height: 100 })
    };
    return element;
}

const elements = new Map();
const rendered = {};

globalThis.localStorage = {
    store: new Map(),
    getItem(key) { return this.store.get(key) ?? null; },
    setItem(key, value) { this.store.set(key, String(value)); },
    removeItem(key) { this.store.delete(key); }
};

globalThis.document = {
    documentElement: createElementStub('root'),
    body: createElementStub('body'),
    getElementById(id) {
        if (!elements.has(id)) elements.set(id, createElementStub(id));
        return elements.get(id);
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => createElementStub('created'),
    addEventListener() {},
    removeEventListener() {}
};
const windowListeners = new Map();

globalThis.window = {
    location: { hash: '', hostname: 'example.org' },
    innerWidth: 390,
    addEventListener(type, handler) {
        if (!windowListeners.has(type)) windowListeners.set(type, []);
        windowListeners.get(type).push(handler);
    },
    removeEventListener() {},
    dispatchEvent(type) {
        (windowListeners.get(type) || []).forEach(handler => handler({ type }));
        return true;
    }
};

globalThis.fetch = async url => {
    const path = String(url).replace(/^\.\//, '').split('?')[0];
    const known = ['database/exercises.json', 'database/plan.json', 'database/workouts.json', 'database/strength-standards.json'];
    if (!known.includes(path)) return { ok: false, status: 404, json: async () => ({}) };
    const text = await readFile(new URL(path, ROOT), 'utf8');
    return { ok: true, status: 200, json: async () => JSON.parse(text), text: async () => text };
};

let failures = 0;
function check(name, condition, detail = '') {
    if (!condition) failures += 1;
    console.log(`${condition ? 'ok  ' : 'FAIL'} ${name}${condition ? '' : ` → ${detail}`}`);
}

await import(new URL('js/main.js', ROOT));
await new Promise(resolve => setTimeout(resolve, 60));

const view = elements.get('view');
const header = elements.get('app-header');
const nav = elements.get('app-nav');

async function visit(hash) {
    window.location.hash = hash;
    view.innerHTML = '';
    window.dispatchEvent('hashchange');
    await new Promise(resolve => setTimeout(resolve, 10));
    rendered[hash] = view.innerHTML;
    return view.innerHTML;
}

check('shell rendered without load error', !view.innerHTML.includes('error-state'), view.innerHTML.slice(0, 400));
check('plan view lists seeded split', view.innerHTML.includes('Upper'), view.innerHTML.slice(0, 200));
check('plan view shows the container', view.innerHTML.includes('Październik'), view.innerHTML.slice(0, 200));
check('plan view offers container copy', view.innerHTML.includes('data-action="copy-container"'));
check('plan view has start button', view.innerHTML.includes('Startuj'));
check('plan view counts exercises', view.innerHTML.includes('6 ćwiczeń'));
check('header shows brand', header.innerHTML.includes('XERFIT'), header.innerHTML);
check('nav has four items', (nav.innerHTML.match(/app-nav__item/g) || []).length === 4);
check('nav marks plan active', nav.innerHTML.includes('aria-current="page"'));

const history = await visit('#/history');
check('history renders tabs', history.includes('segmented') && history.includes('Treningi'));
check('history lists the seeded workouts', history.includes('Upper') && history.includes('Lower') && history.includes('Express'), history.replace(/\s+/g, ' ').slice(0, 400));

const exercises = await visit('#/exercises');
check('catalog lists seeded exercises', exercises.includes('Upper Chest Press') && exercises.includes('Suwnica'), exercises.slice(0, 200));
check('catalog shows split usage without groups', exercises.includes('split'), exercises.replace(/\s+/g, ' ').slice(0, 600));
check('catalog shows a dash without history', exercises.includes('—'));
check('catalog shows the last training date', exercises.includes('15.10.2026'), exercises.replace(/\s+/g, ' ').slice(0, 300));
check('catalog offers a new exercise', exercises.includes('data-action="new-exercise"'));

const settings = await visit('#/settings');
check('settings renders steppers', settings.includes('stepper__row'));
check('settings shows global range', settings.includes('Powtórzenia min') && settings.includes('Powtórzenia max'));
check('settings has no per-split set count', !settings.includes('Serie na start'));
check('settings hides the github info panel', !settings.includes('Zapis do GitHuba') && !settings.includes('Personal access token'));
check('settings has no manual token button', !settings.includes('data-action="token"') && !settings.includes('Personal access token'));

const summary = await visit('#/summary');
check('summary without session invites to plan', summary.includes('Brak podsumowania'));

const workout = await visit('#/workout');
check('workout route falls back to plan without session', workout.includes('Startuj'));

const exerciseDetail = await visit('#/exercises/ex_upper_chest_press');
check('catalog detail renders with exercise id param', exerciseDetail.includes('Upper Chest Press'), exerciseDetail.slice(0, 200));
check('catalog detail shows usage', exerciseDetail.includes('Październik') && exerciseDetail.includes('Upper'));

for (const [route, html] of Object.entries(rendered)) {
    check(`no raw undefined in ${route || '#/plan'}`, !html.includes('undefined'), html.slice(0, 160));
    check(`no raw null in ${route || '#/plan'}`, !html.includes('>null<'), html.slice(0, 160));
}

console.log(failures ? `\n${failures} check(s) failed` : '\nall render checks passed');
process.exit(failures ? 1 : 0);
