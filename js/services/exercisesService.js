import { generateId } from '../utils.js';
import { apiService } from './api.js';

function normalizeCatalog(raw) {
    const list = raw?.exercises && typeof raw.exercises === 'object' ? raw.exercises : {};
    return Object.fromEntries(
        Object.entries(list)
            .filter(([id, exercise]) => id && exercise && exercise.name)
            .map(([id, exercise]) => [id, { name: String(exercise.name), group: String(exercise.group || 'Inne') }])
    );
}

function listCatalog(catalog) {
    return Object.entries(catalog)
        .map(([id, exercise]) => ({ exerciseId: id, name: exercise.name, group: exercise.group }))
        .sort((a, b) => a.name.localeCompare(b.name, 'pl'));
}

function listCatalogGroups(catalog) {
    const groups = new Map();

    listCatalog(catalog).forEach(exercise => {
        if (!groups.has(exercise.group)) groups.set(exercise.group, []);
        groups.get(exercise.group).push(exercise);
    });

    return [...groups.entries()]
        .map(([group, exercises]) => ({ group, exercises }))
        .sort((a, b) => a.group.localeCompare(b.group, 'pl'));
}

function describeExercise(catalog, exerciseId) {
    return catalog[exerciseId] || { name: 'Usunięte ćwiczenie', group: 'Inne' };
}

function addExercise(catalog, { name, group }) {
    const exerciseId = generateId('ex');
    catalog[exerciseId] = { name: String(name).trim(), group: String(group || 'Inne').trim() || 'Inne' };
    return exerciseId;
}

function updateExercise(catalog, exerciseId, patch) {
    const exercise = catalog[exerciseId];
    if (!exercise) return;
    if (patch.name !== undefined) exercise.name = String(patch.name).trim() || exercise.name;
    if (patch.group !== undefined) exercise.group = String(patch.group).trim() || 'Inne';
}

export const exercisesService = {
    normalizeCatalog,
    listCatalog,
    listCatalogGroups,
    describeExercise,
    addExercise,
    updateExercise,

    async load() {
        return normalizeCatalog(await apiService.read('exercises'));
    },

    async save(catalog) {
        return apiService.write('exercises', { version: 1, exercises: normalizeCatalog(catalog) }, 'Update katalog ćwiczeń');
    }
};
