import { WORKOUT_CONFIG } from '../config/config.js';
import { generateId } from '../utils.js';
import { apiService } from './api.js';
import { exercisesService } from './exercisesService.js';

function createEmptyPlan() {
    return {
        version: 2,
        defaults: {
            repMin: WORKOUT_CONFIG.DEFAULT_REP_MIN,
            repMax: WORKOUT_CONFIG.DEFAULT_REP_MAX,
            increment: WORKOUT_CONFIG.DEFAULT_INCREMENT
        },
        containers: []
    };
}

function normalizePlan(raw) {
    const plan = raw && typeof raw === 'object' ? raw : {};
    const defaults = plan.defaults || {};
    const containers = Array.isArray(plan.containers) ? plan.containers : [];

    return {
        version: 2,
        defaults: {
            repMin: toPositiveInt(defaults.repMin, WORKOUT_CONFIG.DEFAULT_REP_MIN),
            repMax: toPositiveInt(defaults.repMax, WORKOUT_CONFIG.DEFAULT_REP_MAX),
            increment: toPositiveNumber(defaults.increment, WORKOUT_CONFIG.DEFAULT_INCREMENT)
        },
        containers: containers
            .filter(container => container && container.id && container.name)
            .map(container => ({
                id: String(container.id),
                name: String(container.name),
                splits: (Array.isArray(container.splits) ? container.splits : [])
                    .filter(split => split && split.id && split.name)
                    .map(split => ({
                        id: String(split.id),
                        name: String(split.name),
                        exercises: (Array.isArray(split.exercises) ? split.exercises : [])
                            .filter(item => item && item.exerciseId)
                            .map(item => ({
                                exerciseId: String(item.exerciseId),
                                repMin: toOptionalInt(item.repMin),
                                repMax: toOptionalInt(item.repMax),
                                increment: toOptionalNumber(item.increment)
                            }))
                    }))
            }))
    };
}

function resolveTargets(plan, item) {
    return {
        repMin: item.repMin ?? plan.defaults.repMin,
        repMax: item.repMax ?? plan.defaults.repMax,
        increment: item.increment ?? plan.defaults.increment
    };
}

function listSplitExercises(plan, catalog, split) {
    return split.exercises.map(item => {
        const exercise = exercisesService.describeExercise(catalog, item.exerciseId);
        return {
            exerciseId: item.exerciseId,
            name: exercise.name,
            group: exercise.group,
            ...resolveTargets(plan, item)
        };
    });
}

function clonePlan(plan) {
    return JSON.parse(JSON.stringify(plan));
}

function findContainer(plan, containerId) {
    return plan.containers.find(container => container.id === containerId) || null;
}

function findSplit(container, splitId) {
    return container?.splits.find(split => split.id === splitId) || null;
}

function findContainerOfSplit(plan, splitId) {
    return plan.containers.find(container => container.splits.some(split => split.id === splitId)) || null;
}

function addContainer(plan, name) {
    const container = { id: generateId('cont'), name: String(name).trim(), splits: [] };
    plan.containers.push(container);
    return container;
}

function renameContainer(plan, containerId, name) {
    const container = findContainer(plan, containerId);
    if (container) container.name = String(name).trim();
}

function copyContainer(plan, containerId) {
    const source = findContainer(plan, containerId);
    if (!source) return null;

    const copy = {
        id: generateId('cont'),
        name: uniqueContainerName(plan, `${source.name} kopia`),
        splits: source.splits.map(split => ({
            id: generateId('split'),
            name: split.name,
            exercises: split.exercises.map(item => ({ ...item }))
        }))
    };

    plan.containers.push(copy);
    return copy;
}

function uniqueContainerName(plan, name) {
    const taken = new Set(plan.containers.map(container => container.name));
    if (!taken.has(name)) return name;

    let index = 2;
    while (taken.has(`${name} ${index}`)) index += 1;
    return `${name} ${index}`;
}

function removeContainer(plan, containerId) {
    plan.containers = plan.containers.filter(container => container.id !== containerId);
}

