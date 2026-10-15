import { WORKOUT_CONFIG } from '../config/config.js';

const WEIGHT_TOLERANCE = 0.01;
const EPSILON = 0.01;

function estimateOneRepMax(weight, reps) {
    const numericWeight = Math.abs(Number(weight) || 0);
    const numericReps = Number(reps) || 0;
    if (numericWeight <= 0 || numericReps <= 0) return 0;
    return numericWeight * (1 + numericReps / 30);
}

function isCompletedSet(set) {
    const weight = set?.weight;
    return Boolean(set?.done) && Number(set?.reps) > 0 && weight !== null && weight !== undefined && weight !== '';
}

function completedSets(entry) {
    return (entry?.sets || []).filter(isCompletedSet);
}

function setLoad(set) {
    return Math.abs(Number(set?.weight) || 0);
}

function entryVolume(entry) {
    return completedSets(entry).reduce((sum, set) => sum + setLoad(set) * Number(set.reps), 0);
}

function entryBestOneRepMax(entry) {
    return completedSets(entry).reduce((best, set) => Math.max(best, estimateOneRepMax(setLoad(set), set.reps)), 0);
}

function sessionVolume(session) {
    return (session?.exercises || []).reduce((sum, entry) => sum + entryVolume(entry), 0);
}

function sessionSetCount(session) {
    return (session?.exercises || []).reduce((sum, entry) => sum + completedSets(entry).length, 0);
}

function historyForExercise(sessions, exerciseId) {
    return sessions
        .filter(session => session?.finishedAt)
        .map(session => {
            const entry = (session.exercises || []).find(item => item.exerciseId === exerciseId);
            if (!entry || entry.skipped || !completedSets(entry).length) return null;
            return { date: session.date, entry, bestOneRepMax: entryBestOneRepMax(entry), volume: entryVolume(entry) };
        })
        .filter(Boolean)
        .sort((a, b) => a.date.localeCompare(b.date));
}

function lastPerformance(sessions, exerciseId) {
    const history = historyForExercise(sessions, exerciseId);
    return history.length ? history[history.length - 1] : null;
}

function formatSetPlan(entry) {
    return completedSets(entry)
        .map(set => `${set.reps}×${normalizeWeight(set.weight)} kg`)
        .join(', ');
}

function normalizeWeight(value) {
    const number = Number(value) || 0;
    return Number.isInteger(number) ? number : Number(number.toFixed(2));
}

function recommendationFor(entry, previous, targets) {
    const sets = completedSets(entry);
    const repMin = targets.repMin;
    const repMax = targets.repMax;

    if (!sets.length) {
        return { level: 'muted', headline: 'Brak serii', detail: 'Zapisz serię, aby dostać podpowiedź.' };
    }

    const assisted = sets.some(set => Number(set.weight) < 0);
    const topWeight = Math.max(...sets.map(set => Number(set.weight)));
    const topSets = sets.filter(set => Math.abs(Number(set.weight) - topWeight) < WEIGHT_TOLERANCE);
    const heaviest = topSets[topSets.length - 1];
    const allAtTop = topSets.length === sets.length && topSets.every(set => Number(set.reps) >= repMax);
    const repsBelowRange = topSets.some(set => Number(set.reps) < repMin);
    const unit = assisted ? 'kg asysty' : 'kg';

    if (previous && topWeight < Number(previous.weight) - WEIGHT_TOLERANCE) {
        const delta = normalizeWeight(Math.abs(topWeight - Number(previous.weight)));
        return {
            level: 'down',
            headline: assisted ? `+${delta} kg asysty` : `−${delta} kg`,
            detail: assisted
                ? `Cofasz się do ${normalizeWeight(topWeight)} kg asysty. Poprzednio ${formatSetPlan(previous)}.`
                : `Wracasz do ${normalizeWeight(topWeight)} kg. Poprzednio ${formatSetPlan(previous)}.`
        };
    }

    if (allAtTop) {
        const nextWeight = normalizeWeight(topWeight + targets.increment);
        const step = normalizeWeight(Math.abs(targets.increment));
        return {
            level: 'up',
            headline: assisted ? `−${step} kg asysty` : `+${step} kg`,
            detail: assisted
                ? `Wszystkie serie na ${repMax} powt. Następnym razem zdejmij ${step} kg asysty (cel: ${nextWeight} kg).`
                : `Wszystkie serie na ${repMax} powt. Następnym razem spróbuj ${nextWeight} kg.`
        };
    }

    if (repsBelowRange) {
        return {
            level: 'hold',
            headline: 'Zostań na ciężarze',
            detail: `Powtórzenia poniżej ${repMin}. Powtórz ${normalizeWeight(topWeight)} ${unit} i odbuduj zakres.`
        };
    }

    return {
        level: 'up-reps',
        headline: 'Dołóż powtórzenie',
        detail: `Zostań na ${normalizeWeight(topWeight)} ${unit} i celuj w ${Math.min(Number(heaviest.reps) + 1, repMax)} powt.`
    };
}

