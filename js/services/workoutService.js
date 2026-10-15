import { generateId, toIsoDate } from '../utils.js';
import { apiService } from './api.js';
import { planService } from './planService.js';
import { storageService, STORAGE_KEYS } from './storage.js';
import { workoutAnalysis } from './workoutAnalysis.js';

function createSet(weight = 0, reps = 0) {
    return { weight, reps, done: false };
}

function toSignedWeight(value) {
    const number = Number(String(value ?? '').replace(',', '.'));
    if (!Number.isFinite(number)) return 0;
    return Math.round(number * 100) / 100;
}

function buildEntry(item, previous) {
    const previousSets = previous ? workoutAnalysis.completedSets(previous.entry) : [];
    const referenceSet = previousSets.at(-1) || null;

    return {
        exerciseId: item.exerciseId,
        name: item.name,
        group: item.group,
        skipped: false,
        repMin: item.repMin,
        repMax: item.repMax,
        increment: item.increment,
        previous: referenceSet ? { date: previous.date, weight: Number(referenceSet.weight), reps: Number(referenceSet.reps) } : null,
        sets: [createSet(referenceSet ? Number(referenceSet.weight) : 0, referenceSet ? Number(referenceSet.reps) : item.repMax)]
    };
}

function saveSession(session) {
    storageService.write(STORAGE_KEYS.SESSION, session);
}

function normalizeWorkouts(payload) {
    const list = Array.isArray(payload?.workouts) ? payload.workouts : Array.isArray(payload) ? payload : [];
    return list
        .filter(item => item && item.id && Array.isArray(item.exercises))
        .map(item => ({
            ...item,
            containerId: item.containerId || '',
            containerName: item.containerName || '',
            volume: item.volume ?? workoutAnalysis.sessionVolume(item)
        }))
        .sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

export const workoutService = {
    createSession(plan, catalog, container, split, sessions = []) {
        const items = planService.listSplitExercises(plan, catalog, split);

        return {
            id: generateId('session'),
            containerId: container.id,
            containerName: container.name,
            splitId: split.id,
            splitName: split.name,
            date: toIsoDate(),
            startedAt: new Date().toISOString(),
            finishedAt: null,
            currentIndex: 0,
            exercises: items.map(item => {
                const previous = workoutAnalysis.lastPerformance(sessions, item.exerciseId);
                return buildEntry(item, previous);
            })
        };
    },

    getCurrentEntry(session) {
        return session?.exercises?.[session.currentIndex] || null;
    },

    targetsFor(entry) {
        return { repMin: entry.repMin, repMax: entry.repMax, increment: entry.increment };
    },

    recommendationFor(entry) {
        return workoutAnalysis.recommendationFor(entry, entry.previous, this.targetsFor(entry));
    },

    setIndex(session, index) {
        if (index < 0 || index >= session.exercises.length) return;
        session.currentIndex = index;
        saveSession(session);
    },

    step(session, offset) {
        const next = session.currentIndex + offset;
        if (next < 0 || next >= session.exercises.length) return false;
        session.currentIndex = next;
        saveSession(session);
        return true;
    },

    updateSet(session, index, patch) {
        const set = this.getCurrentEntry(session)?.sets?.[index];
        if (!set) return;
        if (patch.weight !== undefined) set.weight = toSignedWeight(patch.weight);
        if (patch.reps !== undefined) set.reps = Math.max(0, Number.parseInt(patch.reps, 10) || 0);
        if (patch.done !== undefined) set.done = Boolean(patch.done);
        saveSession(session);
    },

    updateSetAt(session, exerciseIndex, setIndex, patch) {
        const set = session?.exercises?.[exerciseIndex]?.sets?.[setIndex];
        if (!set) return;
        if (patch.weight !== undefined) set.weight = toSignedWeight(patch.weight);
        if (patch.reps !== undefined) set.reps = Math.max(0, Number.parseInt(patch.reps, 10) || 0);
        saveSession(session);
    },

    toggleSetDone(session, index) {
        const set = this.getCurrentEntry(session)?.sets?.[index];
        if (!set) return;
        set.done = !set.done;
        saveSession(session);
    },

    adjustSet(session, index, field, delta) {
        const entry = this.getCurrentEntry(session);
        const set = entry?.sets?.[index];
        if (!set) return;

        if (field === 'weight') {
            const increment = entry.increment || 2.5;
            const step = delta > 0 ? increment : -increment / 2;
            set.weight = Math.round((Number(set.weight) + step) * 100) / 100;
        } else {
            set.reps = Math.min(entry.repMax + 10, Math.max(0, Number(set.reps) + delta));
        }
        saveSession(session);
    },

    addSet(session) {
        const entry = this.getCurrentEntry(session);
        if (!entry) return;
        const last = entry.sets.at(-1);
        entry.sets.push(createSet(last ? Number(last.weight) : 0, last ? Number(last.reps) : entry.repMax));
        saveSession(session);
    },

    removeSet(session, index) {
        const entry = this.getCurrentEntry(session);
        if (!entry || entry.sets.length <= 1) return;
        entry.sets.splice(index, 1);
        saveSession(session);
    },

    toggleSkipped(session) {
        const entry = this.getCurrentEntry(session);
        if (!entry) return;
        entry.skipped = !entry.skipped;
        saveSession(session);
    },

    nextUndoneIndex(session) {
        const sets = this.getCurrentEntry(session)?.sets;
        if (!sets?.length) return 0;
        const index = sets.findIndex(set => !workoutAnalysis.isCompletedSet(set));
        return index === -1 ? 0 : index;
    },

    entryStatus(entry) {
        if (entry.skipped) return 'skipped';
        const done = workoutAnalysis.completedSets(entry).length;
        if (!done) return 'todo';
        return done >= entry.sets.length ? 'done' : 'partial';
    },

    summary(session) {
        const total = session.exercises.length;
        const statuses = session.exercises.map(entry => this.entryStatus(entry));
        const done = statuses.filter(status => status === 'done').length;
        const partial = statuses.filter(status => status === 'partial').length;
        const skipped = statuses.filter(status => status === 'skipped').length;

        return {
            done,
            partial,
            skipped,
            total,
            remaining: total - done - skipped,
            isFinished: done + skipped === total,
            volume: workoutAnalysis.sessionVolume(session),
            sets: workoutAnalysis.sessionSetCount(session),
            progressPercent: total ? Math.round(((done + skipped) / total) * 100) : 0
        };
    },

    finish(session) {
        const summary = this.summary(session);
        return {
            ...session,
            currentIndex: 0,
            finishedAt: new Date().toISOString(),
            durationMs: Date.now() - new Date(session.startedAt).getTime(),
            volume: summary.volume,
            isPartial: summary.done + summary.skipped < summary.total
        };
    },

    saveOnDevice(session) {
        saveSession(session);
    },

    readFromDevice() {
        return storageService.read(STORAGE_KEYS.SESSION);
    },

    clearFromDevice() {
        storageService.clear(STORAGE_KEYS.SESSION);
    },

    async save(session) {
        const payload = await apiService.read('workouts');
        const workouts = normalizeWorkouts(payload);
        const record = JSON.parse(JSON.stringify(session));
        const index = workouts.findIndex(item => item.id === session.id);

        if (index === -1) workouts.push(record);
        else workouts[index] = record;

        await apiService.write('workouts', { version: 1, workouts }, `Trening ${session.containerName} ${session.splitName} ${session.date}`);
        return record;
    },

    async load() {
        return normalizeWorkouts(await apiService.read('workouts'));
    }
};
