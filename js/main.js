import { formatDate, renderMaterialIcon } from './utils.js';
import { exercisesService } from './services/exercisesService.js';
import { planService } from './services/planService.js';
import { storageService, STORAGE_KEYS } from './services/storage.js';
import { profileService, strengthService } from './services/profileService.js';
import { workoutService } from './services/workoutService.js';
import { dialogService, notify } from './ui/components/dialogs.js';
import { createPlanView } from './ui/planView.js';
import { createExercisesView } from './ui/exercisesView.js';
import { createWorkoutView } from './ui/workoutView.js';
import { createSummaryView } from './ui/summaryView.js';
import { createHistoryView } from './ui/historyView.js';
import { createSettingsView } from './ui/settingsView.js';

const NAV_ITEMS = [
    { route: 'plan', label: 'Plan', icon: 'calendar_month' },
    { route: 'exercises', label: 'Ćwiczenia', icon: 'fitness_center' },
    { route: 'history', label: 'Historia', icon: 'insights' },
    { route: 'settings', label: 'Ustawienia', icon: 'tune' }
];

const app = {
    exercises: {},
    plan: null,
    workouts: [],
    standards: null,
    profile: profileService.emptyProfile(),
    draftExercises: {},
    draft: planService.createEmptyPlan(),
    session: null,
    summarySession: null,
    summarySave: { state: 'idle' },
    planSave: { state: 'idle' },
    exercisesSave: { state: 'idle' },
    isReady: false,
    isBusy: false,
    loadError: null,
    planUI: { containerId: null, selectedSplitId: null },
    exercisesUI: { exerciseId: null, query: '' },
    historyUI: { tab: 'workouts', exerciseId: null, metric: 'weight', openSessionId: null, cameFrom: 'history' },
    persistentRoute: null,
    lastFocusedField: null,
    currentContainer() {
        return planService.findContainer(this.draft, this.planUI.containerId);
    },
    activeSetIndex() {
        return workoutService.nextUndoneIndex(this.session);
    },
    isPlanDirty() {
        if (!this.plan) return false;
        return JSON.stringify(this.draft) !== JSON.stringify(this.plan);
    },
    isExercisesDirty() {
        return JSON.stringify(this.draftExercises) !== JSON.stringify(this.exercises);
    },
    setProfile(profile) {
        this.profile = profileService.save(profile);
        notify('Dane zapisane.', { type: 'success' });
        fullRender();
    },
    fullRender,
    markPlanDirty() {
        repaint();
    },
    markExercisesDirty({ render: repaintView = false } = {}) {
        if (repaintView) repaint();
    },
    selectContainer(containerId) {
        this.planUI.containerId = containerId;
        this.planUI.selectedSplitId = null;
        fullRender();
    },
    repaint,
    render: fullRender,
    go,
    startWorkout,
    exitWorkout,
    advanceAfterExercise,
    finishWorkout,
    savePlan,
    saveExercises,
    discardPlanDraft,
    discardExercisesDraft,
    retrySummarySave,
    clearSession,
    reloadData
};

const views = {
    plan: createPlanView(app),
    exercises: createExercisesView(app),
    workout: createWorkoutView(app),
    summary: createSummaryView(app),
    history: createHistoryView(app),
    settings: createSettingsView(app)
};

const root = document.getElementById('view');
const boundRoutes = new Set();

root.addEventListener('focusin', event => {
    app.lastFocusedField = event.target.dataset?.field || null;
}, true);

root.addEventListener('click', event => {
    if (event.target.closest('[data-resume-session]')) go('#/workout');
});

window.addEventListener('hashchange', fullRender);
boot();

async function boot() {
    app.session = readStoredSession();
    renderLoading();
    await loadData({ silent: true });
    window.addEventListener('beforeunload', () => {
        if (app.session) workoutService.saveOnDevice(app.session);
    });
}