function isPlateau(sessions, exerciseId, length = WORKOUT_CONFIG.PLATEAU_LENGTH) {
    const history = historyForExercise(sessions, exerciseId);
    if (history.length < length) return false;

    const recent = history.slice(-length).map(item => Math.round(item.bestOneRepMax * 10) / 10);
    const improved = recent.slice(1).some(value => value > recent[0] + EPSILON);
    return !improved;
}

function exerciseProgress(sessions, exerciseId) {
    const history = historyForExercise(sessions, exerciseId);
    if (history.length < 2) return null;

    const current = history[history.length - 1];
    const previous = history[history.length - 2];
    const currentTop = completedSets(current.entry).reduce((best, set) => (setLoad(set) > setLoad(best) ? set : best), { weight: 0 });
    const previousTop = completedSets(previous.entry).reduce((best, set) => (setLoad(set) > setLoad(best) ? set : best), { weight: 0 });
    const deltaLoad = setLoad(currentTop) - setLoad(previousTop);

    return {
        weight: Number(currentTop.weight),
        weightDelta: deltaLoad,
        volumeDelta: current.volume - previous.volume,
        oneRepMaxDelta: current.bestOneRepMax - previous.bestOneRepMax,
        isProgress: current.bestOneRepMax > previous.bestOneRepMax + EPSILON || deltaLoad > WEIGHT_TOLERANCE
    };
}

function isPersonalRecord(sessions, sessionId, entry) {
    const currentBest = entryBestOneRepMax(entry);
    if (currentBest <= 0) return false;

    const previousBest = sessions
        .filter(session => session?.finishedAt && session.id !== sessionId)
        .reduce((best, session) => {
            const item = (session.exercises || []).find(value => value.exerciseId === entry.exerciseId);
            return item ? Math.max(best, entryBestOneRepMax(item)) : best;
        }, 0);

    return currentBest > previousBest + EPSILON;
}

function currentWeights(catalog, sessions) {
    return Object.entries(catalog)
        .map(([exerciseId, exercise]) => {
            const history = historyForExercise(sessions, exerciseId);
            const last = history.at(-1) || null;
            const lastSets = last ? completedSets(last.entry) : [];
            const topSet = lastSets.reduce((best, set) => (setLoad(set) > setLoad(best) ? set : best), null);
            const hasWeight = lastSets.some(set => Number(set.weight) !== 0);

            return {
                exerciseId,
                name: exercise.name,
                group: exercise.group,
                sessions: history.length,
                lastDate: last?.date || null,
                lastSets: lastSets.map(set => ({ weight: Number(set.weight), reps: Number(set.reps) })),
                weight: hasWeight && topSet ? Number(topSet.weight) : null,
                oneRepMax: last?.bestOneRepMax || 0,
                isPlateau: isPlateau(sessions, exerciseId)
            };
        })
        .sort((a, b) => a.name.localeCompare(b.name, 'pl'));
}

export const workoutAnalysis = {
    estimateOneRepMax,
    isCompletedSet,
    completedSets,
    entryVolume,
    entryBestOneRepMax,
    sessionVolume,
    sessionSetCount,
    historyForExercise,
    lastPerformance,
    formatSetPlan,
    normalizeWeight,
    recommendationFor,
    isPlateau,
    isPlateau,
    exerciseProgress,
    isPersonalRecord,
    currentWeights
};
