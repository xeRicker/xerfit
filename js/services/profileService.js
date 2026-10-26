import { apiService } from './api.js';
import { storageService } from './storage.js';

const KEY = 'xerfit_profile';

function emptyProfile() {
    return { sex: 'male', age: null, height: null, weight: null, bodyFat: null };
}

function normalizeProfile(raw) {
    const profile = raw && typeof raw === 'object' ? raw : {};
    return {
        sex: profile.sex === 'female' ? 'female' : 'male',
        age: toRange(profile.age, 10, 100),
        height: toRange(profile.height, 100, 250),
        weight: toRange(profile.weight, 30, 300),
        bodyFat: toRange(profile.bodyFat, 2, 60)
    };
}

function isComplete(profile) {
    return Boolean(profile?.sex && profile?.weight);
}

function leanMass(profile) {
    if (!profile?.weight) return null;
    if (!profile.bodyFat) return profile.weight;
    return Math.round(profile.weight * (1 - profile.bodyFat / 100) * 10) / 10;
}

export const profileService = {
    emptyProfile,
    normalizeProfile,
    isComplete,
    leanMass,

    load() {
        return normalizeProfile(storageService.read(KEY));
    },

    save(profile) {
        const normalized = normalizeProfile(profile);
        storageService.write(KEY, normalized);
        return normalized;
    }
};

export const strengthService = {
    hasStandards(standards) {
        return Boolean(standards?.lifts && standards?.levels?.length && standards?.matching?.length);
    },

    async load() {
        return apiService.read('strengthStandards');
    },

    matchLift(standards, exerciseName) {
        const needle = String(exerciseName || '').toLowerCase();
        const match = (standards.matching || []).find(entry => entry.match.some(token => needle.includes(token)));
        if (!match) return null;
        const lift = standards.lifts?.[match.lift];
        return lift ? { key: match.lift, ...lift } : null;
    },

    classify(standards, lift, ratio, sex) {
        if (!lift || !Number.isFinite(ratio) || ratio <= 0) return null;
        const bounds = lift[sex === 'female' ? 'female' : 'male'];
        if (!Array.isArray(bounds) || bounds.length !== standards.levels.length) return null;

        let index = 0;
        bounds.forEach((bound, position) => {
            if (ratio >= bound) index = position;
        });

        const level = standards.levels[index];
        const next = bounds[index + 1];
        const previous = bounds[index];
        const span = next ? next - previous : Math.max(previous * 0.25, 0.1);
        const progress = Math.max(0, Math.min(1, (ratio - previous) / span));

        return {
            id: level.id,
            label: level.label,
            index,
            progress,
            isTop: index === standards.levels.length - 1,
            nextBound: next || null
        };
    }
};

function toRange(value, min, max) {
    const number = Number.parseFloat(value);
    if (!Number.isFinite(number) || number <= 0) return null;
    const clamped = Math.min(max, Math.max(min, number));
    return Math.round(clamped * 10) / 10;
}
