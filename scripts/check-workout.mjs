import { registerHooks } from 'node:module';
import { readFile } from 'node:fs/promises';

const ROOT = new URL('../', import.meta.url);

globalThis.window = { location: { hostname: 'example.org' }, addEventListener() {}, removeEventListener() {} };
globalThis.localStorage = {
    store: new Map(),
    getItem(key) { return this.store.get(key) ?? null; },
    setItem(key, value) { this.store.set(key, String(value)); },
    removeItem(key) { this.store.delete(key); }
};
globalThis.document = {
    addEventListener() {},
    removeEventListener() {},
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    createElement: () => ({ classList: { add() {}, remove() {} }, appendChild() {}, addEventListener() {}, setAttribute() {}, style: {} }),
    body: { appendChild() {} }
};

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier)) {
            return { url: new URL(`${specifier}.js`, context.parentURL).href, shortCircuit: true };
        }
        return nextResolve(specifier, context);
    }
});

const { planService } = await import(new URL('js/services/planService.js', ROOT));
const { exercisesService } = await import(new URL('js/services/exercisesService.js', ROOT));
const { workoutService } = await import(new URL('js/services/workoutService.js', ROOT));
const { createWorkoutView } = await import(new URL('js/ui/workoutView.js', ROOT));
const { createSummaryView } = await import(new URL('js/ui/summaryView.js', ROOT));
const { renderSaveStatus } = await import(new URL('js/ui/components/saveStatus.js', ROOT));
const { renderLineChart } = await import(new URL('js/ui/charts.js', ROOT));

let failures = 0;
function check(name, condition, detail = '') {
    if (!condition) failures += 1;
    console.log(`${condition ? 'ok  ' : 'FAIL'} ${name}${condition ? '' : ` → ${detail}`}`);
}

const catalog = exercisesService.normalizeCatalog(JSON.parse(await readFile(new URL('database/exercises.json', ROOT), 'utf8')));
const plan = planService.normalizePlan(JSON.parse(await readFile(new URL('database/plan.json', ROOT), 'utf8')));
const container = plan.containers[0];
const split = container.splits[0];

const history = [
    { id: 'w_prev', date: '2026-02-01', finishedAt: '2026-02-01T18:00:00.000Z', containerName: 'Październik', splitName: 'Upper', exercises: [
        { exerciseId: 'ex_upper_chest_press', name: 'Upper Chest Press', sets: [{ weight: 110, reps: 8, done: true }] },
        { exerciseId: 'ex_back_row', name: 'Back Row', sets: [{ weight: 120, reps: 9, done: true }] }
    ] },
    { id: 'w_prev2', date: '2026-01-25', finishedAt: '2026-01-25T18:00:00.000Z', containerName: 'Październik', splitName: 'Upper', exercises: [
        { exerciseId: 'ex_upper_chest_press', name: 'Upper Chest Press', sets: [{ weight: 110, reps: 8, done: true }] }
    ] },
    { id: 'w_prev3', date: '2026-01-18', finishedAt: '2026-01-18T18:00:00.000Z', containerName: 'Październik', splitName: 'Upper', exercises: [
        { exerciseId: 'ex_upper_chest_press', name: 'Upper Chest Press', sets: [{ weight: 110, reps: 8, done: true }] }
    ] }
];

const session = workoutService.createSession(plan, catalog, container, split, history);
check('split seeds eight exercises', session.exercises.length, 8);
check('session carries container name', session.containerName, 'Październik');
check('previous weight prefilled from history', session.exercises[0].sets[0].weight, 110);
check('previous reps prefilled from history', session.exercises[0].sets[0].reps, 8);
check('only one set is seeded', session.exercises.every(entry => entry.sets.length === 1) === true);
check('first time exercise has no previous', session.exercises[2].previous === null);

const app = {
    session,
    workouts: history,
    summarySession: null,
    summarySave: { state: 'idle' },
    activeSetIndex() { return workoutService.nextUndoneIndex(this.session); },
    render() {},
    advanceAfterExercise() {},
    finishWorkout() {},
    retrySummarySave() {}
};

const workout = createWorkoutView(app);
const workoutHtml = workout.render();

