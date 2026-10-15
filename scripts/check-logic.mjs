import { registerHooks } from 'node:module';

const ROOT = new URL('../', import.meta.url);

globalThis.window = { location: { hostname: 'example.org' }, addEventListener() {} };
globalThis.localStorage = {
    store: new Map(),
    getItem(key) { return this.store.get(key) ?? null; },
    setItem(key, value) { this.store.set(key, String(value)); },
    removeItem(key) { this.store.delete(key); }
};

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier)) {
            return { url: new URL(`${specifier}.js`, context.parentURL).href, shortCircuit: true };
        }
        return nextResolve(specifier, context);
    }
});

const { workoutAnalysis } = await import(new URL('js/services/workoutAnalysis.js', ROOT));
const { workoutService } = await import(new URL('js/services/workoutService.js', ROOT));
const { planService } = await import(new URL('js/services/planService.js', ROOT));
const { exercisesService } = await import(new URL('js/services/exercisesService.js', ROOT));
const { sanitizeDecimal, formatWeight } = await import(new URL('js/utils.js', ROOT));

let failures = 0;
function check(name, actual, expected) {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (!ok) failures += 1;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : ` → ${JSON.stringify(actual)} ≠ ${JSON.stringify(expected)}`}`);
}

const catalog = { ex_a: { name: 'Wyciskanie', group: 'Klatka' } };
const plan = planService.normalizePlan({
    defaults: { repMin: 6, repMax: 10, increment: 2.5 },
    containers: [{
        id: 'c1',
        name: 'Grudzień',
        splits: [
            { id: 's1', name: 'Upper A', exercises: [{ exerciseId: 'ex_a', repMin: null, repMax: null, increment: null }] },
            { id: 's2', name: 'Upper B', exercises: [{ exerciseId: 'ex_a', repMin: 8, repMax: 12, increment: 5 }] }
        ]
    }]
});

const container = planService.findContainer(plan, 'c1');
check('container has two splits', container.splits.length, 2);
check('split resolved against defaults', planService.listSplitExercises(plan, catalog, container.splits[0])[0].repMax, 10);
check('split override wins', planService.listSplitExercises(plan, catalog, container.splits[1])[0].repMin, 8);
check('split override increment wins', planService.listSplitExercises(plan, catalog, container.splits[1])[0].increment, 5);
check('same exercise id in both splits', container.splits[0].exercises[0].exerciseId, container.splits[1].exercises[0].exerciseId);
check('usage counts both splits', planService.usageOfExercise(plan, 'ex_a').map(u => u.splitName), ['Upper A', 'Upper B']);
check('find container of split', planService.findContainerOfSplit(plan, 's2').id, 'c1');
check('catalog list is sorted', exercisesService.listCatalog({ b: { name: 'Zet', group: 'X' }, a: { name: 'Alfa', group: 'X' } }).map(e => e.name), ['Alfa', 'Zet']);
check('catalog groups', exercisesService.listCatalogGroups(catalog).map(g => g.group), ['Klatka']);

const copied = planService.copyContainer(plan, 'c1');
check('copy adds a container', plan.containers.length, 2);
check('copy gets a new id', copied.id !== 'c1', true);
check('copy names itself', copied.name, 'Grudzień kopia');
check('copy keeps split names', copied.splits.map(s => s.name), ['Upper A', 'Upper B']);
check('copy regenerates split ids', copied.splits[0].id !== 's1', true);
check('copy keeps exercise references', copied.splits[0].exercises[0].exerciseId, 'ex_a');
check('copy keeps per-split targets', copied.splits[1].exercises[0], { exerciseId: 'ex_a', repMin: 8, repMax: 12, increment: 5 });

planService.updateSplitExercise(plan, copied.splits[0].id, 0, { increment: 7.5 });
check('editing copy does not touch original', planService.findSplit(container, 's1').exercises[0].increment, null);
check('editing copy changes the copy', copied.splits[0].exercises[0].increment, 7.5);

const again = planService.copyContainer(plan, 'c1');
check('second copy gets a unique name', again.name, 'Grudzień kopia 2');

const second = planService.addContainer(plan, 'Styczeń');
check('addContainer appends', plan.containers.at(-1).id, second.id);
planService.addSplit(plan, second.id, 'Upper');
check('new container split added', second.splits.length, 1);
planService.removeContainer(plan, second.id);
check('removeContainer drops it', plan.containers.some(c => c.id === second.id), false);

const session = workoutService.createSession(plan, catalog, container, container.splits[0], []);
check('session carries container', [session.containerId, session.containerName], ['c1', 'Grudzień']);
check('session carries split', [session.splitId, session.splitName], ['s1', 'Upper A']);
check('session starts with a single set', session.exercises[0].sets.length, 1);
check('session records targets', [session.exercises[0].repMin, session.exercises[0].repMax, session.exercises[0].increment], [6, 10, 2.5]);

const entry = session.exercises[0];
check('recommendation muted before any set', workoutService.recommendationFor(entry).level, 'muted');

workoutService.updateSet(session, 0, { weight: 60, reps: 10 });
check('set values stored', entry.sets[0], { weight: 60, reps: 10, done: false });
workoutService.toggleSetDone(session, 0);
check('set toggled done', entry.sets[0].done, true);
check('entry status done', workoutService.entryStatus(entry), 'done');

workoutService.addSet(session);
check('addSet copies previous values', entry.sets[1], { weight: 60, reps: 10, done: false });
check('addSet grows the list', entry.sets.length, 2);
workoutService.adjustSet(session, 1, 'weight', 1);
check('adjustSet adds one increment', entry.sets[1].weight, 62.5);
workoutService.adjustSet(session, 1, 'weight', -1);
check('adjustSet subtracts half increment', entry.sets[1].weight, 61.25);
workoutService.removeSet(session, 1);
check('removeSet shrinks', entry.sets.length, 1);
workoutService.removeSet(session, 0);
check('never removes the last set', entry.sets.length, 1);

const threeSetSplit = container.splits[1];
const threeSetSession = workoutService.createSession(plan, catalog, container, threeSetSplit, []);
check('every session starts with exactly one set', threeSetSession.exercises[0].sets.length, 1);
check('split-level targets carried', [threeSetSession.exercises[0].repMin, threeSetSession.exercises[0].repMax], [8, 12]);

const history = [
    { id: 'w1', date: '2026-01-01', finishedAt: '2026-01-01T10:00:00.000Z', containerName: 'Grudzień', exercises: [{ exerciseId: 'ex_a', sets: [{ weight: 60, reps: 8, done: true }] }] },
    { id: 'w2', date: '2026-01-08', finishedAt: '2026-01-08T10:00:00.000Z', containerName: 'Grudzień', exercises: [{ exerciseId: 'ex_a', sets: [{ weight: 60, reps: 8, done: true }] }] },
    { id: 'w3', date: '2026-01-15', finishedAt: '2026-01-15T10:00:00.000Z', containerName: 'Styczeń', exercises: [{ exerciseId: 'ex_a', sets: [{ weight: 60, reps: 8, done: true }] }] }
];

check('history spans containers', workoutAnalysis.historyForExercise(history, 'ex_a').map(h => h.date), ['2026-01-01', '2026-01-08', '2026-01-15']);
check('plateau detected across containers', workoutAnalysis.isPlateau(history, 'ex_a'), true);

const carried = workoutService.createSession(plan, catalog, container, container.splits[0], history);
check('new session prefills last weight regardless of container', carried.exercises[0].sets[0].weight, 60);
check('new session carries previous date', carried.exercises[0].previous.date, '2026-01-15');

workoutService.updateSet(carried, 0, { weight: 60, reps: 10, done: true });
check('all at top of range → increase', workoutService.recommendationFor(carried.exercises[0]).headline, '+2.5 kg');
workoutService.updateSet(carried, 0, { reps: 5 });
check('below range → hold', workoutService.recommendationFor(carried.exercises[0]).level, 'hold');
workoutService.updateSet(carried, 0, { reps: 8 });
check('mid range → add a rep', workoutService.recommendationFor(carried.exercises[0]).level, 'up-reps');
workoutService.updateSet(carried, 0, { weight: 50 });
check('below previous → deload', workoutService.recommendationFor(carried.exercises[0]).level, 'down');

check('estimate 1RM Epley', Math.round(workoutAnalysis.estimateOneRepMax(100, 10)), 133);
check('volume skips undone sets', workoutAnalysis.sessionVolume(threeSetSession), 0);
workoutService.updateSet(threeSetSession, 0, { weight: 100, reps: 5, done: true });
check('volume uses done sets', workoutAnalysis.entryVolume(threeSetSession.exercises[0]), 500);

check('catalog weights list every exercise', workoutAnalysis.currentWeights(catalog, history).length, 1);
check('catalog weight is last top set', workoutAnalysis.currentWeights(catalog, history)[0].weight, 60);
check('catalog weight ignores splits', workoutAnalysis.currentWeights({ zz: { name: 'Unused', group: 'X' } }, history)[0].weight, 0);
check('personal record beats history', workoutAnalysis.isPersonalRecord(history, 'w9', { exerciseId: 'ex_a', sets: [{ weight: 70, reps: 8, done: true }] }), true);
check('same load is not a record', workoutAnalysis.isPersonalRecord(history, 'w9', { exerciseId: 'ex_a', sets: [{ weight: 60, reps: 8, done: true }] }), false);

const summary = workoutService.summary(threeSetSession);
check('summary volume', summary.volume, 500);
check('summary of single-set entry', summary.sets, 1);
workoutService.toggleSkipped(threeSetSession);
check('skipped counts as handled', workoutService.summary(threeSetSession).isFinished, true);

const empty = workoutService.createSession(plan, catalog, container, container.splits[0], []);
check('untouched session not finished', workoutService.summary(empty).isFinished, false);
check('untouched session has no volume', workoutService.summary(empty).volume, 0);

planService.setDefaults(plan, { repMin: 8, repMax: 5 });
check('defaults keep min below max', [plan.defaults.repMin, plan.defaults.repMax], [8, 8]);
planService.setDefaults(plan, { increment: 0.1 });
check('increment floors at 0.5', plan.defaults.increment, 0.5);

check('sanitize decimal helper', sanitizeDecimal('62,5kg'), '62.5');
check('format weight trims', formatWeight(62.5), '62,5');

console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);