function readStoredSession() {
    const stored = workoutService.readFromDevice();
    const isValid = stored
        && Array.isArray(stored.exercises)
        && stored.exercises.length > 0
        && stored.exercises.every(entry => Array.isArray(entry?.sets) && entry.sets.length > 0)
        && Boolean(stored.startedAt);
    if (isValid) return stored;
    if (stored) workoutService.clearFromDevice();
    return null;
}

async function loadData({ silent = false } = {}) {
    try {
        const [exercises, plan, workouts, standards] = await Promise.all([
            exercisesService.load(),
            planService.load(),
            workoutService.load(),
            strengthService.load().catch(() => null)
        ]);

        app.exercises = exercises;
        app.plan = plan;
        app.workouts = workouts;
        app.standards = standards;
        app.profile = profileService.load();
        app.draftExercises = JSON.parse(JSON.stringify(exercises));
        app.draft = planService.clonePlan(plan);
        app.planUI.containerId = plan.containers[0]?.id || null;
        app.planUI.selectedSplitId = null;
        app.loadError = null;
        app.isReady = true;
        fullRender();
        if (app.session) promptResume();
        else promptPendingSave();
        return true;
    } catch (error) {
        if (!silent) notify(error.message, { type: 'danger', duration: 6000 });
        app.isReady = true;
        app.loadError = error.message;
        fullRender();
        return false;
    }
}

async function reloadData() {
    if (app.isBusy) return;
    app.isBusy = true;
    const ok = await loadData();
    app.isBusy = false;
    if (ok) notify('Dane wczytane.', { type: 'success' });
}

function fullRender() {
    app.persistentRoute = null;
    paint({ rebuild: true });
}

function repaint() {
    paint({ rebuild: false });
}

function paint({ rebuild }) {
    const { route, param } = parseRoute();
    const showNav = route !== 'workout';

    renderHeader(route);
    renderNav(showNav, route);

    if (!app.isReady) {
        renderLoading();
        return;
    }

    if (app.loadError) {
        root.innerHTML = renderLoadError();
        root.querySelector('[data-action="reload"]')?.addEventListener('click', reloadData);
        return;
    }

    if (route === 'workout' && !app.session) {
        go('#/plan');
        return;
    }

    if (route === 'history') {
        app.historyUI.exerciseId = param || null;
        if (param) app.historyUI.cameFrom = app.historyUI.tab === 'exercises' ? 'exercises' : 'history';
    }
    if (route === 'exercises') app.exercisesUI.exerciseId = param || null;

    const view = views[route] || views.plan;
    const canPatch = !rebuild && app.persistentRoute === route && typeof view.patch === 'function' && root.innerHTML;

    if (canPatch) {
        view.patch(root);
        return;
    }

    const restoreField = app.lastFocusedField;
    root.innerHTML = renderActiveSessionBar(route) + view.render();
    app.persistentRoute = route;
    restoreFieldFocus(restoreField);

    if (!boundRoutes.has(route)) {
        view.bind(root);
        boundRoutes.add(route);
    }
}

function renderActiveSessionBar(route) {
    if (route === 'workout' || !app.session) return '';

    const done = workoutService.summary(app.session);
    return `
        <button type="button" class="resume-bar" data-resume-session>
            ${renderMaterialIcon('play_circle')}
            <span class="resume-bar__text">
                <span class="resume-bar__title">Wróć do treningu</span>
                <span class="resume-bar__meta">${escapeMeta(app.session.splitName)} · ${done.done + done.skipped}/${done.total} ćwiczeń</span>
            </span>
            ${renderMaterialIcon('chevron_right', 'resume-bar__chevron')}
        </button>
    `;
}

function restoreFieldFocus(field) {
    if (!field) return;
    const input = root.querySelector(`[data-field="${field}"]`);
    if (!input) return;
    input.focus();
    if (typeof input.setSelectionRange === 'function' && typeof input.value === 'string' && input.value) {
        const end = input.value.length;
        input.setSelectionRange(end, end);
    }
}