check('workout shows exercise name', workoutHtml.includes('Upper Chest Press'));
check('workout shows position', workoutHtml.includes('1/8'));
check('workout shows split and container', workoutHtml.includes('Upper · Październik'));
check('workout shows previous performance', workoutHtml.includes('110 kg × 8 powt.'));
check('workout shows weight input', workoutHtml.includes('data-input="weight"'));
check('workout shows reps input', workoutHtml.includes('data-input="reps"'));
check('workout shows rep range hint', workoutHtml.includes('Zakres 4–8 powt.'));
check('workout has plus and minus steps', (workoutHtml.match(/data-action="adjust"/g) || []).length === 4);
check('workout seeds a single set chip', (workoutHtml.match(/data-action="toggle-set"/g) || []).length === 1);
check('single set has no remove button', !workoutHtml.includes('data-action="remove-set"'));
check('workout always offers add set', workoutHtml.includes('data-action="add-set"'));
check('workout has skip action', workoutHtml.includes('data-action="skip"') && workoutHtml.includes('Pomiń'));
check('workout has previous and next arrows', workoutHtml.includes('data-action="step-prev"') && workoutHtml.includes('data-action="step-next"'));
check('first exercise disables the previous arrow', workoutHtml.includes('data-action="step-prev" aria-label="Poprzednie ćwiczenie" disabled'));
check('workout has confirm set action', workoutHtml.includes('Zapisz serię'));
check('workout header hides global nav', !workoutHtml.includes('app-nav'));

workoutService.updateSet(session, 0, { weight: 110, reps: 5, done: true });
check('suggestion mid range adds a rep', workout.render().includes('Dołóż powtórzenie'));
workoutService.updateSet(session, 0, { reps: 8 });
check('suggestion at top of range bumps weight', workout.render().includes('+2.5 kg'));
workoutService.updateSet(session, 0, { weight: 105, reps: 5 });

workoutService.addSet(session);
const withTwo = workout.render();
check('added set copies the weight', session.exercises[0].sets[1].weight, 105);
check('added set copies the reps', session.exercises[0].sets[1].reps, 5);
check('added set starts empty of done flag', session.exercises[0].sets[1].done === false);
check('two sets render two chips', (withTwo.match(/data-action="toggle-set"/g) || []).length === 2);
check('two sets render remove buttons', (withTwo.match(/data-action="remove-set"/g) || []).length === 2);
check('set counter shows 1 z 2', withTwo.includes('1 z 2'));

workoutService.step(session, 1);
check('stepping moves to second exercise', session.currentIndex, 1);
check('second exercise shows its own previous', workout.render().includes('120 kg × 9 powt.'));
const back = workoutService.step(session, -1);
check('stepping back returns', [back, session.currentIndex], [true, 0]);
check('cannot step before the first exercise', workoutService.step(session, -1) === false);
check('cannot step past the last exercise', workoutService.step({ ...session, currentIndex: 7 }, 1) === false);

workoutService.setIndex(session, 5);
check('jump to any exercise works', session.currentIndex, 5);
workoutService.setIndex(session, 0);

session.exercises[1].skipped = true;
workoutService.setIndex(session, 1);
check('skip action label after skipping', workout.render().includes('Przywróć'));
workoutService.setIndex(session, 0);

const finished = workoutService.finish(session);
check('finished session stamps finish time', Boolean(finished.finishedAt));
check('finished session computes volume', finished.volume > 0, String(finished.volume));

app.summarySession = finished;
app.workouts = [...history, finished];
const summaryView = createSummaryView(app);
const summaryHtml = summaryView.render();

check('summary congratulates', summaryHtml.includes('Dobra robota!'));
check('summary shows duration', summaryHtml.includes('Czas'));
check('summary shows volume', summaryHtml.includes('Objętość'));
check('summary names the container', summaryHtml.includes('Październik'));
check('summary lists plateau section', summaryHtml.includes('Plateau'));
check('summary shows save status', summaryHtml.includes('data-save-status'));

app.summarySave = { state: 'saving' };
check('saving state shown', summaryView.render().includes('save-status--saving'));

app.summarySave = { state: 'error', title: 'Nie zapisano na GitHubie', detail: 'HTTP 401', actionLabel: 'Ponów' };
const errorHtml = summaryView.render();
check('error state shown', errorHtml.includes('save-status--error'));
check('error offers retry without data loss', errorHtml.includes('data-save-retry') && errorHtml.includes('Ponów'));

app.summarySave = { state: 'saved' };
check('saved state shown', summaryView.render().includes('save-status--saved'));

check('save status idle copy', renderSaveStatus({ state: 'idle' }).includes('Gotowe do zapisu'));
check('save status escapes detail', !renderSaveStatus({ state: 'error', detail: '<b>x</b>' }).includes('<b>'));

const chart = renderLineChart([
    { label: '1 lut', value: 80 },
    { label: '8 lut', value: 82.5 },
    { label: '15 lut', value: 85 }
], { valueFormat: value => String(value) });
check('line chart renders svg', chart.includes('<svg') && chart.includes('chart__line'));
check('line chart labels first and last', chart.includes('1 lut') && chart.includes('15 lut'));
check('line chart renders a dot per point', (chart.match(/chart__dot/g) || []).length === 3);
check('line chart handles single point', renderLineChart([{ label: '1 lut', value: 80 }]).includes('chart__single-label'));
check('line chart handles no data', renderLineChart([]).includes('chart-empty'));

console.log(failures ? `\n${failures} check(s) failed` : '\nall workout checks passed');
process.exit(failures ? 1 : 0);
