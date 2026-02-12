'use server'

import { query } from './db';
import { Product, MealEntry, UserProfile, Measurement, ProductSet } from './store';

interface DbRow {
  data?: string | object;
  value?: string;
}

export async function fetchAllData() {
  try {
    // Inicjalizacja tabel jeśli nie istnieją
    await query(`CREATE TABLE IF NOT EXISTS profiles (id VARCHAR(50) PRIMARY KEY, data TEXT)`);
    await query(`CREATE TABLE IF NOT EXISTS products (id VARCHAR(50) PRIMARY KEY, data TEXT)`);
    await query(`CREATE TABLE IF NOT EXISTS sets (id VARCHAR(50) PRIMARY KEY, data TEXT)`);
    await query(`CREATE TABLE IF NOT EXISTS entries (id VARCHAR(50) PRIMARY KEY, profile_id VARCHAR(50), date VARCHAR(20), data TEXT)`);
    await query(`CREATE TABLE IF NOT EXISTS measurements (id VARCHAR(50) PRIMARY KEY, profile_id VARCHAR(50), data TEXT)`);
    await query(`CREATE TABLE IF NOT EXISTS app_settings ( \`key\` VARCHAR(50) PRIMARY KEY, \`value\` VARCHAR(255))`);

    const results = await Promise.all([
      query('SELECT data FROM profiles'),
      query('SELECT data FROM products'),
      query('SELECT data FROM sets'),
      query('SELECT data FROM entries'),
      query('SELECT data FROM measurements'),
      query('SELECT value FROM app_settings WHERE `key` = "active_profile_id"')
    ]);

    const profiles = results[0] as DbRow[];
    const products = results[1] as DbRow[];
    const sets = results[2] as DbRow[];
    const entries = results[3] as DbRow[];
    const measurements = results[4] as DbRow[];
    const settings = results[5] as DbRow[];

    return {
      profiles: profiles.map((p) => typeof p.data === 'string' ? JSON.parse(p.data) : p.data) as UserProfile[],
      products: products.map((p) => typeof p.data === 'string' ? JSON.parse(p.data) : p.data) as Product[],
      sets: sets.map((s) => typeof s.data === 'string' ? JSON.parse(s.data) : s.data) as ProductSet[],
      entries: entries.map((e) => typeof e.data === 'string' ? JSON.parse(e.data) : e.data) as MealEntry[],
      measurements: measurements.map((m) => typeof m.data === 'string' ? JSON.parse(m.data) : m.data) as Measurement[],
      activeProfileId: settings.length > 0 ? settings[0].value : 'default'
    };
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw new Error('DATABASE_CONNECTION_ERROR');
  }
}

export async function syncProfiles(profiles: UserProfile[]) {
  await query('DELETE FROM profiles');
  for (const p of profiles) {
    await query('INSERT INTO profiles (id, data) VALUES (?, ?)', [p.id, JSON.stringify(p)]);
  }
}

export async function syncProducts(products: Product[]) {
  await query('DELETE FROM products');
  for (const p of products) {
    await query('INSERT INTO products (id, data) VALUES (?, ?)', [p.id, JSON.stringify(p)]);
  }
}

export async function syncSets(sets: ProductSet[]) {
  await query('DELETE FROM sets');
  for (const s of sets) {
    await query('INSERT INTO sets (id, data) VALUES (?, ?)', [s.id, JSON.stringify(s)]);
  }
}

export async function syncEntries(entries: MealEntry[]) {
  await query('DELETE FROM entries');
  for (const e of entries) {
    await query('INSERT INTO entries (id, profile_id, date, data) VALUES (?, ?, ?, ?)', 
      [e.id, e.profileId, e.date, JSON.stringify(e)]);
  }
}

export async function syncMeasurements(measurements: Measurement[]) {
  await query('DELETE FROM measurements');
  for (const m of measurements) {
    await query('INSERT INTO measurements (id, profile_id, data) VALUES (?, ?, ?)',
      [m.id, m.profileId, JSON.stringify(m)]);
  }
}

export async function syncSettings(activeProfileId: string) {
  await query('INSERT INTO app_settings (`key`, `value`) VALUES ("active_profile_id", ?) ON CONFLICT(`key`) DO UPDATE SET `value` = excluded.value', 
    [activeProfileId]);
}