function renderHeader(route) {
    const header = document.getElementById('app-header');
    if (route === 'workout') {
        header.innerHTML = '';
        header.hidden = true;
        return;
    }

    header.hidden = false;
    header.innerHTML = `
        <div class="brand">
            <span class="brand__mark material-symbols-rounded" aria-hidden="true">bolt</span>
            <span class="brand__name">XERFIT</span>
        </div>
    `;
}

function renderNav(show, route) {
    const nav = document.getElementById('app-nav');
    nav.hidden = !show;
    if (!show) return;

    nav.innerHTML = NAV_ITEMS.map(item => `
        <a class="app-nav__item" href="#/${item.route}" ${isActive(route, item.route) ? 'aria-current="page"' : ''}>
            ${renderMaterialIcon(item.icon)}
            <span>${item.label}</span>
        </a>
    `).join('');
}

function isActive(route, itemRoute) {
    if (itemRoute === 'plan') return route === 'plan' || route === 'summary';
    return route === itemRoute;
}

function renderLoading() {
    root.innerHTML = `
        <div class="app-loader">
            <span class="app-loader__spinner"></span>
            <p class="app-loader__message">Wczytuję plan i historię treningów…</p>
        </div>
    `;
}

function renderLoadError() {
    return `
        <div class="error-state">
            ${renderMaterialIcon('cloud_off')}
            <h3 class="error-state__title">Nie udało się wczytać danych</h3>
            <p class="error-state__message">${escapeMeta(app.loadError)}</p>
            <button type="button" class="btn btn--secondary btn--compact" data-action="reload">${renderMaterialIcon('refresh')}<span>Ponów</span></button>
        </div>
    `;
}

async function startWorkout(containerId, splitId) {
    const container = planService.findContainer(app.draft, containerId);
    const split = planService.findSplit(container, splitId);
    if (!container || !split) return;

    if (app.session) {
        const confirmed = await dialogService.confirmDanger('Masz trwający trening. Rozpocząć nowy i porzucić poprzedni?', 'Trwający trening', 'Nowy trening');
        if (!confirmed) return;
    }

    app.session = workoutService.createSession(app.plan, app.exercises, container, split, app.workouts);
    workoutService.saveOnDevice(app.session);
    go('#/workout');
}

function exitWorkout() {
    if (!app.session) return;
    workoutService.saveOnDevice(app.session);
    go('#/plan');
}

function promptResume() {
    dialogService.confirm(
        `Masz niedokończony trening: ${app.session.splitName} (${app.session.containerName}). Wrócić do niego?`,
        'Wznowić trening?'
    ).then(resume => {
        if (resume) {
            go('#/workout');
            return;
        }
        app.session = null;
        workoutService.clearFromDevice();
        fullRender();
    });
}

function advanceAfterExercise() {
    const moved = workoutService.step(app.session, 1);
    if (moved) {
        fullRender();
        return;
    }
    finishWorkout();
}

function finishWorkout() {
    if (!app.session) return;
    const summary = workoutService.summary(app.session);
    const hasAnySet = summary.sets > 0;
    const allHandled = summary.done + summary.skipped === summary.total;

    const run = () => {
        const finished = workoutService.finish(app.session);
        app.session = null;
        workoutService.clearFromDevice();
        if (!hasAnySet) {
            go('#/plan');
            notify('Trening zakończony bez zapisanych serii.', { type: 'info' });
            return;
        }
        app.summarySession = finished;
        app.summarySave = { state: 'idle' };
        go('#/summary');
        pushSummary(finished);
    };

    if (allHandled) {
        run();
        return;
    }

    const message = hasAnySet
        ? 'Nie wszystkie ćwiczenia są gotowe. Zakończyć trening i zapisać to, co jest?'
        : 'Nie zapisałeś żadnej serii. Zakończyć trening bez zapisu?';
    dialogService.confirm(message, 'Zakończyć trening?').then(confirmed => {
        if (confirmed) run();
    });
}