function addSplit(plan, containerId, name) {
    const container = findContainer(plan, containerId);
    if (!container) return null;
    const split = { id: generateId('split'), name: String(name).trim(), exercises: [] };
    container.splits.push(split);
    return split;
}

function removeSplit(container, splitId) {
    container.splits = container.splits.filter(split => split.id !== splitId);
}

function addExerciseToSplit(plan, containerId, splitId, exerciseId) {
    const split = findSplit(findContainer(plan, containerId), splitId);
    if (!split) return;
    split.exercises.push({ exerciseId, repMin: null, repMax: null, increment: null });
}

function updateSplitExercise(plan, splitId, index, patch) {
    const split = findSplitFor(plan, splitId);
    const item = split?.exercises[index];
    if (!item) return;

    if (patch.repMin !== undefined) item.repMin = toOptionalInt(patch.repMin);
    if (patch.repMax !== undefined) item.repMax = toOptionalInt(patch.repMax);
    if (patch.increment !== undefined) item.increment = toOptionalNumber(patch.increment);
}

function removeSplitExercise(plan, splitId, index) {
    const split = findSplitFor(plan, splitId);
    if (!split) return;
    split.exercises.splice(index, 1);
}

function moveSplitExercise(plan, splitId, index, offset) {
    const split = findSplitFor(plan, splitId);
    if (!split) return;
    const target = index + offset;
    if (target < 0 || target >= split.exercises.length) return;
    const [item] = split.exercises.splice(index, 1);
    split.exercises.splice(target, 0, item);
}

function findSplitFor(plan, splitId) {
    const container = findContainerOfSplit(plan, splitId);
    return container ? findSplit(container, splitId) : null;
}

function usageOfExercise(plan, exerciseId) {
    const usages = [];

    plan.containers.forEach(container => {
        container.splits.forEach(split => {
            split.exercises.forEach(item => {
                if (item.exerciseId === exerciseId) {
                    usages.push({ containerId: container.id, containerName: container.name, splitId: split.id, splitName: split.name });
                }
            });
        });
    });

    return usages;
}

function setDefaults(plan, patch) {
    const defaults = plan.defaults;
    if (patch.repMin !== undefined) defaults.repMin = clampInt(patch.repMin, 1, 30, defaults.repMin);
    if (patch.repMax !== undefined) defaults.repMax = clampInt(patch.repMax, 1, 30, defaults.repMax);
    if (patch.increment !== undefined) defaults.increment = Math.min(25, Math.max(0.5, Number(patch.increment) || defaults.increment));
    if (defaults.repMax < defaults.repMin) defaults.repMax = defaults.repMin;
}

export const planService = {
    createEmptyPlan,
    normalizePlan,
    listSplitExercises,
    clonePlan,
    findContainer,
    findSplit,
    findContainerOfSplit,
    addContainer,
    renameContainer,
    copyContainer,
    removeContainer,
    addSplit,
    removeSplit,
    addExerciseToSplit,
    updateSplitExercise,
    removeSplitExercise,
    moveSplitExercise,
    usageOfExercise,
    setDefaults,

    async load() {
        return normalizePlan(await apiService.read('plan'));
    },

    async save(plan) {
        return apiService.write('plan', normalizePlan(plan), 'Update plan treningowy');
    }
};

function toPositiveInt(value, fallback) {
    const number = Number.parseInt(value, 10);
    return Number.isFinite(number) && number > 0 ? number : fallback;
}

function toOptionalInt(value) {
    if (value === null || value === undefined || value === '') return null;
    const number = Number.parseInt(value, 10);
    return Number.isFinite(number) && number > 0 ? number : null;
}

function toPositiveNumber(value, fallback) {
    const number = Number.parseFloat(value);
    return Number.isFinite(number) && number > 0 ? number : fallback;
}

function toOptionalNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    const number = Number.parseFloat(value);
    return Number.isFinite(number) && number > 0 ? number : null;
}

function clampInt(value, min, max, fallback) {
    const number = Number.parseInt(value, 10);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
}
