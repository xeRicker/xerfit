import { registerHooks } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);

globalThis.window = { location: { hostname: 'localhost' }, addEventListener() {} };
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

const { planService } = await import(new URL('js/services/planService.js', ROOT));
const { exercisesService } = await import(new URL('js/services/exercisesService.js', ROOT));
const { workoutService } = await import(new URL('js/services/workoutService.js', ROOT));
const { workoutAnalysis } = await import(new URL('js/services/workoutAnalysis.js', ROOT));

const plan = planService.normalizePlan(JSON.parse(readFileSync(new URL('database/plan.json', ROOT), 'utf8')));
const catalog = exercisesService.normalizeCatalog(JSON.parse(readFileSync(new URL('database/exercises.json', ROOT), 'utf8')));

const SEED = {
    split_upper: {
        date: '2026-10-15T18:05:00',
        minutes: 52,
        sets: {
            ex_upper_chest_press: [[110, 8]],
            ex_back_row: [[120, 9]],
            ex_butterfly: [[75, 8]],
            ex_pullups: [[-15, 7]],
            ex_lateral_raise: [[7.5, 9]],
            ex_reverse_fly: [[70, 8]],
            ex_biceps: [[50, 6]],
            ex_triceps: [[70, 8]]
        }
    },
    split_lower: {
        date: '2026-10-14T17:40:00',
        minutes: 47,
        sets: {
            ex_leg_press: [[230, 8]],
            ex_hack_squat: [[170, 12]],
            ex_leg_curl: [[100, 11], [100, 12]],
            ex_adductors: [[125, 9]],
            ex_abductors: [[145, 9]],
            ex_calf_raise: [[220, 9]]
        }
    },
    split_express: {
        date: '2026-10-13T19:10:00',
        minutes: 41,
        sets: {
            ex_cable_crunch: [[80, 6]],
            ex_ohp: [[110, 7]],
            ex_reverse_fly: [[90, 8]],
            ex_triceps_pushdown: [[100, 8]],
            ex_triceps_dip: [[0, 13]],
            ex_reverse_curl: [[20, 9]],
            ex_shrugs: [[50, 10]],
            ex_t_row: [[100, 6]],
            ex_chest_press: [[80, 6]],
            ex_lateral_raise: [[44, 6]]
        }
    }
};

const container = plan.containers[0];
const workouts = [];

for (const [splitId, seed] of Object.entries(SEED)) {
    const split = planService.findSplit(container, splitId);
    if (!split) throw new Error(`Missing split ${splitId}`);

    const session = workoutService.createSession(plan, catalog, container, split, []);

    session.exercises.forEach(entry => {
        const sets = seed.sets[entry.exerciseId];
        entry.sets = (sets || []).map(([weight, reps]) => ({ weight, reps, done: true }));
        if (!entry.sets.length) entry.skipped = true;
    });

    const startedAt = new Date(seed.date);
    session.date = seed.date.slice(0, 10);
    session.startedAt = startedAt.toISOString();
    session.finishedAt = new Date(startedAt.getTime() + seed.minutes * 60000).toISOString();
    session.durationMs = seed.minutes * 60000;
    session.volume = workoutAnalysis.sessionVolume(session);
    session.isPartial = false;
    session.currentIndex = 0;

    const missing = Object.keys(seed.sets).filter(id => !session.exercises.some(entry => entry.exerciseId === id));
    if (missing.length) throw new Error(`${splitId}: sets for unknown exercises ${missing.join(', ')}`);

    workouts.push(session);
}

workouts.sort((a, b) => a.date.localeCompare(b.date));

const payload = { version: 1, workouts };
writeFileSync(new URL('database/workouts.json', ROOT), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

for (const session of workouts) {
    const sets = workoutAnalysis.sessionSetCount(session);
    console.log(`${session.date}  ${session.splitName.padEnd(8)} ${String(session.exercises.length).padStart(2)} ćwiczeń  ${String(sets).padStart(2)} serii  ${session.volume} kg objętości`);
}
console.log(`\nzapisano ${workouts.length} treningi do database/workouts.json`);