async function pushSummary(session) {
    app.summarySave = { state: 'saving' };
    fullRender();

    try {
        await workoutService.save(session);
        app.summarySave = { state: 'saved' };
        app.workouts = [...app.workouts.filter(item => item.id !== session.id), session];
        storageService.clear(STORAGE_KEYS.PENDING_SAVE);
        fullRender();
    } catch (error) {
        app.summarySave = {
            state: 'error',
            title: 'Nie zapisano na GitHubie',
            detail: `${error.message} Trening czeka w tej przeglądarce — kliknij Ponów, dane nie zginą.`,
            actionLabel: 'Ponów'
        };
        storageService.write(STORAGE_KEYS.PENDING_SAVE, session);
        fullRender();
    }
}

function retrySummarySave() {
    if (!app.summarySession) return;
    pushSummary(app.summarySession);
}

function promptPendingSave() {
    const pending = storageService.read(STORAGE_KEYS.PENDING_SAVE);
    if (!pending?.id || !Array.isArray(pending.exercises)) {
        if (pending) storageService.clear(STORAGE_KEYS.PENDING_SAVE);
        return;
    }

    dialogService.confirm(
        `Trening ${pending.splitName} z ${formatDate(pending.date)} nie został zapisany na GitHubie. Spróbować ponownie?`,
        'Niedokończony zapis'
    ).then(retry => {
        if (retry) {
            app.summarySession = pending;
            go('#/summary');
            pushSummary(pending);
            return;
        }
        storageService.clear(STORAGE_KEYS.PENDING_SAVE);
        notify('Niezapisany trening odrzucony.', { type: 'info' });
    });
}

async function savePlan() {
    app.planSave = { state: 'saving' };
    fullRender();

    try {
        await planService.save(app.draft);
        app.plan = planService.clonePlan(app.draft);
        app.planSave = { state: 'saved' };
        notify('Plan zapisany.', { type: 'success' });
    } catch (error) {
        app.planSave = {
            state: 'error',
            title: 'Nie zapisano planu',
            detail: `${error.message} Zmiany są nadal w pamięci — kliknij Zapisz plan, żeby ponowić.`,
            actionLabel: 'Ponów'
        };
    }
    fullRender();
}

async function saveExercises() {
    app.exercisesSave = { state: 'saving' };
    fullRender();

    try {
        await exercisesService.save(app.draftExercises);
        app.exercises = JSON.parse(JSON.stringify(app.draftExercises));
        app.exercisesSave = { state: 'saved' };
        notify('Katalog ćwiczeń zapisany.', { type: 'success' });
    } catch (error) {
        app.exercisesSave = {
            state: 'error',
            title: 'Nie zapisano katalogu',
            detail: `${error.message} Zmiany są nadal w pamięci — kliknij Zapisz, żeby ponowić.`,
            actionLabel: 'Ponów'
        };
    }
    fullRender();
}

function discardPlanDraft() {
    app.draft = planService.clonePlan(app.plan);
    app.planUI.selectedSplitId = null;
    app.planUI.containerId = app.plan.containers[0]?.id || null;
    app.planSave = { state: 'idle' };
    notify('Zmiany planu cofnięte.', { type: 'info' });
    fullRender();
}

function discardExercisesDraft() {
    app.draftExercises = JSON.parse(JSON.stringify(app.exercises));
    app.exercisesSave = { state: 'idle' };
    notify('Zmiany katalogu cofnięte.', { type: 'info' });
    fullRender();
}

function clearSession() {
    app.session = null;
    workoutService.clearFromDevice();
    fullRender();
}

function go(hash) {
    if (window.location.hash !== hash) window.location.hash = hash;
    fullRender();
}

function parseRoute() {
    const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    const known = ['plan', 'exercises', 'workout', 'summary', 'history', 'settings'];
    const route = known.includes(parts[0]) ? parts[0] : 'plan';
    return { route, param: parts[1] || null };
}

function escapeMeta(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}
